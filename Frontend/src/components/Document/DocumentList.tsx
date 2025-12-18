import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Eye, Settings, User, Calendar, SearchX, Loader2, AlertCircle, 
  Trash2, Power, Building, Layers, Archive 
} from 'lucide-react'; 

import type { DocumentList, DocumentFilters, PaginatedResponse } from '../../services/core-api';
import documentService from '../../services/Document/api';
import ClassificationModal from '../../components/modal/ClassificationModal';
import PaginationControl from './PaginationControl';
import ConfirmModal, { type ConfirmVariant } from '../../components/modal/ConfirmModal';

interface DocumentListProps {
  filters: DocumentFilters;
}

interface DocumentGroup {
  groupName: string;
  docs: DocumentList[];
}

interface ConfirmConfig {
  isOpen: boolean;
  type: 'delete' | 'toggle' | null;
  doc: DocumentList | null;
  title: string;
  message: string;
  variant: ConfirmVariant;
  confirmText: string;
}

const getContrastColor = (hexcolor: string) => {
  if (!hexcolor) return '#000000';
  
  const hex = hexcolor.replace("#", "");
  
  const r = parseInt(hex.substr(0,2),16);
  const g = parseInt(hex.substr(2,2),16);
  const b = parseInt(hex.substr(4,2),16);
  
  const yiq = ((r*299)+(g*587)+(b*114))/1000;
  
  return (yiq >= 128) ? '#000000' : '#FFFFFF';
};

const PAGE_SIZE = 21; 

