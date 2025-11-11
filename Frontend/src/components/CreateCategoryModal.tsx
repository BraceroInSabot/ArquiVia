import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import documentService from '../services/Document/api';
import type { CreateCategoryPayload } from '../services/core-api';
import '../assets/css/ClassificationModal.css'; // Reutiliza o CSS de modais

interface CreateCategoryModalProps {
  sectorId: number;
  onClose: () => void;
  onSuccess: () => void; // Callback para recarregar a lista
}

const CreateCategoryModal: React.FC<CreateCategoryModalProps> = ({ sectorId, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setIsSaving(true);
    setError(null);

    try {
      const payload: CreateCategoryPayload = {
        category: name,
        description: description,
        is_public: isPublic,
        category_sector: sectorId
      };

      await documentService.createCategory(sectorId, payload);
      
      onSuccess();
      onClose();

    } catch (err: any) {
      console.error("Erro ao criar categoria:", err);
      const errMsg = err.response?.data?.message || "Falha ao criar categoria.";
      setError(errMsg);
    } finally {
      setIsSaving(false);
    }
  };

  return createPortal(
    <div className="modal-overlay">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>&times;</button>
        <h2>Nova Categoria</h2>
        
        {error && <p className="classification-error">{error}</p>}

        <form className="classification-form" onSubmit={handleSave}>
          <div className="form-item">
            <label htmlFor="cat_name">Nome</label>
            <input 
              type="text" 
              id="cat_name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="category-search-input"
              placeholder="Ex: Contratos 2024"
            />
          </div>

          <div className="form-item">
            <label htmlFor="cat_desc">Descrição</label>
            <textarea
              id="cat_desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="category-search-input"
              style={{ resize: 'vertical' }}
            />
          </div>

          <div className="form-item">
            <label htmlFor="cat_public">Pública?</label>
            <input 
              type="checkbox" 
              id="cat_public"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
          </div>

          <div className="modal-footer">
            <button 
              type="submit" 
              className="modal-save-btn"
              disabled={isSaving || !name}
            >
              {isSaving ? "Criando..." : "Criar Categoria"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default CreateCategoryModal;