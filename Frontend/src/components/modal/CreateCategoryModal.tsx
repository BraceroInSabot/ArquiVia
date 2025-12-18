import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Save, X, Loader2, AlertCircle, Tag, Palette } from 'lucide-react';
import documentService from '../../services/Document/api';
import type { CreateCategoryPayload } from '../../services/core-api';

interface CreateCategoryModalProps {
  sectorId: number;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateCategoryModal: React.FC<CreateCategoryModalProps> = ({ sectorId, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#FFFFFF'); 
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
        color: color,
        description: description,
        is_public: isPublic,
        category_sector: sectorId
      };

      await documentService.createCategory(sectorId, payload);
      
      onSuccess();
      onClose();

    } catch (err: any) {
      console.error("Erro ao criar categoria:", err);
      const errMsg = err.response?.data?.message || 
                     (err.response?.data?.data?.category ? err.response.data.data.category[0] : "Falha ao criar categoria.");
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
            <Tag size={24} className="text-primary" />
            Nova Categoria
        </h3>
        
        {/* Erro */}
        {error && (
          <div className="alert alert-error shadow-sm mb-4 py-2 text-sm justify-start">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          
          <div className='grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-start'>
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
                autoFocus
              />
            </div>

            {/* Paleta de Cores */}
            <div className="form-control">
                  <label htmlFor="cat_color" className="label">
                      <span className="label-text font-semibold text-secondary flex items-center gap-1">
                          <Palette size={14}/> Cor
                      </span>
                  </label>
                  <div className="flex items-center gap-2">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-base-300 shadow-sm relative cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all">
                          <input
                              type="color"
                              id="cat_color"
                              value={color}
                              onChange={(e) => setColor(e.target.value)}
                              className="absolute -top-2 -left-2 w-16 h-16 p-0 border-0 cursor-pointer"
                          />
                      </div>
                  </div>
              </div>
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
              placeholder="Descreva o propósito desta categoria..."
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
      
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </div>,
    document.body
  );
};

export default CreateCategoryModal;