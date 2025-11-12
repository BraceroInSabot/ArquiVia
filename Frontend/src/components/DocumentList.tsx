import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { DocumentList, DocumentFilters } from '../services/core-api';
import documentService from '../services/Document/api';
import ClassificationModal from '../components/ClassificationModal';

// Imports de ícones e CSS
import gearIcon from '../assets/icons/gear.svg?url';
import eyeIcon from '../assets/icons/eye.svg?url';
import "../assets/css/DocumentPage.css";

interface DocumentListProps {
  filters: DocumentFilters;
}

const DocumentListComponent: React.FC<DocumentListProps> = ({ filters }) => {
  // Armazena os documentos exibidos (seja da busca ou da listagem geral)
  const [documents, setDocuments] = useState<DocumentList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados auxiliares
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<number | null>(null);

  const [docFound, setDocFound] = useState(String);


  // --- EFEITO PRINCIPAL: BUSCA vs LISTAGEM ---
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let response;

        // LÓGICA DE DECISÃO:
        if (filters.searchTerm && filters.searchTerm.trim() !== '') {
          // Se tem termo de busca, chama a API de Recuperação de Informação
          console.log(`Buscando por: ${filters.searchTerm}`);
          response = await documentService.searchDocuments(filters.searchTerm);
          setDocFound(response.data.mensagem);
        } else {
          // Se não tem termo, lista todos (padrão)
          response = await documentService.getDocuments();
        }

        setDocuments(response.data.data || []);
        
      } catch (err: any) {
        console.error("Erro na listagem/busca:", err);
        // Mensagem amigável caso a busca não retorne nada ou dê erro 400
        const msg = err.response?.data?.message || "Falha ao carregar documentos.";
        setError(msg);
        setDocuments([]); // Limpa lista em caso de erro
      } finally {
        setLoading(false);
      }
    };

    // Adicionamos um pequeno delay (debounce) apenas se for busca, 
    // para evitar chamar a API enquanto digita (opcional, mas recomendado)
    const timer = setTimeout(() => {
        loadData();
    }, 300);

    return () => clearTimeout(timer);

  }, [filters.searchTerm]); // Recarrega sempre que o termo mudar


  // --- Funções de Navegação e Modal ---
  const handleEditClick = (documentId: number) => {
    navigate(`/documento/editar/${documentId}`);
  };

  const handleModalOpen = (documentId: number) => {
    setSelectedDocId(documentId);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedDocId(null);
  };

  // --- Renderização ---

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
        <p>Carregando...</p>
      </div>
    );
  }

  if (error) {
    // Se for erro 404 ou lista vazia na busca, pode não ser um "erro" visual crítico
    return (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <p style={{ color: '#888' }}>{error}</p>
        </div>
    );
  }

  if (documents.length === 0) {
    return (
        <div style={{ textAlign: 'center', marginTop: '2rem', color: '#888' }}>
            <p>{docFound}</p>
        </div>
    );
  }

  return (
    <>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {documents.map(doc => (
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
              <button onClick={() => handleEditClick(doc.document_id)} title="Visualizar/Editar">
                <img src={eyeIcon} alt="Visualizar" width="18" height="18" />
              </button>
              <button id="gear-button" onClick={() => handleModalOpen(doc.document_id)} title="Classificação">
                <img src={gearIcon} alt="Classificar" width="18" height="18" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {isModalOpen && selectedDocId && (
        <ClassificationModal
          documentId={selectedDocId}
          onClose={handleModalClose}
        />
      )}
    </>
  );
};

export default DocumentListComponent;