import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Loader2, AlertCircle, Tag } from 'lucide-react'; 
import toast from 'react-hot-toast';

import documentService from '../../services/Document/api';
import sectorService from '../../services/Sector/api'; 
import { useAuth } from '../../contexts/AuthContext'; 
import type { Category } from '../../services/core-api';

// Modais
import CreateCategoryModal from '../../components/modal/CreateCategoryModal';
import EditCategoryModal from '../../components/modal/EditCategoryModal'; 
import ConfirmModal from '../../components/modal/ConfirmModal';

interface SectorCategoriesProps {
  sectorId: number;
}

const SectorCategories: React.FC<SectorCategoriesProps> = ({ sectorId }) => {
  const { user: loggedInUser } = useAuth();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estado de Permissão
  const [canEdit, setCanEdit] = useState(false);

  // Estados dos Modais de Criação/Edição
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);

  // Estado para o Modal de Exclusão
  const [deleteModalConfig, setDeleteModalConfig] = useState<{ isOpen: boolean; categoryId: number | null }>({
    isOpen: false,
    categoryId: null
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchAllData = useCallback(async () => {
    if (!sectorId || !loggedInUser) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const categoriesPromise = documentService.listCategoriesBySector(sectorId);
      const usersPromise = sectorService.getSectorUsers(sectorId);

      const [categoriesResponse, usersResponse] = await Promise.all([categoriesPromise, usersPromise]);
      
      setCategories(categoriesResponse.data.data || []);

      const sectorUsers = usersResponse.data.data;
      if (Array.isArray(sectorUsers)) {
        // @ts-ignore
        const currentUserRole = sectorUsers.find(u => u.user_id === loggedInUser.data.user_id)?.role;
        
        if (currentUserRole) {
            const role = currentUserRole.toLowerCase();
            if (role === 'proprietário' || role === 'gestor' || role === 'administrador') {
                setCanEdit(true);
            } else {
                setCanEdit(false);
            }
        }
      }

    } catch (err: any) {
      console.error("Erro ao buscar dados:", err);
      setError("Falha ao carregar dados.");
    } finally {
      setIsLoading(false);
    }
  }, [sectorId, loggedInUser]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Handler para abrir o modal de exclusão
  const requestDelete = (categoryId: number) => {
    setDeleteModalConfig({ isOpen: true, categoryId });
  };

  // Handler para confirmar a exclusão
  const handleConfirmDelete = async () => {
    const categoryId = deleteModalConfig.categoryId;
    if (!categoryId) return;

    setIsDeleting(true);
    
    try {
      await documentService.deleteCategory(categoryId, sectorId);
      
      setCategories(prev => prev.filter(cat => cat.category_id !== categoryId));
      toast.success("Categoria excluída com sucesso.");
      
      setDeleteModalConfig({ isOpen: false, categoryId: null });

    } catch (err: any) {
      const errMsg = err.response?.data?.data?.non_field_errors?.[0] || "Falha ao excluir categoria.";
      toast.error(errMsg);
      setDeleteModalConfig({ isOpen: false, categoryId: null });
    } finally {
      setIsDeleting(false);
    }
  };

  // --- RENDERIZAÇÃO ---

  if (isLoading && !categories.length) {
    return (
        <div className="flex justify-center items-center py-10 text-gray-400">
            <Loader2 className="animate-spin mr-2" size={24} />
            <span>Carregando categorias...</span>
        </div>
    );
  }

  if (error && !categories.length) {
    return (
        <div className="alert alert-error shadow-lg mt-4">
            <AlertCircle size={20} />
            <span>{error}</span>
        </div>
    );
  }

  console.log('Categorias carregadas:', categories);

  return (
    <div className="mt-6">
      
      {/* Cabeçalho da Seção */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-lg text-secondary">Categorias do Setor</h3>
        
        {canEdit && (
            <button 
                className="btn btn-primary btn-sm gap-2 text-white shadow-md hover:shadow-lg"
                onClick={() => setIsCreateModalOpen(true)}
            >
                <Plus size={16} />
                <span className="hidden sm:inline">Nova Categoria</span>
            </button>
        )}
      </div>

      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 bg-base-200 rounded-xl border border-dashed border-base-300 text-center">
            <div className="bg-base-100 p-3 rounded-full mb-3">
                <Tag size={32} className="text-base-content/30" />
            </div>
            <p className="font-medium text-secondary">Nenhuma categoria encontrada.</p>
            {canEdit && <p className="text-sm text-gray-500 mt-1">Crie categorias para organizar os documentos.</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div key={category.category_id} className="card bg-base-100 shadow-sm border border-base-200 hover:shadow-md transition-shadow duration-200">
              <div className="card-body p-5">
                
                <div className="flex justify-between items-start mb-2">
                  <div className='flex gap-2'>
                    <h4 className="card-title text-base text-secondary line-clamp-1" title={category.category}>
                        {category.category}
                    </h4>
                    <div 
                        aria-label="status" 
                        className='h-3 w-3 rounded-full shadow-sm shrink-0' 
                        style={{backgroundColor: category.color}}
                    >
                    </div>
                  </div>
                  <div className={`badge badge-sm ${category.is_public ? 'badge-success text-white' : 'badge-neutral'} gap-1`}>
                      {category.is_public ? 'Pública' : 'Privada'}
                  </div>
                </div>

                <p className="text-sm text-gray-500 line-clamp-2 min-h-[40px]">
                  {category.description || <span className="italic opacity-50">Sem descrição.</span>}
                </p>
                
                {canEdit && (
                    <div className="card-actions justify-end mt-4 pt-3 border-t border-base-200">
                        <div className="tooltip tooltip-bottom" data-tip="Editar">
                            <button 
                                className="btn btn-square btn-ghost btn-sm text-primary"
                                onClick={() => setCategoryToEdit(category)}
                            >
                                <Pencil size={16} />
                            </button>
                        </div>

                        <div className="tooltip tooltip-bottom" data-tip="Excluir">
                            <button 
                                className="btn btn-square btn-ghost btn-sm text-error"
                                onClick={() => requestDelete(category.category_id)}
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                )}

              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modais */}
      {isCreateModalOpen && (
        <CreateCategoryModal
          sectorId={sectorId}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => fetchAllData()} 
        />
      )}

      {categoryToEdit && (
        <EditCategoryModal
          sectorId={sectorId}
          category={categoryToEdit}
          onClose={() => setCategoryToEdit(null)}
          onSuccess={() => fetchAllData()} 
        />
      )}

      {/* Modal de Confirmação Genérico */}
      <ConfirmModal 
        isOpen={deleteModalConfig.isOpen}
        onClose={() => setDeleteModalConfig({ isOpen: false, categoryId: null })}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Excluir Categoria"
        message="Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita e pode afetar documentos vinculados."
        variant="danger"
        confirmText="Sim, Excluir"
        cancelText="Cancelar"
      />
    </div>
  );
};

export default SectorCategories;