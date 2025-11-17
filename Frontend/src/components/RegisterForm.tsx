import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, UserCheck, AtSign, Lock, FileImage, Loader2, AlertCircle, Save } from 'lucide-react';
import toast from 'react-hot-toast';

import Validate from '../utils/credential_validation';
import registerService from '../services/User/api'; 
// Reutiliza o CSS para inputs e botões
import '../assets/css/LoginPage.css'; 

const RegisterForm = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cpassword, setCpassword] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null); // Para o preview
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Estado de loading

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file)); // Cria preview
    } else {
      setImage(null);
      setImagePreview(null);
    }
  };

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null); 

    const usernameValidation = Validate.username(username);
    if (!usernameValidation[0]) { setError(usernameValidation[1] as string); return; }
    // ... (outras validações) ...
    const passwordValidation = Validate.password(password, cpassword);
    if (!passwordValidation[0]) { setError(passwordValidation[1] as string); return; }

    setIsLoading(true); // Ativa o loading

    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('name', name);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('cpassword', cpassword);

      if (image) {
        formData.append('image', image);
      }

      const api_response = await registerService.register(formData);
      
      if (api_response) {
        toast.success('Registro realizado com sucesso! Faça seu login.');
        navigate('/entrar');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.mensagem || 'Erro ao registrar usuário.';
      setError(errorMessage);
    } finally {
      setIsLoading(false); // Desativa o loading
    }
  }

  return (
    <form onSubmit={handleRegister} className="p-4">
      
      {/* Mensagem de Erro */}
      {error && (
        <div className="alert alert-danger d-flex align-items-center p-2 small mb-3" role="alert">
          <AlertCircle className="me-2 flex-shrink-0" size={16} />
          <div>{error}</div>
        </div>
      )}

      {/* Inputs com Ícones */}
      <div className="mb-3">
        <label htmlFor="username" className="form-label small fw-bold text-secondary text-uppercase">Usuário</label>
        <div className="input-group">
          <span className="input-group-text bg-light border-end-0 text-muted"><User size={18} /></span>
          <input type="text" id="username" className="form-control border-start-0 ps-0 bg-light" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
      </div>

      <div className="mb-3">
        <label htmlFor="name" className="form-label small fw-bold text-secondary text-uppercase">Nome Completo</label>
        <div className="input-group">
          <span className="input-group-text bg-light border-end-0 text-muted"><UserCheck size={18} /></span>
          <input type="text" id="name" className="form-control border-start-0 ps-0 bg-light" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
      </div>

      <div className="mb-3">
        <label htmlFor="email" className="form-label small fw-bold text-secondary text-uppercase">Email</label>
        <div className="input-group">
          <span className="input-group-text bg-light border-end-0 text-muted"><AtSign size={18} /></span>
          <input type="email" id="email" className="form-control border-start-0 ps-0 bg-light" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
      </div>
      
      <div className="mb-3">
        <label htmlFor="password" className="form-label small fw-bold text-secondary text-uppercase">Senha</label>
        <div className="input-group">
          <span className="input-group-text bg-light border-end-0 text-muted"><Lock size={18} /></span>
          <input type="password" id="password" className="form-control border-start-0 ps-0 bg-light" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
      </div>

      <div className="mb-3">
        <label htmlFor="cpassword" className="form-label small fw-bold text-secondary text-uppercase">Confirme a Senha</label>
        <div className="input-group">
          <span className="input-group-text bg-light border-end-0 text-muted"><Lock size={18} /></span>
          <input type="password" id="cpassword" className="form-control border-start-0 ps-0 bg-light" value={cpassword} onChange={(e) => setCpassword(e.target.value)} required />
        </div>
      </div>

      {/* Input de Imagem Customizado */}
      <div className="mb-4">
        <label htmlFor="image" className="form-label small fw-bold text-secondary text-uppercase">Foto de Perfil <span className="fw-normal text-muted">(Opcional)</span></label>
        <div className="position-relative">
          <input
            type="file"
            id="image"
            className="form-control"
            accept="image/png, image/jpeg, image/svg+xml"
            onChange={handleImageChange}
            style={{ opacity: 0, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor: 'pointer', zIndex: 2 }}
          />
          <div className="image-upload-box d-flex align-items-center justify-content-center p-3 text-center border-dashed rounded-3">
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="image-preview-circle" />
            ) : (
              <div className="d-flex align-items-center gap-2 text-muted">
                <FileImage size={18} />
                <span className="small">Clique para adicionar uma imagem</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <button 
        type="submit" 
        className="btn btn-primary-custom w-100 py-2 d-flex align-items-center justify-content-center gap-2 fw-bold"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            Registrando...
          </>
        ) : (
          <>
            <Save size={20} />
            Finalizar Cadastro
          </>
        )}
      </button>
      
    </form>
  );
}

export default RegisterForm;