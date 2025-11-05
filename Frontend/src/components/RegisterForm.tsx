import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Validate from '../utils/credential_validation';
import registerService from '../services/User/api'; // Mudei o nome para 'registerService' para clareza

const RegisterForm = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cpassword, setCpassword] = useState('');
  
  // 1. Adicione um estado para o arquivo de imagem
  const [image, setImage] = useState<File | null>(null);
  
  const [error, setError] = useState<string | null>(null);

  const goToLoginPage = () => {
    navigate('/entrar');
  };

  // 2. Adicione um handler para o input de arquivo
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setImage(event.target.files[0]);
    } else {
      setImage(null);
    }
  };

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null); 

    // (Sua lógica de validação permanece a mesma)
    const usernameValidation = Validate.username(username);
    if (!usernameValidation[0]) {
      setError(usernameValidation[1] as string);
      return;
    }
    // ... (outras validações) ...
    const passwordValidation = Validate.password(password, cpassword);
    if (!passwordValidation[0]) {
      setError(passwordValidation[1] as string);
      return;
    }

    try {
      // 3. Crie um FormData para enviar os dados
      // Isso é necessário para fazer upload de arquivos
      const formData = new FormData();
      formData.append('username', username);
      formData.append('name', name);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('cpassword', cpassword);

      // Adicione a imagem ao formData se ela foi selecionada
      if (image) {
        formData.append('image', image);
      }

      // 4. Envie o formData em vez do objeto JSON
      const api_response = await registerService.register(formData);
      
      if (api_response) {
        alert('Registro realizado com sucesso!');
        navigate('/entrar');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.mensagem || 'Erro ao registrar usuário.';
      setError(errorMessage);
    }
  }
    return (
        <div>
      <form onSubmit={handleRegister}>
        {/* ... (campos de username, name, email, password, cpassword) ... */}
        <div>
          <label htmlFor="username">Usuário:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <br />
        <div>
          <label htmlFor="name">Nome Completo:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <br />
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <br />
        <div>
          <label htmlFor="password">Senha:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <br />
        <div>
          <label htmlFor="cpassword">Confirme a Senha:</label>
          <input
            type="password"
            id="cpassword"
            value={cpassword}
            onChange={(e) => setCpassword(e.target.value)}
          />
        </div>
        <br />

        {/* 5. Adicione o novo campo de input de arquivo */}
        <div>
          <label htmlFor="image">Imagem de Perfil (PNG, JPG, SVG):</label>
          <input
            type="file"
            id="image"
            accept="image/png, image/jpeg, image/svg+xml"
            onChange={handleImageChange}
          />
        </div>
        <br />

        <button type="submit">Cadastrar</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button type="button" onClick={goToLoginPage}>Já tenho uma conta</button>
    </div>
    )
}

export default RegisterForm;