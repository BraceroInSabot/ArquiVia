import React, { useState, useEffect } from 'react';
import { Funnel, Search } from 'lucide-react';
import type { DocumentFilters, AvailableCategorySearch, AvailableUser } from '../../services/core-api';
import DocumentFilterSearch from './DocumentFilterSearch';

interface DocumentFiltersProps {
  defaultFilters: DocumentFilters;
  onFilterChange: (filters: DocumentFilters) => void;
  availableCategories: AvailableCategorySearch[];
  availableReviewers: AvailableUser[];
  isLoading: boolean;
}

const DocumentFiltersComponent: React.FC<DocumentFiltersProps> = ({ 
  defaultFilters, 
  onFilterChange,
  availableCategories,
  availableReviewers,
  isLoading
}) => {
  const [filters, setFilters] = useState<DocumentFilters>(defaultFilters);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    setFilters(defaultFilters);
  }, [defaultFilters]);

  const handleFilterUpdate = (filterUpdate: Partial<DocumentFilters>) => {
    const newFilters = { ...filters, ...filterUpdate };
    setFilters(newFilters);
    
    // ALTERAÇÃO AQUI: Dispara o onFilterChange se for searchTerm OU groupBy
    if (filterUpdate.searchTerm !== undefined || filterUpdate.groupBy !== undefined) {
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
    <div className="w-full">
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 items-center mb-4">
        
        {/* Botão Filtros Avançados */}
        <button 
          type="button" 
          className={`btn ${isFilterOpen ? 'btn-primary text-white' : 'btn-outline btn-secondary'} gap-2 shadow-sm`}
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          title="Filtros avançados"
          disabled={isLoading}
        >
          <Funnel size={20} />
          <span className="hidden sm:inline">Filtros</span>
        </button>

        {/* Dropdown de Agrupamento */}
        <select
          name="groupBy"
          className="select select-bordered w-full max-w-xs flex-1 focus:border-primary focus:ring-primary"
          value={filters.groupBy || 'none'}
          onChange={(e) => handleFilterUpdate({ groupBy: e.target.value as any })}
          disabled={isLoading}
        >
          <option value="none">Não agrupar</option>
          <option value="enterprise">Por Empresa</option>
          <option value="sector">Por Setor</option>
          <option value="both">Empresa e Setor</option>
        </select>

        {/* Barra de Busca Principal */}
        <div className="relative flex-grow min-w-[200px]">
          <input
            type="text"
            name="q"
            className="input input-bordered w-full pr-10 focus:border-primary focus:ring-primary"
            placeholder="Pesquisar documentos..."
            value={filters.searchTerm}
            onChange={(e) => handleFilterUpdate({ searchTerm: e.target.value })}
            autoComplete="off"
            disabled={isLoading}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
            <Search size={20} />
          </div>
        </div>
      </form>

      {/* Painel de Filtros Avançados (Gaveta) */}
      {isFilterOpen && (
        <div className="card bg-base-100 shadow-lg border border-base-200 animate-fade-in-down mb-6">
          <div className="card-body p-4">
            <DocumentFilterSearch 
              currentFilters={filters}
              onAdvancedChange={handleAdvancedFilterChange}
              onApply={handleApplyAdvancedFilters}
              availableCategories={availableCategories}
              availableReviewers={availableReviewers}
              isLoading={isLoading}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentFiltersComponent;