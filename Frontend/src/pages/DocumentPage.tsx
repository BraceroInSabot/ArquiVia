import React, { useState, useEffect } from 'react';
import { FileText, Loader2 } from 'lucide-react';
import type { 
  DocumentFilters, 
  AvailableCategorySearch, 
  AvailableUser 
} from '../services/core-api';

import documentService from '../services/Document/api';
import userService from '../services/User/api'; 

import DocumentFiltersComponent from '../components/DocumentFilters';
import DocumentListComponent from '../components/DocumentList';
import CreateDocumentButton from '../components/CreateButtonDocument';

import '../assets/css/EnterprisePage.css';

export interface DocumentPageProps {
  defaultFilters?: DocumentFilters;
}

const DocumentPage: React.FC<DocumentPageProps> = ({ 
  defaultFilters = { searchTerm: '' } 
}) => {
  
  const [activeFilters, setActiveFilters] = useState<DocumentFilters>(defaultFilters);

  const [availableCategories, setAvailableCategories] = useState<AvailableCategorySearch[]>([]);
  const [availableReviewers, setAvailableReviewers] = useState<AvailableUser[]>([]);
  const [isLoadingFilters, setIsLoadingFilters] = useState(true);

  const handleFilterChange = (newFilters: DocumentFilters) => {
    setActiveFilters(newFilters);
  };

  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const [catsRes, usersRes] = await Promise.all([
          documentService.listAvailableCategories(),
          userService.listAvailableUsers() 
        ]);
        
        setAvailableCategories(catsRes.data.data || []);
        setAvailableReviewers(usersRes.data.data || []);
        
      } catch (err) {
        console.error("Falha ao carregar dados de filtro", err);
      } finally {
        setIsLoadingFilters(false);
      }
    };
    
    fetchFilterData();
  }, []);

  return (
    <div className="page-container">
      <div className="container py-5">
        
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
        
        <div className="custom-card p-4 min-vh-50">
          
          <div className="mb-4 border-bottom pb-4">
            {isLoadingFilters ? (
              <div className="d-flex align-items-center text-muted small p-2">
                <Loader2 size={16} className="animate-spin me-2" />
                Carregando filtros...
              </div>
            ) : (
              <DocumentFiltersComponent 
                defaultFilters={activeFilters}
                onFilterChange={handleFilterChange}
                availableCategories={availableCategories}
                availableReviewers={availableReviewers}
                isLoading={isLoadingFilters}
              />
            )}
          </div>

          <DocumentListComponent 
            filters={activeFilters} 
          />
        </div>
        
        <CreateDocumentButton />
        
      </div>
    </div>
  );
};

export default DocumentPage;