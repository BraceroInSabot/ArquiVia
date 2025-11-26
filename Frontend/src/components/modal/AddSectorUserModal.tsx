import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, UserPlus, Loader2, AlertCircle, Mail } from 'lucide-react'; 
import sectorService from '../../services/Sector/api';
import type { SectorUser, AddSectorUserPayload } from '../../services/core-api';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectorId: number;
  onUserAdded: (newUser: SectorUser) => void;
}

const AddSectorUserModal = ({ isOpen, onClose, sectorId, onUserAdded }: ModalProps) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await sectorService.addUserToSector(sectorId, { user_email: email } as AddSectorUserPayload);

      onUserAdded(response.data);
      
      setEmail('');
      onClose();

      window.location.reload();

    } catch (err: any) {
      setError(err.response?.data?.detail || 'Falha ao adicionar usuário.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setError(null);
    onClose();
  };

  return createPortal(
    <div className="modal modal-open" role="dialog">
      <div className="modal-box relative">
        
        {/* Botão Fechar Flutuante */}
        <button 
            onClick={handleClose} 
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        >
            <X size={20} />
        </button>
        
        {/* Cabeçalho */}
        <h3 className="font-bold text-lg flex items-center gap-2 text-secondary mb-6">
            <UserPlus size={24} className="text-primary" />
            Adicionar Usuário
        </h3>
        
        {/* Erro */}
        {error && (
          <div className="alert alert-error shadow-sm mb-4 py-2 text-sm">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-control w-full">
            <label htmlFor="email" className="label">
              <span className="label-text font-semibold text-secondary">Email do Usuário</span>
            </label>
            
            <label className="input input-bordered flex items-center gap-2 focus-within:input-primary">
              <Mail size={18} className="text-gray-400" />
              <input
                type="email"
                id="email"
                className="grow"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="exemplo@email.com"
                autoFocus
              />
            </label>
            
            <div className="label">
              <span className="label-text-alt text-gray-500">O usuário deve estar previamente cadastrado no sistema.</span>
            </div>
          </div>
          
          {/* Ações */}
          <div className="modal-action mt-6">
            <button 
              type="button" 
              onClick={handleClose} 
              className="btn btn-ghost text-secondary"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            
            <button 
              type="submit" 
              className="btn btn-primary text-white px-6"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Adicionando...
                </>
              ) : (
                'Adicionar'
              )}
            </button>
          </div>
        </form>
      </div>
      
      {/* Backdrop Clicável */}
      <form method="dialog" className="modal-backdrop">
        <button onClick={handleClose}>close</button>
      </form>
    </div>,
    document.body
  );
};

export default AddSectorUserModal;