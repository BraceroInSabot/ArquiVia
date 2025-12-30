import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import type { DocumentFilters } from '../../services/core-api';

import DocumentFiltersComponent, { type ViewMode } from '../../components/Document/DocumentFilters'; 
import DocumentListComponent from '../../components/Document/DocumentList'; 
import CreateDocumentButton from '../../components/button/CreateButtonDocument';

export interface DocumentPageProps {
  defaultFilters?: DocumentFilters;
}

const DocumentPage: React.FC<DocumentPageProps> = ({ 
  defaultFilters = { searchTerm: '' }  
}) => {
  
  const [activeFilters, setActiveFilters] = useState<DocumentFilters>(defaultFilters);
  
  // NOVO: Estado para controlar a visualização (inicia como 'grid' ou 'list')
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const handleFilterChange = (newFilters: DocumentFilters) => {
    setActiveFilters(newFilters);
  };

  return (
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
                  availableCategories={[]} // TODO: Buscar do backend se necessário
                  availableReviewers={[]}  // TODO: Buscar do backend se necessário
                  isLoading={false}
                  
                  // Passando o controle do ViewMode
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                />
            </div>

            {/* Lista de Documentos */}
            <div className="min-h-[400px]">
                <DocumentListComponent 
                  filters={activeFilters}
                  // Passando o modo de visualização atual
                  viewMode={viewMode}
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