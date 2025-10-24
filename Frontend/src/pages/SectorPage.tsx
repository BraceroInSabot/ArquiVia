import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import sectorService from '../services/Sector/api';
import type { Sector } from '../services/core-api';

const SectorPage = () => {
  const navigate = useNavigate();

  const [sectors, setSectors] = useState<Sector[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const groupedAndSortedSectors = useMemo(() => {
    const groups: Record<string, Sector[]> = {};
    sectors.forEach(sector => {
      const enterpriseName = sector.enterprise.name;
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
    // alert('Navegar para a página de criação de setor');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ textAlign: 'left' }}>Listagem de Setores</h1>
        <button onClick={goToCreateSector}>
          Criar Novo Setor
        </button>
      </div>

      <hr />

      {isLoading && <p>Carregando setores...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!isLoading && !error && (
        <div>
          {groupedAndSortedSectors.length === 0 ? (
            <p>Nenhum setor encontrado para as empresas que você pertence.</p>
          ) : (
            groupedAndSortedSectors.map(group => (
              <div key={group.enterpriseName}>
                <h2>{group.enterpriseName}</h2>
                <ul>
                  {group.sectors.map(sector => (
                    <li key={sector.id}>
                      {sector.name}
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SectorPage;