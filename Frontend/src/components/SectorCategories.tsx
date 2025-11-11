import React, { useState, useEffect, useCallback } from 'react';
import documentService from '../services/Document/api';
import type { Category } from '../services/core-api';
import CreateCategoryModal from '../components/CreateCategoryModal'; // <-- Importe o Modal

import '../assets/css/SectorCategories.css'; 

interface SectorCategoriesProps {
  sectorId: number;
}

const SectorCategories: React.FC<SectorCategoriesProps> = ({ sectorId }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Estado para feedback visual durante exclusão (opcional, mas bom UX)
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
      const errMsg = err.response?.data?.message || "Falha ao carregar categorias.";
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  }, [sectorId]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // --- NOVA FUNÇÃO: Excluir Categoria ---
  const handleDelete = async (categoryId: number) => {
    if (!window.confirm("Tem certeza que deseja excluir esta categoria?")) return;

    setDeletingId(categoryId); // Ativa loading no item
    try {
      const response = await documentService.deleteCategory(categoryId, sectorId);
      // Remove da lista localmente (mais rápido que recarregar tudo)
      
      setCategories(prev => prev.filter(cat => cat.category_id !== categoryId));
    } catch (err: any) {
      const errMsg = err.response?.data?.data?.non_field_errors?.[0] || "Falha ao excluir categoria.";
      alert(errMsg);
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading && !categories.length) {
    return <p>Carregando categorias...</p>;
  }

  if (error && !categories.length) {
    return <p className="category-error">{error}</p>;
  }

  return (
    <div className="sector-categories-container">
      
      <div className="sector-categories-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3>Categorias do Setor</h3>
        <button 
          className="modal-save-btn" 
          onClick={() => setIsCreateModalOpen(true)}
          style={{ fontSize: '0.9rem', padding: '8px 16px' }}
        >
          + Nova Categoria
        </button>
      </div>

      {categories.length === 0 ? (
        <p>Nenhuma categoria encontrada para este setor.</p>
      ) : (
        <ul className="category-list">
          {categories.map((category) => (
            <li key={category.category_id} className="category-item">
              <div className="category-item-header">
                <span className="category-title">{category.category}</span>
                <span className={`category-badge ${category.is_public ? 'public' : 'private'}`}>
                  {category.is_public ? 'Pública' : 'Privada'}
                </span>
              </div>
              <p className="category-description">
                {category.description || "Esta categoria não possui descrição."}
              </p>
              
              {/* --- NOVO BOTÃO: Excluir --- */}
              <div className="category-item-footer" style={{ marginTop: '10px', textAlign: 'right' }}>
                <button 
                  className="delete-category-btn"
                  onClick={() => handleDelete(category.category_id)}
                  disabled={deletingId === category.category_id}
                >
                  {deletingId === category.category_id ? "Excluindo..." : "Excluir"}
                </button>
              </div>

            </li>
          ))}
        </ul>
      )}

      {isCreateModalOpen && (
        <CreateCategoryModal
          sectorId={sectorId}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            fetchCategories(); 
          }}
        />
      )}
    </div>
  );
};

export default SectorCategories;