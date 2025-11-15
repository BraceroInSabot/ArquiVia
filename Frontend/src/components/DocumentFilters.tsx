import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react'; // Ícone
import type { DocumentFilters } from '../services/core-api';

// Reutiliza CSS global se necessário, mas focaremos em classes utilitárias
import '../assets/css/EnterprisePage.css'; 

interface DocumentFiltersProps {
  defaultFilters: DocumentFilters;
  onFilterChange: (filters: DocumentFilters) => void;
}

const DocumentFiltersComponent: React.FC<DocumentFiltersProps> = ({ 
  defaultFilters, 
  onFilterChange 
}) => {
  const [searchTerm, setSearchTerm] = useState(defaultFilters.searchTerm || '');

  // Sincroniza se o pai mudar o filtro externamente
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

  return (
    <form onSubmit={handleSubmit} className="w-100">
      <div className="d-flex gap-2">
        
        {/* Grupo do Input com Ícone */}
        <div className="position-relative flex-grow-1">
          <div className="position-absolute top-50 start-0 translate-middle-y ps-3 text-muted pointer-events-none">
            <Search size={20} />
          </div>
          <input
            type="text"
            name="q"
            className="form-control ps-5 py-2" // ps-5 dá espaço para o ícone
            placeholder="Pesquisar por título ou conteúdo..."
            value={searchTerm}
            onChange={handleChange}
            autoComplete="off"
          />
        </div>
        
        {/* Botão de Buscar */}
        <button 
          type="submit"
          className="btn btn-primary-custom px-4 fw-semibold"
        >
          Buscar
        </button>

      </div>
    </form>
  );
};

export default DocumentFiltersComponent;