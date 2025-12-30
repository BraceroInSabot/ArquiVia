import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Eye, Settings, User, Calendar, SearchX, Loader2, AlertCircle, 
  Trash2, Power, Building, Layers, Archive, Edit, FileText, MoreVertical,
  FilePenLine // <--- Novo ícone importado
} from 'lucide-react'; 

import type { DocumentList, DocumentFilters, PaginatedResponse } from '../../services/core-api';
import documentService from '../../services/Document/api';
import ClassificationModal from '../../components/modal/ClassificationModal';
import PaginationControl from './PaginationControl';
import ConfirmModal, { type ConfirmVariant } from '../../components/modal/ConfirmModal';

type ViewMode = 'grid' | 'list';

interface DocumentListProps {
  filters: DocumentFilters;
  viewMode: ViewMode; 
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

const DocumentListComponent: React.FC<DocumentListProps> = ({ filters, viewMode }) => {
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
  
  // --- ESTADOS PARA RENOMEAR ---
  const [renamingDoc, setRenamingDoc] = useState<DocumentList | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);

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
  
  // --- LÓGICA DE RENOMEAR ---
  const handleOpenRename = (doc: DocumentList) => {
    setRenamingDoc(doc);
    setNewTitle(doc.title || '');
  };

  const handleCloseRename = () => {
    setRenamingDoc(null);
    setNewTitle('');
    setIsRenaming(false);
  };

