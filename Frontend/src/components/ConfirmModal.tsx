import React from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Info, CheckCircle2, Loader2, X } from 'lucide-react';

// Reutiliza o CSS base de modais que já definimos
import '../assets/css/ClassificationModal.css'; 

export type ConfirmVariant = 'danger' | 'warning' | 'success' | 'info';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void; // A função que executa a ação
  isLoading?: boolean;   // Para mostrar o spinner no botão
  
  // Configuração de Texto e Estilo
  title: string;
  message: string | React.ReactNode; // Aceita string ou JSX (para negritos, etc)
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant; // Padrão: 'warning'
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isLoading = false,
  title, 
  message, 
  confirmText = "Confirmar", 
  cancelText = "Cancelar",
  variant = 'warning'
}) => {
  
  if (!isOpen) return null;

  // Configuração Visual baseada na Variante
  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <AlertTriangle size={32} />,
          bgClass: 'bg-danger-subtle',
          textClass: 'text-danger',
          btnClass: 'btn-danger'
        };
      case 'success':
        return {
          icon: <CheckCircle2 size={32} />,
          bgClass: 'bg-success-subtle',
          textClass: 'text-success',
          btnClass: 'btn-success'
        };
      case 'info':
        return {
          icon: <Info size={32} />,
          bgClass: 'bg-info-subtle',
          textClass: 'text-info',
          btnClass: 'btn-info text-white'
        };
      case 'warning':
      default:
        return {
          icon: <AlertTriangle size={32} />,
          bgClass: 'bg-warning-subtle',
          textClass: 'text-warning',
          btnClass: 'btn-warning text-dark'
        };
    }
  };

  const styles = getVariantStyles();

  return createPortal(
    <div className="modal-overlay" onClick={!isLoading ? onClose : undefined} style={{ zIndex: 1060 }}>
      <div 
        className="modal-content p-0 overflow-hidden" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '400px', borderRadius: '12px' }}
      >
        
        {/* Botão Fechar (Topo) */}
        <div className="d-flex justify-content-end p-2">
            <button 
                onClick={onClose} 
                className="btn btn-link text-secondary p-1 text-decoration-none"
                disabled={isLoading}
            >
                <X size={24} />
            </button>
        </div>

        <div className="px-4 pb-4 text-center">
            
            {/* Ícone Dinâmico */}
            <div className={`mb-3 d-inline-flex p-3 rounded-circle ${styles.bgClass} ${styles.textClass}`}>
                {styles.icon}
            </div>

            <h4 className="fw-bold text-dark mb-2">{title}</h4>
            
            <div className="text-muted mb-4 small">
                {message}
            </div>

            {/* Botões de Ação */}
            <div className="d-grid gap-2">
                <button 
                    type="button" 
                    className={`btn ${styles.btnClass} py-2 fw-bold d-flex align-items-center justify-content-center gap-2`}
                    onClick={onConfirm}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="animate-spin" size={18} />
                            Processando...
                        </>
                    ) : (
                        confirmText
                    )}
                </button>
                
                <button 
                    type="button" 
                    className="btn btn-light text-secondary" 
                    onClick={onClose}
                    disabled={isLoading}
                >
                    {cancelText}
                </button>
            </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmModal;