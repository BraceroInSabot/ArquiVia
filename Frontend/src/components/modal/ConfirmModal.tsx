import React from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Info, CheckCircle2, Loader2, X } from 'lucide-react';

export type ConfirmVariant = 'danger' | 'warning' | 'success' | 'info';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  
  title: string;
  message: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
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

  // Configuração Visual baseada na Variante (Tailwind/DaisyUI)
  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <AlertTriangle size={32} />,
          iconClass: 'text-error bg-error/10',
          btnClass: 'btn-error text-white'
        };
      case 'success':
        return {
          icon: <CheckCircle2 size={32} />,
          iconClass: 'text-success bg-success/10',
          btnClass: 'btn-success text-white'
        };
      case 'info':
        return {
          icon: <Info size={32} />,
          iconClass: 'text-info bg-info/10',
          btnClass: 'btn-info text-white'
        };
      case 'warning':
      default:
        return {
          icon: <AlertTriangle size={32} />,
          iconClass: 'text-warning bg-warning/10',
          btnClass: 'btn-warning text-white' // Ajuste para melhor contraste dependendo do tema
        };
    }
  };

  const styles = getVariantStyles();

  return createPortal(
    <div className="modal modal-open" role="dialog">
      <div className="modal-box relative text-center">
        
        {/* Botão Fechar (Topo) */}
        <button 
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          onClick={!isLoading ? onClose : undefined}
          disabled={isLoading}
        >
          <X size={20} />
        </button>

        <div className="pt-4">
            {/* Ícone Dinâmico */}
            <div className={`mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center ${styles.iconClass}`}>
                {styles.icon}
            </div>

            <h3 className="font-bold text-lg mb-2">{title}</h3>
            
            <div className="py-2 text-gray-500 text-sm">
                {message}
            </div>

            {/* Botões de Ação */}
            <div className="modal-action flex justify-center gap-3 mt-6">
                <button 
                    className="btn btn-ghost" 
                    onClick={onClose}
                    disabled={isLoading}
                >
                    {cancelText}
                </button>

                <button 
                    className={`btn ${styles.btnClass} min-w-[120px]`}
                    onClick={onConfirm}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="animate-spin" size={18} />
                            <span className="loading loading-spinner loading-xs hidden"></span> {/* Fallback DaisyUI */}
                        </>
                    ) : (
                        confirmText
                    )}
                </button>
            </div>
        </div>
      </div>
      
      {/* Backdrop clicável */}
      <form method="dialog" className="modal-backdrop">
        <button onClick={!isLoading ? onClose : undefined} disabled={isLoading}>close</button>
      </form>
    </div>,
    document.body
  );
};

export default ConfirmModal;