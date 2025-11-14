import { useState, useEffect, useRef, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import userService from '../services/User/api';
import { useAuth } from '../contexts/AuthContext';
import type { UserDetails } from '../services/core-api';
import '../assets/css/ProfilePage.css';
import ChangePasswordModal from '../components/ChangePasswordModal';
import DeactivateAccountModal from '../components/DeactivateAccountModal';

// Ícones
import EditIcon from '../assets/icons/edit.svg?url';
import LockIcon from '../assets/icons/lock.svg?url';
import TrashIcon from '../assets/icons/delete.svg?url';
import CameraIcon from '../assets/icons/camera.svg?url'; 

const ProfilePage = () => {
  const { user } = useAuth();
  
  // Estados de Dados
  const [profileData, setProfileData] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de Edição
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Dados do Formulário
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  // Dados de Imagem
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Modal
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- 1. Busca Inicial ---
  const fetchProfile = async () => {
    if (!user || !user.data.username) {
      setError("Usuário não identificado.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await userService.getUserDetails(user.data.username);
      setProfileData(response.data);
    } catch (err) {
      console.error("Erro ao buscar perfil:", err);
      setError("Falha ao carregar dados do perfil.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  // --- 2. Handlers de Imagem ---
  
  // Clica no input escondido quando clica na foto (apenas no modo edição)
  const handleImageClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Cria uma URL temporária para preview imediato
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  // --- 3. Handlers de Ação ---

  const handleEditData = () => {
    if (profileData) {
      setName(profileData.data.name);
      setEmail(profileData.data.email);
      setImagePreview(null); // Reseta preview anterior
      setSelectedFile(null);
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSaveData = async () => {
    if (!user || !user.data.username) return;

    setIsSaving(true);
    try {
      // Cria o FormData para envio de arquivos
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      
      if (selectedFile) {
        formData.append('image', selectedFile);
      }

      await userService.updateUser(user.data.username, formData);
      
      await fetchProfile(); // Recarrega dados atualizados
      setIsEditing(false);
      // alert("Dados atualizados com sucesso!");

    } catch (err) {
      console.error("Erro ao atualizar:", err);
      alert("Erro ao atualizar dados.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = () => {
    setIsPasswordModalOpen(true);
  };
  const handleDeactivateAccount = () => {
    // Abre o modal que pede a senha
    setIsDeactivateModalOpen(true);
  };

  // --- Renderização ---

  if (isLoading) return <div className="profile-container"><p>Carregando...</p></div>;
  if (error || !profileData) return <div className="profile-container"><p className="profile-error">{error}</p></div>;

  const userData = profileData.data; 
  // Define qual imagem mostrar: Preview > Imagem Atual > Placeholder
  const displayImage = imagePreview || userData.image;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <h1>Meu Perfil</h1>
        </div>

        <div className="profile-content">
          
          {/* --- ÁREA DA IMAGEM --- */}
          <div className="profile-image-wrapper">
            <div 
              className={`profile-image-container ${isEditing ? 'editable' : ''}`}
              onClick={handleImageClick}
              title={isEditing ? "Clique para alterar a foto" : ""}
            >
              {displayImage ? (
                <img src={displayImage} alt={userData.name} className="profile-image" />
              ) : (
                <div className="placeholder-image">
                  {userData.name.charAt(0).toUpperCase()}
                </div>
              )}

              {/* Overlay de Edição (Ícone de Câmera) */}
              {isEditing && (
                <div className="image-edit-overlay">
                  <img src={CameraIcon} alt="Alterar Foto" width="24" height="24" />
                </div>
              )}
            </div>
            
            {/* Input Oculto */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              style={{ display: 'none' }} 
              accept="image/png, image/jpeg, image/jpg, image/svg+xml"
            />
          </div>

          {/* --- CAMPO NOME --- */}
          <div className="info-group">
            <label className="info-label">Nome Completo</label>
            {isEditing ? (
              <input 
                type="text" 
                className="profile-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            ) : (
              <p className="info-value">{userData.name}</p>
            )}
          </div>

          {/* --- CAMPO USUARIO --- */}
          <div className="info-group">
            <label className="info-label">Usuário</label>
            <p className="info-value" style={{ color: '#777' }}>@{userData.username}</p>
          </div>

          {/* --- CAMPO EMAIL --- */}
          <div className="info-group no-border">
            <label className="info-label">E-mail</label>
            {isEditing ? (
              <input 
                type="email" 
                className="profile-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            ) : (
              <p className="info-value">{userData.email}</p>
            )}
          </div>

          {/* --- AÇÕES --- */}
          <div className="profile-actions">
            {isEditing ? (
              <div className="edit-actions-row">
                <button className="action-btn btn-cancel" onClick={handleCancelEdit} disabled={isSaving}>
                  Cancelar
                </button>
                <button className="action-btn btn-save" onClick={handleSaveData} disabled={isSaving}>
                  {isSaving ? "Salvando..." : "Salvar Alterações"}
                </button>
              </div>
            ) : (
              <>
                <button className="action-btn btn-edit" onClick={handleEditData}>
                  <img src={EditIcon} alt="" width="18" height="18" /> Editar Dados
                </button>
                <button className="action-btn btn-password" onClick={handleChangePassword}>
                  <img src={LockIcon} alt="" width="18" height="18" /> Alterar Senha
                </button>
                <button className="action-btn btn-danger" onClick={handleDeactivateAccount}>
                  <img src={TrashIcon} alt="" width="18" height="18" /> Desativar Conta
                </button>
              </>
            )}
          </div>

        </div>
      </div>

      {/* 4. Renderize o Modal Condicionalmente (fora do card, mas dentro do container ou fragment) */}
      {isPasswordModalOpen && (
        <ChangePasswordModal 
          onClose={() => setIsPasswordModalOpen(false)} 
        />
      )}

      {isDeactivateModalOpen && (
        <DeactivateAccountModal 
          onClose={() => setIsDeactivateModalOpen(false)} 
        />
      )}
    </div>
  );
};

export default ProfilePage;