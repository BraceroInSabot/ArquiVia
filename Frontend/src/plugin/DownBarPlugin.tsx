import { useState, type JSX } from 'react';
import { useParams } from 'react-router-dom'; // 1. Importe useParams
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { type EditorState } from 'lexical';

import HistoryViewModal from './HistoryViewModal';
import AttachedFilesModal from '../components/AttachedFilesModal'; // 2. Importe o novo Modal

// 3. Importe os ícones (Substitua PDFIcon por PaperclipIcon)
// Certifique-se de ter um ícone 'paperclip.svg' ou similar
import PaperclipIcon from '../assets/icons/paperclip.svg?url'; 
import HistoryIcon from '../assets/icons/history.svg?url';
import EyeIcon from '../assets/icons/eye.svg?url';
import RestoreIcon from '../assets/icons/restore.svg?url';
import SaveIcon from '../assets/icons/save.svg?url';

import '../assets/css/EditorTheme.css'

interface HistoryEntry {
  state: string; 
  timestamp: Date; 
}

interface ActionsPluginProps {
  history: HistoryEntry[];
  isAutosaveActive: boolean;
  onAutosaveToggle: () => void;
  isGlowing: boolean;
  onManualSave: () => void;
}

export default function ActionsPlugin({ 
  history,
  isAutosaveActive,
  onAutosaveToggle,
  isGlowing,
  onManualSave
}: ActionsPluginProps): JSX.Element {
    // 4. Pegue o ID da URL
    const { id } = useParams<{ id: string }>(); 
    const documentId = id ? Number(id) : null;

    const [viewingState, setViewingState] = useState<string | null>(null);
    // 5. Estado para o modal de arquivos
    const [isFilesModalOpen, setIsFilesModalOpen] = useState(false);
    
    const [editor] = useLexicalComposerContext(); 
    const [isHistoryVisible, setIsHistoryVisible] = useState(false);

    // (A função handleExportToPdf foi removida/substituída)

    const handleFilesClick = () => {
        if (documentId) {
            setIsFilesModalOpen(true);
        } else {
            alert("Salve o documento antes de visualizar anexos.");
        }
    };

    const handleHistoryClick = (): void => {
        setIsHistoryVisible(!isHistoryVisible);
    };

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

                {/* BOTÃO DE SALVAR MANUAL */}
                <button
                    onClick={onManualSave}
                    className="toolbar-item save-btn"
                    aria-label="Salvar Agora"
                    title="Salvar Agora"
                >
                    <img src={SaveIcon} alt="Salvar Agora" className="format" width="18" height="18" />
                </button>
                
                {/* BOTÃO DE TOGGLE */}
                <button
                    onClick={onAutosaveToggle}
                    className={`toolbar-item autosave-toggle ${isAutosaveActive ? 'active' : ''}`}
                    aria-label="Toggle Autosave"
                    title={isAutosaveActive ? "Auto-salvamento Ativado" : "Auto-salvamento Desativado"}
                >
                  <span className="autosave-icon">{isAutosaveActive ? 'ON' : 'OFF'}</span>
                </button>
                
                {/* BOTÃO DE HISTÓRICO */}
                <button
                    onClick={handleHistoryClick}
                    className={`toolbar-item history-btn ${isGlowing ? 'glowing' : ''}`}
                    aria-label="Toggle History"
                >
                    <img src={HistoryIcon} alt="Review History" className="format" width="18" height="18" />
                </button>
                
                {/* --- 6. BOTÃO DE ANEXOS (SUBSTITUI PDF) --- */}
                <button
                    onClick={handleFilesClick}
                    className="toolbar-item export-btn" // Pode manter a classe ou criar uma 'files-btn'
                    aria-label="Arquivos Anexados"
                    title="Arquivos Anexados"
                    disabled={!documentId} // Desabilita se não houver ID (criação)
                >
                    <img src={PaperclipIcon} alt="Anexos" className="format" width="18" height="18" />
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
                                        className="history-action-btn restore-btn" 
                                        onClick={() => handleRestore(entry.state)}
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

            {/* --- 7. RENDERIZAÇÃO DO MODAL DE ARQUIVOS --- */}
            {isFilesModalOpen && documentId && (
                <AttachedFilesModal
                    documentId={documentId}
                    onClose={() => setIsFilesModalOpen(false)}
                />
            )}
        </div>
    );
}