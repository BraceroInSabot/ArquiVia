import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import userService from '../services/User/api';
import { useAuth } from '../contexts/AuthContext';
import '../assets/css/ClassificationModal.css'; // Reutiliza estilos

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
      // Tenta desativar
      await userService.deactivateAccount(password);
      
      // SUCESSO: Conta desativada
      alert("Sua conta foi desativada com sucesso.");
      logout(); // Desloga o usuário (redireciona para login)

    } catch (err: any) {
      console.error("Erro ao desativar conta:", err);
      
      // Verifica se o erro foi "Senha incorreta" (Status 400 na sua View)
      if (err.response && err.response.status === 400) {
        alert("Senha incorreta. Por medidas de segurança, você será deslogado.");
        logout(); // REGRA DE NEGÓCIO: Desloga se errar a senha
      } else {
        // Outro erro (ex: servidor fora do ar)
        setError("Ocorreu um erro ao tentar desativar a conta. Tente novamente.");
        setIsLoading(false);
      }
    }
  };

  return createPortal(
    <div className="modal-overlay">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>&times;</button>
        
        <h2 style={{ color: '#dc3545' }}>Desativar Conta</h2>
        
        <p style={{ marginBottom: '1.5rem', color: '#555' }}>
          Tem certeza? Esta ação tornará sua conta inacessível. 
          Para confirmar, digite sua senha atual.
        </p>

        {error && <div className="classification-error">{error}</div>}

        <form className="classification-form" onSubmit={handleSubmit}>
          <div className="form-item">
            <label htmlFor="confirm_password">Senha Atual</label>
            <input
              type="password"
              id="confirm_password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="password-input" // Reutiliza classe do CSS anterior
              placeholder="Digite sua senha..."
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
              style={{ backgroundColor: '#dc3545', borderColor: '#dc3545' }} // Vermelho
              disabled={isLoading || !password}
            >
              {isLoading ? "Processando..." : "Confirmar e Desativar"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default DeactivateAccountModal;