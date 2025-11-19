import { useState, useEffect, useCallback } from 'react';
import { Trash2, Shield, UserCheck, UserMinus, UserPlus, Loader2, AlertCircle } from 'lucide-react'; 
import toast from 'react-hot-toast';

import sectorService from '../services/Sector/api';
import { useAuth } from '../contexts/AuthContext';
import type { SectorUser } from '../services/core-api';

import AddSectorUserModal from './AddSectorUserModal';
import ConfirmModal, { type ConfirmVariant } from './ConfirmModal'; // 1. Importe o Modal

// Interface para configurar o modal dinamicamente
interface ConfirmConfig {
  isOpen: boolean;
  type: 'remove' | 'promote_manager' | 'toggle_admin' | null;
  data: any; // Dados flexíveis para passar ID, email ou payload
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

  // 2. Estado do Modal de Confirmação
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig>({
    isOpen: false, type: null, data: null, title: '', message: '', variant: 'warning', confirmText: ''
  });

  // --- BUSCA DE DADOS ---
  const fetchAllData = useCallback(async () => {
      if (!loggedInUser && !isAuthLoading) {
        setError("Não foi possível identificar o usuário logado.");
        setIsLoading(false); 
        return;
      }
      if (!sectorId || !loggedInUser) return;

      setIsLoading(true);
      setError(null);
      // Reseta permissões
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

  // --- 3. HANDLERS DE ABERTURA DE MODAL (Request Action) ---

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
      message: `ATENÇÃO: Ao promover "${user.user_name}" a Gerente, você deixará de ser o Gerente deste setor (se for o caso). Deseja continuar?`,
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
      message: `Deseja realmente ${makeAdmin ? 'tornar' : 'remover'} "${user.user_name}" como administrador do setor?`,
      variant: 'info',
      confirmText: "Confirmar"
    });
  };

  // --- 4. EXECUÇÃO DA AÇÃO ---

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
        fetchAllData(); // Recarrega tudo pois permissões mudam
      }
      else if (type === 'toggle_admin') {
        // @ts-ignore
        await sectorService.promoteUserToAdministrator(data);
        toast.success(`Permissão de administrador ${data.makeAdmin ? 'concedida' : 'removida'}.`);
        fetchAllData(); // Recarrega para atualizar a lista
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

  // Helper para cor do badge
  const getRoleBadgeClass = (role: string) => {
    const lowerRole = role.toLowerCase();
    if (lowerRole === 'proprietário') return 'bg-warning text-dark';
    if (lowerRole === 'gestor') return 'bg-primary text-white';
    if (lowerRole === 'administrador') return 'bg-info text-white';
    return 'bg-secondary text-white';
  };

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
                                onClick={() => requestRemove(user)} // <-- Chama requestRemove
                                className="btn btn-light btn-sm text-danger"
                                title="Remover Usuário"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                            
                            {/* Botão Promover a Gerente */}
                            {isOwner && (targetRole === 'membro' || targetRole === 'administrador') && (
                              <button 
                                onClick={() => requestPromoteManager(user)} // <-- Chama requestPromoteManager
                                className="btn btn-light btn-sm text-primary"
                                title="Promover para Gerente"
                              >
                                <Shield size={16} />
                              </button>
                            )}
                            
                            {/* Botões de Admin */}
                            {(isOwner || isManager) && targetRole === 'membro' && (
                              <button 
                                onClick={() => requestToggleAdmin(user, true)} // <-- Chama requestToggleAdmin
                                className="btn btn-light btn-sm text-info"
                                title="Promover para Administrador"
                              >
                                <UserCheck size={16} />
                              </button>
                            )}

                            {(isOwner || isManager) && targetRole === 'administrador' && (
                              <button 
                                onClick={() => requestToggleAdmin(user, false)} // <-- Chama requestToggleAdmin
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

      {/* 5. Modal de Confirmação */}
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