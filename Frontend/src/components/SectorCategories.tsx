import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Loader2, AlertCircle, Tag } from 'lucide-react'; 
import toast from 'react-hot-toast';

import documentService from '../services/Document/api';
import sectorService from '../services/Sector/api'; 
import { useAuth } from '../contexts/AuthContext'; 
import type { Category } from '../services/core-api';

// Modais
import CreateCategoryModal from '../components/CreateCategoryModal';
import EditCategoryModal from '../components/EditCategoryModal'; 
import ConfirmModal from '../components/ConfirmModal'; // 1. Importe o Modal Genérico

import '../assets/css/EnterprisePage.css';
import '../assets/css/SectorCategories.css'; 

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

  // 2. Novo Estado para o Modal de Exclusão
  const [deleteModalConfig, setDeleteModalConfig] = useState<{ isOpen: boolean; categoryId: number | null }>({
    isOpen: false,
    categoryId: null
  });
  const [isDeleting, setIsDeleting] = useState(false); // Loading do botão do modal

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
        //@ts-ignore
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

  // --- 3. Handler para ABRIR o Modal ---
  const requestDelete = (categoryId: number) => {
    setDeleteConfirmation({ isOpen: true, categoryId });
  };
  
  // Helper para atualizar o estado do modal de forma limpa
  const setDeleteConfirmation = (config: { isOpen: boolean; categoryId: number | null }) => {
    setDeleteModalConfig(config);
  };

  // --- 4. Handler para EXECUTAR a Exclusão (Passado para o Modal) ---
  const handleConfirmDelete = async () => {
    const categoryId = deleteModalConfig.categoryId;
    if (!categoryId) return;

    setIsDeleting(true);
    
    try {
      await documentService.deleteCategory(categoryId, sectorId);
      
      // Atualiza a lista localmente
      setCategories(prev => prev.filter(cat => cat.category_id !== categoryId));
      toast.success("Categoria excluída com sucesso.");
      
      // Fecha o modal
      setDeleteConfirmation({ isOpen: false, categoryId: null });

    } catch (err: any) {
      const errMsg = err.response?.data?.data?.non_field_errors?.[0] || "Falha ao excluir categoria.";
      toast.error(errMsg);
      // Fecha o modal mesmo em erro (ou pode manter aberto se preferir)
      setDeleteConfirmation({ isOpen: false, categoryId: null });
    } finally {
      setIsDeleting(false);
    }
  };

  // --- RENDERIZAÇÃO ---

  if (isLoading && !categories.length) {
    return (
        <div className="d-flex justify-content-center align-items-center py-5 text-muted">
            <Loader2 className="animate-spin me-2" size={24} />
            <span>Carregando categorias...</span>
        </div>
    );
  }

  if (error && !categories.length) {
    return (
        <div className="alert alert-danger d-flex align-items-center mt-3" role="alert">
            <AlertCircle className="me-2" size={20} />
            <div>{error}</div>
        </div>
    );
  }

  return (
    <div className="mt-4">
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="fw-bold text-secondary mb-0">Categorias do Setor</h5>
        
        {canEdit && (
            <button 
            className="btn btn-primary-custom btn-sm d-flex align-items-center gap-2 shadow-sm"
            onClick={() => setIsCreateModalOpen(true)}
            >
            <Plus size={18} />
            <span>Nova Categoria</span>
            </button>
        )}
      </div>

      {categories.length === 0 ? (
        <div className="text-center text-muted py-5 bg-light rounded border border-dashed">
            <Tag size={48} className="opacity-25 mb-3" />
            <p className="mb-0">Nenhuma categoria encontrada para este setor.</p>
            {canEdit && <small>Crie categorias para organizar melhor os documentos.</small>}
        </div>
      ) : (
        <div className="category-grid">
          {categories.map((category) => (
            <div key={category.category_id} className="card h-100 border shadow-sm hover-effect">
              <div className="card-body d-flex flex-column">
                
                <div className="d-flex justify-content-between align-items-start mb-2">
                    <h6 className="fw-bold text-dark mb-0 text-truncate" title={category.category}>
                        {category.category}
                    </h6>
                    <span className={`badge ${category.is_public ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'} border`}>
                        {category.is_public ? 'Pública' : 'Privada'}
                    </span>
                </div>

                <p className="text-muted small flex-grow-1 mb-3" style={{ minHeight: '40px' }}>
                  {category.description || <span className="fst-italic opacity-50">Sem descrição.</span>}
                </p>
                
                {canEdit && (
                    <div className="d-flex justify-content-end gap-2 pt-2 border-top">
                    <button 
                        className="btn btn-light btn-sm text-primary"
                        onClick={() => setCategoryToEdit(category)}
                        title="Editar Categoria"
                    >
                        <Pencil size={16} />
                    </button>

                    <button 
                        className="btn btn-light btn-sm text-danger"
                        // 5. Atualizado para chamar requestDelete
                        onClick={() => requestDelete(category.category_id)}
                        title="Excluir Categoria"
                    >
                        <Trash2 size={16} />
                    </button>
                    </div>
                )}

              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modais de Criação e Edição */}
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

      {/* 6. Modal de Confirmação de Exclusão */}
      <ConfirmModal 
        isOpen={deleteModalConfig.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, categoryId: null })}
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