import { useState, useEffect } from 'react';
import sectorService from '../services/Sector/api';
import { useAuth } from '../contexts/AuthContext';
import type { promoteUserToAdministratorPayload, SectorUser } from '../services/core-api';

import AddSectorUserModal from './AddSectorUserModal';

interface SectorUsersProps {
  sectorId: number;
}

const SectorUsers = ({ sectorId }: SectorUsersProps) => {
  const [users, setUsers] = useState<SectorUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isManager, setIsManager] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
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
      setIsOwner(false);
      setIsManager(false);
      setIsAdmin(false);

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
          if (role === 'proprietário') {
            setIsOwner(true);
          } else if (role === 'gestor') {
            setIsManager(true);
          } else if (role === 'administrador') {
            setIsAdmin(true);
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
  }, [sectorId, loggedInUser, isAuthLoading]);

  const handleUserAdded = (newUser: SectorUser) => {
    setUsers(currentUsers => [...currentUsers, newUser]);
  };

  if (isLoading || isAuthLoading) {
    return <p>Carregando usuários...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  const handleUserRemove = async (sectorUserLinkId: number) => {
    console.log("Removendo usuário com link ID:", users);
    if (window.confirm("Tem certeza que deseja remover este usuário?")) {
      try {
        await sectorService.removeUserFromSector(sectorUserLinkId);
        alert("Usuário removido com sucesso.");
      } catch (err) {
        console.error("Falha ao remover usuário do setor:", err);
        alert("Não foi possível remover o usuário do setor.");
      }
      window.location.reload();
    }
  };

  const handlePromoteUserToManager = async (userEmail: string) => {
    try {
      const response = await sectorService.promoteUserToManager(sectorId, { new_manager_email: userEmail });
      alert("Usuário promovido a gerente com sucesso.");
      window.location.reload();
    } catch (err) {
      console.error("Falha ao promover usuário para gerente:", err);
      alert("Não foi possível promover o usuário para gerente.");
    }
  };

  const handlePromoteUserToAdministrator = async ({ sectorUserLinkId, makeAdmin }: promoteUserToAdministratorPayload) => {
    try {
      const response = await sectorService.promoteUserToAdministrator({sectorUserLinkId, makeAdmin});
      alert(`Usuário ${makeAdmin ? 'promovido' : 'rebaixado'} com sucesso.`);
    } catch (err) {
      console.error("Falha ao alterar cargo de administrador:", err);
      alert("Não foi possível alterar o cargo do usuário.");
    }
    window.location.reload();
  };

  return (
    <div>
      {(isOwner || isManager || isAdmin) ? (
        <button onClick={() => setIsModalOpen(true)} style={{ marginBottom: '15px' }}>
          Adicionar Usuário ao Setor
        </button>
      ) : null}

      <AddSectorUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        sectorId={sectorId}
        onUserAdded={handleUserAdded}
      />

      {users.length === 0 && !(isOwner || isManager || isAdmin) ? (
        <p>Nenhum usuário encontrado neste setor.</p>
      ) : (
        <div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid black', textAlign: 'left' }}>
                <th style={{ padding: '8px' }}>Usuário</th>
                <th style={{ padding: '8px', minWidth: '200px' }}>Email</th>
                <th style={{ padding: '8px' }}>Função</th>
                {(isOwner || isManager || isAdmin) ? (<th style={{ padding: '8px' }}>Ações</th>) : null}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const targetRole = user.role.toLowerCase();
                //@ts-ignore
                const canNotRemoveSelf = user.user_id === loggedInUser.data.user_id;
                const isTargetOwner = targetRole === 'proprietário';
                const canOwnerRemove = isOwner; 
                const canManagerRemove = isManager && (targetRole === 'administrador' || targetRole === 'membro');
                const canAdminRemove = isAdmin && (targetRole === 'membro');
                const showRemoveButton = 
                  !canNotRemoveSelf && 
                  !isTargetOwner && 
                  (canOwnerRemove || canManagerRemove || canAdminRemove);

                return (
                  <tr key={user.user_id} style={{ borderBottom: '1px solid #ccc' }}>
                    <td style={{ padding: '8px' }}>{user.user_name}</td>
                    <td style={{ padding: '8px' }}>{user.user_email}</td>
                    <td style={{ padding: '8px' }}>{user.role}</td>
                    
                    {(isOwner || isManager || isAdmin) && (
                      <td style={{ padding: '8px' }}>
                        {/* @ts-ignore */}
                        {user.user_id === loggedInUser.data.user_id ? (
                          <em>(Você)</em>
                        ) : null}
                        
                        {showRemoveButton && (
                          <button onClick={() => handleUserRemove(user.sector_user_id)}>Remover</button>
                        )}
                        
                        {isOwner && (targetRole === 'membro' || targetRole === 'administrador') ? (
                          <button onClick={() => handlePromoteUserToManager(user.user_email)}>Promover para Gerente</button>
                        ): null}
                        
                        {(isOwner || isManager) && targetRole === 'membro' ? (
                          <button onClick={() => handlePromoteUserToAdministrator({sectorUserLinkId: user.sector_user_id, makeAdmin: true})}>
                            Promover para Administrador
                          </button>
                        ) : (isOwner || isManager) && targetRole === 'administrador' ? (
                          <button onClick={() => handlePromoteUserToAdministrator({sectorUserLinkId: user.sector_user_id, makeAdmin: false})}>
                            Rebaixar de Administrador
                          </button>
                        ): null}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SectorUsers;