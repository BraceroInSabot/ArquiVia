import React, { useState, useEffect, useMemo } from 'react';
import type { Category } from '../../services/core-api';
import documentService from '../../services/Document/api';
import '../../assets/css/ClassificationModal.css';

interface CategoryManagerProps {
  documentId: number;
  linkedCategories: Category[]; // Categorias já vinculadas
  onCategoryChange: (newCategoryList: Category[]) => void; // Callback para atualizar o estado no "pai"
}

const CategoryManager: React.FC<CategoryManagerProps> = ({
  documentId,
  linkedCategories,
  onCategoryChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // --- LÓGICA DE BUSCA (REFEITA) ---
  // 1. Armazena a lista completa de categorias disponíveis (da API)
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);

  // 2. Busca todas as categorias disponíveis UMA VEZ quando o modal abre
  useEffect(() => {
    setIsLoadingSearch(true);
    documentService.listDiponibleCategories(documentId)
      .then(response => {
        setAvailableCategories(response.data.data || []);
      })
      .catch(err => console.error("Erro ao buscar categorias disponíveis:", err))
      .finally(() => setIsLoadingSearch(false));
  }, [documentId]); // Roda uma vez

  // 3. Filtra localmente (useMemo para performance)
  const searchResults = useMemo(() => {
    // Não mostra nada se a busca estiver vazia
    if (!searchTerm) {
      return [];
    }

    // Filtra a lista local 'availableCategories'
    return availableCategories.filter(availableCat => {
      // Condição 1: O texto deve bater (case-insensitive)
      const matchesSearch = availableCat.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Condição 2: Não pode já estar na lista 'linkedCategories'
      const isAlreadyLinked = linkedCategories.some(
        linkedCat => linkedCat.category_id === availableCat.category_id
      );

      return matchesSearch && !isAlreadyLinked;
    });
  }, [searchTerm, availableCategories, linkedCategories]);

  // --- FIM DA LÓGICA DE BUSCA ---

  // Adiciona uma categoria à lista local
  const handleAddCategory = (categoryToAdd: Category) => {
    // Atualiza o estado no componente PAI
    onCategoryChange([...linkedCategories, categoryToAdd]);
    
    // Limpa a busca
    setSearchTerm('');
  };

  // Remove uma categoria da lista local (clicando no 'X')
  const handleRemoveCategory = (categoryIdToRemove: number) => {
    const newList = linkedCategories.filter(c => c.category_id !== categoryIdToRemove);
    onCategoryChange(newList); // Atualiza o estado no PAI
  };

  return (
    <div className="category-manager">
      <h5 className="section-title">Categorias</h5>
      
      {/* --- CAMPO DE BUSCA (AGORA FUNCIONAL) --- */}
      <div className="category-search-container">
        <input
          type="text"
          placeholder="Buscar categorias para adicionar..."
          className="category-search-input form-control mb-2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          // Habilitado (removemos 'disabled={true}')
        />
        
        {/* Container de Resultados (só aparece se houver busca) */}
        {(isLoadingSearch || searchResults.length > 0 || (searchTerm && !isLoadingSearch)) && (
          <ul className="search-results-list">
            {isLoadingSearch ? (
              <li className="search-result-item loading">Buscando...</li>
            ) : searchResults.length > 0 ? (
              searchResults.map(cat => (
                <li 
                  key={cat.category_id} 
                  className="search-result-item"
                  onClick={() => handleAddCategory(cat)}
                  style={{ cursor: 'pointer' }}
                >
                  {cat.category}
                </li>
              ))
            ) : (
              <li className="search-result-item loading">Nenhum resultado.</li>
            )}
          </ul>
        )}
      </div>

      {/* --- CATEGORIAS VINCULADAS (Pills) --- */}
      <div className="category-pill-container">
        {linkedCategories.length === 0 ? (
          <p className="category-empty-text">Este documento não possui categorias.</p>
        ) : (
          linkedCategories.map(category => (
            <span key={category.category_id} className="category-pill">
              {category.category}
              {/* Botão de Remover ('X') */}
              <button 
                className="remove-pill-btn" 
                title="Remover Categoria"
                onClick={() => handleRemoveCategory(category.category_id)}
              >
                &times;
              </button> 
            </span>
          ))
        )}
      </div>
    </div>
  );
};

export default CategoryManager;