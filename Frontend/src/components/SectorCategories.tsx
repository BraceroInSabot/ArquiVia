import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Loader2, AlertCircle, Tag } from 'lucide-react'; 
import toast from 'react-hot-toast';

import documentService from '../services/Document/api';
import sectorService from '../services/Sector/api'; // Necessário para buscar permissões
import { useAuth } from '../contexts/AuthContext'; // Necessário para pegar o usuário logado
import type { Category } from '../services/core-api';
import CreateCategoryModal from '../components/CreateCategoryModal';
import EditCategoryModal from '../components/EditCategoryModal'; 

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

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchAllData = useCallback(async () => {
    if (!sectorId || !loggedInUser) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // 1. Busca Categorias
      const categoriesPromise = documentService.listCategoriesBySector(sectorId);
      
      // 2. Busca Usuários do Setor para determinar permissão (igual ao SectorUsers)
      const usersPromise = sectorService.getSectorUsers(sectorId);

      const [categoriesResponse, usersResponse] = await Promise.all([categoriesPromise, usersPromise]);
      
      setCategories(categoriesResponse.data.data || []);

      // 3. Lógica de Permissão
      const sectorUsers = usersResponse.data.data;
      if (Array.isArray(sectorUsers)) {
        //@ts-ignore
        const currentUserRole = sectorUsers.find(u => u.user_id === loggedInUser.data.user_id)?.role;
        
        // Se for Proprietário, Gestor ou Admin, pode editar. Membro não.
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

  const handleDelete = async (categoryId: number) => {
    if (!window.confirm("Tem certeza que deseja excluir esta categoria?")) return;

    setDeletingId(categoryId); 
    try {
      await documentService.deleteCategory(categoryId, sectorId);
      setCategories(prev => prev.filter(cat => cat.category_id !== categoryId));
      toast.success("Categoria excluída com sucesso.");
    } catch (err: any) {
      const errMsg = err.response?.data?.data?.non_field_errors?.[0] || "Falha ao excluir categoria.";
      toast.error(errMsg);
    } finally {
      setDeletingId(null);
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
      
      {/* Cabeçalho da Seção */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="fw-bold text-secondary mb-0">Categorias do Setor</h5>
        
        {/* Botão de Criar (Só aparece se tiver permissão) */}
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
                
                {/* Botões de Ação (Só aparecem se tiver permissão) */}
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
                        onClick={() => handleDelete(category.category_id)}
                        disabled={deletingId === category.category_id}
                        title="Excluir Categoria"
                    >
                        {deletingId === category.category_id ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <Trash2 size={16} />
                        )}
                    </button>
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
          onSuccess={() => fetchAllData()} // Recarrega tudo
        />
      )}

      {categoryToEdit && (
        <EditCategoryModal
          sectorId={sectorId}
          category={categoryToEdit}
          onClose={() => setCategoryToEdit(null)}
          onSuccess={() => fetchAllData()} // Recarrega tudo
        />
      )}
    </div>
  );
};

export default SectorCategories;