import { useState, type JSX } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $generateHtmlFromNodes } from '@lexical/html';
import jsPDF from 'jspdf'; // A biblioteca jspdf
import { type EditorState } from 'lexical';
import HistoryViewModal from './HistoryViewModal'; // Importa o novo modal

import PDFIcon from '../assets/icons/pdf-export.svg';
import HistoryIcon from '../assets/icons/history.svg';
import EyeIcon from '../assets/icons/eye.svg';
import RestoreIcon from '../assets/icons/restore.svg';

import '../assets/css/EditorTheme.css'

// Define a "forma" de um item do histórico
interface HistoryEntry {
  state: string; // O EditorState serializado como string JSON
  timestamp: Date; // O objeto Date de quando foi salvo
}

// Define as props do componente
interface ActionsPluginProps {
  history: HistoryEntry[];
  isAutosaveActive: boolean;
  onAutosaveToggle: () => void;
  isGlowing: boolean;
  // A prop 'onRestore' foi removida.
}

// Aplica os tipos nas props e no retorno da função
export default function ActionsPlugin({ 
  history,
  isAutosaveActive,
  onAutosaveToggle,
  isGlowing,
}: ActionsPluginProps): JSX.Element {
    const [viewingState, setViewingState] = useState<string | null>(null);
    
    const [editor] = useLexicalComposerContext(); 
    const [isHistoryVisible, setIsHistoryVisible] = useState(false);

    const handleExportToPdf = (): void => {
        editor.getEditorState().read(() => {
          const htmlString = $generateHtmlFromNodes(editor, null);
          const pdf = new jsPDF('p', 'mm', 'a4');
    
          pdf.html(htmlString, {
            callback: function (doc: jsPDF) {
              doc.save('documento.pdf');
            },
            margin: [15, 15, 15, 15],
            autoPaging: 'text',
            width: 180,
            windowWidth: 700,
          });
        });
    };

    const handleHistoryClick = (): void => {
        setIsHistoryVisible(!isHistoryVisible);
    };

    // A lógica de restauração agora usa o 'editor' local
    const handleRestore = (stateToRestore: string): void => {
      try {
        const editorState = editor.parseEditorState(stateToRestore); 
        editor.setEditorState(editorState);
      } catch (e) {
        console.error("Falha ao restaurar o estado.", e);
      }
        setIsHistoryVisible(false);
    };

    return (
        <div>
            <div className="actions-container">
                
                {/* --- BOTÃO DE TOGGLE --- */}
                <button
                    onClick={onAutosaveToggle}
                    className={`toolbar-item autosave-toggle ${isAutosaveActive ? 'active' : ''}`}
                    aria-label="Toggle Autosave"
                    title={isAutosaveActive ? "Auto-salvamento Ativado" : "Auto-salvamento Desativado"}
                >
                  <span className="autosave-icon">{isAutosaveActive ? 'ON' : 'OFF'}</span>
                </button>
                
                {/* --- BOTÃO DE HISTÓRICO --- */}
                <button
                    onClick={handleHistoryClick}
                    className={`toolbar-item history-btn ${isGlowing ? 'glowing' : ''}`}
                    aria-label="Toggle History"
                >
                    <img src={HistoryIcon} alt="Review History" className="format" width="18" height="18" />
                </button>
                
                {/* --- BOTÃO DE PDF --- */}
                <button
                    onClick={handleExportToPdf}
                    className="toolbar-item export-btn"
                    aria-label="Export to PDF"
                >
                    <img src={PDFIcon} alt="Export PDF" className="format" width="18" height="18" />
                </button>
            </div>
            
            {isHistoryVisible && (
                <div className="history-panel">
                    {history.length > 0 ? (
                        <ul className="history-list">
                            {/* --- INÍCIO DA LÓGICA ATUALIZADA (VER/VOLTAR) --- */}
                            {history.map((entry: HistoryEntry, index: number) => (
                                <li key={index} className="history-item">
                                    <span className="history-timestamp">
                                      {entry.timestamp.toLocaleDateString()} {entry.timestamp.toLocaleTimeString()}
                                    </span>
                                    <div className="history-item-actions">
                                      <button 
                                        className="history-action-btn view-btn" 
                                        onClick={() => setViewingState(entry.state)}
                                      >
                                        <img src={EyeIcon} alt="Visualizar" className="format" width="18" height="18" />
                                      </button>
                                      <button 
                                        className="history-action-btn restore-btn" 
                                        onClick={() => handleRestore(entry.state)}
                                      >
                                        <img src={RestoreIcon} alt="Voltar" className="format" width="18" height="18" />
                                      </button>
                                    </div>
                                </li>
                            ))}
                            {/* --- FIM DA LÓGICA ATUALIZADA --- */}
                        </ul>
                    ) : (
                        <p>Nenhum ponto de histórico salvo ainda.</p>
                    )}
                </div>
            )}

            {/* --- RENDERIZAÇÃO DO MODAL DE VISUALIZAÇÃO --- */}
            {viewingState && (
              <HistoryViewModal
                editorStateString={viewingState}
                onClose={() => setViewingState(null)}
              />
            )}
        </div>
    );
}