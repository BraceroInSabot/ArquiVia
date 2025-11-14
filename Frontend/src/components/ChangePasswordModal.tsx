import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import userService from '../services/User/api';
import { type ChangePasswordPayload } from '../services/core-api';
import '../assets/css/ClassificationModal.css'; // Reutiliza estilos básicos de modal

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
    setFormData(prev => ({ ...prev, [name]: value }));
    // Limpa erros ao digitar
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // 1. Validação básica no Frontend
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
      // 2. Chamada ao Backend
      await userService.changePassword(formData);
      
      setSuccessMessage("Senha alterada com sucesso!");
      
      // Fecha o modal após um breve delay para o usuário ler a mensagem
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (err: any) {
      console.error("Erro ao alterar senha:", err);
      
      // Tenta extrair mensagens de erro específicas do Serializer
      let msg = "Falha ao alterar senha.";
      
      // Verifica erros de validação de campos (ex: senha fraca)
      if (err.response?.data?.data) {
        const fieldErrors = err.response.data.data;
        // Pega o primeiro erro que encontrar
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
    <div className="modal-overlay">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>&times;</button>
        
        <h2>Alterar Senha</h2>

        {error && <div className="classification-error">{error}</div>}
        {successMessage && (
            <div style={{ 
                backgroundColor: '#d4edda', 
                color: '#155724', 
                padding: '10px', 
                borderRadius: '4px', 
                marginBottom: '1rem',
                textAlign: 'center',
                fontWeight: 'bold'
            }}>
                {successMessage}
            </div>
        )}

        <form className="classification-form" onSubmit={handleSubmit}>
          
          <div className="form-item">
            <label htmlFor="old_password">Senha Atual</label>
            <input
              type="password"
              id="old_password"
              name="old_password"
              value={formData.old_password}
              onChange={handleChange}
              required
              className="password-input"
            />
          </div>

          <div className="form-item">
            <label htmlFor="new_password">Nova Senha</label>
            <input
              type="password"
              id="new_password"
              name="new_password"
              value={formData.new_password}
              onChange={handleChange}
              required
              className="password-input"
            />
          </div>

          <div className="form-item">
            <label htmlFor="c_new_password">Confirmar Nova Senha</label>
            <input
              type="password"
              id="c_new_password"
              name="c_new_password"
              value={formData.c_new_password}
              onChange={handleChange}
              required
              className="password-input"
            />
          </div>

          <div className="modal-footer">
            <button 
              type="button" 
              className="confirm-btn cancel-btn" 
              onClick={onClose}
              disabled={isLoading}
              style={{ marginRight: '10px' }}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="modal-save-btn"
              disabled={isLoading || !formData.old_password || !formData.new_password}
            >
              {isLoading ? "Salvando..." : "Alterar Senha"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default ChangePasswordModal;