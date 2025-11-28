import { useState, type JSX } from 'react';
import { useParams } from 'react-router-dom';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
//@ts-ignore
import { $generateHtmlFromNodes } from '@lexical/html';

//@ts-ignore
import { type EditorState } from 'lexical'; 
import { 
  Save, History, Paperclip, 
  Eye, RotateCcw, Loader2, X 
} from 'lucide-react';
import toast from 'react-hot-toast';

import HistoryViewModal from './HistoryViewModal';
import AttachedFilesModal from '../components/modal/AttachedFilesModal';
import documentService from '../services/Document/api';
import type { DocumentHistory } from '../services/core-api';
import ConfirmModal from '../components/modal/ConfirmModal';

interface ActionsPluginProps {
  isAutosaveActive: boolean;
  onAutosaveToggle: () => void;
  isGlowing: boolean;
  onManualSave: () => void;
}

// @ts-ignore
export default function ActionsPlugin({isAutosaveActive, onAutosaveToggle, isGlowing, onManualSave}: ActionsPluginProps): JSX.Element {
    const { id } = useParams<{ id: string }>(); 
    const documentId = id ? Number(id) : null;
    const [editor] = useLexicalComposerContext(); 
    
    const [viewingState, setViewingState] = useState<string | null>(null);
    const [isFilesModalOpen, setIsFilesModalOpen] = useState(false);
    const [isHistoryVisible, setIsHistoryVisible] = useState(false);
    const [apiHistory, setApiHistory] = useState<DocumentHistory[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    const [revertConfig, setRevertConfig] = useState<{ isOpen: boolean; historyEntry: DocumentHistory | null }>({
        isOpen: false,
        historyEntry: null
    });
    const [isReverting, setIsReverting] = useState(false);

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

    const requestRevert = (historyEntry: DocumentHistory) => {
        setRevertConfig({ isOpen: true, historyEntry });
    };

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
            setRevertConfig({ isOpen: false, historyEntry: null }); 

        } catch (e) {
            console.error("Falha ao reverter:", e);
            toast.error("Erro ao reverter versão."); 
        } finally {
            setIsReverting(false);
        }
    };

    const handleViewVersion = (content: any) => {
        const contentString = typeof content === 'string' ? content : JSON.stringify(content);
        setViewingState(contentString);
    };

    return (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[100] flex flex-col items-center">
            
            {/* --- PAINEL DE HISTÓRICO (Popover) --- */}
            {isHistoryVisible && (
                <div className="card bg-base-100 shadow-2xl w-80 border border-base-200 absolute bottom-16 animate-slide-up">
                    <div className="card-body p-0 overflow-hidden">
                        <div className="flex justify-between items-center p-3 bg-base-200/50 border-b border-base-200">
                            <h3 className="font-bold text-sm text-secondary">Histórico de Versões</h3>
                            <button className="btn btn-xs btn-circle btn-ghost" onClick={() => setIsHistoryVisible(false)}>
                                <X size={16} />
                            </button>
                        </div>

                        <div className="max-h-72 overflow-y-auto p-1">
                            {isLoadingHistory ? (
                                <div className="flex justify-center items-center py-8 text-gray-400">
                                    <Loader2 className="animate-spin mr-2" size={20} />
                                    <span className="text-xs">Carregando...</span>
                                </div>
                            ) : apiHistory.length > 0 ? (
                                <ul className="menu bg-base-100 w-full p-0 menu-xs">
                                    {apiHistory.map((entry) => (
                                        <li key={entry.history_id} className="border-b border-base-100 last:border-none">
                                            <div className="flex flex-col gap-1 py-2 active:bg-base-100 cursor-default hover:bg-base-100">
                                                <div className="w-full flex justify-between items-start">
                                                    <div>
                                                        <span className="font-bold block text-xs">
                                                            {new Date(entry.history_date).toLocaleDateString()}
                                                            <span className="font-normal ml-1 opacity-70">
                                                                {new Date(entry.history_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                            </span>
                                                        </span>
                                                        <span className="text-[10px] text-gray-500 block mt-0.5">{entry.user_name} • {entry.action}</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex gap-2 mt-1 w-full justify-end">
                                                    <button 
                                                        className="btn btn-xs btn-outline btn-primary h-7 min-h-0 px-2"
                                                        onClick={() => handleViewVersion(entry.content)}
                                                        title="Visualizar"
                                                    >
                                                        <Eye size={12} className="mr-1" /> Ver
                                                    </button>
                                                    <button 
                                                        className="btn btn-xs btn-outline btn-error h-7 min-h-0 px-2"
                                                        onClick={() => requestRevert(entry)}
                                                        title="Reverter"
                                                    >
                                                        <RotateCcw size={12} className="mr-1" /> Reverter
                                                    </button>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-center py-6 text-gray-400 text-xs italic">
                                    Nenhum histórico disponível.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* --- BARRA DE AÇÕES (Toolbar DaisyUI) --- */}
            <div className="join bg-base-100 shadow-lg rounded-full border border-base-300 p-1">
                
                {/* Botão Salvar */}
                <button
                    onClick={onManualSave}
                    className="join-item btn btn-sm btn-primary rounded-full px-4 text-white border-none"
                    title="Salvar Agora"
                >
                    <Save size={18} />
                    <span className="hidden sm:inline ml-1">Salvar</span>
                </button>
                
                {/* Toggle AutoSave */}
                <button
                    onClick={onAutosaveToggle}
                    className={`join-item btn btn-sm border-none font-normal text-xs ${isAutosaveActive ? 'bg-success/10 text-success' : 'bg-base-200 text-gray-500'}`}
                    title={isAutosaveActive ? "Auto-salvamento Ativado" : "Desativado"}
                >
                    {isAutosaveActive ? 'AUTO ON' : 'AUTO OFF'}
                </button>

                {/* Divisor */}
                <div className="join-item w-px bg-base-300 mx-1 my-1"></div>

                {/* Histórico */}
                <div className="tooltip" data-tip="Histórico">
                    <button
                        onClick={handleHistoryClick}
                        className={`join-item btn btn-sm btn-circle btn-ghost ${isHistoryVisible ? 'bg-base-200 text-primary' : ''}`}
                    >
                        <History size={20} />
                    </button>
                </div>

                {/* Anexos */}
                <div className="tooltip" data-tip="Anexos">
                    <button
                        onClick={handleFilesClick}
                        className="join-item btn btn-sm btn-circle btn-ghost"
                        disabled={!documentId}
                    >
                        <Paperclip size={20} />
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

            <ConfirmModal 
                isOpen={revertConfig.isOpen}
                onClose={() => setRevertConfig({ isOpen: false, historyEntry: null })}
                onConfirm={handleConfirmRevert}
                isLoading={isReverting}
                title="Reverter Versão"
                message={`Tem certeza que deseja reverter para a versão de ${new Date(revertConfig.historyEntry?.history_date || '').toLocaleString()}? Isso substituirá o conteúdo atual.`}
                variant="warning"
                confirmText="Sim, Reverter"
            />
        </div>
    );
}