import React, { useState, useEffect } from 'react';
import type { DocumentFilters } from '../services/core-api';
import '../assets/css/DocumentPage.css'; // Assumindo que o CSS está aqui

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
    // Envia apenas o termo de busca. 
    // Mantemos a estrutura do objeto DocumentFilters para compatibilidade.
    onFilterChange({ searchTerm: searchTerm });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem' }}>
      <input
        type="text"
        name="q"
        placeholder="Pesquisar nos documentos..."
        value={searchTerm}
        onChange={handleChange}
        style={{
          flex: 1,
          padding: '10px',
          borderRadius: '4px',
          border: '1px solid #ccc',
          fontSize: '1rem'
        }}
      />
      
      <button 
        type="submit"
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        Buscar
      </button>
    </form>
  );
};

export default DocumentFiltersComponent;