import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
// 1. Importa a nova interface 'DocumentList' e o 'documentService'
import type { DocumentList, DocumentFilters } from '../services/core-api';
import documentService from '../services/Document/api';
import ClassificationModal from '../components/ClassificationModal';
import gearIcon from '../assets/icons/gear.svg'
import eyeIcon from '../assets/icons/eye.svg'
import "../assets/css/DocumentPage.css"

interface DocumentListProps {
  filters: DocumentFilters;
}

const DocumentListComponent: React.FC<DocumentListProps> = ({ filters }) => {
  // Estado para armazenar *todos* os documentos da API
  const [allDocuments, setAllDocuments] = useState<DocumentList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [ClassificationModal, setClassificationModal] = useState(false);


  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await documentService.getDocuments();
        setAllDocuments(response.data.data || []); 
      } catch (err) {
        console.error("Erro ao buscar documentos:", err);
        setError("Falha ao carregar a lista de documentos.");
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []); 

  const filteredDocuments = useMemo(() => {
    let docs = allDocuments;

    if (filters.searchTerm) {
      docs = docs.filter(doc => 
        doc.title.toLowerCase().includes(filters.searchTerm!.toLowerCase())
      );
    }

    return docs;
  }, [allDocuments, filters]);

  const handleItemClick = (documentId: number) => {
    navigate(`/documento/editar/${documentId}`);
  };

  if (loading) {
  	return <p>Carregando documentos...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  if (filteredDocuments.length === 0) {
  	return <p>Nenhum documento encontrado.</p>;
  }

  const handleModal = () => {
    setClassificationModal(true);
  }

  return (
  	<ul style={{ listStyle: 'none', padding: 0 }}>
  	  {filteredDocuments.map(doc => (
    	  <li 
            key={doc.document_id}
            style={{ 
              backgroundColor: '#fff', 
              border: '1px solid #eee', 
              padding: '1rem', 
              marginBottom: '0.5rem', 
              borderRadius: '4px', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
            }}
          >
      	  <div>
      	  	<strong>{doc.title}</strong>
      	  	<p style={{ margin: '0.25rem 0 0', color: '#555', fontSize: '0.9em'}}>
      	  	  Por: {doc.creator_name} em {doc.created_at}
      	  	</p>
      	  </div>
          <div className='buttons-options'>
            <button onClick={() => handleItemClick(doc.document_id)}>
              <img src={eyeIcon} alt="" />
            </button>
            <button id="gear-button" onClick={handleModal}>
              <img src={gearIcon} width='100' alt="Classificar" aria-label='Classificar'/>
            </button>
          </div>
    	  </li>
  	  ))}
  	</ul>
  );
};

export default DocumentListComponent;