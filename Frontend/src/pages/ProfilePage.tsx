import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Hook para navegação
import userService from '../services/User/api';
import { useAuth } from '../contexts/AuthContext';
import type { UserDetails } from '../services/core-api';
import '../assets/css/ProfilePage.css';

// Importação dos Ícones (Certifique-se de ter estes arquivos ou ajuste os nomes)
import EditIcon from '../assets/icons/edit.svg?url'; // Você precisará deste ícone
import LockIcon from '../assets/icons/lock.svg?url'; // Você precisará deste ícone
import DeleteIcon from '../assets/icons/delete.svg?url'; // Você precisará deste ícone (ou delete.svg)

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user || !user.data.username) {
        setError("Usuário não identificado.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await userService.getUserDetails(user.data.username);
        setProfileData(response.data);
      } catch (err) {
        console.error("Erro ao buscar perfil:", err);
        setError("Falha ao carregar dados do perfil.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  // --- Handlers dos Botões ---
  const handleEditData = () => {
    // Exemplo: navigate('/perfil/editar');
    console.log("Navegar para edição de dados");
  };

  const handleChangePassword = () => {
    // Exemplo: navigate('/perfil/senha');
    console.log("Navegar para alteração de senha");
  };

  if (isLoading) {
    return (
      <div className="profile-container">
        <p>Carregando perfil...</p>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="profile-container">
        <p className="profile-error">{error || "Perfil não encontrado."}</p>
      </div>
    );
  }

  const userData = profileData.data; 

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <h1>Meu Perfil</h1>
        </div>

        <div className="profile-content">
          <div className="profile-image-container">
            {userData.image ? (
              <img 
                src={userData.image} 
                alt={userData.name} 
                className="profile-image" 
              />
            ) : (
              <div className="placeholder-image">
                {userData.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="info-group">
            <label className="info-label">Nome Completo</label>
            <p className="info-value">{userData.name}</p>
          </div>

          <div className="info-group">
            <label className="info-label">Usuário (Login)</label>
            <p className="info-value">@{userData.username}</p>
          </div>

          {/* A classe 'no-border' foi movida para cá, pois é o último item de info */}
          <div className="info-group no-border">
            <label className="info-label">E-mail</label>
            <p className="info-value">{userData.email}</p>
          </div>

          {/* --- NOVOS BOTÕES DE AÇÃO --- */}
          <div className="profile-actions">
            <button className="action-btn btn-edit" onClick={handleEditData}>
              <img src={EditIcon} alt="" width="18" height="18" />
              Editar Dados
            </button>

            <button className="action-btn btn-password" onClick={handleChangePassword}>
              <img src={LockIcon} alt="" width="18" height="18" />
              Alterar Senha
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfilePage;