import { useState } from 'react';
import sectorService from '../services/Sector/api';
import type { SectorUser, AddSectorUserPayload } from '../services/core-api';

// --- Interfaces e Estilos ---

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectorId: number;
  onUserAdded: (newUser: SectorUser) => void;
}

const OVERLAY_STYLE: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  zIndex: 1000,
};

const MODAL_STYLE: React.CSSProperties = {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: '#FFF',
  padding: '20px',
  borderRadius: '8px',
  zIndex: 1001,
  width: '400px',
};

// --- O Componente ---

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
      // 1. Chama o serviço atualizado, passando o email
      const response = await sectorService.addUserToSector(sectorId, { user_email: email } as AddSectorUserPayload);

      // 2. Avisa o componente pai (SectorUsers) que um novo usuário foi adicionado
      onUserAdded(response.data);
      
      // 3. Limpa o formulário e fecha o modal
      setEmail('');
      onClose();

    } catch (err: any) {
      setError(err.response?.data?.detail || 'Falha ao adicionar usuário.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reseta o estado ao fechar
    setEmail('');
    setError(null);
    onClose();
  };

  return (
    <div style={OVERLAY_STYLE} onClick={handleClose}>
      <div style={MODAL_STYLE} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Adicionar Usuário ao Setor</h3>
          <button onClick={handleClose} style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer' }}>
            &times;
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div style={{ margin: '20px 0' }}>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>
              Email do Usuário:
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          
          {error && <p style={{ color: 'red' }}>{error}</p>}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" onClick={handleClose} disabled={isSubmitting}>
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adicionando...' : 'Adicionar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSectorUserModal;