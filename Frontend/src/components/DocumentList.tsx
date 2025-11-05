import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
// 1. Importa a nova interface 'DocumentList' e o 'documentService'
import type { DocumentList, DocumentFilters } from '../services/core-api';
import documentService from '../services/Document/api';

interface DocumentListProps {
  filters: DocumentFilters;
}

const DocumentListComponent: React.FC<DocumentListProps> = ({ filters }) => {
  // Estado para armazenar *todos* os documentos da API
  const [allDocuments, setAllDocuments] = useState<DocumentList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate(); // Hook para navegação

  // 2. Efeito para buscar os dados da API (apenas uma vez)
  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await documentService.getDocuments();
        setAllDocuments(response.data.data || []); // Assume a estrutura 'ResponseStructure'
      } catch (err) {
        console.error("Erro ao buscar documentos:", err);
        setError("Falha ao carregar a lista de documentos.");
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []); // Dependência vazia, busca apenas no 'mount'

  // 3. Memo para filtrar os documentos localmente
  // Isso roda sempre que os dados da API ou os filtros mudam
  const filteredDocuments = useMemo(() => {
    let docs = allDocuments;

    // Filtra por termo de busca
    if (filters.searchTerm) {
      docs = docs.filter(doc => 
        doc.title.toLowerCase().includes(filters.searchTerm!.toLowerCase())
      );
    }

    // NOTA: O filtro por 'tipo' (filters.type) foi removido
    // pois a nova interface 'DocumentList' não possui a propriedade 'type'.
    // Você precisará atualizar o 'DocumentFiltersComponent' se quiser
    // filtrar por 'creator_name', por exemplo.

    return docs;
  }, [allDocuments, filters]);

  // Função para navegar para a página de edição
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

  return (
    // 4. Estilos adicionados para manter a aparência e adicionar 'cursor: pointer'
  	<ul style={{ listStyle: 'none', padding: 0 }}>
  	  {filteredDocuments.map(doc => (
        // 5. Atualiza o JSX para usar os campos da API ('document_id', 'title', etc.)
    	  <li 
            key={doc.document_id} 
            onClick={() => handleItemClick(doc.document_id)}
            style={{ 
              backgroundColor: '#fff', 
              border: '1px solid #eee', 
              padding: '1rem', 
              marginBottom: '0.5rem', 
              borderRadius: '4px', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              cursor: 'pointer'
            }}
          >
      	  <div>
      	  	<strong>{doc.title}</strong>
      	  	<p style={{ margin: '0.25rem 0 0', color: '#555', fontSize: '0.9em'}}>
      	  	  Por: {doc.creator_name} em {doc.created_at}
      	  	</p>
      	  </div>
      	  <span style={{ color: '#888', fontSize: '0.9em' }}>
      	  	
      	  </span>
    	  </li>
  	  ))}
  	</ul>
  );
};

export default DocumentListComponent;