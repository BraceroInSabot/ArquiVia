import React, { useState, useEffect, useMemo } from 'react';
import { UserSearch, Filter, FunnelX, X as XIcon, Loader2, Tag, User } from 'lucide-react';
import { STATUS_OPTIONS, PRIVACITY_OPTIONS } from '../../types/classification';
import type { DocumentFilters, AvailableCategorySearch, AvailableUser } from '../../services/core-api';
import documentService from '../../services/Document/api';
import userService from '../../services/User/api';

interface DocumentFilterSearchProps {
  currentFilters: DocumentFilters; 
  onAdvancedChange: (filters: Partial<DocumentFilters>) => void;
  onApply: () => void;
  availableCategories: AvailableCategorySearch[];
  availableReviewers: AvailableUser[];
  isLoading: boolean;
}

const DocumentFilterSearch: React.FC<DocumentFilterSearchProps> = ({
  currentFilters,
  onAdvancedChange,
  onApply,
  isLoading
}) => {

  // --- Lógica de Categorias (Existente) ---
  const [availableCategories, setAvailableCategories] = useState<AvailableCategorySearch[]>([]);
  //@ts-ignore
  const [isLoadingCats, setIsLoadingCats] = useState(true);
  const [categorySearchTerm, setCategorySearchTerm] = useState('');

  // --- 2. NOVA LÓGICA DE REVISORES ---
  const [availableReviewers, setAvailableReviewers] = useState<AvailableUser[]>([]);
  //@ts-ignore
  const [isLoadingReviewers, setIsLoadingReviewers] = useState(true);
  const [showReviewerDropdown, setShowReviewerDropdown] = useState(false);

  useEffect(() => {
    // Busca Categorias
    documentService.listAvailableCategories()
      .then(res => setAvailableCategories(res.data.data || []))
      .catch(err => console.error("Falha ao carregar sugestões de categoria:", err))
      .finally(() => setIsLoadingCats(false));
      
    // Busca Revisores
    userService.listAvailableUsers()
      .then(res => setAvailableReviewers(res.data.data || []))
      .catch(err => console.error("Falha ao carregar lista de usuários:", err))
      .finally(() => setIsLoadingReviewers(false));
  }, []); // Roda na montagem
  
  const reviewerSearchResults = useMemo(() => {
    const searchTerm = currentFilters.reviewer || '';
    if (!searchTerm) return []; 
    return availableReviewers.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [currentFilters.reviewer, availableReviewers]);

  const selectedCategoryNames = useMemo(() => {
    return currentFilters.categories ? currentFilters.categories.split(';').map(c => c.trim()).filter(Boolean) : [];
  }, [currentFilters.categories]);

  const categorySearchResults = useMemo(() => {
    if (!categorySearchTerm) return [];
    return availableCategories.filter(cat => {
      const matchesSearch = cat.category.toLowerCase().includes(categorySearchTerm.toLowerCase());
      const isAlreadySelected = selectedCategoryNames.includes(cat.category);
      return matchesSearch && !isAlreadySelected;
    });
  }, [categorySearchTerm, availableCategories, selectedCategoryNames]);

  // Handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    onAdvancedChange({ [e.target.name]: e.target.value });
  };
  
  const handleReviewerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onAdvancedChange({ [e.target.name]: e.target.value });
    setShowReviewerDropdown(true);
  };

  const handleSelectReviewer = (user: AvailableUser) => {
    onAdvancedChange({ reviewer: user.name });
    setShowReviewerDropdown(false);
  };

  const handleClearFilters = () => {
    onAdvancedChange({
      reviewer: '',
      isReviewed: '', // String vazia
      statusId: '',
      privacityId: '',
      categories: ''
    });
  };
  
  const handleAddCategory = (category: AvailableCategorySearch) => {
    const newCats = [...selectedCategoryNames, category.category];
    onAdvancedChange({ categories: newCats.join('; ') });
    setCategorySearchTerm('');
  };

  const handleRemoveCategory = (categoryName: string) => {
    const newCats = selectedCategoryNames.filter(name => name !== categoryName);
    onAdvancedChange({ categories: newCats.join('; ') });
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* --- 1ª LINHA: SELECTS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="form-control w-full">
          <label className="label pt-0 pb-1">
            <span className="label-text font-bold text-secondary text-xs uppercase">Status Revisão</span>
          </label>
          <select name="isReviewed" className="select select-bordered select-sm w-full" value={currentFilters.isReviewed || ''} onChange={handleChange}>
            <option value="">Todos</option>
            <option value="true">Sim, Revisados</option>
            <option value="false">Não, Pendentes</option>
          </select>
        </div>

        <div className="form-control w-full">
          <label className="label pt-0 pb-1">
            <span className="label-text font-bold text-secondary text-xs uppercase">Classificação</span>
          </label>
          <select name="statusId" className="select select-bordered select-sm w-full" value={currentFilters.statusId || ''} onChange={handleChange}>
            <option value="">Todas as Classificações</option>
            {STATUS_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
          </select>
        </div>

        <div className="form-control w-full">
          <label className="label pt-0 pb-1">
            <span className="label-text font-bold text-secondary text-xs uppercase">Privacidade</span>
          </label>
          <select name="privacityId" className="select select-bordered select-sm w-full" value={currentFilters.privacityId || ''} onChange={handleChange}>
            <option value="">Todas</option>
            {PRIVACITY_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
          </select>
        </div>

      </div>

      {/* --- 2ª LINHA: AUTOCOMPLETE (Revisor e Categorias) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* CAMPO REVISOR */}
        <div className="form-control relative">
          <label className="label pt-0 pb-1">
            <span className="label-text font-bold text-secondary text-xs uppercase">Revisado Por</span>
          </label>
          <div className="join w-full">
            <div className="join-item bg-base-200 px-3 flex items-center border border-base-300 border-r-0 rounded-l-lg">
                <UserSearch size={16} className="text-gray-500" />
            </div>
            <input 
              type="text" 
              name="reviewer"
              className="input input-bordered input-sm w-full join-item focus:outline-none"
              placeholder={isLoading ? "Carregando..." : "Digite o nome..."}
              value={currentFilters.reviewer || ''}
              onChange={handleReviewerChange}
              onFocus={() => setShowReviewerDropdown(true)}
              onBlur={() => setTimeout(() => setShowReviewerDropdown(false), 200)}
              disabled={isLoading}
            />
          </div>

          {/* Dropdown Autocomplete Revisor */}
          {showReviewerDropdown && (currentFilters.reviewer?.length || 0) > 0 && (
            <ul className="menu bg-base-100 w-full rounded-box border border-base-200 shadow-lg absolute top-full left-0 mt-1 z-20 max-h-40 overflow-y-auto p-1">
              {reviewerSearchResults.length > 0 ? (
                reviewerSearchResults.slice(0, 5).map(user => (
                  <li key={user.user_id}>
                    <a onClick={() => handleSelectReviewer(user)} className="py-2 text-sm">
                      <User size={14} className="text-gray-400" /> {user.name}
                    </a>
                  </li>
                ))
              ) : (
                <li className="disabled"><a className="text-xs text-gray-400 italic">Nenhum usuário encontrado.</a></li>
              )}
            </ul>
          )}
        </div>

        {/* CAMPO CATEGORIAS (Tags + Input) */}
        <div className="form-control relative">
          <label className="label pt-0 pb-1">
            <span className="label-text font-bold text-secondary text-xs uppercase">Categorias</span>
          </label>
          
          <div className="flex flex-wrap items-center gap-2 p-2 border border-base-300 rounded-lg bg-base-100 min-h-[3rem] focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
            {selectedCategoryNames.map(name => (
              <span key={name} className="badge badge-primary badge-md gap-1 text-white">
                {name}
                <XIcon 
                    size={14} 
                    className="cursor-pointer hover:text-red-200" 
                    onClick={() => handleRemoveCategory(name)}
                />
              </span>
            ))}
            <input 
              type="text"
              className="input input-ghost input-sm h-6 p-0 focus:bg-transparent focus:text-base-content placeholder:text-gray-400 flex-grow min-w-[120px]"
              value={categorySearchTerm}
              onChange={(e) => setCategorySearchTerm(e.target.value)}
              placeholder={selectedCategoryNames.length === 0 ? "Adicionar categoria..." : ""}
              disabled={isLoading}
            />
          </div>

          {/* Dropdown Autocomplete Categoria */}
          {categorySearchTerm && (
            <ul className="menu bg-base-100 w-full rounded-box border border-base-200 shadow-lg absolute top-full left-0 mt-1 z-20 max-h-40 overflow-y-auto p-1">
              {isLoading ? (
                <li className="disabled"><a><Loader2 size={16} className="animate-spin" /> Carregando...</a></li>
              ) : categorySearchResults.length > 0 ? (
                categorySearchResults.slice(0, 5).map(cat => (
                  <li key={cat.category_id}>
                    <a onClick={() => handleAddCategory(cat)} className="py-2 text-sm flex justify-between">
                      <span><Tag size={14} className="inline mr-2 text-gray-400" /> {cat.category}</span>
                      <span className="text-xs text-gray-400 font-normal">{cat.enterprise_name}</span>
                    </a>
                  </li>
                ))
              ) : (
                <li className="disabled"><a className="text-xs text-gray-400 italic">Nenhuma categoria encontrada.</a></li>
              )}
            </ul>
          )}
        </div>

      </div>

      {/* AÇÕES */}
      <div className="flex justify-end gap-3 mt-2 pt-4 border-t border-base-200">
        <button 
          className="btn btn-sm btn-ghost text-gray-500 hover:bg-base-200 gap-2"
          onClick={handleClearFilters}
        >
          <FunnelX size={16}/>
          Limpar
        </button>
        <button 
          className="btn btn-sm btn-primary text-white gap-2 shadow-sm"
          onClick={onApply}
        >
          <Filter size={16} />
          Aplicar Filtros
        </button>
      </div>

    </div>
  );
};

export default DocumentFilterSearch;