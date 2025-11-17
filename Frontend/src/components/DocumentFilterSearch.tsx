import React, { useState, useEffect, useMemo } from 'react';
import { UserSearch, Filter, FunnelX, X as XIcon, Loader2, Tag } from 'lucide-react';
import { STATUS_OPTIONS, PRIVACITY_OPTIONS } from '../types/classification';
import documentService from '../services/Document/api';
import type { DocumentFilters, AvailableCategorySearch } from '../services/core-api';

// Importe o CSS do input de tags
import '../assets/css/DocumentFilters.css'; 

interface DocumentFilterSearchProps {
  currentFilters: DocumentFilters; 
  onAdvancedChange: (filters: Partial<DocumentFilters>) => void;
  onApply: () => void;
}

const DocumentFilterSearch: React.FC<DocumentFilterSearchProps> = ({
  currentFilters,
  onAdvancedChange,
  onApply
}) => {
  // --- LÓGICA DE CATEGORIAS ---
  const [availableCategories, setAvailableCategories] = useState<AvailableCategorySearch[]>([]);
  const [isLoadingCats, setIsLoadingCats] = useState(true);
  const [categorySearchTerm, setCategorySearchTerm] = useState('');

  // 1. Busca todas as categorias disponíveis na montagem
  useEffect(() => {
    documentService.listAvailableCategories()
      .then(res => { setAvailableCategories(res.data.data || []); })
      .catch(err => console.error("Falha ao carregar categorias:", err))
      .finally(() => setIsLoadingCats(false));
  }, []);

  // 2. Deriva as pílulas (tags) da string de filtro (ex: "contratos; financeiro")
  const selectedCategoryNames = useMemo(() => {
    return currentFilters.categories ? currentFilters.categories.split(';').map(c => c.trim()).filter(Boolean) : [];
  }, [currentFilters.categories]);

  // 3. Filtra os resultados da busca (autocomplete)
  const categorySearchResults = useMemo(() => {
    if (!categorySearchTerm) return [];
    
    return availableCategories.filter(cat => {
      const matchesSearch = cat.category.toLowerCase().includes(categorySearchTerm.toLowerCase());
      // Não mostra se já foi selecionada
      const isAlreadySelected = selectedCategoryNames.includes(cat.category);
      return matchesSearch && !isAlreadySelected;
    });
  }, [categorySearchTerm, availableCategories, selectedCategoryNames]);

  // --- Handlers ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    onAdvancedChange({ [e.target.name]: e.target.value });
  };

  const handleClearFilters = () => {
    onAdvancedChange({
      reviewer: '',
      isReviewed: 'all',
      statusId: 'all',
      privacityId: 'all',
      categories: '' // Limpa a string de categorias
    });
  };
  
  // 4. Adiciona uma categoria (clicando no dropdown)
  const handleAddCategory = (category: AvailableCategorySearch) => {
    const newCats = [...selectedCategoryNames, category.category];
    onAdvancedChange({ categories: newCats.join('; ') });
    setCategorySearchTerm(''); // Limpa o input de busca
  };

  // 5. Remove uma categoria (clicando no 'X' da pílula)
  const handleRemoveCategory = (categoryName: string) => {
    const newCats = selectedCategoryNames.filter(name => name !== categoryName);
    onAdvancedChange({ categories: newCats.join('; ') });
  };

  return (
    <div className="p-3">
      {/* 1ª Linha (Status, Privacidade, Revisão) */}
      <div className="row g-3">
        <div className="col-md-4">
          <label htmlFor="filter-reviewed" className="form-label fw-semibold text-secondary small">Está Revisado?</label>
          <select id="filter-reviewed" name="isReviewed" className="form-select" value={currentFilters.isReviewed || 'all'} onChange={handleChange}>
            <option value="all">Todos</option>
            <option value="true">Sim, Revisados</option>
            <option value="false">Não, Pendentes</option>
          </select>
        </div>
        <div className="col-md-4">
          <label htmlFor="filter-status" className="form-label fw-semibold text-secondary small">Status</label>
          <select id="filter-status" name="statusId" className="form-select" value={currentFilters.statusId || 'all'} onChange={handleChange}>
            <option value="all">Todos os Status</option>
            {STATUS_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
          </select>
        </div>
        <div className="col-md-4">
          <label htmlFor="filter-privacity" className="form-label fw-semibold text-secondary small">Privacidade</label>
          <select id="filter-privacity" name="privacityId" className="form-select" value={currentFilters.privacityId || 'all'} onChange={handleChange}>
            <option value="all">Público e Privado</option>
            {PRIVACITY_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
          </select>
        </div>
      </div>

      {/* 2ª Linha (Revisor e Categorias) */}
      <div className="row g-3 mt-3">
        <div className="col-md-6">
          <label htmlFor="filter-reviewer" className="form-label fw-semibold text-secondary small">Revisado Por:</label>
          <div className="input-group">
            <span className="input-group-text bg-light border-end-0 text-muted"><UserSearch size={18} /></span>
            <input type="text" name="reviewer" className="form-control border-start-0 ps-0" placeholder="Digite o nome..." value={currentFilters.reviewer || ''} onChange={handleChange} />
          </div>
        </div>

        {/* --- CAMPO DE CATEGORIAS (TAG INPUT) --- */}
        <div className="col-md-6">
          <label htmlFor="filter-categories" className="form-label fw-semibold text-secondary small">Categorias</label>
          <div className="position-relative">
            {/* O Container de Pílulas e Input */}
            <div className="tag-input-container">
              {/* Pílulas (Tags) */}
              {selectedCategoryNames.map(name => (
                <span key={name} className="tag-pill">
                  {name}
                  <button type="button" className="remove-tag-btn" onClick={() => handleRemoveCategory(name)}>
                    <XIcon size={14} />
                  </button>
                </span>
              ))}
              {/* Input de Busca */}
              <input 
                type="text"
                id="filter-categories"
                className="tag-input"
                value={categorySearchTerm}
                onChange={(e) => setCategorySearchTerm(e.target.value)}
                placeholder={selectedCategoryNames.length === 0 ? "Adicionar categoria..." : "Adicionar..."}
                disabled={isLoadingCats}
              />
            </div>
            
            {/* Dropdown de Resultados do Autocomplete */}
            {(isLoadingCats || categorySearchResults.length > 0 || (categorySearchTerm && !isLoadingCats)) && (
              <ul className="search-results-list">
                {isLoadingCats ? (
                  <li className="search-result-item text-muted d-flex align-items-center gap-2">
                    <Loader2 size={16} className="animate-spin" /> Carregando categorias...
                  </li>
                ) : categorySearchResults.length > 0 ? (
                  categorySearchResults.slice(0, 5).map(cat => ( // Limita a 5 resultados
                    <li 
                      key={cat.category_id} 
                      className="search-result-item"
                      onClick={() => handleAddCategory(cat)}
                      title={`${cat.enterprise_name} > ${cat.sector_name}`}
                    >
                      <Tag size={14} className="me-2 text-muted" /> {cat.category}
                    </li>
                  ))
                ) : (
                  <li className="search-result-item text-muted fst-italic">Nenhuma categoria encontrada.</li>
                )}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
        <button type="button" className="btn btn-light d-flex align-itemsCen-center gap-2" onClick={handleClearFilters}>
          <FunnelX size={16}/>
          Limpar Filtros
        </button>
        <button type="button" className="btn btn-primary-custom d-flex align-items-center gap-2" onClick={onApply}>
          <Filter size={16} />
          Aplicar Filtros
        </button>
      </div>

    </div>
  );
};

export default DocumentFilterSearch;