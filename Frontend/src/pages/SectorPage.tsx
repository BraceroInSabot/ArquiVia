import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import sectorService from '../services/Sector/api';
import type { Sector } from '../services/core-api';
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
        console.log("Dados do setor recebidos:", response.data.data[0]); 
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
    alert(`Consultar setor ID: ${id}`);
    // Futuramente: navigate(`/setor/${id}`);
  };

  const handleEditSector = (id: number) => {
    alert(`Editar setor ID: ${id}`);
    // Futuramente: navigate(`/setor/editar/${id}`);
  };

  const handleDeleteSector = (id: number) => {
    if (window.confirm(`Tem certeza que deseja remover o setor ID: ${id}?`)) {
      alert(`Removendo setor ID: ${id}`);
    }
  };

  const handleDeactivateOrActivate = (id: number) => {
    if (window.confirm(`Tem certeza que deseja desativar ou ativar setor ID: ${id}?`)) {
      alert(`Desativando/Removendo setor ID: ${id}`);
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