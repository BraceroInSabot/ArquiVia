import React, { useState, useEffect } from 'react';
import type { Document, DocumentFilters } from '../services/core-api';

interface DocumentListProps {
  filters: DocumentFilters;
}

const mockDocuments: Document[] = [
  { id: '1', title: 'Contrato Cliente A', type: 'Contract', createdAt: '2025-10-30', author: 'Ana Silva' },
  { id: '2', title: 'Fatura Outubro', type: 'Invoice', createdAt: '2025-10-29', author: 'Bruno Costa' },
  { id: '3', title: 'Relatório Q3', type: 'Report', createdAt: '2025-10-28', author: 'Ana Silva' },
  { id: '4', title: 'Contrato Fornecedor B', type: 'Contract', createdAt: '2025-10-27', author: 'Carlos Dias' },
];

const DocumentListComponent: React.FC<DocumentListProps> = ({ filters }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    
    const fetchDocuments = () => {
      let filteredDocs = mockDocuments;

      if (filters.searchTerm) {
        filteredDocs = filteredDocs.filter(doc => 
          doc.title.toLowerCase().includes(filters.searchTerm!.toLowerCase())
        );
      }

      if (filters.type && filters.type !== 'All') {
        filteredDocs = filteredDocs.filter(doc => doc.type === filters.type);
      }
      
      setTimeout(() => {
        setDocuments(filteredDocs);
        setLoading(false);
      }, 500);
    };

    fetchDocuments();
  }, [filters]);

  if (loading) {
    return <p>Carregando documentos...</p>;
  }

  if (documents.length === 0) {
    return <p>Nenhum documento encontrado.</p>;
  }

  return (
    <ul>
      {documents.map(doc => (
        <li key={doc.id}>
          <div>
            <strong>{doc.title}</strong>
            <p style={{ margin: '0.25rem 0 0', color: '#555' }}>
              {doc.type} - Por: {doc.author}
            </p>
          </div>
          <span style={{ color: '#888', fontSize: '0.9em' }}>
            {new Date(doc.createdAt).toLocaleDateString()}
          </span>
        </li>
      ))}
    </ul>
  );
};

export default DocumentListComponent;