  const handleRenameSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!renamingDoc || !newTitle.trim()) return;

    setIsRenaming(true);
    try {
        // Usando a mesma lógica do EditDocumentPage: updateDocument com { title: ... }
        await documentService.updateDocument(renamingDoc.document_id, { title: newTitle });
        
        // Atualiza a lista localmente para refletir a mudança instantaneamente
        setDocuments(prevDocs => 
            prevDocs.map(d => d.document_id === renamingDoc.document_id ? { ...d, title: newTitle } : d)
        );
        handleCloseRename();
    } catch (err) {
        console.error("Erro ao renomear:", err);
        alert("Erro ao renomear o documento.");
    } finally {
        setIsRenaming(false);
    }
  };

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

  const handleS3FileDownload = (fileUrl: string) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = '';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderDocCard = (doc: DocumentList) => {
    //@ts-ignore
    const hasThumbnail = doc.is_uploaded_document && doc.thumbnail_path;
    const file_url: string = doc.file_url || '';

    return (
      <div className={`card w-full h-[28rem] bg-base-100 shadow-md hover:shadow-xl transition-all duration-300 border border-base-200 flex flex-col ${!doc.is_active ? 'opacity-75 grayscale-[0.5]' : ''}`}>
        <figure 
            className="h-44 w-full relative overflow-hidden bg-base-200 shrink-0 group cursor-pointer"
            onClick={() => handleS3FileDownload(file_url)}
        >
            {hasThumbnail ? (
                <img 
                    // @ts-ignore
                    src={doc.thumbnail_path} 
                    alt={doc.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-base-content/20 group-hover:text-primary/50 transition-colors">
                    <FileText size={64} strokeWidth={1} />
                </div>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            <div className="absolute top-3 left-3 right-3 z-10 flex items-start gap-2">
                <div className="bg-base-100/95 backdrop-blur-sm p-3 rounded-lg shadow-sm border border-base-200 max-w-full flex-1">
                    <div className="flex justify-between items-start gap-2">
                        <h3 className="font-bold text-sm text-secondary line-clamp-2 leading-tight" title={doc.title}>
                            {doc.title || "Sem Título"}
                        </h3>
                        <div className={`badge badge-xs shrink-0 mt-1 ${doc.is_active ? 'badge-success' : 'badge-warning'}`} />
                    </div>
                </div>
            </div>
        </figure>

        <div className="card-body p-4 flex flex-col flex-nowrap h-full overflow-hidden">
            <div 
                className="flex flex-wrap gap-1.5 min-h-[1.5rem] content-start cursor-pointer group shrink-0 mb-2"
                onClick={(e) => { e.stopPropagation(); setAreLabelsExpanded(!areLabelsExpanded); }}
                title="Clique para expandir/colapsar etiquetas"
            >
                {doc?.categories_data?.map((category, index) => (
                    <span 
                        key={index}
                        className={`transition-all duration-300 rounded font-bold text-[10px] ${areLabelsExpanded ? 'px-2 py-0.5 badge border-none h-auto' : 'w-8 h-1.5 hover:w-10 hover:opacity-80 rounded-full'}`}
                        style={{ backgroundColor: category.color, color: areLabelsExpanded ? getContrastColor(category.color) : 'transparent' }}
                    >
                        {areLabelsExpanded && category.category}
                    </span>
                ))}
            </div>

            <div className="text-xs text-gray-500 space-y-2 flex-grow min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-base-300 pr-1">
                <div className="flex items-center gap-2"><Building size={14} className="text-primary opacity-70 shrink-0" /><span className="truncate">{doc.enterprise || "N/A"}</span></div>
                <div className="flex items-center gap-2"><Layers size={14} className="text-primary opacity-70 shrink-0" /><span className="truncate">{doc.sector || "N/A"}</span></div>
                <div className="flex items-center gap-2"><User size={14} className="text-primary opacity-70 shrink-0" /><span className="truncate">{doc.creator_name}</span></div>
                <div className="flex items-center gap-2"><Calendar size={14} className="text-primary opacity-70 shrink-0" /><span>{doc.created_at}</span></div>
            </div>

            <div className="card-actions justify-end gap-1 mt-auto pt-3 border-t border-base-200">
                <div className="tooltip tooltip-left" data-tip={doc.file_url ? "Baixar" : "Editar"}>
                   <button onClick={() => doc.file_url ? handleS3FileDownload(doc.file_url) : handleEditClick(doc.document_id)} className="btn btn-square btn-sm btn-ghost text-primary hover:bg-primary/10">
                      {doc.file_url ? <Eye size={18} /> : <Edit size={18} />}
                   </button>
                </div>

                {/* --- BOTÃO DE RENOMEAR (CARD) --- */}
                <div className="tooltip tooltip-top" data-tip="Renomear">
                   <button onClick={() => handleOpenRename(doc)} className="btn btn-square btn-sm btn-ghost text-info hover:bg-info/10">
                      <FilePenLine size={18} />
                   </button>
                </div>

                <div className="tooltip tooltip-top" data-tip="Configurações">
                    <button onClick={() => handleModalOpen(doc.document_id)} className="btn btn-square btn-sm btn-ghost text-secondary hover:bg-secondary/10"><Settings size={18} /></button>
                </div>
                <div className="w-px h-5 bg-base-300 mx-1 self-center"></div>
                <div className="tooltip tooltip-top" data-tip={doc.is_active ? 'Desativar' : 'Ativar'}>
                    <button onClick={() => requestToggleStatus(doc)} className={`btn btn-square btn-sm btn-ghost ${doc.is_active ? 'text-warning hover:bg-warning/10' : 'text-success hover:bg-success/10'}`}><Power size={18} /></button>
                </div>
                <div className="tooltip tooltip-top" data-tip="Excluir">
                    <button onClick={() => requestDelete(doc)} className="btn btn-square btn-sm btn-ghost text-error hover:bg-error/10"><Trash2 size={18} /></button>
                </div>
            </div>
        </div>
      </div>
    );
  };

  const renderListView = (docs: DocumentList[]) => {
    return (
      <div className="w-full rounded-lg border border-base-200 bg-base-100 shadow-sm overflow-visible">
        <table className="table table-sm w-full table-fixed">
          
          <thead className="bg-base-200 text-xs font-bold text-gray-500 uppercase">
            <tr>
              <th className="w-12 text-center">St</th>
              <th className="w-auto">Documento</th>
              <th className="hidden lg:table-cell w-48">Contexto</th>
              <th className="hidden md:table-cell w-36">Criador / Data</th>
              <th className="hidden xl:table-cell w-40">Etiquetas</th>
              <th className="w-20 text-end">Ações</th>
            </tr>
          </thead>
          
          <tbody>
            {docs.map(doc => (
              <tr key={doc.document_id} className={`hover group ${!doc.is_active ? 'opacity-60 grayscale-[0.3]' : ''}`}>
                
                <td className="text-center align-middle">
                    <div className={`w-2.5 h-2.5 rounded-full mx-auto ${doc.is_active ? 'bg-success' : 'bg-warning'}`} title={doc.is_active ? "Ativo" : "Inativo"}></div>
                </td>

                <td className="align-middle py-3">
                    <div className="flex flex-col gap-0.5 pr-2">
                        <span 
                            className="font-bold text-secondary text-sm hover:text-primary cursor-pointer truncate"
                            onClick={() => doc.file_url && handleS3FileDownload(doc.file_url)}
                            title={doc.title}
                        >
                            {doc.title || "Sem Título"}
                        </span>
                        
                        <span className="text-[10px] text-gray-400 font-mono hidden sm:block">Ref: #{doc.document_id}</span>
                        
                        <div className="flex flex-col gap-1 mt-1 sm:hidden">
                            <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                <Building size={10} /> {doc.enterprise} 
                                <span className="opacity-50">|</span> 
                                <Layers size={10} /> {doc.sector}
                            </span>
                            <span className="text-[10px] text-gray-400">
                                {doc.created_at}
                            </span>
                        </div>
                    </div>
                </td>

                <td className="hidden lg:table-cell align-middle">
                    <div className="flex flex-col text-xs text-gray-500 truncate">
                        <span className="font-semibold flex items-center gap-1 truncate" title={doc.enterprise || ''}>
                            <Building size={12} className="shrink-0" /> {doc.enterprise || "-"}
                        </span>
                        <span className="flex items-center gap-1 truncate" title={doc.sector || ''}>
                            <Layers size={12} className="shrink-0" /> {doc.sector || "-"}
                        </span>
                    </div>
                </td>

                <td className="hidden md:table-cell align-middle">
                    <div className="flex flex-col text-xs text-gray-500 truncate">
                         <span className="font-medium truncate" title={doc.creator_name}>{doc.creator_name}</span>
                         <span className="text-[10px]">{doc.created_at}</span>
                    </div>
                </td>

                <td className="hidden xl:table-cell align-middle">
                    <div className="flex flex-wrap gap-1 max-h-8 overflow-hidden">
                        {doc.categories_data?.slice(0, 2).map((cat, idx) => (
                            <span 
                                key={idx} 
                                className="badge badge-xs border-none text-[10px] font-bold text-white px-1.5 py-2 truncate max-w-[100px]"
                                style={{ backgroundColor: cat.color, color: getContrastColor(cat.color) }}
                            >
                                {cat.category}
                            </span>
                        ))}
                        {(doc.categories_data?.length || 0) > 2 && (
                             <span className="badge badge-ghost badge-xs text-[9px]">+{(doc.categories_data?.length || 0) - 2}</span>
                        )}
                    </div>
                </td>

                <td className="text-end align-middle">
                    <div className="dropdown dropdown-end dropdown-left sm:dropdown-end">
                        <label tabIndex={0} className="btn btn-sm btn-ghost btn-square text-gray-500">
                            <MoreVertical size={16} />
                        </label>
                        <ul tabIndex={0} className="dropdown-content z-50 menu p-2 shadow-lg bg-base-100 rounded-box w-48 border border-base-200">
                            <li>
                                <a onClick={() => doc.file_url ? handleS3FileDownload(doc.file_url) : handleEditClick(doc.document_id)}>
                                    {doc.file_url ? <Eye size={14} /> : <Edit size={14} />} 
                                    {doc.file_url ? "Visualizar" : "Editar"}
                                </a>
                            </li>
                            {/* --- BOTÃO DE RENOMEAR (LISTA) --- */}
                            <li>
                                <a onClick={() => handleOpenRename(doc)}>
                                    <FilePenLine size={14} /> Renomear
                                </a>
                            </li>
                            <li>
                                <a onClick={() => handleModalOpen(doc.document_id)}>
                                    <Settings size={14} /> Configurações
                                </a>
                            </li>
                            <div className="divider my-1"></div>
                            <li>
                                <a onClick={() => requestToggleStatus(doc)} className={doc.is_active ? "text-warning" : "text-success"}>
                                    <Power size={14} /> {doc.is_active ? "Desativar" : "Ativar"}
                                </a>
                            </li>
                            <li>
                                <a onClick={() => requestDelete(doc)} className="text-error hover:bg-error/10">
                                    <Trash2 size={14} /> Excluir
                                </a>
                            </li>
                        </ul>
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

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
              
              {viewMode === 'list' ? (
                renderListView(group.docs)
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {group.docs.map(doc => (
                    <div key={doc.document_id}>{renderDocCard(doc)}</div>
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4">
            {viewMode === 'list' ? (
                renderListView(documents)
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {documents.map(doc => (
                        <div key={doc.document_id}>{renderDocCard(doc)}</div>
                    ))}
                </div>
            )}
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

      {/* --- MODAL DE RENOMEAR --- */}
      {renamingDoc && (
        <div className="modal modal-open">
            <form onSubmit={handleRenameSubmit} className="modal-box relative">
                <button 
                    type="button" 
                    className="btn btn-sm btn-circle absolute right-2 top-2" 
                    onClick={handleCloseRename}
                >✕</button>
                <h3 className="text-lg font-bold mb-4">Renomear Documento</h3>
                
                <div className="form-control w-full">
                    <label className="label">
                        <span className="label-text">Novo Título</span>
                    </label>
                    <input 
                        type="text" 
                        placeholder="Digite o novo nome..." 
                        className="input input-bordered w-full focus:input-primary" 
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        autoFocus
                    />
                </div>

                <div className="modal-action">
                    <button type="button" className="btn btn-ghost" onClick={handleCloseRename} disabled={isRenaming}>Cancelar</button>
                    <button type="submit" className="btn btn-primary" disabled={isRenaming || !newTitle.trim()}>
                        {isRenaming ? <Loader2 className="animate-spin" size={20} /> : "Salvar"}
                    </button>
                </div>
            </form>
            <div className="modal-backdrop bg-black/50" onClick={handleCloseRename}></div>
        </div>
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