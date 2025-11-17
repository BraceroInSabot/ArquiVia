import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Settings, User, Calendar, SearchX, Loader2, AlertCircle } from 'lucide-react'; // Ícones

import type { DocumentList, DocumentFilters } from '../services/core-api';
import documentService from '../services/Document/api';
import ClassificationModal from '../components/ClassificationModal';

import "../assets/css/EnterprisePage.css"; // Reutiliza CSS global

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

  // Estado para armazenar a mensagem de busca do backend
  const [searchMessage, setSearchMessage] = useState<string>('');


  // --- EFEITO PRINCIPAL: BUSCA vs LISTAGEM (INTACTO) ---
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      setSearchMessage(''); 
      
      try {
        let response;

        // 1. Verifica se QUALQUER filtro está ativo
        const hasSearchTerm = filters.searchTerm && filters.searchTerm.trim() !== '';
        const hasAdvancedFilters = (filters.isReviewed && filters.isReviewed !== '') ||
                                 (filters.statusId && filters.statusId !== '') ||
                                 (filters.privacityId && filters.privacityId !== '') ||
                                 (filters.reviewer && filters.reviewer.trim() !== '') ||
                                 (filters.categories && filters.categories.trim() !== '');

        if (hasSearchTerm || hasAdvancedFilters) {
          
          // 2. CORREÇÃO: Passa o objeto 'filters' inteiro para o serviço
          response = await documentService.searchDocuments(filters);
          setSearchMessage(response.data.mensagem || ''); // Usa 'message'

        } else {
          // Se não tem filtro, lista todos (padrão)
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

    // 3. REMOVIDO o 'setTimeout'. A busca é imediata quando 'filters' muda.
    loadData();

  }, [filters]); // 4. CORREÇÃO: A dependência é o objeto 'filters'


  // --- Funções de Navegação e Modal ---
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

  // --- Renderização ---

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
      {/* Exibe a mensagem de sucesso da busca, se houver */}
      {searchMessage && filters.searchTerm && (
          <p className="text-muted small mb-3 fst-italic">
              {searchMessage}
          </p>
      )}

      {/* Grid de Documentos */}
      <div className="row g-3">
        {documents.map(doc => (
          <div key={doc.document_id} className="col-12 col-md-6 col-xl-4">
            <div className="card h-100 border shadow-sm hover-effect">
                <div className="card-body d-flex flex-column">
                    
                    {/* Título */}
                    <h6 className="fw-bold text-dark mb-2 text-truncate" title={doc.title}>
                        {doc.title || "Sem Título"}
                    </h6>
                    
                    {/* Metadados */}
                    <div className="text-muted small mb-3 flex-grow-1">
                        <div className="d-flex align-items-center gap-2 mb-1">
                            <User size={14} />
                            <span className="text-truncate">{doc.creator_name}</span>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                            <Calendar size={14} />
                            {/* Formata a data para melhor leitura */}
                            <span>{doc.created_at}</span>
                        </div>
                    </div>

                    {/* Ações */}
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