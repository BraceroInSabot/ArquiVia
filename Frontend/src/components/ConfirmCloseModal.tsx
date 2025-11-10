import React from 'react';
import { createPortal } from 'react-dom';

// Props que o modal de confirmação espera
interface ConfirmCloseModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmCloseModal: React.FC<ConfirmCloseModalProps> = ({ onConfirm, onCancel }) => (
  createPortal(
    <div className="modal-overlay confirm-overlay">
      <div className="modal-content confirm-modal">
        <h4>Sair sem Salvar?</h4>
        <p>Você tem alterações não salvas. Deseja realmente sair?</p>
        <div className="confirm-actions">
          <button className="confirm-btn cancel-btn" onClick={onCancel}>Cancelar</button>
          <button className="confirm-btn confirm-exit-btn" onClick={onConfirm}>Sair Sem Salvar</button>
        </div>
      </div>
    </div>,
    document.body
  )
);

export default ConfirmCloseModal;