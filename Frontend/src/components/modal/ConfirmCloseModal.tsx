import React from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle } from 'lucide-react'; // Ícone

interface ConfirmCloseModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmCloseModal: React.FC<ConfirmCloseModalProps> = ({ onConfirm, onCancel }) => (
  createPortal(
    <div className="modal-overlay confirm-overlay" onClick={onCancel}>
      <div 
        className="modal-content confirm-modal p-4 text-center" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '400px' }}
      >
        
        <div className="mb-3 d-flex justify-content-center">
            <div className="bg-warning-subtle p-3 rounded-circle text-warning">
                <AlertTriangle size={32} />
            </div>
        </div>

        <h5 className="fw-bold text-dark mb-2">Descartar alterações?</h5>
        
        <p className="text-muted mb-4">
            Você tem alterações não salvas. Se sair agora, as mudanças serão perdidas.
        </p>

        <div className="d-flex gap-2 justify-content-center w-100">
          <button 
            className="btn btn-light text-secondary flex-grow-1" 
            onClick={onCancel}
          >
            Continuar Editando
          </button>
          
          <button 
            className="btn btn-danger flex-grow-1" 
            onClick={onConfirm}
          >
            Sair sem Salvar
          </button>
        </div>

      </div>
    </div>,
    document.body
  )
);

export default ConfirmCloseModal; 