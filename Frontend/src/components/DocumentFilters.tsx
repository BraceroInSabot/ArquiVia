import React, { useState, useEffect } from 'react';
import type { DocumentFilters } from '../services/core-api';

interface DocumentFiltersProps {
  defaultFilters: DocumentFilters;
  onFilterChange: (filters: DocumentFilters) => void;
}

const DocumentFiltersComponent: React.FC<DocumentFiltersProps> = ({ 
  defaultFilters, 
  onFilterChange 
}) => {
  const [filters, setFilters] = useState<DocumentFilters>(defaultFilters);

  useEffect(() => {
    setFilters(defaultFilters);
  }, [defaultFilters]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange(filters);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="searchTerm"
        placeholder="Buscar por título..."
        value={filters.searchTerm || ''}
        onChange={handleChange}
      />
      
      <select 
        name="type" 
        value={filters.type || 'All'} 
        onChange={handleChange}
      >
        <option value="All">Todos os Tipos</option>
        <option value="Contract">Contrato</option>
        <option value="Invoice">Fatura</option>
        <option value="Report">Relatório</option>
      </select>
      
      <button type="submit">Filtrar</button>
    </form>
  );
};

export default DocumentFiltersComponent;