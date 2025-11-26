import { useState, useEffect, useCallback } from 'react';
import { Trash2, Shield, UserCheck, UserMinus, UserPlus, Loader2, AlertCircle } from 'lucide-react'; 
import toast from 'react-hot-toast';

import sectorService from '../../services/Sector/api';
import { useAuth } from '../../contexts/AuthContext';
import type { SectorUser } from '../../services/core-api';

import AddSectorUserModal from '../modal/AddSectorUserModal'; // Verifique se o caminho mudou para modals/
import ConfirmModal, { type ConfirmVariant } from '../modal/ConfirmModal';

// Interface para configurar o modal dinamicamente
interface ConfirmConfig {
  isOpen: boolean;
  type: 'remove' | 'promote_manager' | 'toggle_admin' | null;
  data: any;
  title: string;
  message: string;
  variant: ConfirmVariant;
  confirmText: string;
}

interface SectorUsersProps {
  sectorId: number;
}

const SectorUsers = ({ sectorId }: SectorUsersProps) => {
  const [users, setUsers] = useState<SectorUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Permissões
  const [isOwner, setIsOwner] = useState(false);
  const [isManager, setIsManager] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user: loggedInUser, isLoading: isAuthLoading } = useAuth(); 

  // Estado do Modal de Confirmação
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig>({
    isOpen: false, type: null, data: null, title: '', message: '', variant: 'warning', confirmText: ''
  });

  const fetchAllData = useCallback(async () => {
      if (!loggedInUser && !isAuthLoading) {
        setError("Não foi possível identificar o usuário logado.");
        setIsLoading(false); 
        return;
      }
      if (!sectorId || !loggedInUser) return;

      setIsLoading(true);
      setError(null);
      setIsOwner(false); setIsManager(false); setIsAdmin(false);

      try {
        const usersResponse = await sectorService.getSectorUsers(sectorId);
        const sectorUsers = usersResponse.data.data;
        
        if (!Array.isArray(sectorUsers)) throw new Error("Formato de resposta inválido.");
        
        setUsers(sectorUsers);
        
        // @ts-ignore
        const userId = loggedInUser.data.user_id;
        // @ts-ignore
        const userRoleInThisSector = sectorUsers.find(u => u.user_id === userId)?.role;

        if (userRoleInThisSector) {
          const role = userRoleInThisSector.toLowerCase();
          if (role === 'proprietário') setIsOwner(true);
          else if (role === 'gestor') setIsManager(true);
          else if (role === 'administrador') setIsAdmin(true);
        }
      } catch (err) {
        console.error("Falha ao buscar dados:", err);
        setError("Não foi possível carregar os usuários.");
      } finally {
        setIsLoading(false);
      }
  }, [sectorId, loggedInUser, isAuthLoading]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleUserAdded = (newUser: SectorUser) => {
    setUsers(current => [...current, newUser]);
    toast.success("Usuário adicionado com sucesso!");
  };

  // --- HANDLERS DE MODAL ---

  const requestRemove = (user: SectorUser) => {
    setConfirmConfig({
      isOpen: true,
      type: 'remove',
      data: user.sector_user_id,
      title: "Remover Usuário?",
      message: `Tem certeza que deseja remover "${user.user_name}" deste setor?`,
      variant: 'danger',
      confirmText: "Sim, Remover"
    });
  };

  const requestPromoteManager = (user: SectorUser) => {
    setConfirmConfig({
      isOpen: true,
      type: 'promote_manager',
      data: user.user_email,
      title: "Promover a Gerente?",
      message: `ATENÇÃO: Ao promover "${user.user_name}" a Gerente, você deixará de ser o Gerente deste setor.`,
      variant: 'warning',
      confirmText: "Sim, Promover"
    });
  };

  const requestToggleAdmin = (user: SectorUser, makeAdmin: boolean) => {
    const action = makeAdmin ? "Promover a Administrador" : "Rebaixar de Administrador";
    setConfirmConfig({
      isOpen: true,
      type: 'toggle_admin',
      data: { sectorUserLinkId: user.sector_user_id, makeAdmin },
      title: `${action}?`,
      message: `Deseja realmente ${makeAdmin ? 'tornar' : 'remover'} "${user.user_name}" como administrador?`,
      variant: 'info',
      confirmText: "Confirmar"
    });
  };

  const handleConfirmAction = async () => {
    const { type, data } = confirmConfig;
    if (!type) return;

    setIsActionLoading(true);

    try {
      if (type === 'remove') {
        await sectorService.removeUserFromSector(data);
        setUsers(prev => prev.filter(u => u.sector_user_id !== data));
        toast.success("Usuário removido com sucesso.");
      } 
      else if (type === 'promote_manager') {
        // @ts-ignore
        await sectorService.promoteUserToManager(sectorId, { new_manager_email: data });
        toast.success("Gerente alterado com sucesso.");
        fetchAllData(); 
      }
      else if (type === 'toggle_admin') {
        // @ts-ignore
        await sectorService.promoteUserToAdministrator(data);
        toast.success(`Permissão de administrador ${data.makeAdmin ? 'concedida' : 'removida'}.`);
        fetchAllData(); 
      }

      setConfirmConfig(prev => ({ ...prev, isOpen: false }));

    } catch (err: any) {
      console.error("Erro na ação:", err);
      const msg = err.response?.data?.message || "Falha ao realizar a operação.";
      toast.error(msg);
    } finally {
      setIsActionLoading(false);
    }
  };

  // --- RENDERIZAÇÃO ---

  if (isLoading || isAuthLoading) {
    return (
        <div className="flex justify-center items-center py-8 text-gray-400">
            <Loader2 className="animate-spin mr-2" size={24} />
            <span>Carregando usuários...</span>
        </div>
    );
  }

  if (error) {
    return (
        <div className="alert alert-error shadow-sm my-4">
            <AlertCircle size={20} />
            <span>{error}</span>
        </div>
    );
  }

  const hasPermission = isOwner || isManager || isAdmin;

  const getRoleBadgeClass = (role: string) => {
    const lowerRole = role.toLowerCase();
    if (lowerRole === 'proprietário') return 'badge badge-warning badge text-primary-content p-2 mt-1 text-xs';
    if (lowerRole === 'gestor') return 'badge badge-primary badge text-primary-content p-2 mt-1 text-xs';
    if (lowerRole === 'administrador') return 'badge badge-info badge text-primary-content p-2 mt-1 text-xs';
    return 'badge badge-secondary badge text-primary-content p-2 mt-1 text-xs';
  };

  return (
    <div className="mt-6">
      {/* Header da Seção */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg text-secondary">Membros do Setor</h3>
        {hasPermission && (
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="btn btn-primary btn-sm gap-2 text-white"
          >
            <UserPlus size={16} />
            <span className="hidden sm:inline">Adicionar Usuário</span>
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
        <div className="text-center py-8 bg-base-200 rounded-lg border border-dashed border-base-300 text-gray-500">
            <p>Nenhum usuário encontrado neste setor.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-base-200 rounded-lg bg-base-100">
          <table className="table table w-full">
            {/* Cabeçalho */}
            <thead>
              <tr>
                <th className="bg-base-200/50">Usuário</th>
                <th className="bg-base-200/50">Email</th>
                <th className="bg-base-200/50">Função</th>
                {hasPermission && <th className="bg-base-200/50 text-right">Ações</th>}
              </tr>
            </thead>
            
            {/* Corpo */}
            <tbody>
              {users.map((user) => {
                const targetRole = user.role.toLowerCase();
                //@ts-ignore
                const isSelf = user.user_id === loggedInUser.data.user_id;
                const isTargetOwner = targetRole === 'proprietário';
                
                const canRemove = !isSelf && !isTargetOwner && (
                    isOwner || 
                    (isManager && (targetRole === 'administrador' || targetRole === 'membro')) || 
                    (isAdmin && targetRole === 'membro')
                );

                return (
                  <tr key={user.user_id} className="hover">
                    <td>
                        <div className="font-bold flex items-center gap-2">
                            {user.user_name} 
                            {isSelf && <span className="badge badge-neutral badge-outline p-2 mt-1 text-xs">Você</span>}
                        </div>
                    </td>
                    <td className="text-gray-500">{user.user_email}</td>
                    <td>
                        <div className={getRoleBadgeClass(user.role)}>
                            {user.role}
                        </div>
                    </td>
                    
                    {hasPermission && (
                      <td className="text-right">
                        <div className="flex justify-end gap-1">
                            
                            {/* Remover */}
                            {canRemove && (
                              <div className="tooltip tooltip-left" data-tip="Remover">
                                <button 
                                    onClick={() => requestRemove(user)}
                                    className="btn btn-square btn-ghost btn-xs text-error"
                                >
                                    <Trash2 size={16} />
                                </button>
                              </div>
                            )}
                            
                            {/* Promover a Gerente */}
                            {isOwner && (targetRole === 'membro' || targetRole === 'administrador') && (
                              <div className="tooltip tooltip-left" data-tip="Promover a Gerente">
                                <button 
                                    onClick={() => requestPromoteManager(user)}
                                    className="btn btn-square btn-ghost btn-xs text-primary"
                                >
                                    <Shield size={16} />
                                </button>
                              </div>
                            )}
                            
                            {/* Admin Toggle */}
                            {(isOwner || isManager) && targetRole === 'membro' && (
                              <div className="tooltip tooltip-left" data-tip="Tornar Admin">
                                <button 
                                    onClick={() => requestToggleAdmin(user, true)}
                                    className="btn btn-square btn-ghost btn-xs text-info"
                                >
                                    <UserCheck size={16} />
                                </button>
                              </div>
                            )}

                            {(isOwner || isManager) && targetRole === 'administrador' && (
                              <div className="tooltip tooltip-left" data-tip="Remover Admin">
                                <button 
                                    onClick={() => requestToggleAdmin(user, false)}
                                    className="btn btn-square btn-ghost btn-xs text-warning"
                                >
                                    <UserMinus size={16} />
                                </button>
                              </div>
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

      <ConfirmModal 
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmAction}
        isLoading={isActionLoading}
        title={confirmConfig.title}
        message={confirmConfig.message}
        variant={confirmConfig.variant}
        confirmText={confirmConfig.confirmText}
      />
    </div>
  );
};

export default SectorUsers;