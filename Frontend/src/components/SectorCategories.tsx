import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Loader2, AlertCircle, Tag } from 'lucide-react'; // Ícones
import toast from 'react-hot-toast';

import documentService from '../services/Document/api';
import type { Category } from '../services/core-api';
import CreateCategoryModal from '../components/CreateCategoryModal';
import EditCategoryModal from '../components/EditCategoryModal'; 

// Import do CSS (Reutiliza o CSS base de Enterprise para cores e cards)
import '../assets/css/EnterprisePage.css';
import '../assets/css/SectorCategories.css'; // CSS específico (veja abaixo)

interface SectorCategoriesProps {
  sectorId: number;
}

const SectorCategories: React.FC<SectorCategoriesProps> = ({ sectorId }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchCategories = useCallback(async () => {
    if (!sectorId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await documentService.listCategoriesBySector(sectorId);
      setCategories(response.data.data || []);
    } catch (err: any) {
      console.error("Erro ao buscar categorias:", err);
      setError("Falha ao carregar categorias.");
    } finally {
      setIsLoading(false);
    }
  }, [sectorId]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleDelete = async (categoryId: number) => {
    if (!window.confirm("Tem certeza que deseja excluir esta categoria?")) return;

    setDeletingId(categoryId); 
    try {
      await documentService.deleteCategory(categoryId, sectorId);
      setCategories(prev => prev.filter(cat => cat.category_id !== categoryId));
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
        <button 
          className="btn btn-primary-custom btn-sm d-flex align-items-center gap-2 shadow-sm"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus size={18} />
          <span>Nova Categoria</span>
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="text-center text-muted py-5 bg-light rounded border border-dashed">
            <Tag size={48} className="opacity-25 mb-3" />
            <p className="mb-0">Nenhuma categoria encontrada para este setor.</p>
            <small>Crie categorias para organizar melhor os documentos.</small>
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
          onSuccess={() => fetchCategories()}
        />
      )}

      {categoryToEdit && (
        <EditCategoryModal
          sectorId={sectorId}
          category={categoryToEdit}
          onClose={() => setCategoryToEdit(null)}
          onSuccess={() => fetchCategories()}
        />
      )}
    </div>
  );
};

export default SectorCategories;