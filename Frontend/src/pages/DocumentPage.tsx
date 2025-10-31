import React, { useState } from 'react';
import type { DocumentFilters } from '../services/core-api';

import DocumentFiltersComponent from '../components/DocumentFilters';
import DocumentListComponent from '../components/DocumentList';
import CreateDocumentButton from '../components/CreateButtonDocument';

export interface DocumentPageProps {
  defaultFilters?: DocumentFilters;
}

const DocumentPage: React.FC<DocumentPageProps> = ({ 
  defaultFilters = { type: 'All', searchTerm: '' } 
}) => {
  
  const [activeFilters, setActiveFilters] = useState<DocumentFilters>(defaultFilters);

  const handleFilterChange = (newFilters: DocumentFilters) => {
    setActiveFilters(newFilters);
  };

  return (
    <div>
      <h1>Meus Documentos</h1>
      
      <DocumentFiltersComponent 
        defaultFilters={activeFilters}
        onFilterChange={handleFilterChange}
      />

      <DocumentListComponent 
        filters={activeFilters} 
      />
      
      <CreateDocumentButton />
    </div>
  );
};

export default DocumentPage;