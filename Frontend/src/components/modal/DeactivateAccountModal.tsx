import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle, Lock, Loader2, AlertCircle } from 'lucide-react'; 
import toast from 'react-hot-toast';

import userService from '../../services/User/api';
import { useAuth } from '../../contexts/AuthContext';

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
      const response = await userService.deactivateAccount(password);
      console.log(response);
      if (response.data.sucesso === true) {
        toast.success(response.data.mensagem);
        logout(); 
      } else {
        toast.error(response.data.mensagem);
        setIsLoading(false);
      }

    } catch (err: any) {
      console.error("Erro ao desativar conta:", err);
      
      if (err.response && err.response.status === 400) {
        setError("Senha incorreta.");
        setIsLoading(false);
      } else {
        setError("Ocorreu um erro ao tentar desativar a conta. Tente novamente.");
        setIsLoading(false);
      }
    }
  };

  return createPortal(
    <>
      {/* Backdrop */}
      <div className="modal modal-open">
        <div className="modal-box relative max-w-sm">
            <button 
                onClick={onClose} 
                className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            >
                <X size={20} />
            </button>

            <div className="text-center pt-4">
                <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-error/10 flex items-center justify-center text-error">
                    <AlertTriangle size={32} />
                </div>
                
                <h3 className="font-bold text-xl text-error mb-2">Desativar Conta</h3>
                <p className="text-sm text-gray-500 mb-6">
                    Esta ação tornará sua conta inacessível imediatamente. 
                    Para confirmar, digite sua senha atual.
                </p>

                {error && (
                    <div className="alert alert-error shadow-sm mb-4 text-sm py-2 justify-start">
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="text-left space-y-4">
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text font-semibold">Senha Atual</span>
                        </label>
                        <label className="input input-bordered flex items-center gap-2 focus-within:input-error">
                            <Lock size={16} className="text-gray-400" />
                            <input
                                type="password"
                                className="grow"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                            />
                        </label>
                    </div>

                    <div className="modal-action flex flex-col gap-2 mt-6">
                        <button 
                            type="submit" 
                            className="btn btn-error w-full text-white"
                            disabled={isLoading || !password}
                        >
                            {isLoading ? <Loader2 className="animate-spin" /> : "Confirmar e Desativar"}
                        </button>
                        <button 
                            type="button" 
                            className="btn btn-ghost w-full"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
        {/* Clica fora pra fechar se quiser */}
        <form method="dialog" className="modal-backdrop">
            <button onClick={onClose}>close</button>
        </form>
      </div>
    </>,
    document.body
  );
};

export default DeactivateAccountModal;