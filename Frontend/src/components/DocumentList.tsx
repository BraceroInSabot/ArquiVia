import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { DocumentList, DocumentFilters } from '../services/core-api';
import documentService from '../services/Document/api';
// 1. Importe o novo modal
import ClassificationModal from '../components/ClassificationModal'; 

// (Seus ícones)
import gearIcon from '../assets/icons/gear.svg?url'; // Use ?url
import eyeIcon from '../assets/icons/eye.svg?url';   // Use ?url
import "../assets/css/DocumentPage.css"; // (Seu CSS)

interface DocumentListProps {
  filters: DocumentFilters;
}

const DocumentListComponent: React.FC<DocumentListProps> = ({ filters }) => {
  const [allDocuments, setAllDocuments] = useState<DocumentList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // --- 2. CORREÇÃO DAS VARIÁVEIS DE ESTADO ---
  // Renomeia o estado do modal para evitar colisão de nome
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Novo estado para saber *qual* documento foi clicado
  const [selectedDocId, setSelectedDocId] = useState<number | null>(null);
  // --- FIM DA CORREÇÃO ---


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
    // ... (sua lógica de filtro - sem mudanças)
    let docs = allDocuments;
    if (filters.searchTerm) {
      docs = docs.filter(doc => 
        doc.title.toLowerCase().includes(filters.searchTerm!.toLowerCase())
      );
    }
    return docs;
  }, [allDocuments, filters]);

  // Navega para a página de edição
  const handleEditClick = (documentId: number) => {
    navigate(`/documento/editar/${documentId}`);
  };

  if (loading) {
    return <p>Carregando documentos...</p>;
  }
  // ... (render de erro e 'Nenhum documento')

  // --- 3. FUNÇÃO ATUALIZADA PARA ABRIR O MODAL ---
  const handleModalOpen = (documentId: number) => {
    setSelectedDocId(documentId); // Define qual documento foi clicado
  	setIsModalOpen(true); // Abre o modal
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedDocId(null);
  };

  return (
    <> {/* 4. Use um fragmento para incluir o modal */}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {filteredDocuments.map(doc => (
          <li 
            key={doc.document_id}
            // (seus estilos inline)
            style={{ 
              backgroundColor: '#fff', border: '1px solid #eee', padding: '1rem', 
              marginBottom: '0.5rem', borderRadius: '4px', display: 'flex', 
              justifyContent: 'space-between', alignItems: 'center',
            }}
          >
            <div>
              <strong>{doc.title}</strong>
              <p style={{ margin: '0.25rem 0 0', color: '#555', fontSize: '0.9em'}}>
                Por: {doc.creator_name} em {new Date(doc.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className='buttons-options'>
              {/* 5. Altere 'handleItemClick' e use <img> */}
              <button onClick={() => handleEditClick(doc.document_id)} title="Editar">
                <img src={eyeIcon} alt="Editar" width="18" height="18" />
              </button>
              {/* 6. Chame 'handleModalOpen' com o ID */}
              <button id="gear-button" onClick={() => handleModalOpen(doc.document_id)} title="Classificação">
                <img src={gearIcon} alt="Classificar" width="18" height="18" />
          	  </button>
            </div>
          </li>
        ))}
      </ul>

      {/* 7. Renderize o modal condicionalmente */}
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