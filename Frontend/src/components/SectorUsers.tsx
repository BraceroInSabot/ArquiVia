import { useState, useEffect } from 'react';
import sectorService from '../services/Sector/api';
import { useAuth } from '../contexts/AuthContext';
import type { SectorUser } from '../services/core-api';

import AddSectorUserModal from './AddSectorUserModal';

interface SectorUsersProps {
  sectorId: number;
}

const SectorUsers = ({ sectorId }: SectorUsersProps) => {
  const [users, setUsers] = useState<SectorUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canManage, setCanManage] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { user: loggedInUser, isLoading: isAuthLoading } = useAuth(); 

  useEffect(() => {
    if (!loggedInUser && !isAuthLoading) {
      setError("Não foi possível identificar o usuário logado.");
      setIsLoading(false); 
      return;
    }
    
    if (!sectorId || !loggedInUser) {
      return;
    }

    const fetchAllData = async () => {
      setIsLoading(true);
      setError(null);
      setCanManage(false); 

      try {
        const usersResponse = await sectorService.getSectorUsers(sectorId);
        const sectorUsers = usersResponse.data.data;
        
        if (!Array.isArray(sectorUsers)) {
          console.error("A resposta da API de usuários não era um array:", usersResponse.data);
          throw new Error("A resposta da API de usuários não continha um array.");
        }
        
        setUsers(sectorUsers);
        
        //@ts-ignore
        console.log("Usuário logado ID:", loggedInUser.data);
        const userRoleInThisSector = sectorUsers.find(
          //@ts-ignore
          (user) => user.user_id === loggedInUser.data.user_id
        )?.role;

        if (userRoleInThisSector) {
          const role = userRoleInThisSector.toLowerCase();
          if (role === 'proprietário' || role === 'gerente' || role === 'administrador') {
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
  }, [sectorId, loggedInUser, isAuthLoading]); // Adicione 'isAuthLoading' às dependências

  const handleUserAdded = (newUser: SectorUser) => {
    setUsers(currentUsers => [...currentUsers, newUser]);
  };

  // Mostra o loading principal se o AuthContext ou os dados do setor estiverem carregando
  if (isLoading || isAuthLoading) {
    return <p>Carregando usuários...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <div>
      {canManage && (
        <button onClick={() => setIsModalOpen(true)} style={{ marginBottom: '15px' }}>
          Adicionar Usuário ao Setor
        </button>
      )}

      <AddSectorUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        sectorId={sectorId}
        onUserAdded={handleUserAdded}
      />

      {users.length === 0 && !canManage ? (
        <p>Nenhum usuário encontrado neste setor.</p>
      ) : (
        <div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid black', textAlign: 'left' }}>
                <th style={{ padding: '8px' }}>Usuário</th>
                <th style={{ padding: '8px', minWidth: '200px' }}>Email</th>
                <th style={{ padding: '8px' }}>Função</th>
                {canManage && <th style={{ padding: '8px' }}>Ações</th>}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.user_id} style={{ borderBottom: '1px solid #ccc' }}>
                  <td style={{ padding: '8px' }}>{user.user_name}</td>
                  <td style={{ padding: '8px' }}>{user.user_email}</td>
                  <td style={{ padding: '8px' }}>{user.role}</td>
                  <td style={{ padding: '8px' }}>
                    {canManage && user.user_id !== loggedInUser?.data.user_id ? (
                      <button onClick={() => alert(`Removendo usuário ID: ${user.user_id} do setor.`)}>Remover</button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SectorUsers;