import React, { useState } from 'react';
import type { DocumentFilters } from '../services/core-api';

import DocumentFiltersComponent from '../components/DocumentFilters';
import DocumentListComponent from '../components/DocumentList';
import CreateDocumentButton from '../components/CreateButtonDocument'; // Ajuste o nome se for CreateButtonDocument

// Reutiliza os estilos globais de página
import '../assets/css/EnterprisePage.css';

export interface DocumentPageProps {
  defaultFilters?: DocumentFilters;
}

//@ts-ignore
const DocumentPage: React.FC<DocumentPageProps> = ({ 
  defaultFilters = { searchTerm: '' }  
}) => {
  
  const [activeFilters, setActiveFilters] = useState<DocumentFilters>(defaultFilters);

  const handleFilterChange = (newFilters: DocumentFilters) => {
    setActiveFilters(newFilters);
  };

  return (
    <div className="page-container">
      <div className="container py-5">
        
        
        
        {/* Área Principal */}
        <div className="custom-card p-4 min-vh-50">
          
          {/* Filtros */}
          <div className="mb-4 border-bottom pb-4">
             <DocumentFiltersComponent 
                defaultFilters={activeFilters}
                onFilterChange={handleFilterChange}
              />
          </div>

          {/* Lista */}
          <DocumentListComponent 
            filters={activeFilters} 
          />
          
        </div>

        {/* Botão Flutuante (FAB) */}
        <CreateDocumentButton />
        
      </div>
    </div>
  );
};

export default DocumentPage;