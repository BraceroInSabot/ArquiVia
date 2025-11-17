import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Eye, Settings, User, Calendar, SearchX, Loader2, AlertCircle, 
  Trash2, Power, Building, Layers // 1. Importe Building e Layers
} from 'lucide-react'; 

import type { DocumentList, DocumentFilters } from '../services/core-api';
import documentService from '../services/Document/api';
import ClassificationModal from '../components/ClassificationModal';

import "../assets/css/EnterprisePage.css"; 

interface DocumentListProps {
  filters: DocumentFilters;
}

const DocumentListComponent: React.FC<DocumentListProps> = ({ filters }) => {
  const [documents, setDocuments] = useState<DocumentList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<number | null>(null);
  const [searchMessage, setSearchMessage] = useState<string>('');
  
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  // --- LÓGICA (INTACTA) ---
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      setSearchMessage(''); 
      
      try {
        let response;
        
        const hasSearchTerm = filters.searchTerm && filters.searchTerm.trim() !== '';
        const hasAdvancedFilters = (filters.isReviewed && filters.isReviewed !== '') ||
                                 (filters.statusId && filters.statusId !== '') ||
                                 (filters.privacityId && filters.privacityId !== '') ||
                                 (filters.reviewer && filters.reviewer.trim() !== '') ||
                                 (filters.categories && filters.categories.trim() !== '');

        if (hasSearchTerm || hasAdvancedFilters) {
          response = await documentService.searchDocuments(filters);
          setSearchMessage(response.data.mensagem || '');
        } else {
          response = await documentService.getDocuments();
        }

        setDocuments(response.data.data || []);
        
      } catch (err: any) {
        console.error("Erro na listagem/busca:", err);
        const msg = err.response?.data?.message || "Falha ao carregar documentos.";
        setError(msg);
        setDocuments([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();

  }, [filters]); 

  const handleEditClick = (documentId: number) => {
    navigate(`/documento/editar/${documentId}`);
  };

  const handleModalOpen = (documentId: number) => {
    setSelectedDocId(documentId);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedDocId(null);
  };
  
  const handleToggleStatus = async (doc: DocumentList) => {
    const actionText = doc.is_active ? "Desativar" : "Ativar";
    if (!window.confirm(`Tem certeza que deseja ${actionText} o documento "${doc.title}"?`)) return;

    setActionLoadingId(doc.document_id);
    try {
      await documentService.toggleDocumentStatus(doc.document_id);
      setDocuments(prevDocs => 
        prevDocs.map(d => 
          d.document_id === doc.document_id ? { ...d, is_active: !d.is_active } : d
        )
      );
    } catch (err: any) {
      alert(err.response?.data?.message || `Falha ao ${actionText} o documento.`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (doc: DocumentList) => {
    if (!window.confirm(`ATENÇÃO: Deseja EXCLUIR PERMANENTEMENTE o documento "${doc.title}"?\n\nEsta ação não pode ser desfeita.`)) return;

    setActionLoadingId(doc.document_id);
    try {
      await documentService.deleteDocument(doc.document_id);
      setDocuments(prevDocs => 
        prevDocs.filter(d => d.document_id !== doc.document_id)
      );
    } catch (err: any) {
      alert(err.response?.data?.message || "Falha ao excluir o documento.");
    } finally {
      setActionLoadingId(null);
    }
  };
  // --- FIM DA LÓGICA ---

  // --- RENDERIZAÇÃO ---
  if (loading) {
    return (
        <div className="d-flex justify-content-center align-items-center py-5 text-muted">
            <Loader2 className="animate-spin me-2" size={24} />
            <span>Carregando documentos...</span>
        </div>
    );
  }

  if (error) {
    return (
        <div className="alert alert-danger d-flex align-items-center mt-3 mx-auto" style={{ maxWidth: '600px' }} role="alert">
            <AlertCircle className="me-2" size={20} />
            <div>{error}</div>
        </div>
    );
  }

  if (documents.length === 0) {
    return (
        <div className="text-center text-muted py-5 bg-light rounded border border-dashed mt-3">
            <SearchX size={48} className="opacity-25 mb-3" />
            <p className="mb-0 fw-medium">{searchMessage || "Nenhum documento encontrado."}</p>
            {filters.searchTerm && <small>Tente outro termo de busca.</small>}
        </div>
    );
  }

  return (
    <>
      {searchMessage && filters.searchTerm && (
          <p className="text-muted small mb-3 fst-italic">
              {searchMessage}
          </p>
      )}

      <div className="row g-3">
        {documents.map(doc => (
          <div key={doc.document_id} className="col-12 col-md-6 col-xl-4">
            <div className={`card h-100 border shadow-sm hover-effect ${!doc.is_active ? 'opacity-75 bg-light' : ''}`}>
                <div className="card-body d-flex flex-column">
                    
                    <h6 className="fw-bold text-dark mb-2 text-truncate" title={doc.title}>
                        {doc.title || "Sem Título"}
                    </h6>
                    
                    {/* --- METADADOS ATUALIZADOS --- */}
                    <div className="text-muted small mb-3 flex-grow-1">
                        <div className="d-flex align-items-center gap-2 mb-1" title="Empresa">
                            <Building size={14} />
                            <span className="text-truncate">{doc.enterprise}</span>
                        </div>
                        <div className="d-flex align-items-center gap-2 mb-1" title="Setor">
                            <Layers size={14} />
                            <span className="text-truncate">{doc.sector}</span>
                        </div>
                        <div className="d-flex align-items-center gap-2 mb-1" title="Criador">
                            <User size={14} />
                            <span className="text-truncate">{doc.creator_name}</span>
                        </div>
                        <div className="d-flex align-items-center gap-2" title="Data de Criação">
                            <Calendar size={14} />
                            <span>{doc.created_at}</span>
                        </div>
                    </div>

                    {/* Ações (INTACTAS) */}
                    <div className="d-flex justify-content-end gap-2 border-top pt-2 mt-auto">
                        <button 
                            onClick={() => handleEditClick(doc.document_id)} 
                            className="btn btn-light btn-sm text-primary"
                            title="Visualizar / Editar Conteúdo"
                        >
                            <Eye size={16} />
                            <span className="d-none d-lg-inline ms-1">Abrir</span>
                        </button>
                        
                        <button 
                            onClick={() => handleModalOpen(doc.document_id)} 
                            className="btn btn-light btn-sm text-secondary"
                            title="Configurações e Classificação"
                        >
                            <Settings size={16} />
                        </button>

                        <div className="vr mx-1 opacity-25"></div>

                        <button 
                          onClick={() => handleToggleStatus(doc)} 
                          className={`btn btn-light btn-sm ${doc.is_active ? 'text-warning' : 'text-success'}`}
                          title={doc.is_active ? 'Desativar Documento' : 'Ativar Documento'}
                          disabled={actionLoadingId === doc.document_id}
                        >
                          <Power size={16} />
                        </button>
                        
                        <button 
                          onClick={() => handleDelete(doc)} 
                          className="btn btn-light btn-sm text-danger"
                          title="Excluir Documento"
                          disabled={actionLoadingId === doc.document_id}
                        >
                          {actionLoadingId === doc.document_id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                    </div>

                </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && selectedDocId && (
        <ClassificationModal
          documentId={selectedDocId}
          onClose={handleModalClose}
        />
      )}
    </>
  );
};

export default DocumentListComponent;