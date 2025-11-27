import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import type { DocumentFilters } from '../../services/core-api';

import DocumentFiltersComponent from '../../components/Document/DocumentFilters'; // Verifique se o caminho está correto (DocumentFilters ou DocumentFiltersComponent)
import DocumentListComponent from '../../components/Document/DocumentList'; // Verifique se o caminho está correto
import CreateDocumentButton from '../../components/button/CreateButtonDocument';

export interface DocumentPageProps {
  defaultFilters?: DocumentFilters;
}

const DocumentPage: React.FC<DocumentPageProps> = ({ 
  defaultFilters = { searchTerm: '' }  
}) => {
  
  const [activeFilters, setActiveFilters] = useState<DocumentFilters>(defaultFilters);

  const handleFilterChange = (newFilters: DocumentFilters) => {
    setActiveFilters(newFilters);
  };

  return (
    // Fundo da página (Base-200 = #F4F6F7 conforme config)
    <div className="min-h-screen bg-base-100 p-4 md:p-8 font-sans text-neutral">
      <div className="max-w-7xl mx-auto">
        
        {/* --- Cabeçalho da Página --- */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-full bg-base-100 shadow-md flex items-center justify-center text-primary">
            <FileText size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-secondary">Meus Documentos</h1>
            <p className="text-sm text-gray-500">Gerencie, busque e organize seus arquivos</p>
          </div>
        </div>
        
        {/* --- Área Principal (Card DaisyUI) --- */}
        <div className="card bg-base-100 shadow-xl border border-base-300">
          <div className="card-body p-6">
            
            {/* Seção de Filtros */}
            <div className="mb-2">
               <DocumentFiltersComponent 
                  defaultFilters={activeFilters}
                  onFilterChange={handleFilterChange}
                  availableCategories={[]}
                  availableReviewers={[]}
                  isLoading={false}
                />
            </div>

            {/* Lista de Documentos */}
            <div className="min-h-[400px]">
                <DocumentListComponent 
                  filters={activeFilters} 
                />
            </div>
            
          </div>
        </div>

        {/* --- Botão Flutuante (FAB) --- */}
        <CreateDocumentButton />
        
      </div>
    </div>
  );
};

export default DocumentPage;