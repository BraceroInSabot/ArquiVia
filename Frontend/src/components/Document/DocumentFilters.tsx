import React, { useState, useEffect } from 'react';
import { Funnel, Search } from 'lucide-react';
import type { DocumentFilters } from '../../services/core-api';
import DocumentFilterSearch from './DocumentFilterSearch';

import '../../assets/css/DocumentFilters.css'; 
import '../../assets/css/EnterprisePage.css'; 

interface DocumentFiltersProps {
  defaultFilters: DocumentFilters;
  onFilterChange: (filters: DocumentFilters) => void;
}

const DocumentFiltersComponent: React.FC<DocumentFiltersProps> = ({ 
  defaultFilters, 
  onFilterChange 
}) => {
  const [filters, setFilters] = useState<DocumentFilters>(defaultFilters);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    setFilters(defaultFilters);
  }, [defaultFilters]);

  const handleFilterUpdate = (filterUpdate: Partial<DocumentFilters>) => {
    const newFilters = { ...filters, ...filterUpdate };
    setFilters(newFilters);

    if (filterUpdate.searchTerm !== undefined) {
      onFilterChange(newFilters);
    }
  };
  
  const handleAdvancedFilterChange = (advancedFilters: Partial<DocumentFilters>) => {
    setFilters(prev => ({ ...prev, ...advancedFilters }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange(filters);
  };
  
  const handleApplyAdvancedFilters = () => {
    onFilterChange(filters);
  };

  return (
    <form onSubmit={handleSubmit} className="w-100">
      <div className="d-flex gap-2">
        <button 
          type="button" 
          className={`btn ${isFilterOpen ? 'btn-primary-custom' : 'btn-outline-secondary'} shadow-sm`}
          onClick={() => setIsFilterOpen(prev => !prev)}
          title="Filtros avançados"
        >
          <Funnel size={20} />
        </button>
        
        <select
          name="groupBy"
          className="form-select shadow-sm"
          value={filters.groupBy || 'none'}
          onChange={(e) => handleFilterUpdate({ groupBy: e.target.value as any })}
          style={{ maxWidth: '200px' }}
        >
          <option value="none">Não agrupar</option>
          <option value="enterprise">Agrupar por Empresa</option>
          <option value="sector">Agrupar por Setor</option>
          <option value="both">Agrupar por Empresa e Setor</option>
        </select>
        
        <div className="position-relative flex-grow-1">
          <input
            type="text"
            name="q"
            className="form-control form-control-lg ps-3 pe-5"
            placeholder="Pesquisar por título ou conteúdo..."
            value={filters.searchTerm}
            onChange={(e) => handleFilterUpdate({ searchTerm: e.target.value })}
            autoComplete="off"
          />
          <div className="position-absolute top-50 end-0 translate-middle-y pe-3 text-muted">
            <Search size={20} />
          </div>
        </div>
      </div>

      {isFilterOpen && (
        <div className="filter-area-container">
          <div className="card card-body mt-3 shadow-sm" style={{ backgroundColor: '#fdfdfd' }}>
            <DocumentFilterSearch 
              currentFilters={filters}
              onAdvancedChange={handleAdvancedFilterChange}
              onApply={handleApplyAdvancedFilters}
            />
          </div>
        </div>
      )}
    </form>
  );
};

export default DocumentFiltersComponent;