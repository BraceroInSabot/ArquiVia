import React, { useState, useEffect, useRef, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Pencil, Lock, Trash2, Camera, 
  Loader2, AlertCircle, Save, X, User, Mail, AtSign
} from 'lucide-react';
import toast from 'react-hot-toast';

import userService from '../services/User/api';
import { useAuth } from '../contexts/AuthContext';
import type { UserDetails } from '../services/core-api';
import ChangePasswordModal from '../components/ChangePasswordModal';
import DeactivateAccountModal from '../components/DeactivateAccountModal';

const ProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
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

  // Modais
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
      toast.success("Perfil atualizado com sucesso!");
    } catch (err) {
      console.error("Erro ao atualizar:", err);
      toast.error("Erro ao atualizar dados.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = () => setIsPasswordModalOpen(true);
  const handleDeactivateAccount = () => setIsDeactivateModalOpen(true);
  // --- FIM DA LÓGICA ---

  // --- RENDERIZAÇÃO ---

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-base-200 gap-4">
        <Loader2 size={48} className="animate-spin text-primary" />
        <p className="text-gray-500 font-medium">Carregando perfil...</p>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
        <div className="alert alert-error max-w-md shadow-lg">
          <AlertCircle size={24} />
          <span>{error || "Perfil não encontrado."}</span>
        </div>
      </div>
    );
  }

  const userData = profileData.data; 
  const displayImage = imagePreview || userData.image;

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4 md:p-8">
      
      <div className="card w-full max-w-lg bg-base-100 shadow-xl overflow-visible border border-base-300">
        
        {/* Header com Fundo Colorido */}
        <div className="h-32 bg-gradient-to-r from-primary to-secondary rounded-t-xl relative">
           <div className="absolute top-4 left-0 w-full text-center">
              <h1 className="text-2xl font-bold text-white drop-shadow-md">Meu Perfil</h1>
           </div>
        </div>

        <div className="card-body pt-0 relative">
          
          {/* --- ÁREA DA IMAGEM (Avatar com Badge/Overlay) --- */}
          <div className="flex justify-center -mt-16 mb-6">
             <div 
                className={`relative group ${isEditing ? 'cursor-pointer' : ''}`}
                onClick={handleImageClick}
                title={isEditing ? "Clique para alterar a foto" : ""}
             >
                <div className="avatar">
                  <div className="w-32 h-32 rounded-full ring ring-base-100 ring-offset-base-100 ring-offset-2 bg-base-200">
                     {displayImage ? (
                       <img src={displayImage} alt={userData.name} className="object-cover" />
                     ) : (
                       <div className="flex items-center justify-center h-full w-full bg-neutral text-neutral-content text-4xl font-bold">
                          {userData.name.charAt(0).toUpperCase()}
                       </div>
                     )}
                  </div>
                </div>

                {/* Overlay de Edição (Só aparece no hover e se estiver editando) */}
                {isEditing && (
                  <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                     <Camera size={32} className="text-white" />
                  </div>
                )}
             </div>

             {/* Input Oculto */}
             <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden"
                accept="image/png, image/jpeg, image/jpg, image/svg+xml"
             />
          </div>

          {/* --- FORMULÁRIO / DADOS --- */}
          <div className="flex flex-col gap-4">
            
            {/* Nome Completo */}
            <div className="form-control w-full">
              <label className="label pb-1">
                <span className="label-text font-bold text-secondary flex items-center gap-2">
                  <User size={16} /> Nome Completo
                </span>
              </label>
              {isEditing ? (
                <input 
                  type="text" 
                  className="input input-bordered input-primary w-full" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              ) : (
                <div className="px-4 py-3 bg-base-200/50 rounded-lg font-medium text-lg text-neutral border border-transparent">
                  {userData.name}
                </div>
              )}
            </div>

            {/* Usuário (Read-only) */}
            <div className="form-control w-full">
              <label className="label pb-1">
                <span className="label-text font-bold text-secondary flex items-center gap-2">
                   <AtSign size={16} /> Usuário
                </span>
              </label>
              <div className="px-4 py-3 bg-base-200 rounded-lg text-gray-500 border border-base-200 cursor-not-allowed">
                @{userData.username}
              </div>
            </div>

            {/* E-mail */}
            <div className="form-control w-full">
              <label className="label pb-1">
                <span className="label-text font-bold text-secondary flex items-center gap-2">
                   <Mail size={16} /> E-mail
                </span>
              </label>
              {isEditing ? (
                <input 
                  type="email" 
                  className="input input-bordered input-primary w-full" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              ) : (
                <div className="px-4 py-3 bg-base-200/50 rounded-lg font-medium text-lg text-neutral border border-transparent">
                  {userData.email}
                </div>
              )}
            </div>
          </div>

          {/* --- AÇÕES --- */}
          <div className="divider my-6"></div>

          <div className="flex flex-col gap-3">
            {isEditing ? (
              // MODO EDIÇÃO
              <div className="grid grid-cols-2 gap-4">
                <button 
                  className="btn btn-ghost text-secondary" 
                  onClick={handleCancelEdit} 
                  disabled={isSaving}
                >
                  <X size={20} /> Cancelar
                </button>
                <button 
                  className="btn btn-success text-white" 
                  onClick={handleSaveData} 
                  disabled={isSaving}
                >
                  {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  {isSaving ? "Salvando..." : "Salvar"}
                </button>
              </div>
            ) : (
              // MODO VISUALIZAÇÃO
              <>
                <button className="btn btn-outline btn-primary w-full" onClick={handleEditData}>
                  <Pencil size={18} /> Editar Dados
                </button>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                  <button className="btn btn-outline btn-secondary w-full" onClick={handleChangePassword}>
                    <Lock size={18} /> Senha
                  </button>
                  <button className="btn btn-outline btn-error w-full" onClick={handleDeactivateAccount}>
                    <Trash2 size={18} /> Excluir Conta
                  </button>
                </div>
              </>
            )}
          </div>

        </div>
      </div>

      {/* Modais */}
      {isPasswordModalOpen && (
        <ChangePasswordModal onClose={() => setIsPasswordModalOpen(false)} />
      )}

      {isDeactivateModalOpen && (
        <DeactivateAccountModal onClose={() => setIsDeactivateModalOpen(false)} />
      )}
    </div>
  );
};

export default ProfilePage;