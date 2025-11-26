import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, Plus } from 'lucide-react'; 
import toast from 'react-hot-toast';

import sectorService from '../services/Sector/api';
import type { Sector, ToggleSectorStatusPayload, RemoveSectorPayload } from '../services/core-api';
import SectorList from '../components/Sector/SectorList';
import type { SectorGroup } from '../components/Sector/SectorList.types';
import ConfirmModal, { type ConfirmVariant } from '../components/modal/ConfirmModal'; // 1. Importe o Modal

import '../assets/css/EnterprisePage.css'; 

// Interface para o estado do modal
interface ConfirmConfig {
  isOpen: boolean;
  type: 'toggle' | 'delete' | null;
  sectorId: number | null; // Mudado de 'id' para 'sectorId' para clareza
  sectorName?: string;     // Para mostrar no texto
  currentStatus?: boolean; // Apenas para toggle
  title: string;
  message: string;
  variant: ConfirmVariant;
  confirmText: string;
}

const SectorPage = () => {
  const navigate = useNavigate();

  const [sectors, setSectors] = useState<Sector[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 2. Estados para o Modal e Loading de Ação
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig>({
    isOpen: false, type: null, sectorId: null, title: '', message: '', variant: 'warning', confirmText: ''
  });

  useEffect(() => {
    const fetchSectors = async () => {
      try {
        const response = await sectorService.getSectors();
        setSectors(response.data.data || []);
      } catch (err) {
        setError('Nenhum setor encontrado.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSectors();
  }, []); 

  const groupedAndSortedSectors: SectorGroup[] = useMemo(() => {
    const groups: Record<string, Sector[]> = {};
    sectors.forEach(sector => {
      const enterpriseName = sector.enterprise_name;
      if (!groups[enterpriseName]) {
        groups[enterpriseName] = [];
      }
      groups[enterpriseName].push(sector);
    });
    const sortedGroups = Object.keys(groups)
      .sort()
      .map(enterpriseName => ({
        enterpriseName: enterpriseName,
        sectors: groups[enterpriseName],
      }));
    return sortedGroups;
  }, [sectors]);

  const goToCreateSector = () => navigate('/setor/criar');
  const handleViewSector = (id: number) => navigate(`/setor/${id}`);
  const handleEditSector = (id: number) => navigate(`/setor/editar/${id}`);

  // --- 3. HANDLERS DE ABERTURA DE MODAL ---

  const handleDeleteSector = (id: number) => {
    // Encontra o setor para mostrar o nome (opcional, mas bom para UX)
    const sector = sectors.find(s => s.sector_id === id);
    
    setConfirmConfig({
      isOpen: true,
      type: 'delete',
      sectorId: id,
      title: "Excluir Setor?",
      message: `Tem certeza que deseja remover o setor "${sector?.name || id}"? Esta ação não pode ser desfeita e pode afetar documentos vinculados.`,
      variant: 'danger',
      confirmText: "Sim, Excluir"
    });
  };

  const handleDeactivateOrActivate = (sector_id: ToggleSectorStatusPayload) => {
    // Encontra o setor para saber o status atual
    // @ts-ignore
    const sector = sectors.find(s => s.sector_id === sector_id);
    if (!sector) return;

    const actionText = !sector.is_active ? "Ativar" : "Desativar";
    const variant = !sector.is_active ? "success" : "warning";

    setConfirmConfig({
      isOpen: true,
      type: 'toggle',
      // @ts-ignore
      sectorId: sector_id,
      currentStatus: sector.is_active,
      title: `${actionText} Setor?`,
      message: `Tem certeza que deseja ${actionText.toLowerCase()} o setor "${sector.name}"?`,
      variant: variant,
      confirmText: `Sim, ${actionText}`
    });
  };

  // --- 4. LÓGICA DE EXECUÇÃO (CHAMADA PELO MODAL) ---

  const handleConfirmAction = async () => {
    const { sectorId, type } = confirmConfig;
    if (!sectorId || !type) return;

    setIsActionLoading(true);

    try {
      if (type === 'delete') {
        await sectorService.deleteSector(sectorId as unknown as RemoveSectorPayload);
        
        toast.success(`Setor removido com sucesso.`);
        // Remove da lista localmente para não precisar de reload
        setSectors(prev => prev.filter(s => s.sector_id !== sectorId));
      } 
      else if (type === 'toggle') {
        await sectorService.toggleSectorStatus(sectorId as unknown as ToggleSectorStatusPayload);
        
        // Atualiza o estado localmente
        setSectors(prev => prev.map(s => 
           s.sector_id === sectorId ? { ...s, is_active: !s.is_active } : s
        ));
        
        // Mensagem baseada na ação que ACABOU de acontecer (inverso do status antigo)
        const actionDone = !confirmConfig.currentStatus ? "ativado" : "desativado";
        toast.success(`Setor ${actionDone} com sucesso.`);
      }

      // Fecha o modal
      setConfirmConfig(prev => ({ ...prev, isOpen: false }));

    } catch (err) {
      console.error("Erro na ação:", err);
      const actionFail = type === 'delete' ? "remover" : "alterar status do";
      toast.error(`Não foi possível ${actionFail} setor.`);
    } finally {
      setIsActionLoading(false);
    }
  };


  return (
    <div className="page-container">
      <div className="container py-5">
        
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h3 mb-1 fw-bold text-body-custom">Listagem de Setores</h1>
            <p className="text-muted mb-0">Gerencie os setores e departamentos vinculados às empresas</p>
          </div>
          
          <button 
            onClick={goToCreateSector} 
            className="btn btn-primary-custom d-flex align-items-center gap-2 shadow-sm px-4 py-2"
          >
            <Plus size={20} strokeWidth={2.5} />
            <span>Novo Setor</span>
          </button>
        </div>

        <div className="custom-card p-4">
            
            {isLoading && (
                <div className="d-flex flex-column justify-content-center align-items-center py-5 text-muted">
                    <Loader2 className="animate-spin text-primary-custom mb-3" size={48} />
                    <span>Carregando setores...</span>
                </div>
            )}
            
            {error && (
                <div className="alert alert-danger d-flex align-items-center" role="alert">
                    <AlertCircle className="me-2" size={20} />
                    <div>{error}</div>
                </div>
            )}

            {!isLoading && !error && (
                <SectorList 
                    groups={groupedAndSortedSectors} 
                    onViewSector={handleViewSector}
                    onEditSector={handleEditSector}
                    // Passamos os handlers que abrem o modal
                    onDeleteSector={handleDeleteSector}
                    onDeactivateOrActivate={handleDeactivateOrActivate}
                />
            )}
        </div>

        {/* 5. Renderiza o Modal de Confirmação */}
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

export default SectorPage;