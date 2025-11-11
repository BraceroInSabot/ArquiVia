import React, { useState, useEffect } from 'react';
import documentService from '../services/Document/api';
import type { Category } from '../services/core-api';

import '../assets/css/SectorCategories.css'; 

interface SectorCategoriesProps {
  sectorId: number;
}

const SectorCategories: React.FC<SectorCategoriesProps> = ({ sectorId }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sectorId) return;

    const fetchCategories = async () => {
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
    };

    fetchCategories();
  }, [sectorId]); // Depende do sectorId

  // 7. Renderização condicional
  if (isLoading) {
    return <p>Carregando categorias...</p>;
  }

  if (error) {
    return <p className="category-error">{error}</p>;
  }

  return (
    <div className="sector-categories-container">
      {categories.length === 0 ? (
        <p>Nenhuma categoria encontrada para este setor.</p>
      ) : (
        <ul className="category-list">
          {categories.map((category) => (
            <li key={category.category_id} className="category-item">
              <div className="category-item-header">
                <span className="category-title">{category.category}</span>
                {/* Badge (Distintivo) de Público/Privado */}
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
    </div>
  );
};

export default SectorCategories;