const DocumentListComponent: React.FC<DocumentListProps> = ({ filters }) => {
  const [documents, setDocuments] = useState<DocumentList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<number | null>(null);
  const [searchMessage, setSearchMessage] = useState<string>('');
  const [areLabelsExpanded, setAreLabelsExpanded] = useState(false);
  
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig>({
    isOpen: false, type: null, doc: null, title: '', message: '', variant: 'warning', confirmText: ''
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      setSearchMessage(''); 
      
      try {
        let responseData: PaginatedResponse<DocumentList>;
        let message = '';
        
        const hasSearchTerm = filters.searchTerm && filters.searchTerm.trim() !== '';
        const hasAdvancedFilters = (filters.isReviewed && filters.isReviewed !== '') ||
                                 (filters.statusId && filters.statusId !== '') ||
                                 (filters.privacityId && filters.privacityId !== '') ||
                                 (filters.reviewer && filters.reviewer.trim() !== '') ||
                                 (filters.categories && filters.categories.trim() !== '')

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

  const handleEditClick = (documentId: number) => navigate(`/documento/editar/${documentId}`);
  const handleModalOpen = (documentId: number) => { setSelectedDocId(documentId); setIsModalOpen(true); };
  const handleModalClose = () => { setIsModalOpen(false); setSelectedDocId(null); };
  
  const requestToggleStatus = (doc: DocumentList) => {
    const actionText = doc.is_active ? "Desativar" : "Ativar";
    const variant: ConfirmVariant = doc.is_active ? "warning" : "success";
    
    setConfirmConfig({
      isOpen: true, type: 'toggle', doc: doc,
      title: `${actionText} Documento?`,
      message: `Você está prestes a ${actionText.toLowerCase()} o documento "${doc.title}".`,
      variant: variant, confirmText: `Sim, ${actionText}`
    });
  };

  const requestDelete = (doc: DocumentList) => {
    setConfirmConfig({
      isOpen: true, type: 'delete', doc: doc,
      title: "Excluir Documento?",
      message: `ATENÇÃO: Deseja EXCLUIR PERMANENTEMENTE este documento? Esta ação não pode ser desfeita.`,
      variant: 'danger', confirmText: "Sim, Excluir"
    });
  };

  const handleConfirmAction = async () => {
    const { doc, type } = confirmConfig;
    if (!doc || !type) return;

    setIsActionLoading(true);
    const docId = confirmConfig.doc!.document_id;

    try {
      if (type === 'toggle') {
        await documentService.toggleDocumentStatus(docId);
        setDocuments(prevDocs => 
          prevDocs.map(d => d.document_id === docId ? { ...d, is_active: !d.is_active } : d)
        );
      } else if (type === 'delete') {
        await documentService.deleteDocument(docId);
        setDocuments(prevDocs => prevDocs.filter(d => d.document_id !== docId));
      }
      setConfirmConfig(prev => ({ ...prev, isOpen: false }));
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Falha ao realizar a operação.";
      alert(errorMsg); 
    } finally {
      setIsActionLoading(false);
    }
  };

  const groupedDocuments: DocumentGroup[] | null = useMemo(() => {
    const groupBy = filters.groupBy || 'none';
    if (groupBy === 'none' || documents.length === 0) return null;

    const groups: Record<string, DocumentList[]> = {};
    documents.forEach(doc => {
      let key = "Sem Agrupamento";
      if (groupBy === 'enterprise') key = doc.enterprise || "Sem Empresa";
      else if (groupBy === 'sector') key = doc.sector || "Sem Setor";
      else if (groupBy === 'both') key = `${doc.enterprise || "Sem Empresa"}, setor ${doc.sector || "Sem Setor"}`;
      
      if (!groups[key]) groups[key] = [];
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
    <div className={`card bg-base-100 shadow-md hover:shadow-lg transition-all duration-200 border border-base-200 h-full ${!doc.is_active ? 'opacity-75 bg-base-200/50' : ''}`}>
      <div className="card-body p-5 flex flex-col h-full">
        
        <div className="flex items-start justify-between">
           <h3 className="card-title text-base text-secondary line-clamp-2 min-h-[3rem]" title={doc.title}>
             {doc.title || "Sem Título"}
           </h3>
           {/* Indicador de Status */}
           <div className={`badge badge-xs ${doc.is_active ? 'badge-success' : 'badge-warning'}`}></div>
        </div>
        <div 
            className="flex flex-wrap gap-1.5 min-h-[1.5rem] content-start cursor-pointer group"
            onClick={(e) => {
                e.stopPropagation(); // Evita abrir o card se tiver clique no card
                setAreLabelsExpanded(!areLabelsExpanded);
            }}
            title="Clique para expandir/colapsar etiquetas"
        >
          {doc?.categories_data?.map((category, index) => (
             <span 
                key={index}
                className={`
                    transition-all duration-300 rounded font-bold text-xs
                    ${areLabelsExpanded 
                        ? 'px-2 py-1 badge border-none h-auto' // Modo Expandido
                        : 'w-8 h-2 hover:w-10 hover:opacity-80' // Modo Colapsado (Barra)
                    }
                `}
                style={{
                    backgroundColor: category.color,
                    // Aplica contraste apenas se expandido, senão transparente
                    color: areLabelsExpanded ? getContrastColor(category.color) : 'transparent'
                }}
             >
                {/* Só mostra o texto se estiver expandido */}
                {areLabelsExpanded && category.category}
             </span>
          ))}
          {(
            !doc?.categories_data 
            ||
            //@ts-ignore 
            doc.categories_data.length === 0) && (
             <span className="text-xs text-gray-400 italic select-none">Sem categorias</span>
          )}
        </div>
        
        <div className="text-xs text-gray-500 space-y-1.5 flex-grow">
          <div className="flex items-center gap-2" title="Empresa">
            <Building size={14} className="text-primary opacity-70" />
            <span className="truncate">{doc.enterprise || "N/A"}</span>
          </div>
          <div className="flex items-center gap-2" title="Setor">
            <Layers size={14} className="text-primary opacity-70" />
            <span className="truncate">{doc.sector || "N/A"}</span>
          </div>
          <div className="flex items-center gap-2" title="Criador">
            <User size={14} className="text-primary opacity-70" />
            <span className="truncate">{doc.creator_name}</span>
          </div>
          <div className="flex items-center gap-2" title="Data de Criação">
            <Calendar size={14} className="text-primary opacity-70" />
            <span>{doc.created_at}</span>
          </div>
        </div>

        <div className="card-actions justify-end gap-1">
          <div className="tooltip tooltip-bottom" data-tip="Abrir">
            <button 
              onClick={() => handleEditClick(doc.document_id)} 
              className="btn btn-square btn-sm btn-ghost text-primary hover:bg-primary/10"
            >
              <Eye size={18} />
            </button>
          </div>
          
          <div className="tooltip tooltip-bottom" data-tip="Configurações">
            <button 
              onClick={() => handleModalOpen(doc.document_id)} 
              className="btn btn-square btn-sm btn-ghost text-secondary hover:bg-secondary/10"
            >
              <Settings size={18} />
            </button>
          </div>

          <div className="w-px h-6 bg-base-300 mx-1 self-center"></div>

          <div className="tooltip tooltip-bottom" data-tip={doc.is_active ? 'Desativar' : 'Ativar'}>
            <button 
              onClick={() => requestToggleStatus(doc)} 
              className={`btn btn-square btn-sm btn-ghost ${doc.is_active ? 'text-warning hover:bg-warning/10' : 'text-success hover:bg-success/10'}`}
            >
              <Power size={18} />
            </button>
          </div>
          
          <div className="tooltip tooltip-bottom" data-tip="Excluir">
            <button 
              onClick={() => requestDelete(doc)} 
              className="btn btn-square btn-sm btn-ghost text-error hover:bg-error/10"
            >
               <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );


  if (loading) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Loader2 className="animate-spin mb-2 text-primary" size={40} />
            <span>Carregando documentos...</span>
        </div>
    );
  }

  if (error) {
    return (
        <div className="alert alert-error shadow-lg max-w-2xl mx-auto mt-8">
            <AlertCircle size={24} />
            <span>{error}</span>
        </div>
    );
  }

  if (documents.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-base-100 rounded-box border border-base-200 border-dashed mt-4">
            <div className="bg-base-200 p-4 rounded-full mb-4">
                <SearchX size={40} className="text-gray-400" />
            </div>
            <h3 className="font-bold text-lg text-secondary">{searchMessage || "Nenhum documento encontrado."}</h3>
            {filters.searchTerm && <p className="text-sm text-gray-500 mt-1">Tente outro termo de busca.</p>}
        </div>
    );
  }

  return (
    <>
      {groupedDocuments ? (
        <div className="flex flex-col gap-10 mt-6">
          {groupedDocuments.map(group => (
            <div key={group.groupName}>
              <div className="flex items-center gap-3 mb-4 border-b border-base-200 pb-2">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  {getGroupIcon()}
                </div>
                <h2 className="text-xl font-bold text-secondary">{group.groupName}</h2>
                <div className="badge badge-outline">{group.docs.length}</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {group.docs.map(doc => (
                  <div key={doc.document_id}>{renderDocCard(doc)}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-4">
          {documents.map(doc => (
            <div key={doc.document_id}>{renderDocCard(doc)}</div>
          ))}
        </div>
      )}
      
      <PaginationControl 
        currentPage={currentPage}
        totalCount={totalCount}
        pageSize={PAGE_SIZE}
        onPageChange={(newPage) => {
            setLoading(true); 
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

      <ConfirmModal 
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmAction}
        isLoading={isActionLoading}
        title={confirmConfig.title}
        message={confirmConfig.message}
        variant={confirmConfig.variant}
        confirmText={confirmConfig.confirmText}
      />
    </>
  );
};

export default DocumentListComponent;