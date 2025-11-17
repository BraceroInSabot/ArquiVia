import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, Plus } from 'lucide-react'; // Novos ícones
import toast from 'react-hot-toast';

import sectorService from '../services/Sector/api';
import type { Sector, ToggleSectorStatusPayload, RemoveSectorPayload } from '../services/core-api';
import SectorList from '../components/SectorList';
import type { SectorGroup } from '../components/SectorList.types';

// Import do CSS (reutilizaremos o CSS base da EnterprisePage para consistência)
import '../assets/css/EnterprisePage.css'; 

const SectorPage = () => {
  const navigate = useNavigate();

  const [sectors, setSectors] = useState<Sector[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- LÓGICA (MANTIDA INTACTA) ---
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

  const goToCreateSector = () => {
    navigate('/setor/criar');
  };

  const handleViewSector = (id: number) => {
    navigate(`/setor/${id}`);
  };

  const handleEditSector = (id: number) => {
    navigate(`/setor/editar/${id}`);
  };

  const handleDeleteSector = (id: number) => {
    if (window.confirm(`Tem certeza que deseja remover o setor ID: ${id}? Esta ação não pode ser desfeita.`)) {
        const deleteSector = async () => {
        try {
            //@ts-ignore
            await sectorService.deleteSector(id as RemoveSectorPayload);
            toast.success(`Setor ID: ${id} removido com sucesso.`);
            window.location.reload();
        } catch (err) {
            toast.error("Não foi possível remover o setor.");
        }
        };
        deleteSector();
    }
  };

  const handleDeactivateOrActivate = async (sector_id: ToggleSectorStatusPayload) => {
    console.log("Toggle setor ID:", sector_id);
    //@ts-ignore
    const sectorToToggle = sectors.find(s => s.sector_id === sector_id);
    console.log("Setor encontrado para toggle:", sectorToToggle);
    if (!sectorToToggle) return;

    const newStatus = !sectorToToggle.is_active;
    const actionText = newStatus ? 'ativar' : 'desativar';
    
    if (window.confirm(`Tem certeza que deseja ${actionText} o setor "${sectorToToggle.name}"?`)) {
      try {
        await sectorService.toggleSectorStatus(sector_id);
        window.location.reload();
      } catch (err) {
        toast.error(`Não foi possível ${actionText} o setor.`);
      }
    }
  };
  // --- FIM DA LÓGICA ---

  return (
    <div className="page-container">
      <div className="container py-5">
        
        {/* Cabeçalho */}
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

        {/* Conteúdo Principal */}
        <div className="custom-card p-4">
            
            {/* Loading */}
            {isLoading && (
                <div className="d-flex flex-column justify-content-center align-items-center py-5 text-muted">
                    <Loader2 className="animate-spin text-primary-custom mb-3" size={48} />
                    <span>Carregando setores...</span>
                </div>
            )}
            
            {/* Erro */}
            {error && (
                <div className="alert alert-danger d-flex align-items-center" role="alert">
                    <AlertCircle className="me-2" size={20} />
                    <div>{error}</div>
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
    </div>
  );
};

export default SectorPage;