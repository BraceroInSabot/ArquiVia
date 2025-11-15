import React, { useState } from 'react';
import { FileText } from 'lucide-react'; // Ícone
import type { DocumentFilters } from '../services/core-api';

import DocumentFiltersComponent from '../components/DocumentFilters';
import DocumentListComponent from '../components/DocumentList';
import CreateDocumentButton from '../components/CreateButtonDocument'; // Ajuste o nome se for CreateButtonDocument

// Reutiliza os estilos globais de página
import '../assets/css/EnterprisePage.css';

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
    <div className="page-container">
      <div className="container py-5">
        
        {/* Cabeçalho da Página */}
        <div className="d-flex align-items-center mb-4">
          <div 
            className="bg-white p-2 rounded-circle border me-3 d-flex align-items-center justify-content-center shadow-sm" 
            style={{width: '50px', height: '50px'}}
          >
            <FileText className="text-primary-custom" size={24} />
          </div>
          <div>
            <h1 className="h3 mb-1 fw-bold text-body-custom">Meus Documentos</h1>
            <p className="text-muted mb-0">Gerencie, busque e organize seus arquivos</p>
          </div>
        </div>
        
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