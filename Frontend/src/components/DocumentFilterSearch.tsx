import React, { useState, useMemo } from 'react';
import { UserSearch, Filter, FunnelX, X as XIcon, Loader2, Tag, User } from 'lucide-react';
import { STATUS_OPTIONS, PRIVACITY_OPTIONS } from '../types/classification';
import type { DocumentFilters, AvailableCategorySearch, AvailableUser } from '../services/core-api';

import '../assets/css/ClassificationModal.css';
import '../assets/css/DocumentFilters.css'; 

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
  availableCategories,
  availableReviewers,
  isLoading
}) => {
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [showReviewerDropdown, setShowReviewerDropdown] = useState(false);

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
      isReviewed: 'all',
      statusId: 'all',
      privacityId: 'all',
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
    <div className="p-3">
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

      <div className="row g-3 mt-3">
        <div className="col-md-6">
          <label htmlFor="filter-reviewer" className="form-label fw-semibold text-secondary small">Revisado Por:</label>
          <div className="input-group position-relative">
            <span className="input-group-text bg-light border-end-0 text-muted"><UserSearch size={18} /></span>
            <input 
              type="text" 
              name="reviewer"
              className="form-control border-start-0 ps-0" 
              placeholder={isLoading ? "Carregando..." : "Digite o nome..."}
              value={currentFilters.reviewer || ''}
              onChange={handleReviewerChange}
              onFocus={() => setShowReviewerDropdown(true)}
              onBlur={() => setTimeout(() => setShowReviewerDropdown(false), 150)}
              disabled={isLoading}
            />

            {showReviewerDropdown && (currentFilters.reviewer?.length || 0) > 0 && (
              <ul className="search-results-list">
                {reviewerSearchResults.length > 0 ? (
                  reviewerSearchResults.slice(0, 5).map(user => (
                    <li 
                      key={user.user_id} 
                      className="search-result-item"
                      onClick={() => handleSelectReviewer(user)}
                    >
                      <User size={14} className="me-2 text-muted" /> {user.name}
                    </li>
                  ))
                ) : (
                  <li className="search-result-item text-muted fst-italic">Nenhum usuário encontrado.</li>
                )}
              </ul>
            )}
          </div>
        </div>

        <div className="col-md-6">
          <label htmlFor="filter-categories" className="form-label fw-semibold text-secondary small">Categorias</label>
          <div className="position-relative">
            <div className="tag-input-container">
              {selectedCategoryNames.map(name => (
                <span key={name} className="tag-pill">
                  {name}
                  <button type="button" className="remove-tag-btn" onClick={() => handleRemoveCategory(name)}>
                    <XIcon size={14} />
                  </button>
                </span>
              ))}
              <input 
                type="text"
                id="filter-categories-input"
                className="tag-input"
                value={categorySearchTerm}
                onChange={(e) => setCategorySearchTerm(e.target.value)}
                placeholder={selectedCategoryNames.length === 0 ? "Adicionar categoria..." : "Adicionar..."}
                disabled={isLoading}
              />
            </div>
            
            {categorySearchTerm && (
              <ul className="search-results-list">
                {isLoading ? (
                  <li className="search-result-item text-muted"><Loader2 size={16} className="animate-spin" /></li>
                ) : categorySearchResults.length > 0 ? (
                  categorySearchResults.slice(0, 5).map(cat => (
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

      <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
        <button type="button" className="btn btn-light d-flex align-items-center gap-2" onClick={handleClearFilters}>
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