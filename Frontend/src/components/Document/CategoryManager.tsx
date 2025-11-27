import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, Tag, Loader2 } from 'lucide-react'; // Ícones
import type { Category } from '../../services/core-api';
import documentService from '../../services/Document/api';

// Não precisamos mais importar CSS externo
// import '../../assets/css/ClassificationModal.css';

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
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);

  useEffect(() => {
    setIsLoadingSearch(true);
    documentService.listDiponibleCategories(documentId)
      .then(response => {
        setAvailableCategories(response.data.data || []);
      })
      .catch(err => console.error("Erro ao buscar categorias disponíveis:", err))
      .finally(() => setIsLoadingSearch(false));
  }, [documentId]);

  const searchResults = useMemo(() => {
    if (!searchTerm) return [];

    return availableCategories.filter(availableCat => {
      const matchesSearch = availableCat.category.toLowerCase().includes(searchTerm.toLowerCase());
      const isAlreadyLinked = linkedCategories.some(
        linkedCat => linkedCat.category_id === availableCat.category_id
      );
      return matchesSearch && !isAlreadyLinked;
    });
  }, [searchTerm, availableCategories, linkedCategories]);

  const handleAddCategory = (categoryToAdd: Category) => {
    onCategoryChange([...linkedCategories, categoryToAdd]);
    setSearchTerm('');
  };

  const handleRemoveCategory = (categoryIdToRemove: number) => {
    const newList = linkedCategories.filter(c => c.category_id !== categoryIdToRemove);
    onCategoryChange(newList);
  };

  return (
    <div className="mt-4">
      
      {/* Título da Seção */}
      <h5 className="font-bold text-sm text-gray-500 uppercase mb-3 flex items-center gap-2">
        <Tag size={16} /> Categorias
      </h5>
      
      {/* Campo de Busca */}
      <div className="form-control w-full relative mb-4">
        <div className="input-group w-full">
            {/* Ícone Search dentro do input (simulado com join ou absolute) */}
            <label className="input input-bordered flex items-center gap-2 w-full focus-within:input-primary">
                <Search size={18} className="text-gray-400" />
                <input 
                    type="text" 
                    className="grow" 
                    placeholder="Buscar categorias para adicionar..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </label>
        </div>
        
        {/* Dropdown de Resultados (Absoluto) */}
        {(isLoadingSearch || searchResults.length > 0 || (searchTerm && !isLoadingSearch)) && (
          <ul className="menu bg-base-100 w-full rounded-box border border-base-200 shadow-lg absolute top-full left-0 mt-1 z-20 max-h-40 overflow-y-auto p-1">
            {isLoadingSearch ? (
              <li className="disabled">
                <a><Loader2 size={16} className="animate-spin" /> Buscando...</a>
              </li>
            ) : searchResults.length > 0 ? (
              searchResults.map(cat => (
                <li key={cat.category_id}>
                  <a onClick={() => handleAddCategory(cat)} className="flex justify-between items-center">
                    <span>{cat.category}</span>
                  </a>
                </li>
              ))
            ) : (
              <li className="disabled"><a className="italic text-gray-400">Nenhuma categoria encontrada.</a></li>
            )}
          </ul>
        )}
      </div>

      {/* Lista de Categorias Vinculadas (Pills) */}
      <div className="flex flex-wrap gap-2 p-3 bg-base-100 border border-base-200 rounded-lg min-h-[3rem]">
        {linkedCategories.length === 0 ? (
          <p className="text-gray-400 text-sm italic w-full text-center py-1">Este documento não possui categorias.</p>
        ) : (
          linkedCategories.map(category => (
            <div key={category.category_id} className="badge badge-primary badge-lg gap-2 text-white pl-3 pr-1 py-3">
              {category.category}
              <button 
                onClick={() => handleRemoveCategory(category.category_id)}
                className="btn btn-circle btn-xs btn-ghost text-white hover:bg-white/20"
              >
                <X size={14} />
              </button>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default CategoryManager;