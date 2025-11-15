import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Loader2 } from 'lucide-react'; // Ícones

import documentService from '../services/Document/api'; 
import type { CreateDocument } from '../services/core-api';
import SectorSelectionModal from './SectorSelectionModal';

// Import do CSS
import '../assets/css/DocumentPage.css';
import '../assets/css/EnterprisePage.css'; // Para btn-primary-custom

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
      
      const newDocumentId = response.data.data.document_id; 

      if (!newDocumentId) {
        throw new Error("A API não retornou um ID para o novo documento.");
      }

      navigate(`/documento/editar/${newDocumentId}`); 

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
        className="btn btn-primary-custom fab-button"
        onClick={handleClick}
        title="Criar Novo Documento"
        disabled={isLoading} 
      >
        {isLoading ? (
            <>
                <Loader2 className="animate-spin" size={24} />
                <span className="fw-bold">Criando...</span>
            </>
        ) : (
            <>
                <Plus size={24} strokeWidth={3} />
                <span className="fw-bold">Novo Documento</span>
            </>
        )}
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