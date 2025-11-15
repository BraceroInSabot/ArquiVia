import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Lock, Key, Save, X, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'; // Ícones

import userService from '../services/User/api';
import { type ChangePasswordPayload } from '../services/core-api';
import '../assets/css/ClassificationModal.css'; // Reutiliza CSS base

interface ChangePasswordModalProps {
  onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ onClose }) => {
  const [formData, setFormData] = useState<ChangePasswordPayload>({
    old_password: '',
    new_password: '',
    c_new_password: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    //@ts-ignore
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (formData.new_password !== formData.c_new_password) {
      setError("A nova senha e a confirmação não conferem.");
      return;
    }

    if (formData.new_password === formData.old_password) {
        setError("A nova senha deve ser diferente da atual.");
        return;
    }

    setIsLoading(true);

    try {
      await userService.changePassword(formData);
      setSuccessMessage("Senha alterada com sucesso!");
      
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (err: any) {
      console.error("Erro ao alterar senha:", err);
      let msg = "Falha ao alterar senha.";
      
      if (err.response?.data?.data) {
        const fieldErrors = err.response.data.data;
        const firstKey = Object.keys(fieldErrors)[0];
        if (firstKey && Array.isArray(fieldErrors[firstKey])) {
            msg = fieldErrors[firstKey][0];
        }
      } else if (err.response?.data?.message) {
        msg = err.response.data.message;
      }
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content p-0 overflow-hidden" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '450px' }}
      >
        
        {/* Cabeçalho */}
        <div className="d-flex justify-content-between align-items-center p-3 px-4 border-bottom bg-light">
            <h4 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <Lock size={20} className="text-warning" />
                Alterar Senha
            </h4>
            <button 
                onClick={onClose} 
                className="btn btn-link text-secondary p-0 text-decoration-none"
                title="Fechar"
            >
                <X size={24} />
            </button>
        </div>

        <div className="p-4">
            {/* Mensagens de Feedback */}
            {error && (
                <div className="alert alert-danger d-flex align-items-center mb-3" role="alert">
                    <AlertCircle className="me-2 flex-shrink-0" size={20} />
                    <div>{error}</div>
                </div>
            )}

            {successMessage && (
                <div className="alert alert-success d-flex align-items-center mb-3" role="alert">
                    <CheckCircle2 className="me-2 flex-shrink-0" size={20} />
                    <div>{successMessage}</div>
                </div>
            )}

            <form onSubmit={handleSubmit}>
            
            {/* Senha Atual */}
            <div className="mb-3">
                <label htmlFor="old_password" className="form-label fw-semibold text-secondary small text-uppercase">
                    Senha Atual
                </label>
                <div className="input-group">
                    <span className="input-group-text bg-white border-end-0 text-muted">
                        <Lock size={18} />
                    </span>
                    <input
                        type="password"
                        id="old_password"
                        name="old_password"
                        className="form-control border-start-0 ps-0"
                        value={formData.old_password}
                        onChange={handleChange}
                        required
                        placeholder="••••••••"
                    />
                </div>
            </div>

            <hr className="my-4 text-muted opacity-25" />

            {/* Nova Senha */}
            <div className="mb-3">
                <label htmlFor="new_password" className="form-label fw-semibold text-secondary small text-uppercase">
                    Nova Senha
                </label>
                <div className="input-group">
                    <span className="input-group-text bg-white border-end-0 text-muted">
                        <Key size={18} />
                    </span>
                    <input
                        type="password"
                        id="new_password"
                        name="new_password"
                        className="form-control border-start-0 ps-0"
                        value={formData.new_password}
                        onChange={handleChange}
                        required
                        placeholder="••••••••"
                    />
                </div>
            </div>

            {/* Confirmar Nova Senha */}
            <div className="mb-4">
                <label htmlFor="c_new_password" className="form-label fw-semibold text-secondary small text-uppercase">
                    Confirmar Nova Senha
                </label>
                <div className="input-group">
                    <span className="input-group-text bg-white border-end-0 text-muted">
                        <Key size={18} />
                    </span>
                    <input
                        type="password"
                        id="c_new_password"
                        name="c_new_password"
                        className="form-control border-start-0 ps-0"
                        value={formData.c_new_password}
                        onChange={handleChange}
                        required
                        placeholder="••••••••"
                    />
                </div>
            </div>

            {/* Rodapé / Botões */}
            <div className="d-grid gap-2">
                <button 
                    type="submit" 
                    className="btn btn-success py-2 fw-bold d-flex align-items-center justify-content-center gap-2"
                    disabled={isLoading || !formData.old_password || !formData.new_password}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="animate-spin" size={20} />
                            Alterando...
                        </>
                    ) : (
                        <>
                            <Save size={20} />
                            Alterar Senha
                        </>
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

export default ChangePasswordModal;