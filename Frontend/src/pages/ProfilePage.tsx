import { useState, useEffect } from 'react';
import userService from '../services/User/api';
import { useAuth } from '../contexts/AuthContext';
import type { UserDetails } from '../services/core-api';
import '../assets/css/ProfilePage.css';

const ProfilePage = () => {
  const { user } = useAuth();
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

          <div className="info-group">
            <label className="info-label">E-mail</label>
            <p className="info-value">{userData.email}</p>
          </div>

          <div className="info-group no-border">
            <label className="info-label">ID do Usuário</label>
            <p className="info-value">#{userData.user_id}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;