import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Save, X, Loader2, AlertCircle, Pencil } from 'lucide-react';
import documentService from '../../services/Document/api';
import type { Category, UpdateCategoryPayload } from '../../services/core-api';

interface EditCategoryModalProps {
  sectorId: number;
  category: Category;
  onClose: () => void;
  onSuccess: () => void;
}

const EditCategoryModal: React.FC<EditCategoryModalProps> = ({ sectorId, category, onClose, onSuccess }) => {
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
      const payload: UpdateCategoryPayload = {
        sector_id: sectorId,
        category: name,
        description: description,
        is_public: isPublic,
      };

      await documentService.updateCategory(category.category_id, payload);
      
      onSuccess();
      onClose();

    } catch (err: any) {
      console.error("Erro ao editar categoria:", err);
      const errorData = err.response?.data?.data;
      let errMsg = "Falha ao editar categoria.";
      
      if (errorData?.category) {
        errMsg = errorData.category[0];
      } else if (err.response?.data?.message) {
        errMsg = err.response.data.message;
      }
      setError(errMsg);
    } finally {
      setIsSaving(false);
    }
  };

  return createPortal(
    <div className="modal modal-open" role="dialog">
      <div className="modal-box relative max-w-lg">
        
        {/* Botão Fechar */}
        <button 
            onClick={onClose} 
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        >
            <X size={20} />
        </button>
        
        {/* Cabeçalho */}
        <h3 className="font-bold text-lg flex items-center gap-2 text-secondary mb-6">
            <Pencil size={24} className="text-primary" />
            Editar Categoria
        </h3>
        
        {/* Erro */}
        {error && (
          <div className="alert alert-error shadow-sm mb-4 py-2 text-sm justify-start">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          
          {/* Nome */}
          <div className="form-control w-full">
            <label htmlFor="cat_name" className="label">
              <span className="label-text font-semibold text-secondary">Nome da Categoria</span>
            </label>
            <input 
              type="text" 
              id="cat_name"
              className="input input-bordered input-primary w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Ex: Contratos 2024"
            />
          </div>

          {/* Descrição */}
          <div className="form-control w-full">
            <label htmlFor="cat_desc" className="label">
              <span className="label-text font-semibold text-secondary">Descrição</span>
              <span className="label-text-alt">(Opcional)</span>
            </label>
            <textarea
              id="cat_desc"
              className="textarea textarea-bordered h-24 resize-y"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Checkbox Pública */}
          <div className="form-control">
            <label className="label cursor-pointer justify-start gap-3">
                <input 
                    type="checkbox" 
                    id="cat_public"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="checkbox checkbox-primary"
                />
                <div>
                    <span className="label-text font-semibold block">Tornar Pública</span>
                    <span className="label-text-alt text-gray-500">Permite que todos os membros da empresa visualizem.</span>
                </div>
            </label>
          </div>

          {/* Ações */}
          <div className="modal-action mt-8">
            <button 
                type="button" 
                className="btn btn-ghost text-gray-500 hover:bg-gray-100"
                onClick={onClose}
                disabled={isSaving}
            >
                Cancelar
            </button>
            <button 
              type="submit" 
              className="btn btn-primary text-white px-6"
              disabled={isSaving || !name}
            >
               {isSaving ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Salvar Alterações
                  </>
                )}
            </button>
          </div>
        </form>
      </div>

      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </div>,
    document.body
  );
};

export default EditCategoryModal;