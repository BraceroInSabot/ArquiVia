import React, { useState, useEffect } from 'react';
import { Funnel, Search } from 'lucide-react';
// 1. Importe a interface ATUALIZADA e o componente filho
import type { DocumentFilters } from '../services/core-api';
import DocumentFilterSearch from './DocumentFilterSearch';

import '../assets/css/DocumentFilters.css'; 
import '../assets/css/EnterprisePage.css'; 

interface DocumentFiltersProps {
  defaultFilters: DocumentFilters;
  onFilterChange: (filters: DocumentFilters) => void;
}

const DocumentFiltersComponent: React.FC<DocumentFiltersProps> = ({ 
  defaultFilters, 
  onFilterChange 
}) => {
  // O estado 'filters' agora contém TUDO
  const [filters, setFilters] = useState<DocumentFilters>(defaultFilters);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    setFilters(defaultFilters);
  }, [defaultFilters]);

  // Atualiza apenas o searchTerm (busca rápida)
  const handleSearchTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, searchTerm: e.target.value }));
  };
  
  // Atualiza os filtros avançados (chamado pelo filho)
  const handleAdvancedFilterChange = (advancedFilters: Partial<DocumentFilters>) => {
    setFilters(prev => ({ ...prev, ...advancedFilters }));
  };

  // Submete o formulário principal (botão 'Buscar' ou Enter)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange(filters); // Envia todos os filtros
  };
  
  // Submete ao clicar em "Aplicar Filtros" (no filho)
  const handleApplyAdvancedFilters = () => {
    onFilterChange(filters); // Envia todos os filtros
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
        
        <div className="position-relative flex-grow-1">
          <input
            type="text"
            name="q"
            className="form-control form-control-lg ps-3 pe-5"
            placeholder="Pesquisar por título ou conteúdo..."
            value={filters.searchTerm}
            onChange={handleSearchTermChange}
            autoComplete="off"
          />
          <div className="position-absolute top-50 end-0 translate-middle-y pe-3 text-muted">
            <Search size={20} />
          </div>
        </div>
      </div>

      {/* Área de Filtros Avançados */}
      {isFilterOpen && (
        <div className="filter-area-container">
          <div className="card card-body mt-3 shadow-sm" style={{ backgroundColor: '#fdfdfd' }}>
            <DocumentFilterSearch 
              // 2. Passa os filtros e os handlers para o filho
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