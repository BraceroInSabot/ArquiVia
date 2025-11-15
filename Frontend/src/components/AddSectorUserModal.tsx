import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, UserPlus, Loader2, AlertCircle } from 'lucide-react'; // Ícones
import sectorService from '../services/Sector/api';
import type { SectorUser, AddSectorUserPayload } from '../services/core-api';

// Reutiliza o CSS base de modais que já criamos
import '../assets/css/ClassificationModal.css'; 

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
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
        
        {/* Cabeçalho do Modal */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
            <UserPlus size={24} className="text-primary-custom" />
            Adicionar Usuário
          </h4>
          <button 
            onClick={handleClose} 
            className="btn btn-link text-secondary p-0 text-decoration-none"
            title="Fechar"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Mensagem de Erro */}
        {error && (
          <div className="alert alert-danger d-flex align-items-center mb-3" role="alert">
            <AlertCircle className="me-2 flex-shrink-0" size={20} />
            <div style={{ fontSize: '0.9rem' }}>{error}</div>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="form-label fw-semibold text-secondary">
              Email do Usuário
            </label>
            <input
              type="email"
              id="email"
              className="form-control form-control-lg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="exemplo@email.com"
              autoFocus
            />
            <div className="form-text">
              O usuário deve estar previamente cadastrado no sistema.
            </div>
          </div>
          
          {/* Rodapé / Botões */}
          <div className="d-flex justify-content-end gap-2 pt-2 border-top">
            <button 
              type="button" 
              onClick={handleClose} 
              className="btn btn-light text-secondary"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            
            <button 
              type="submit" 
              className="btn btn-primary-custom d-flex align-items-center gap-2"
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
    </div>,
    document.body
  );
};

export default AddSectorUserModal;