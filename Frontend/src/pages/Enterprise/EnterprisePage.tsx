import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Loader2, AlertCircle } from 'lucide-react'; 
import toast from 'react-hot-toast'; 

// Imports de Lógica/API
import enterpriseService from '../../services/Enterprise/api';
import type { Enterprise } from '../../services/core-api';

// Componentes
import EnterpriseList from '../../components/Enterprise/EnterpriseList';
import EnterpriseDetailsModal from '../../components/modal/EnterpriseDetailsModal';
import ConfirmModal, { type ConfirmVariant } from '../../components/modal/ConfirmModal'; // 1. Importe o Modal

import '../../assets/css/EnterprisePage.css'; 

// Interface para o estado do modal de confirmação
interface ConfirmConfig {
  isOpen: boolean;
  type: 'toggle' | 'delete' | null;
  id: number | null;
  currentStatus?: boolean; // Apenas para toggle
  title: string;
  message: string;
  variant: ConfirmVariant;
  confirmText: string;
}

const EnterprisePage = () => {
  const navigate = useNavigate();
  
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewingEnterprise, setViewingEnterprise] = useState<Enterprise | null>(null);

  // 2. Estados para o Modal de Confirmação
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig>({
    isOpen: false, type: null, id: null, title: '', message: '', variant: 'warning', confirmText: ''
  });

  useEffect(() => {
    const fetchEnterprises = async () => {
      try {
        const response = await enterpriseService.getEnterprises();
        const data = response.data.data;
        setEnterprises(Array.isArray(data) ? data : (response.data as any) || []);
      } catch (err) {
        console.error(err);
        setError('Falha ao carregar as empresas.');
        toast.error('Erro de conexão ao buscar empresas.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchEnterprises();
  }, []);

  const handleView = (id: number) => {
    const enterpriseToView = enterprises.find(e => e.enterprise_id === id);
    if (enterpriseToView) {
        setViewingEnterprise(enterpriseToView);
    } else {
        enterpriseService.getEnterpriseById(id)
            .then(res => setViewingEnterprise(res.data as any))
            .catch(() => toast.error("Erro ao carregar detalhes."));
    }
  };

  const handleEdit = (id: number) => {
    navigate(`/empresas/editar/${id}`);
  };

  // --- 3. NOVOS HANDLERS (ABREM O MODAL) ---

  const handleToggleStatusClick = (id: number, currentStatus: boolean) => {
    const actionText = !currentStatus ? "Ativar" : "Desativar";
    const variant = !currentStatus ? "success" : "warning";
    
    setConfirmConfig({
      isOpen: true,
      type: 'toggle',
      id,
      currentStatus,
      title: `${actionText} Empresa?`,
      message: `Tem certeza que deseja ${actionText.toLowerCase()} esta empresa?`,
      variant,
      confirmText: `Sim, ${actionText}`
    });
  };

  const handleDeleteClick = (id: number) => {
    setConfirmConfig({
      isOpen: true,
      type: 'delete',
      id,
      title: "Excluir Empresa?",
      message: "ATENÇÃO: Isso pode apagar todos os setores e documentos vinculados. Esta ação é irreversível.",
      variant: 'danger',
      confirmText: "Sim, Excluir"
    });
  };

  // --- 4. EXECUÇÃO DA AÇÃO (CHAMADA PELO MODAL) ---

  const handleConfirmAction = async () => {
    const { id, type, currentStatus } = confirmConfig;
    if (!id || !type) return;

    setIsActionLoading(true);

    try {
      if (type === 'toggle' && currentStatus !== undefined) {
        const newStatus = !currentStatus;
        await enterpriseService.toggleEnterpriseStatus(id, newStatus);

        setEnterprises(prev => prev.map(e => 
          e.enterprise_id === id ? { ...e, is_active: newStatus } : e
        ));
        toast.success(`Empresa ${newStatus ? 'ativada' : 'desativada'} com sucesso!`);
      } 
      else if (type === 'delete') {
        await enterpriseService.deleteEnterprise(id);
        
        setEnterprises(prev => prev.filter(e => e.enterprise_id !== id));
        toast.success('Empresa deletada com sucesso!');
      }
      
      // Fecha o modal
      setConfirmConfig(prev => ({ ...prev, isOpen: false }));

    } catch (error) {
      console.error(error);
      toast.error(`Não foi possível realizar a ação.`);
    } finally {
      setIsActionLoading(false);
    }
  };

  const goToCreateEnterprisePage = () => navigate("/criar-empresa");


  // --- RENDERIZAÇÃO ---
  return (
    <div className='page-container'>
      <div className='container'>
        <div className="container mt-4 px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-secondary">Gestão de Empresas</h1>
              <p className="text-gray-500 mt-1">
                Gerencie as organizações cadastradas no sistema
              </p>
            </div>
            
            <button 
              onClick={goToCreateEnterprisePage} 
              className="btn btn-primary text-white gap-2 shadow-md hover:shadow-lg transition-all"
            >
              <Plus size={20} strokeWidth={2.5} />
              <span>Nova Empresa</span>
            </button>
          </div>
      </div>
        
        <div className="container p-4">
          {isLoading && (
            <div className="d-flex flex-column justify-content-center align-items-center py-5 text-muted">
              <Loader2 className="animate-spin text-primary-custom mb-3" size={48} />
              <span>Carregando empresas...</span>
            </div>
          )}

          {error && (
            <div className="alert alert-danger d-flex align-items-center" role="alert">
              <AlertCircle className="me-2" size={20} />
              <div>{error}</div>
            </div>
          )}
          
          {!isLoading && !error && (
            <EnterpriseList
              enterprises={enterprises}
              onView={handleView}
              onEdit={handleEdit}
              // Passamos os handlers que abrem o modal
              onToggleStatus={handleToggleStatusClick}
              onDelete={handleDeleteClick}
            />
          )}
        </div>

        {viewingEnterprise && (
            <EnterpriseDetailsModal 
                enterprise={viewingEnterprise}
                onClose={() => setViewingEnterprise(null)}
            />
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
    </div>
  );
};

export default EnterprisePage;