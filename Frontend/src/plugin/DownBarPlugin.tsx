import { useState, type JSX } from 'react';
import { useParams } from 'react-router-dom';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $generateHtmlFromNodes } from '@lexical/html';
import jsPDF from 'jspdf';
import { type EditorState } from 'lexical';

import HistoryViewModal from './HistoryViewModal';
import AttachedFilesModal from '../components/AttachedFilesModal';
import documentService from '../services/Document/api'; // Importe o serviço
import type { DocumentHistory } from '../services/core-api'; // Importe o tipo

// Ícones
import PDFIcon from '../assets/icons/pdf-export.svg?url';
import HistoryIcon from '../assets/icons/history.svg?url';
import EyeIcon from '../assets/icons/eye.svg?url';
import RestoreIcon from '../assets/icons/restore.svg?url';
import SaveIcon from '../assets/icons/save.svg?url';
import PaperclipIcon from '../assets/icons/paperclip.svg?url';

import '../assets/css/EditorTheme.css';

interface ActionsPluginProps {
  // Removemos a prop 'history' (agora vem da API)
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
    
    // Estados de Modais e Painéis
    const [viewingState, setViewingState] = useState<string | null>(null);
    const [isFilesModalOpen, setIsFilesModalOpen] = useState(false);
    const [isHistoryVisible, setIsHistoryVisible] = useState(false);

    // Estado para armazenar o histórico vindo da API
    const [apiHistory, setApiHistory] = useState<DocumentHistory[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    // --- FUNÇÕES AUXILIARES ---

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

    // --- LÓGICA DE HISTÓRICO (Backend) ---

    const handleHistoryClick = async () => {
        // Alterna visibilidade
        if (isHistoryVisible) {
            setIsHistoryVisible(false);
            return;
        }

        // Se for abrir, busca os dados
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
            alert("Falha ao carregar histórico.");
        } finally {
            setIsLoadingHistory(false);
        }
    };

    const handleRevert = async (historyEntry: DocumentHistory) => {
        if (!documentId) return;
        
        const confirmMsg = `Tem certeza que deseja reverter para a versão de ${new Date(historyEntry.history_date).toLocaleString()}? \nIsso substituirá o conteúdo atual.`;
        if (!window.confirm(confirmMsg)) return;

        try {
            // 1. Chama a API de Reversão
            const response = await documentService.revertDocument(documentId, historyEntry.history_id);
            const restoredDoc = response.data.data;

            // 2. Atualiza o Editor com o conteúdo retornado
            const newStateString = typeof restoredDoc.content === 'string' 
                ? restoredDoc.content 
                : JSON.stringify(restoredDoc.content);

            const editorState = editor.parseEditorState(newStateString);
            editor.setEditorState(editorState);

            // 3. Fecha o painel e avisa
            setIsHistoryVisible(false);
            // alert("Documento revertido com sucesso!"); // Opcional

        } catch (e) {
            console.error("Falha ao reverter documento:", e);
            alert("Erro ao reverter versão.");
        }
    };

    // Helper para abrir o modal de visualização
    const handleViewVersion = (content: any) => {
        // Garante que temos uma string para o modal
        const contentString = typeof content === 'string' ? content : JSON.stringify(content);
        setViewingState(contentString);
    };

    return (
        <div>
            <div className="actions-container">
                {/* Botão Salvar */}
                <button
                    onClick={onManualSave}
                    className="toolbar-item save-btn"
                    aria-label="Salvar Agora"
                    title="Salvar Agora"
                >
                    <img src={SaveIcon} alt="Salvar" className="format" width="18" height="18" />
                </button>
                
                {/* Botão Toggle Autosave */}
                <button
                    onClick={onAutosaveToggle}
                    className={`toolbar-item autosave-toggle ${isAutosaveActive ? 'active' : ''}`}
                    aria-label="Toggle Autosave"
                    title={isAutosaveActive ? "Auto-salvamento Ativado" : "Desativado"}
                >
                    <span className="autosave-icon">{isAutosaveActive ? 'ON' : 'OFF'}</span>
                </button>
                
                {/* Botão Histórico */}
                <button
                    onClick={handleHistoryClick}
                    className={`toolbar-item history-btn ${isGlowing ? 'glowing' : ''}`}
                    aria-label="Histórico"
                    title="Ver Histórico de Alterações"
                >
                    <img src={HistoryIcon} alt="Histórico" className="format" width="18" height="18" />
                </button>
                
                {/* Botão Anexos */}
                <button
                    onClick={handleFilesClick}
                    className="toolbar-item export-btn"
                    aria-label="Arquivos Anexados"
                    title="Arquivos Anexados"
                    disabled={!documentId}
                >
                    <img src={PaperclipIcon} alt="Anexos" className="format" width="18" height="18" />
                </button>

                {/* Botão PDF (Opcional, se quiser manter) */}
                <button
                    onClick={handleExportToPdf}
                    className="toolbar-item export-btn"
                    aria-label="Exportar PDF"
                    title="Exportar PDF"
                >
                    <img src={PDFIcon} alt="PDF" className="format" width="18" height="18" />
                </button>
            </div>
            
            {/* --- PAINEL DE HISTÓRICO (BACKEND) --- */}
            {isHistoryVisible && (
                <div className="history-panel">
                    {isLoadingHistory ? (
                        <p style={{padding: '1rem', textAlign: 'center', color: '#666'}}>Carregando histórico...</p>
                    ) : apiHistory.length > 0 ? (
                        <ul className="history-list">
                            {apiHistory.map((entry) => (
                                <li key={entry.history_id} className="history-item">
                                    <div className="history-info" style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
                                        <span className="history-timestamp">
                                            {new Date(entry.history_date).toLocaleDateString()} {new Date(entry.history_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </span>
                                        <span style={{fontSize: '0.75rem', color: '#555', marginTop: '2px'}}>
                                            {entry.user_name} • {entry.action}
                                        </span>
                                    </div>
                                    
                                    <div className="history-item-actions">
                                        <button 
                                            className="history-action-btn view-btn" 
                                            onClick={() => handleViewVersion(entry.content)}
                                            title="Visualizar esta versão"
                                        >
                                            <img src={EyeIcon} alt="Ver" className="format" width="16" height="16" />
                                        </button>
                                        <button 
                                            className="history-action-btn restore-btn" 
                                            onClick={() => handleRevert(entry)}
                                            title="Reverter para esta versão"
                                        >
                                            <img src={RestoreIcon} alt="Reverter" className="format" width="16" height="16" />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p style={{padding: '1rem', textAlign: 'center', color: '#888'}}>
                            Nenhum histórico disponível.
                        </p>
                    )}
                </div>
            )}

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