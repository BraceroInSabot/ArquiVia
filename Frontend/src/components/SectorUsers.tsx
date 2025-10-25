import { useState, useEffect } from 'react';
import sectorService from '../services/Sector/api';
import userService from '../services/User/api';
import { useAuth } from '../contexts/AuthContext';
import type { SectorUser, UserDetails } from '../services/core-api';
import AddSectorUserForm from './AddUserToSectorForm';

interface SectorUsersProps {
  sectorId: number;
}

const SectorUsers = ({ sectorId }: SectorUsersProps) => {
  const [users, setUsers] = useState<SectorUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canManage, setCanManage] = useState(false);
  
  const { user: loggedInUser } = useAuth(); 

  useEffect(() => {
    if (!sectorId || !loggedInUser) {
      // Se não tivermos um ID do setor ou do usuário logado, não fazemos nada.
      // O 'isLoading' de AuthContext deve lidar com a espera do loggedInUser.
      if (!loggedInUser && !useAuth().isLoading) {
        setError("Não foi possível identificar o usuário logado.");
      }
      setIsLoading(false);
      return;
    }

    const fetchAllData = async () => {
      setIsLoading(true);
      setError(null);
      setCanManage(false); 

      try {
        const usersPromise = sectorService.getSectorUsers(sectorId);
        // O getUserDetails agora vem do AuthContext, não precisamos chamar de novo.
        // Vamos usar o 'loggedInUser' que já pegamos do 'useAuth()'.
        
        // Precisamos apenas da lista de usuários do setor
        const usersResponse = await usersPromise;

        // Corrigido: Acesse a chave 'data' dentro da resposta da API
        const sectorUsers = usersResponse.data.data; 
        
        // Verifique se 'sectorUsers' é realmente um array
        if (!Array.isArray(sectorUsers)) {
          console.error("A resposta da API de usuários não era um array:", usersResponse.data);
          throw new Error("A resposta da API de usuários não continha um array.");
        }
        
        setUsers(sectorUsers);

        const userRoleInThisSector = sectorUsers.find(
          (user) => user.user_id === loggedInUser.user_id
        )?.role;

        if (userRoleInThisSector) {
          const role = userRoleInThisSector.toLowerCase();
          if (role === 'proprietario' || role === 'gerente' || role === 'administrador') {
            setCanManage(true);
          }
        }

      } catch (err) {
        console.error("Falha ao buscar dados dos usuários:", err);
        setError("Não foi possível carregar os dados dos usuários.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAllData();
  }, [sectorId, loggedInUser]); 

  const handleUserAdded = (newUser: SectorUser) => {
    setUsers(currentUsers => [...currentUsers, newUser]);
  };

  if (isLoading) {
    return <p>Carregando usuários...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <div>
      {canManage && (
        <AddSectorUserForm 
          sectorId={sectorId} 
          onUserAdded={handleUserAdded} 
        />
      )}

      {users.length === 0 && !canManage ? (
        <p>Nenhum usuário encontrado neste setor.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid black', textAlign: 'left' }}>
              <th style={{ padding: '8px' }}>Usuário</th>
              <th style={{ padding: '8px' }}>Email</th>
              <th style={{ padding: '8px' }}>Função</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.user_id} style={{ borderBottom: '1px solid #ccc' }}>
                <td style={{ padding: '8px' }}>{user.user_name}</td>
                <td style={{ padding: '8px' }}>{user.user_email}</td>
                <td style={{ padding: '8px' }}>{user.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SectorUsers;