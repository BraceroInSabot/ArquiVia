import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, Plus } from 'lucide-react'; 
import toast from 'react-hot-toast';

import sectorService from '../../services/Sector/api';
import type { Sector, ToggleSectorStatusPayload, RemoveSectorPayload } from '../../services/core-api';
import SectorList from '../../components/Sector/SectorList'; // Certifique-se do caminho
import type { SectorGroup } from '../../components/Sector/SectorList.types'; // Certifique-se do caminho
import ConfirmModal, { type ConfirmVariant } from '../../components/modal/ConfirmModal';

// Interface para o estado do modal
interface ConfirmConfig {
  isOpen: boolean;
  type: 'toggle' | 'delete' | null;
  sectorId: number | null;
  sectorName?: string;
  currentStatus?: boolean;
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

  // Estados para o Modal e Loading de Ação
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

  // --- HANDLERS DE ABERTURA DE MODAL ---

  const handleDeleteSector = (id: number) => {
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

  // --- LÓGICA DE EXECUÇÃO ---

  const handleConfirmAction = async () => {
    const { sectorId, type } = confirmConfig;
    if (!sectorId || !type) return;

    setIsActionLoading(true);

    try {
      if (type === 'delete') {
        await sectorService.deleteSector(sectorId as unknown as RemoveSectorPayload);
        toast.success(`Setor removido com sucesso.`);
        setSectors(prev => prev.filter(s => s.sector_id !== sectorId));
      } 
      else if (type === 'toggle') {
        await sectorService.toggleSectorStatus(sectorId as unknown as ToggleSectorStatusPayload);
        setSectors(prev => prev.map(s => 
           s.sector_id === sectorId ? { ...s, is_active: !s.is_active } : s
        ));
        const actionDone = !confirmConfig.currentStatus ? "ativado" : "desativado";
        toast.success(`Setor ${actionDone} com sucesso.`);
      }
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
    <div className="min-h-screen bg-base-000 p-4 md:p-8 font-sans text-neutral">
      <div className="max-w-7xl mx-auto">
        
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-secondary">Listagem de Setores</h1>
            <p className="text-sm text-gray-500 mt-1">Gerencie os setores e departamentos vinculados às empresas</p>
          </div>
          
          <button 
            onClick={goToCreateSector} 
            className="btn btn-primary text-white gap-2 shadow-md hover:shadow-lg transition-all"
          >
            <Plus size={20} strokeWidth={2.5} />
            <span>Novo Setor</span>
          </button>
        </div>

        {/* Conteúdo Principal */}
        <div className="card bg-base-100 shadow-xl border border-base-300">
            <div className="card-body">
                
                {/* Loading */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                        <Loader2 className="animate-spin text-primary mb-2" size={40} />
                        <span>Carregando setores...</span>
                    </div>
                )}
                
                {/* Erro */}
                {error && (
                    <div className="alert alert-error shadow-sm mb-4">
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}

                {/* Lista */}
                {!isLoading && !error && (
                    <SectorList 
                        groups={groupedAndSortedSectors} 
                        onViewSector={handleViewSector}
                        onEditSector={handleEditSector}
                        onDeleteSector={handleDeleteSector}
                        onDeactivateOrActivate={handleDeactivateOrActivate}
                    />
                )}
            </div>
        </div>

        {/* Modal de Confirmação */}
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