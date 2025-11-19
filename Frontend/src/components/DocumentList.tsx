import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Eye, Settings, User, Calendar, SearchX, Loader2, AlertCircle, 
  Trash2, Power, Building, Layers, Archive 
} from 'lucide-react'; 

import type { DocumentList, DocumentFilters, PaginatedResponse } from '../services/core-api';
import documentService from '../services/Document/api';
import ClassificationModal from '../components/ClassificationModal';
import PaginationControl from './PaginationControl'; // Importe o componente de paginação

import "../assets/css/EnterprisePage.css"; 

interface DocumentListProps {
  filters: DocumentFilters;
}

interface DocumentGroup {
  groupName: string;
  docs: DocumentList[];
}

const PAGE_SIZE = 21; // Definido pela regra de negócio do backend

const DocumentListComponent: React.FC<DocumentListProps> = ({ filters }) => {
  const [documents, setDocuments] = useState<DocumentList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados de Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<number | null>(null);
  const [searchMessage, setSearchMessage] = useState<string>('');
  
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  // Reset de página ao mudar filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // --- EFEITO PRINCIPAL: BUSCA vs LISTAGEM ---
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      setSearchMessage(''); 
      
      try {
        let responseData: PaginatedResponse<DocumentList>;
        let message = '';
        
        const hasSearchTerm = filters.searchTerm && filters.searchTerm.trim() !== '';
        const hasAdvancedFilters = (filters.isReviewed && filters.isReviewed !== 'all') ||
                                 (filters.statusId && filters.statusId !== 'all') ||
                                 (filters.privacityId && filters.privacityId !== 'all') ||
                                 (filters.reviewer && filters.reviewer.trim() !== '') ||
                                 (filters.categories && filters.categories.trim() !== '');

        if (hasSearchTerm || hasAdvancedFilters) {
          const res = await documentService.searchDocuments(filters, currentPage);
          responseData = res.data.data;
          message = res.data.mensagem;
          setSearchMessage(message || '');
        } else {
          const res = await documentService.getDocuments(currentPage);
          responseData = res.data.data;
        }

        setDocuments(responseData.results || []);
        setTotalCount(responseData.count || 0);
        
      } catch (err: any) {
        console.error("Erro na listagem/busca:", err);
        const msg = err.response?.data?.message || "Falha ao carregar documentos.";
        setError(msg);
        setDocuments([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };

    loadData();

  }, [filters, currentPage]); 

  // --- Handlers ---
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
      // Opcional: Recarregar dados para atualizar a paginação se um item for excluído
      // loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Falha ao excluir o documento.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const groupedDocuments: DocumentGroup[] | null = useMemo(() => {
    const groupBy = filters.groupBy || 'none';
    
    if (groupBy === 'none' || documents.length === 0) {
      return null;
    }

    const groups: Record<string, DocumentList[]> = {};
    
    documents.forEach(doc => {
      let key = "Sem Agrupamento";

      if (groupBy === 'enterprise') {
        key = doc.enterprise || "Sem Empresa";
      } else if (groupBy === 'sector') {
        key = doc.sector || "Sem Setor";
      } else if (groupBy === 'both') {
        const enterprise = doc.enterprise || "Sem Empresa";
        const sector = doc.sector || "Sem Setor";
        key = `${enterprise} ➤ ${sector}`; 
      }
      
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(doc);
    });
    
    return Object.entries(groups)
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
      .map(([groupName, docs]) => ({ groupName, docs }));

  }, [documents, filters.groupBy]);

  const getGroupIcon = () => {
    if (filters.groupBy === 'enterprise') return <Building size={20} />;
    if (filters.groupBy === 'sector') return <Layers size={20} />;
    if (filters.groupBy === 'both') return <Archive size={20} />;
    return null;
  };

  const renderDocCard = (doc: DocumentList) => (
    <div className={`card h-100 border shadow-sm hover-effect ${!doc.is_active ? 'opacity-75 bg-light' : ''}`}>
      <div className="card-body d-flex flex-column">
        <h6 className="fw-bold text-dark mb-2 text-truncate" title={doc.title}>
          {doc.title || "Sem Título"}
        </h6>
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
  );


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

      {groupedDocuments ? (
        <div className="grouped-list-container mt-4">
          {groupedDocuments.map(group => (
            <section key={group.groupName} className="mb-5">
              <div className="d-flex align-items-center mb-3 border-bottom pb-2">
                <div className="bg-light p-2 rounded me-3 text-primary-custom">
                  {getGroupIcon()}
                </div>
                <h4 className="fw-bold text-dark mb-0">{group.groupName}</h4>
                <span className="badge bg-light text-secondary ms-3 border">
                  {group.docs.length} {group.docs.length === 1 ? 'doc' : 'docs'}
                </span>
              </div>
              <div className="row g-3">
                {group.docs.map(doc => (
                  <div key={doc.document_id} className="col-12 col-md-6 col-xl-4">
                    {renderDocCard(doc)}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="row g-3">
          {documents.map(doc => (
            <div key={doc.document_id} className="col-12 col-md-6 col-xl-4">
              {renderDocCard(doc)}
            </div>
          ))}
        </div>
      )}
      
      {/* --- PAGINAÇÃO --- */}
      <PaginationControl 
        currentPage={currentPage}
        totalCount={totalCount}
        pageSize={PAGE_SIZE}
        onPageChange={(newPage) => {
            setLoading(true); // Feedback visual
            setCurrentPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

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