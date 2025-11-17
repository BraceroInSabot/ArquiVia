import { useState, useEffect, useRef, type ChangeEvent } from 'react';
import userService from '../services/User/api';
import { useAuth } from '../contexts/AuthContext';
import type { UserDetails } from '../services/core-api';
import ChangePasswordModal from '../components/ChangePasswordModal';
import DeactivateAccountModal from '../components/DeactivateAccountModal';
import toast from 'react-hot-toast';


// 1. Importar ícones Lucide-React
import { 
  Pencil, Lock, Trash2, Camera, 
  Loader2, AlertCircle, Save
} from 'lucide-react';

// 2. Importar o CSS customizado
import '../assets/css/ProfilePage.css';

const ProfilePage = () => {
  //@ts-ignore
  const { user, logout } = useAuth();
  
  const [profileData, setProfileData] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- LÓGICA (INTACTA) ---
  const fetchProfile = async () => {
    if (!user || !user.data.username) {
      setError("Usuário não identificado.");
      setIsLoading(false);
      return;
    }
    try {
      // (Já estava com setIsLoading(true) no estado inicial)
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

  const handleImageClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleEditData = () => {
    if (profileData) {
      setName(profileData.data.name);
      setEmail(profileData.data.email);
      setImagePreview(null);
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
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      
      if (selectedFile) {
        formData.append('image', selectedFile);
      }

      await userService.updateUser(user.data.username, formData);
      
      await fetchProfile(); 
      setIsEditing(false);
    } catch (err) {
      toast.error("Erro ao atualizar dados.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = () => {
    setIsPasswordModalOpen(true);
  };
  const handleDeactivateAccount = () => {
    setIsDeactivateModalOpen(true);
  };
  // --- FIM DA LÓGICA ---


  // --- RENDERIZAÇÃO ---

  if (isLoading) {
    return (
      <div className="profile-container d-flex justify-content-center align-items-center text-center text-muted">
        <div>
          <Loader2 size={40} className="animate-spin text-primary-custom" />
          <p className="mt-2">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="profile-container d-flex justify-content-center align-items-center">
        <div className="alert alert-danger d-flex align-items-center">
          <AlertCircle size={20} className="me-2" />
          {error || "Perfil não encontrado."}
        </div>
      </div>
    );
  }

  const userData = profileData.data; 
  const displayImage = imagePreview || userData.image;

  return (
    <div className="profile-container">
      <div className="card shadow-sm border-0 rounded-3" style={{ maxWidth: '450px', width: '100%' }}>
        <div className="card-header bg-primary text-white text-center p-4">
          <h3 className="mb-0">.</h3>
        </div>

        <div className="card-body p-4">
          
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

              {isEditing && (
                <div className="image-edit-overlay">
                  <Camera size={24} color="white" />
                </div>
              )}
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              style={{ display: 'none' }} 
              accept="image/png, image/jpeg, image/jpg, image/svg+xml"
            />
          </div>

          {/* Form de Edição ou Visualização */}
          <div className="mt-3">
            <div className="mb-3">
              <label className="form-label text-muted small text-uppercase fw-semibold">Nome Completo</label>
              {isEditing ? (
                <input 
                  type="text" 
                  className="profile-input form-control form-control-lg"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              ) : (
                <p className="info-value">{userData.name}</p>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label text-muted small text-uppercase fw-semibold">Usuário (Login)</label>
              <p className="info-value text-muted">@{userData.username}</p>
            </div>

            <div className="mb-4">
              <label className="form-label text-muted small text-uppercase fw-semibold">E-mail</label>
              {isEditing ? (
                <input 
                  type="email" 
                  className="profile-input form-control form-control-lg"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              ) : (
                <p className="info-value">{userData.email}</p>
              )}
            </div>
          </div>


          {/* Botões de Ação */}
          <div className="profile-actions pt-4 border-top">
            {isEditing ? (
              // Modo Edição
              <div className="d-grid gap-2">
                <button 
                  className="btn btn-success d-flex align-items-center justify-content-center gap-2" 
                  onClick={handleSaveData} 
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Save size={18} />
                  )}
                  {isSaving ? "Salvando..." : "Salvar Alterações"}
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={handleCancelEdit} 
                  disabled={isSaving}
                >
                  Cancelar
                </button>
              </div>
            ) : (
              // Modo Visualização
              <div className="d-grid gap-2">
                <button className="btn btn-outline-primary d-flex align-items-center justify-content-center gap-2" onClick={handleEditData}>
                  <Pencil size={16} /> Editar Dados
                </button>
                <button className="btn btn-outline-secondary d-flex align-items-center justify-content-center gap-2" onClick={handleChangePassword}>
                  <Lock size={16} /> Alterar Senha
                </button>
                <button className="btn btn-outline-danger d-flex align-items-center justify-content-center gap-2" onClick={handleDeactivateAccount}>
                  <Trash2 size={16} /> Desativar Conta
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Modais */}
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