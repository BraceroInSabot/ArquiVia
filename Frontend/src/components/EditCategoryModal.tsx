import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import documentService  from '../services/Document/api';
import type { Category, UpdateCategoryPayload } from '../services/core-api';
import '../assets/css/ClassificationModal.css';

interface EditCategoryModalProps {
  sectorId: number; // Necessário para o payload
  category: Category; // Dados iniciais da categoria
  onClose: () => void;
  onSuccess: () => void;
}

const EditCategoryModal: React.FC<EditCategoryModalProps> = ({ sectorId, category, onClose, onSuccess }) => {
  // Inicializa o estado com os dados da categoria
  const [name, setName] = useState(category.category);
  const [description, setDescription] = useState(category.description || '');
  const [isPublic, setIsPublic] = useState(category.is_public);
  
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setIsSaving(true);
    setError(null);

    try {
      // Monta o payload (incluindo o sector_id obrigatório)
      const payload: UpdateCategoryPayload = {
        sector_id: sectorId,
        category: name,
        description: description,
        is_public: isPublic,
      };

      await documentService.updateCategory(category.category_id, payload);
      
      onSuccess(); // Recarrega a lista
      onClose();   // Fecha o modal

    } catch (err: any) {
      console.error("Erro ao editar categoria:", err);
      // Tenta pegar erros de campo específicos (ex: nome duplicado)
      const errorData = err.response?.data?.data;
      let errMsg = "Falha ao editar categoria.";
      
      if (errorData?.category) {
        errMsg = errorData.category[0]; // Ex: "Nome já existe"
      } else if (err.response?.data?.message) {
        errMsg = err.response.data.message;
      }
      
      setError(errMsg);
    } finally {
      setIsSaving(false);
    }
  };

  return createPortal(
    <div className="modal-overlay">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>&times;</button>
        <h2>Editar Categoria</h2>
        
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
              {isSaving ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default EditCategoryModal;