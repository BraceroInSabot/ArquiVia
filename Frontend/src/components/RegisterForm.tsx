import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, UserCheck, AtSign, Lock, FileImage, Loader2, AlertCircle, Save } from 'lucide-react';
import toast from 'react-hot-toast';

import Validate from '../utils/credential_validation';
import registerService from '../services/User/api';

const RegisterForm = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cpassword, setCpassword] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImage(null);
      setImagePreview(null);
    }
  };

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const usernameValidation = Validate.username(username);
    if (!usernameValidation[0]) { 
      setError(usernameValidation[1] as string); 
      return; 
    }

    const nameValidation = Validate.name(name);
    if (!nameValidation[0]) { 
      setError(nameValidation[1] as string); 
      return; 
    }

    const emailValidation = Validate.email(email);
    if (!emailValidation[0]) { 
      setError(emailValidation[1] as string); 
      return; 
    }

    const passwordValidation = Validate.password(password, cpassword);
    if (!passwordValidation[0]) { 
      setError(passwordValidation[1] as string); 
      return; 
    }

    setIsLoading(true);

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
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className="space-y-4">
      {/* Error Alert */}
      {error && (
        <div className="alert alert-error shadow-lg">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Username Field */}
      <div className="form-control">
        <label className="label" htmlFor="username">
          <span className="label-text font-semibold text-secondary text-xs uppercase tracking-wide">
            Usuário
          </span>
          <span className="bg-base-000 border-r-0">
            <User className="w-5 h-5 text-secondary/60" />
          </span>
        </label>
        <label className="input-group">
          <input
            type="text"
            id="username"
            className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Seu nome de usuário"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={isLoading}
          />
        </label>
      </div>

      {/* Name Field */}
      <div className="form-control">
        <label className="label" htmlFor="name">
          <span className="label-text font-semibold text-secondary text-xs uppercase tracking-wide">
            Nome Completo
          </span>
          <span className="bg-base-000 border-r-0">
            <UserCheck className="w-5 h-5 text-secondary/60" />
          </span>
        </label>
        <label className="input-group">
          <input
            type="text"
            id="name"
            className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Seu nome completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={isLoading}
          />
        </label>
      </div>

      {/* Email Field */}
      <div className="form-control">
        <label className="label" htmlFor="email">
          <span className="label-text font-semibold text-secondary text-xs uppercase tracking-wide">
            Email
          </span>
          <span className="bg-base-000 border-r-0">
            <AtSign className="w-5 h-5 text-secondary/60" />
          </span>
        </label>
        <label className="input-group">
          <input
            type="email"
            id="email"
            className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
        </label>
      </div>

      {/* Password Field */}
      <div className="form-control">
        <label className="label" htmlFor="password">
          <span className="label-text font-semibold text-secondary text-xs uppercase tracking-wide">
            Senha
          </span>
          <span className="bg-base-000 border-r-0">
            <Lock className="w-5 h-5 text-secondary/60" />
          </span>
        </label>
        <label className="input-group">
          <input
            type="password"
            id="password"
            className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </label>
      </div>

      {/* Confirm Password Field */}
      <div className="form-control">
        <label className="label" htmlFor="cpassword">
          <span className="label-text font-semibold text-secondary text-xs uppercase tracking-wide">
            Confirme a Senha
          </span>
          <span className="bg-base-000 border-r-0">
            <Lock className="w-5 h-5 text-secondary/60" />
          </span>
        </label>
        <label className="input-group">
          <input
            type="password"
            id="cpassword"
            className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="••••••••"
            value={cpassword}
            onChange={(e) => setCpassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </label>
      </div>

      {/* Image Upload Field */}
      <div className="form-control">
        <label className="label" htmlFor="image">
          <span className="label-text font-semibold text-secondary text-xs uppercase tracking-wide">
            Foto de Perfil <span className="normal-case font-normal text-gray-400">(Opcional)</span>
          </span>
        </label>
        <div className="relative">
          <input
            type="file"
            id="image"
            className="file-input file-input-bordered w-full hidden"
            accept="image/png, image/jpeg, image/svg+xml"
            onChange={handleImageChange}
            disabled={isLoading}
          />
          <label 
            htmlFor="image" 
            className="cursor-pointer"
          >
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors bg-base-200/50">
              {imagePreview ? (
                <div className="flex flex-col items-center gap-2">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                  />
                  <span className="text-xs text-secondary/70">Clique para alterar</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-secondary/60">
                  <FileImage className="w-8 h-8" />
                  <span className="text-sm">Clique para adicionar uma imagem</span>
                </div>
              )}
            </div>
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <div className="form-control mt-6">
        <button 
          type="submit" 
          className="btn btn-primary text-white w-full font-semibold"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Registrando...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Finalizar Cadastro
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default RegisterForm;
