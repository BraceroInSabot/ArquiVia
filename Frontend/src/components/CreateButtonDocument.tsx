import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import documentService from '../services/Document/api'; 
import type { CreateDocument } from '../services/core-api';
import SectorSelectionModal from './SectorSelectionModal';

const fabStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: '2rem',
  right: '2rem',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '3%',
  fontSize: '20px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  // Adiciona um efeito de transição e muda o cursor se estiver desabilitado
  transition: 'background-color 0.2s ease',
  opacity: 1,
};

const fabDisabledStyle: React.CSSProperties = {
  ...fabStyle,
  backgroundColor: '#999',
  cursor: 'not-allowed',
};

const defaultEmptyContent = {
  "root": {
    "children": [
      {
        "children": [],
        "direction": null,
        "format": "",
        "indent": 0,
        "type": "paragraph",
        "version": 1
      }
    ],
    "direction": null,
    "format": "",
    "indent": 0,
    "type": "root",
    "version": 1
  }
};

const CreateDocumentButton: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = () => {
    setIsModalOpen(true);
  };

  const handleSectorSelect = async (selectedSectorId: number) => {
    setIsModalOpen(false);
    setIsLoading(true);

    try {
      const payload: CreateDocument = {
        content: defaultEmptyContent,
        sector: selectedSectorId,
        categories: []
      };

  	  const response = await documentService.createDocument(payload);
      
      console.log(response.data.data)
  	  const newDocumentId = response.data.data.document_id; 

      if (!newDocumentId) {
        throw new Error("A API não retornou um ID para o novo documento.");
      }

  	  navigate(`/documento/editar/${newDocumentId}`); // momentaneo

  	} catch (error) {
  	  console.error('Erro ao criar documento:', error);
      alert("Houve um erro ao tentar criar o documento. Tente novamente.");
  	} finally {
      setIsLoading(false);
    }
  };

  return (
    <> 
  	  <button 
    	  style={isLoading ? fabDisabledStyle : fabStyle} 
    	  onClick={handleClick}
    	  title="Criar Novo Documento"
        disabled={isLoading} 
  	  >
    	  {isLoading ? 'Criando...' : 'Criar Novo Documento'}
  	  </button>

      {isModalOpen && (
        <SectorSelectionModal
          onClose={() => setIsModalOpen(false)}
          onSelectSector={handleSectorSelect}
        />
      )}
    </>
  );
};

export default CreateDocumentButton;