import { useState, type JSX } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $generateHtmlFromNodes } from '@lexical/html';
import jsPDF from 'jspdf'; // A biblioteca jspdf
import { type EditorState } from 'lexical';
import HistoryViewModal from './HistoryViewModal'; // Importa o novo modal

// --- 1. Importe TODOS os ícones ---
import PDFIcon from '../assets/icons/pdf-export.svg?url';
import HistoryIcon from '../assets/icons/history.svg?url';
import EyeIcon from '../assets/icons/eye.svg?url';
import RestoreIcon from '../assets/icons/restore.svg?url';
import SaveIcon from '../assets/icons/save.svg?url'; // <-- Ícone de salvar

import '../assets/css/EditorTheme.css'

// Define a "forma" de um item do histórico
interface HistoryEntry {
  state: string; // O EditorState serializado como string JSON
  timestamp: Date; // O objeto Date de quando foi salvo
}

// --- 2. Atualize a interface de props ---
interface ActionsPluginProps {
  history: HistoryEntry[];
  isAutosaveActive: boolean;
  onAutosaveToggle: () => void;
  isGlowing: boolean;
  onManualSave: () => void; // <-- Adiciona a prop de salvar
}

// --- 3. Atualize a assinatura do componente ---
export default function ActionsPlugin({ 
  history,
  isAutosaveActive,
  onAutosaveToggle,
  isGlowing,
  onManualSave // <-- Recebe a prop
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

                {/* --- 4. NOVO BOTÃO DE SALVAR MANUAL (À ESQUERDA) --- */}
                <button
                    onClick={onManualSave}
                    className="toolbar-item save-btn"
                    aria-label="Salvar Agora"
                    title="Salvar Agora"
                >
                    <img src={SaveIcon} alt="Salvar Agora" className="format" width="18" height="18" />
                </button>
                
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
                                        className="history-action-btn restore-btn" onClick={() => handleRestore(entry.state)}
                                      >
                                       <img src={RestoreIcon} alt="Voltar" className="format" width="18" height="18" />
                                      </button>
                                    </div>
                                </li>
                            ))}
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