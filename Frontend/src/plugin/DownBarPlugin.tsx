import { useState, type JSX } from 'react';
import { useParams } from 'react-router-dom';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $generateHtmlFromNodes } from '@lexical/html';
import jsPDF from 'jspdf';
//@ts-ignore
import { type EditorState } from 'lexical'; 
import { 
  Save, History, FileText, Paperclip, 
  Eye, RotateCcw, Loader2 
} from 'lucide-react';

import HistoryViewModal from './HistoryViewModal';
import AttachedFilesModal from '../components/AttachedFilesModal';
import documentService from '../services/Document/api';
import type { DocumentHistory } from '../services/core-api';
import ConfirmModal from '../components/ConfirmModal'; // Importe o Modal de Confirmação
import toast from 'react-hot-toast';

// Remova a importação do CSS customizado, usaremos só Bootstrap
// import '../assets/css/ActionsPlugin.css'; 

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
    
    // Estados
    const [viewingState, setViewingState] = useState<string | null>(null);
    const [isFilesModalOpen, setIsFilesModalOpen] = useState(false);
    const [isHistoryVisible, setIsHistoryVisible] = useState(false);
    const [apiHistory, setApiHistory] = useState<DocumentHistory[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    // Estado para o modal de reversão
    const [revertConfig, setRevertConfig] = useState<{ isOpen: boolean; historyEntry: DocumentHistory | null }>({
        isOpen: false,
        historyEntry: null
    });
    const [isReverting, setIsReverting] = useState(false);

    // --- FUNÇÕES ---
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
        else toast.error("Salve o documento antes de visualizar anexos.");
    };

    const handleHistoryClick = async () => {
        if (isHistoryVisible) {
            setIsHistoryVisible(false);
            return;
        }
        if (!documentId) {
            toast.error("Salve o documento pelo menos uma vez para ver o histórico.");
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

    // Apenas abre o modal
    const requestRevert = (historyEntry: DocumentHistory) => {
        setRevertConfig({ isOpen: true, historyEntry });
    };

    // Executa a reversão quando confirmado
    const handleConfirmRevert = async () => {
        const historyEntry = revertConfig.historyEntry;
        if (!documentId || !historyEntry) return;
        
        setIsReverting(true);
        try {
            const response = await documentService.revertDocument(documentId, historyEntry.history_id);
            const restoredDoc = response.data.data;
            const newStateString = typeof restoredDoc.content === 'string' 
                ? restoredDoc.content 
                : JSON.stringify(restoredDoc.content);

            const editorState = editor.parseEditorState(newStateString);
            editor.setEditorState(editorState);
            
            setIsHistoryVisible(false);
            setRevertConfig({ isOpen: false, historyEntry: null }); // Fecha modal

        } catch (e) {
            console.error("Falha ao reverter:", e);
            toast.error("Erro ao reverter versão."); // Use toast se tiver
        } finally {
            setIsReverting(false);
        }
    };


    const handleViewVersion = (content: any) => {
        const contentString = typeof content === 'string' ? content : JSON.stringify(content);
        setViewingState(contentString);
    };

    return (
        <div className="d-flex justify-content-center" style={{ position: 'fixed', bottom: '20px', left: 0, right: 0, zIndex: 100 }}>
            
            {/* --- PAINEL DE HISTÓRICO (Estilizado com Bootstrap) --- */}
            {isHistoryVisible && (
                <div 
                    className="card shadow-lg border-0" 
                    style={{ position: 'absolute', bottom: '60px', width: '340px', zIndex: 101, animation: 'slideUpFade 0.2s ease-out' }}
                >
                    <div className="card-header bg-light d-flex justify-content-between align-items-center py-2 px-3">
                        <h6 className="fw-bold text-dark mb-0">Histórico de Versões</h6>
                        <button className="btn-close small" onClick={() => setIsHistoryVisible(false)}></button>
                    </div>

                    <div className="card-body p-0" style={{ maxHeight: '320px', overflowY: 'auto' }}>
                        {isLoadingHistory ? (
                            <div className="d-flex justify-content-center align-items-center p-3 text-muted">
                                <Loader2 className="animate-spin me-2" size={20} />
                                <small>Carregando...</small>
                            </div>
                        ) : apiHistory.length > 0 ? (
                            <ul className="list-group list-group-flush">
                                {apiHistory.map((entry) => (
                                    <li key={entry.history_id} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center px-3 py-2">
                                        <div className="history-info">
                                            <span className="fw-medium small">{entry.history_date}</span>
                                            <span className="text-muted small d-block">{entry.user_name} • {entry.action}</span>
                                        </div>
                                        <div className="d-flex gap-1">
                                            <button 
                                                className="btn btn-sm btn-outline-secondary"
                                                onClick={() => handleViewVersion(entry.content)}
                                                title="Visualizar"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button 
                                                className="btn btn-sm btn-outline-danger"
                                                // Alterado para chamar o requestRevert (abre o modal)
                                                onClick={() => requestRevert(entry)}
                                                title="Reverter"
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

            {/* --- BARRA DE AÇÕES (ESTILIZADA COM BOOTSTRAP) --- */}
            <div 
                className="d-flex align-items-center gap-2 p-2 rounded-pill shadow"
                style={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0' }}
            >
                {/* Grupo 1: Salvar */}
                <div className="btn-group" role="group">
                    <button
                        onClick={onManualSave}
                        className="btn btn-primary-custom d-flex align-items-center gap-2 rounded-pill px-3"
                        title="Salvar Agora"
                    >
                        <Save size={18} />
                        <span className="d-none d-sm-inline fw-medium" style={{ fontSize: '0.9rem' }}>Salvar</span>
                    </button>
                    
                    <button
                        onClick={onAutosaveToggle}
                        className={`btn ${isAutosaveActive ? 'btn-success-subtle' : 'btn-light'} rounded-pill ms-2 px-3`}
                        title={isAutosaveActive ? "Auto-salvamento Ativado" : "Desativado"}
                        style={{ fontSize: '0.8rem', fontWeight: '600' }}
                    >
                        {isAutosaveActive ? 'AUTO ON' : 'AUTO OFF'}
                    </button>
                </div>

                <div className="vr mx-2"></div>

                {/* Grupo 2: Ferramentas */}
                <div className="btn-group" role="group">
                    <button
                        onClick={handleHistoryClick}
                        className={`btn ${isGlowing ? 'btn-success' : 'btn-light'} rounded-circle p-2 ${isHistoryVisible ? 'active' : ''}`}
                        title="Histórico de Versões"
                    >
                        <History size={20} />
                    </button>
                    
                    <button
                        onClick={handleFilesClick}
                        className="btn btn-light rounded-circle p-2"
                        title="Arquivos Anexados"
                        disabled={!documentId}
                    >
                        <Paperclip size={20} />
                    </button>

                    <button
                        onClick={handleExportToPdf}
                        className="btn btn-light rounded-circle p-2"
                        title="Exportar para PDF"
                    >
                        <FileText size={20} />
                    </button>
                </div>
            </div>
            
            {/* Modais (Renderização intacta) */}
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

            {/* Modal de Confirmação de Reversão */}
            <ConfirmModal 
                isOpen={revertConfig.isOpen}
                onClose={() => setRevertConfig({ isOpen: false, historyEntry: null })}
                onConfirm={handleConfirmRevert}
                isLoading={isReverting}
                title="Reverter Versão"
                message={`Tem certeza que deseja reverter para a versão de ${revertConfig.historyEntry?.history_date || ''}? Isso substituirá o conteúdo atual.`}
                variant="warning"
                confirmText="Sim, Reverter"
            />
        </div>
    );
}