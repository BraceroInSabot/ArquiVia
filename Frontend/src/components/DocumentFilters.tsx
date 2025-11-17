import React, { useState, useEffect } from 'react';
import { Funnel, Search } from 'lucide-react';
import type { DocumentFilters } from '../services/core-api';
// Importe o componente de filtros avançados
import DocumentFilterSearch from './DocumentFilterSearch';

// Importe o CSS para a animação (Opcional, mas recomendado)
import '../assets/css/DocumentFilter.css'; 
import '../assets/css/EnterprisePage.css'; // Reutiliza CSS global

interface DocumentFiltersProps {
  defaultFilters: DocumentFilters;
  onFilterChange: (filters: DocumentFilters) => void;
}

const DocumentFiltersComponent: React.FC<DocumentFiltersProps> = ({ 
  defaultFilters, 
  onFilterChange 
}) => {
  const [searchTerm, setSearchTerm] = useState(defaultFilters.searchTerm || '');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    setSearchTerm(defaultFilters.searchTerm || '');
  }, [defaultFilters]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ searchTerm: searchTerm });
  };
  
  const toggleFilterArea = () => {
    setIsFilterOpen(prev => !prev);
  };

  return (
    <form onSubmit={handleSubmit} className="w-100">
      <div className="d-flex gap-2">
        
        {/* Botão de Filtro (Esquerda) */}
        <button 
          type="button" 
          // Atualiza o visual do botão quando ativo
          className={`btn ${isFilterOpen ? 'btn-primary-custom' : 'btn-outline-secondary'} shadow-sm`}
          onClick={toggleFilterArea}
          title="Filtros avançados"
        >
          <Funnel size={20} />
        </button>
        
        {/* Input de Busca (Direita) */}
        <div className="position-relative flex-grow-1">
          <input
            type="text"
            name="q"
            className="form-control form-control-lg ps-3 pe-5"
            placeholder="Pesquisar por título ou conteúdo..."
            value={searchTerm}
            onChange={handleChange}
            autoComplete="off"
          />
          <div className="position-absolute top-50 end-0 translate-middle-y pe-3 text-muted">
            <Search size={20} />
          </div>
        </div>
        
      </div>

      {/* --- CORREÇÃO AQUI --- */}
      {/* Usamos 'isFilterOpen && ...' para renderizar o 
          componente DocumentFilterSearch APENAS se o estado for true. */}
      {isFilterOpen && (
        <div className="filter-area-container">
          <div className="card card-body mt-3 shadow-sm" style={{ backgroundColor: '#fdfdfd' }}>
            <DocumentFilterSearch />
          </div>
        </div>
      )}

    </form>
  );
};

export default DocumentFiltersComponent;