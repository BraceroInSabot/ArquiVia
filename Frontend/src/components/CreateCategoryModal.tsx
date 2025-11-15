import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Save, X, Loader2, AlertCircle } from 'lucide-react'; // Ícones
import documentService from '../services/Document/api';
import type { CreateCategoryPayload } from '../services/core-api';

// Reutiliza o CSS base de modais
import '../assets/css/ClassificationModal.css'; 

interface CreateCategoryModalProps {
  sectorId: number;
  onClose: () => void;
  onSuccess: () => void;
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
      // Mensagem de erro amigável
      const errMsg = err.response?.data?.message || 
                     (err.response?.data?.data?.category ? err.response.data.data.category[0] : "Falha ao criar categoria.");
      setError(errMsg);
    } finally {
      setIsSaving(false);
    }
  };

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        
        {/* Cabeçalho */}
        <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="fw-bold text-dark mb-0">Nova Categoria</h4>
            <button 
                onClick={onClose} 
                className="btn btn-link text-secondary p-0 text-decoration-none"
                title="Fechar"
            >
                <X size={24} />
            </button>
        </div>
        
        {/* Erro */}
        {error && (
            <div className="alert alert-danger d-flex align-items-center mb-3" role="alert">
                <AlertCircle className="me-2 flex-shrink-0" size={20} />
                <div style={{ fontSize: '0.9rem' }}>{error}</div>
            </div>
        )}

        <form onSubmit={handleSave}>
          
          {/* Campo Nome */}
          <div className="mb-3">
            <label htmlFor="cat_name" className="form-label fw-semibold text-secondary">Nome da Categoria</label>
            <input 
              type="text" 
              id="cat_name"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Ex: Contratos 2024"
              autoFocus
            />
          </div>

          {/* Campo Descrição */}
          <div className="mb-3">
            <label htmlFor="cat_desc" className="form-label fw-semibold text-secondary">Descrição <small className="text-muted fw-normal">(Opcional)</small></label>
            <textarea
              id="cat_desc"
              className="form-control"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Descreva o propósito desta categoria..."
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Checkbox Pública */}
          <div className="mb-4 form-check">
            <input 
              type="checkbox" 
              className="form-check-input"
              id="cat_public"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <label htmlFor="cat_public" className="form-check-label user-select-none" style={{ cursor: 'pointer' }}>
                Tornar Pública <small className="text-muted d-block">Permite que todos os membros da empresa visualizem.</small>
            </label>
          </div>

          {/* Rodapé / Botões */}
          <div className="d-flex justify-content-end gap-2 pt-3 border-top">
            <button 
                type="button" 
                className="btn btn-light text-secondary"
                onClick={onClose}
                disabled={isSaving}
            >
                Cancelar
            </button>
            <button 
              type="submit" 
              className="btn btn-primary-custom d-flex align-items-center gap-2"
              disabled={isSaving || !name}
            >
               {isSaving ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Criando...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Criar Categoria
                  </>
                )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default CreateCategoryModal;