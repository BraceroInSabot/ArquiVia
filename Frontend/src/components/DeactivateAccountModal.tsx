import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle, Lock, Loader2, AlertCircle } from 'lucide-react'; // Ícones
import toast from 'react-hot-toast';

import userService from '../services/User/api';
import { useAuth } from '../contexts/AuthContext';
import '../assets/css/ClassificationModal.css'; // Reutiliza overlay e animações

interface DeactivateAccountModalProps {
  onClose: () => void;
}

const DeactivateAccountModal: React.FC<DeactivateAccountModalProps> = ({ onClose }) => {
  const { logout } = useAuth();
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setIsLoading(true);
    setError(null);

    try {
      await userService.deactivateAccount(password);
      
      toast.success("Sua conta foi desativada com sucesso.");
      logout(); 

    } catch (err: any) {
      console.error("Erro ao desativar conta:", err);
      
      if (err.response && err.response.status === 400) {
        toast.error("Senha incorreta. Por medidas de segurança, você será deslogado.");
        logout(); 
      } else {
        setError("Ocorreu um erro ao tentar desativar a conta. Tente novamente.");
        setIsLoading(false);
      }
    }
  };

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content p-0 overflow-hidden" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '450px' }}
      >
        
        {/* Cabeçalho com Botão Fechar */}
        <div className="d-flex justify-content-end p-2">
            <button 
                onClick={onClose} 
                className="btn btn-link text-secondary p-1 text-decoration-none"
            >
                <X size={24} />
            </button>
        </div>

        <div className="px-4 pb-4 text-center">
            
            {/* Ícone de Alerta */}
            <div className="mb-3 d-flex justify-content-center">
                <div className="bg-danger-subtle p-3 rounded-circle text-danger">
                    <AlertTriangle size={40} />
                </div>
            </div>

            <h4 className="fw-bold text-dark mb-2">Desativar Conta</h4>
            
            <p className="text-muted mb-4 small">
                Tem certeza? Esta ação tornará sua conta inacessível imediatamente. 
                Para confirmar, por favor digite sua senha atual.
            </p>

            {/* Erro */}
            {error && (
                <div className="alert alert-danger d-flex align-items-center text-start mb-3 py-2" role="alert">
                    <AlertCircle className="me-2 flex-shrink-0" size={18} />
                    <div className="small">{error}</div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="text-start">
                
                <div className="mb-4">
                    <label htmlFor="confirm_password" className="form-label fw-semibold text-secondary small text-uppercase">
                        Senha Atual
                    </label>
                    <div className="input-group">
                        <span className="input-group-text bg-light border-end-0 text-muted">
                            <Lock size={18} />
                        </span>
                        <input
                            type="password"
                            id="confirm_password"
                            className="form-control border-start-0 ps-0"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Digite sua senha..."
                        />
                    </div>
                </div>

                <div className="d-grid gap-2">
                    <button 
                        type="submit" 
                        className="btn btn-danger py-2 fw-bold d-flex align-items-center justify-content-center gap-2"
                        disabled={isLoading || !password}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin" size={18} />
                                Processando...
                            </>
                        ) : (
                            'Confirmar e Desativar'
                        )}
                    </button>
                    
                    <button 
                        type="button" 
                        className="btn btn-light text-secondary" 
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Cancelar
                    </button>
                </div>

            </form>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default DeactivateAccountModal;