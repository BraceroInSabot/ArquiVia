import { useState, type JSX } from 'react';
import { useParams } from 'react-router-dom';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $generateHtmlFromNodes } from '@lexical/html';
import jsPDF from 'jspdf';
//@ts-ignore
import { type EditorState } from 'lexical'; 

// Ícones Lucide (Substituindo os imports de SVG?url)
import { 
  Save, History, FileText, Paperclip, 
  Eye, RotateCcw, Loader2 
} from 'lucide-react';

import HistoryViewModal from './HistoryViewModal';
import AttachedFilesModal from '../components/AttachedFilesModal';
import documentService from '../services/Document/api';
import type { DocumentHistory } from '../services/core-api';

// Importe o NOVO CSS
import '../assets/css/DownBarPlugin.css'; 

interface ActionsPluginProps {
  isAutosaveActive: boolean;
  onAutosaveToggle: () => void;
  isGlowing: boolean;
  onManualSave: () => void;
}

export default function ActionsPlugin({ 
  isAutosaveActive,
  onAutosaveToggle,
  isGlowing,
  onManualSave
}: ActionsPluginProps): JSX.Element {
    const { id } = useParams<{ id: string }>(); 
    const documentId = id ? Number(id) : null;

    const [editor] = useLexicalComposerContext(); 
    
    const [viewingState, setViewingState] = useState<string | null>(null);
    const [isFilesModalOpen, setIsFilesModalOpen] = useState(false);
    const [isHistoryVisible, setIsHistoryVisible] = useState(false);
    const [apiHistory, setApiHistory] = useState<DocumentHistory[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    const handleExportToPdf = (): void => {
        editor.getEditorState().read(() => {
          const htmlString = $generateHtmlFromNodes(editor, null);
          const pdf = new jsPDF('p', 'mm', 'a4');
          pdf.html(htmlString, {
            callback: function (doc: jsPDF) { doc.save('documento.pdf'); },
            margin: [15, 15, 15, 15],
            autoPaging: 'text',
            width: 180,
            windowWidth: 700,
          });
        });
    };

    const handleFilesClick = () => {
        if (documentId) setIsFilesModalOpen(true);
        else alert("Salve o documento antes de visualizar anexos.");
    };

    const handleHistoryClick = async () => {
        if (isHistoryVisible) {
            setIsHistoryVisible(false);
            return;
        }
        if (!documentId) {
            alert("Salve o documento pelo menos uma vez para ver o histórico.");
            return;
        }

        setIsHistoryVisible(true);
        setIsLoadingHistory(true);
        try {
            const response = await documentService.getDocumentHistory(documentId);
            setApiHistory(response.data.data || []);
        } catch (error) {
            console.error("Erro ao buscar histórico:", error);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    const handleRevert = async (historyEntry: DocumentHistory) => {
        if (!documentId) return;
        const confirmMsg = `Tem certeza que deseja reverter para a versão de ${new Date(historyEntry.history_date).toLocaleString()}? \nIsso substituirá o conteúdo atual.`;
        if (!window.confirm(confirmMsg)) return;

        try {
            const response = await documentService.revertDocument(documentId, historyEntry.history_id);
            const restoredDoc = response.data.data;
            const newStateString = typeof restoredDoc.content === 'string' 
                ? restoredDoc.content 
                : JSON.stringify(restoredDoc.content);

            const editorState = editor.parseEditorState(newStateString);
            editor.setEditorState(editorState);
            setIsHistoryVisible(false);
        } catch (e) {
            console.error("Falha ao reverter documento:", e);
            alert("Erro ao reverter versão.");
        }
    };

    const handleViewVersion = (content: any) => {
        const contentString = typeof content === 'string' ? content : JSON.stringify(content);
        setViewingState(contentString);
    };

    return (
        <div className="actions-plugin-container">
            
            {/* --- PAINEL DE HISTÓRICO (Popover) --- */}
            {isHistoryVisible && (
                <div className="history-popover">
                    <div className="history-header">
                        <h6>Histórico de Versões</h6>
                        <button className="btn-close-history" onClick={() => setIsHistoryVisible(false)}>&times;</button>
                    </div>

                    <div className="history-content">
                        {isLoadingHistory ? (
                            <div className="d-flex justify-content-center align-items-center p-3 text-muted">
                                <Loader2 className="animate-spin me-2" size={20} />
                                <small>Carregando...</small>
                            </div>
                        ) : apiHistory.length > 0 ? (
                            <ul className="history-list">
                                {apiHistory.map((entry) => (
                                    <li key={entry.history_id} className="history-item">
                                        <div className="history-info">
                                            <span className="history-timestamp">
                                                {new Date(entry.history_date).toLocaleDateString()} 
                                                <small className="ms-1 text-muted">
                                                    {new Date(entry.history_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </small>
                                            </span>
                                            <span className="history-meta">
                                                {entry.user_name} • {entry.action}
                                            </span>
                                        </div>
                                        
                                        <div className="history-item-actions">
                                            <button 
                                                className="btn-icon view" 
                                                onClick={() => handleViewVersion(entry.content)}
                                                title="Visualizar esta versão"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button 
                                                className="btn-icon revert" 
                                                onClick={() => handleRevert(entry)}
                                                title="Reverter para esta versão"
                                            >
                                                <RotateCcw size={16} />
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-center text-muted p-3 m-0 small">Nenhum histórico disponível.</p>
                        )}
                    </div>
                </div>
            )}

            {/* --- BARRA DE AÇÕES (Toolbar) --- */}
            <div className="actions-toolbar">

                {/* Grupo 1: Salvar e Autosave */}
                <div className="action-group">
                    <button
                        onClick={onManualSave}
                        className="action-btn primary"
                        title="Salvar Agora"
                    >
                        <Save size={18} />
                        <span className="d-none d-sm-block text-sm">Salvar</span>
                    </button>
                    
                    <button
                        onClick={onAutosaveToggle}
                        className={`action-toggle ${isAutosaveActive ? 'active' : ''}`}
                        title={isAutosaveActive ? "Auto-salvamento Ativado" : "Auto-salvamento Desativado"}
                    >
                        <span>{isAutosaveActive ? 'Auto ON' : 'Auto OFF'}</span>
                    </button>
                </div>

                <div className="vr"></div>

                {/* Grupo 2: Ferramentas */}
                <div className="action-group">
                    <button
                        onClick={handleHistoryClick}
                        className={`action-btn ${isGlowing ? 'glowing' : ''} ${isHistoryVisible ? 'active' : ''}`}
                        title="Histórico de Versões"
                    >
                        <History size={20} />
                    </button>
                    
                    <button
                        onClick={handleFilesClick}
                        className="action-btn"
                        title="Arquivos Anexados"
                        disabled={!documentId}
                    >
                        <Paperclip size={20} />
                    </button>

                    <button
                        onClick={handleExportToPdf}
                        className="action-btn"
                        title="Exportar para PDF"
                    >
                        <FileText size={20} />
                    </button>
                </div>
            </div>
            
            {/* Modais */}
            {viewingState && (
                <HistoryViewModal
                    editorStateString={viewingState}
                    onClose={() => setViewingState(null)}
                />
            )}

            {isFilesModalOpen && documentId && (
                <AttachedFilesModal
                    documentId={documentId}
                    onClose={() => setIsFilesModalOpen(false)}
                />
            )}
        </div>
    );
}