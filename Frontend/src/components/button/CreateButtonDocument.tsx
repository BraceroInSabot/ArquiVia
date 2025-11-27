import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

import documentService from '../../services/Document/api';
import type { CreateDocument } from '../../services/core-api';
import SectorSelectionModal from '../../components/modal/SectorSelectionModal';

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
  
  // Começa expandido
  const [isExpanded, setIsExpanded] = useState(true);

  // Timer para minimizar
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExpanded(false);
    }, 3000); 

    return () => clearTimeout(timer);
  }, []);

  const handleClick = () => {
    // Se estiver minimizado, expande brevemente ao clicar (feedback visual)
    if (!isExpanded) {
       setIsExpanded(true);
    }
    setIsModalOpen(true);
  };

  const handleSectorSelect = async (selectedSectorId: number) => {
    setIsModalOpen(false);
    setIsLoading(true);
    setIsExpanded(true); // Expande para mostrar o texto "Criando..."

    try {
      const payload: CreateDocument = {
        content: defaultEmptyContent,
        sector: selectedSectorId,
        categories: []
      };

      const response = await documentService.createDocument(payload);
      
      const newDocumentId = response.data.data?.document_id

      if (!newDocumentId) {
        throw new Error("A API não retornou um ID para o novo documento.");
      }

      navigate(`/documento/editar/${newDocumentId}`); 

    } catch (error) {
      console.error(error);
      toast.error("Houve um erro ao tentar criar o documento.");
      // Se falhar, volta a minimizar após 2s
      setTimeout(() => setIsExpanded(false), 2000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        title="Criar Novo Documento"
        disabled={isLoading}
        // Classes Base do Botão
        className={`
            fixed bottom-8 right-8 z-40 
            btn btn-primary border-none shadow-xl text-white 
            h-14 flex items-center justify-center overflow-hidden
            transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]
            ${isExpanded ? 'px-6 rounded-[2rem]' : 'w-14 rounded-full px-0'}
            hover:-translate-y-1 hover:shadow-2xl
        `}
      >
        <div className="flex items-center justify-center">
            {isLoading ? (
                <Loader2 className="animate-spin shrink-0" size={24} />
            ) : (
                <Plus className="shrink-0" size={28} strokeWidth={2.5} />
            )}

            {/* Truque de CSS para animação suave de largura:
               Animamos max-width e opacity.
               whitespace-nowrap impede que o texto quebre linha enquanto encolhe.
            */}
            <span 
                className={`
                    whitespace-nowrap overflow-hidden transition-all duration-700 ease-in-out
                    font-bold text-lg
                    ${isExpanded ? 'max-w-[200px] opacity-100 ml-3' : 'max-w-0 opacity-0 ml-0'}
                `}
            >
                {isLoading ? "Criando..." : "Novo Documento"}
            </span>
        </div>
      </button>

      {isModalOpen && (
        <SectorSelectionModal
          onClose={() => {
             setIsModalOpen(false);
             // Se cancelou, volta a minimizar imediatamente
             if (!isLoading) setIsExpanded(false);
          }}
          onSelectSector={handleSectorSelect}
        />
      )}
    </>
  );
};

export default CreateDocumentButton;