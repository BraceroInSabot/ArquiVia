import { useState, useEffect } from 'react';
import { Trash2, Shield, UserCheck, UserMinus, UserPlus, Loader2, AlertCircle } from 'lucide-react'; // Ícones
import sectorService from '../services/Sector/api';
import { useAuth } from '../contexts/AuthContext';
import type { promoteUserToAdministratorPayload, SectorUser } from '../services/core-api';
import toast from 'react-hot-toast';

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

  // --- LÓGICA (MANTIDA INTACTA) ---
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
        const userRoleInThisSector = sectorUsers.find(
          //@ts-ignore
          (user) => user.user_id === loggedInUser.data.user_id
        )?.role;

        if (userRoleInThisSector) {
          const role = userRoleInThisSector.toLowerCase();
          if (role === 'proprietário') setIsOwner(true);
          else if (role === 'gestor') setIsManager(true);
          else if (role === 'administrador') setIsAdmin(true);
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

  const handleUserRemove = async (sectorUserLinkId: number) => {
    if (window.confirm("Tem certeza que deseja remover este usuário?")) {
      try {
        await sectorService.removeUserFromSector(sectorUserLinkId);
        toast.success("Usuário removido com sucesso.");
        window.location.reload();
      } catch (err) {
        toast.error("Não foi possível remover o usuário do setor.");
      }
    }
  };

  const handlePromoteUserToManager = async (userEmail: string) => {
    try {
      //@ts-ignore
      await sectorService.promoteUserToManager(sectorId, { new_manager_email: userEmail });
      toast.success("Usuário promovido a gerente com sucesso.");
      window.location.reload();
    } catch (err) {
      toast.error("Não foi possível promover o usuário para gerente.");
    }
  };

  const handlePromoteUserToAdministrator = async ({ sectorUserLinkId, makeAdmin }: promoteUserToAdministratorPayload) => {
    try {
      //@ts-ignore
      await sectorService.promoteUserToAdministrator({sectorUserLinkId, makeAdmin});
      toast.success(`Usuário ${makeAdmin ? 'promovido' : 'rebaixado'} com sucesso.`);
      window.location.reload();
    } catch (err) {
      toast.error("Não foi possível alterar o cargo do usuário.");
    }
  };

  // Helper para cor do badge
  const getRoleBadgeClass = (role: string) => {
    const lowerRole = role.toLowerCase();
    if (lowerRole === 'proprietário') return 'bg-warning text-dark';
    if (lowerRole === 'gestor') return 'bg-primary text-white';
    if (lowerRole === 'administrador') return 'bg-info text-white';
    return 'bg-secondary text-white';
  };
  // --- FIM DA LÓGICA ---


  // --- RENDERIZAÇÃO ---

  if (isLoading || isAuthLoading) {
    return (
        <div className="d-flex justify-content-center align-items-center py-4 text-muted">
            <Loader2 className="animate-spin me-2" size={24} />
            <span>Carregando usuários...</span>
        </div>
    );
  }

  if (error) {
    return (
        <div className="alert alert-danger d-flex align-items-center" role="alert">
            <AlertCircle className="me-2" size={20} />
            <div>{error}</div>
        </div>
    );
  }

  const hasPermission = isOwner || isManager || isAdmin;

  return (
    <div className="mt-4">
      {/* Cabeçalho da Seção */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold text-secondary mb-0">Membros do Setor</h5>
        {hasPermission && (
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="btn btn-primary-custom btn-sm d-flex align-items-center gap-2"
          >
            <UserPlus size={18} />
            <span className="d-none d-sm-inline">Adicionar Usuário</span>
          </button>
        )}
      </div>

      <AddSectorUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        sectorId={sectorId}
        onUserAdded={handleUserAdded}
      />

      {users.length === 0 && !hasPermission ? (
        <div className="text-center text-muted py-4 bg-light rounded">
            <p className="mb-0">Nenhum usuário encontrado neste setor.</p>
        </div>
      ) : (
        <div className="table-responsive border rounded bg-white shadow-sm">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th className="ps-3 text-secondary text-uppercase small fw-bold">Usuário</th>
                <th className="text-secondary text-uppercase small fw-bold">Email</th>
                <th className="text-secondary text-uppercase small fw-bold">Função</th>
                {hasPermission && <th className="text-end pe-3 text-secondary text-uppercase small fw-bold">Ações</th>}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const targetRole = user.role.toLowerCase();
                //@ts-ignore
                const isSelf = user.user_id === loggedInUser.data.user_id;
                const isTargetOwner = targetRole === 'proprietário';
                
                // Lógica de permissão para remover
                const canRemove = !isSelf && !isTargetOwner && (
                    isOwner || 
                    (isManager && (targetRole === 'administrador' || targetRole === 'membro')) || 
                    (isAdmin && targetRole === 'membro')
                );

                return (
                  <tr key={user.user_id}>
                    <td className="ps-3 fw-medium">
                        {user.user_name} {isSelf && <span className="text-muted small fst-italic ms-1">(Você)</span>}
                    </td>
                    <td className="text-muted">{user.user_email}</td>
                    <td>
                        <span className={`badge ${getRoleBadgeClass(user.role)} fw-normal px-2 py-1`}>
                            {user.role}
                        </span>
                    </td>
                    
                    {hasPermission && (
                      <td className="text-end pe-3">
                        <div className="d-flex justify-content-end gap-1">
                            
                            {/* Botão Remover */}
                            {canRemove && (
                              <button 
                                onClick={() => handleUserRemove(user.sector_user_id)}
                                className="btn btn-light btn-sm text-danger"
                                title="Remover Usuário"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                            
                            {/* Botão Promover a Gerente */}
                            {isOwner && (targetRole === 'membro' || targetRole === 'administrador') && (
                              <button 
                                onClick={() => handlePromoteUserToManager(user.user_email)}
                                className="btn btn-light btn-sm text-primary"
                                title="Promover para Gerente"
                              >
                                <Shield size={16} />
                              </button>
                            )}
                            
                            {/* Botão Promover/Rebaixar Admin */}
                            {(isOwner || isManager) && targetRole === 'membro' && (
                              <button 
                                onClick={() => handlePromoteUserToAdministrator({sectorUserLinkId: user.sector_user_id, makeAdmin: true})}
                                className="btn btn-light btn-sm text-info"
                                title="Promover para Administrador"
                              >
                                <UserCheck size={16} />
                              </button>
                            )}

                            {(isOwner || isManager) && targetRole === 'administrador' && (
                              <button 
                                onClick={() => handlePromoteUserToAdministrator({sectorUserLinkId: user.sector_user_id, makeAdmin: false})}
                                className="btn btn-light btn-sm text-secondary"
                                title="Rebaixar de Administrador"
                              >
                                <UserMinus size={16} />
                              </button>
                            )}

                        </div>
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