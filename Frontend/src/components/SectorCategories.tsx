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
  
  // Estado para o modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Transformei em useCallback para poder chamar novamente no 'onSuccess'
  const fetchCategories = useCallback(async () => {
    if (!sectorId) return;
    setIsLoading(true);
    setError(null);
    try {
      // Ajuste se sua função estiver em outro serviço
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

  if (isLoading && !categories.length) { // Mostra loading só se não tiver dados
    return <p>Carregando categorias...</p>;
  }

  // (Se der erro no carregamento inicial)
  if (error && !categories.length) {
    return <p className="category-error">{error}</p>;
  }

  return (
    <div className="sector-categories-container">
      
      {/* --- HEADER COM BOTÃO DE CRIAR --- */}
      <div className="sector-categories-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3>Categorias do Setor</h3>
        <button 
          className="modal-save-btn" // Reutilizando classe de botão azul
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
            </li>
          ))}
        </ul>
      )}

      {/* --- MODAL DE CRIAÇÃO --- */}
      {isCreateModalOpen && (
        <CreateCategoryModal
          sectorId={sectorId}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            // Recarrega a lista após criar com sucesso
            fetchCategories(); 
          }}
        />
      )}
    </div>
  );
};

export default SectorCategories;