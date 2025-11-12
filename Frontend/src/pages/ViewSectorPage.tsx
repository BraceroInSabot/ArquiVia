import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import sectorService from '../services/Sector/api';
import type { Sector } from '../services/core-api';
import SectorUsers from '../components/SectorUsers';  
import SectorCategories from '../components/SectorCategories';

const SectorMetrics = ({ sectorId }: { sectorId: number }) => {
  return (
    <div>
      <h3>Componente de Métricas</h3>
      <p>Aqui serão exibidos os gráficos e métricas do setor {sectorId}.</p>
    </div>
  );
};

const SectorLogs = ({ sectorId }: { sectorId: number }) => {
  return (
    <div>
      <h3>Componente de Registros</h3>
      <p>Aqui será exibido o log de atividades do setor {sectorId}.</p>
    </div>
  );
};

type TabName = 'users' | 'metrics' | 'logs' | 'categories';

const ViewSectorPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [sector, setSector] = useState<Sector>({} as Sector);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<TabName>('users');

  useEffect(() => {
    if (!id) {
      setError('ID do setor não fornecido.');
      setIsLoading(false);
      return;
    }
    const fetchSectorData = async () => {
      try {
        const response = await sectorService.getSectorById(Number(id));
        setSector(response.data.data); 
      } catch (err) {
        console.error("Falha ao buscar dados do setor:", err);
        setError("Não foi possível carregar os dados do setor.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSectorData();
  }, [id]);


  const tabStyle: React.CSSProperties = {
    padding: '10px 15px',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    marginRight: '10px',
  };

  const getActiveTabStyle = (tabName: TabName): React.CSSProperties => {
    if (activeTab === tabName) {
      return {
        ...tabStyle,
        fontWeight: 'bold',
        borderBottom: '3px solid blue', 
      };
    }
    return tabStyle;
  };


  if (isLoading) {
    return <p>Carregando dados do setor...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  const goToEditSectorPage = () => {
    navigate(`/setor/editar/${sector.sector_id}`);
  };



  return (
    <div style={{ padding: '20px' }}>
      <div style={{ border: '1px solid #ccc', padding: '16px', borderRadius: '8px', marginBottom: '40px' }}>
        <h2 style={{ marginTop: 0 }}>{sector.name}</h2>
        
        <img 
          src={sector.image || 'https://via.placeholder.com/100'} 
          alt={sector.name} 
          style={{ width: '100px', height: '100px', objectFit: 'cover', float: 'right' }} 
        />
        
        <p><strong>ID do Setor:</strong> {sector.sector_id}</p> 
        <p><strong>Empresa:</strong> {sector.enterprise_name}</p>
        <p><strong>Gerente:</strong> {sector.manager_name}</p>
        <p><strong>Data de Criação:</strong> {sector.creation_date}</p>
        <p><strong>Status:</strong> {sector.is_active ? 'Ativo' : 'Inativo'}</p>
        
        <div>
          <button onClick={() => {navigate(-1)}}>
            Voltar
          </button>
          <button onClick={goToEditSectorPage}>
            Editar Setor
          </button>
        </div>
      </div>

      <nav style={{ borderBottom: '1px solid #ccc' }}>
        <button style={getActiveTabStyle('users')} onClick={() => setActiveTab('users')}>
          Usuários
        </button>
        <button style={getActiveTabStyle('categories')} onClick={() => setActiveTab('categories')}>
          Categorias
        </button>
        <button style={getActiveTabStyle('metrics')} onClick={() => setActiveTab('metrics')}>
          Métricas
        </button>
        <button style={getActiveTabStyle('logs')} onClick={() => setActiveTab('logs')}>
          Registros
        </button>
      </nav>

      <div style={{ padding: '20px 0' }}>
        {activeTab === 'users' && sector.sector_id && <SectorUsers sectorId={sector.sector_id} />}
        {activeTab === 'categories' && <SectorCategories sectorId={sector.sector_id} />}
        {activeTab === 'metrics' && <SectorMetrics sectorId={sector.sector_id} />}
        {activeTab === 'logs' && <SectorLogs sectorId={sector.sector_id} />}
      </div>
    </div>
  );
};

export default ViewSectorPage;