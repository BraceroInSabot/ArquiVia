import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import sectorService from '../services/Sector/api';
import type { Sector, ToggleSectorStatusPayload, RemoveSectorPayload } from '../services/core-api';
import SectorHeader from '../components/SectorHeader';
import SectorList from '../components/SectorList';
import type { SectorGroup } from '../components/SectorList.types';

const SectorPage = () => {
  const navigate = useNavigate();

  const [sectors, setSectors] = useState<Sector[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSectors = async () => {
      try {
        const response = await sectorService.getSectors();
        // console.log("Dados do setor recebidos:", response.data.data[0]); 
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
    confirm(`Tem certeza que deseja remover o setor ID: ${id}? Esta ação não pode ser desfeita.`) && alert(`Setor ID: ${id} removido.`);

    const deleteSector = async () => {
      try {
        //@ts-ignore
        await sectorService.deleteSector(id as RemoveSectorPayload);
        alert(`Setor ID: ${id} removido com sucesso.`);
        window.location.reload();
      } catch (err) {
        console.error("Falha ao remover setor:", err);
        alert("Não foi possível remover o setor.");
      }
    };
    deleteSector();
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
        alert(`Não foi possível ${actionText} o setor.`);
      }
    }
  };

  return (
    <div>
      <SectorHeader title="Listagem de Setores" onCreate={goToCreateSector} />
      <hr />

      {isLoading && <p>Carregando setores...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

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
  );
};

export default SectorPage;