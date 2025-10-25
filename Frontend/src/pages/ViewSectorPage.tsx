import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import sectorService from '../services/Sector/api';
import type { Sector } from '../services/core-api';

// --- 1. Definição dos Componentes das Abas (Placeholders) ---
// Em um projeto real, estes seriam arquivos separados.

const SectorUsers = ({ sectorId }: { sectorId: number }) => {
  return (
    <div>
      <h3>Componente de Usuários</h3>
      <p>Aqui será exibida a lista de usuários do setor {sectorId}.</p>
    </div>
  );
};

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
// --- Fim dos Componentes das Abas ---

// Definição do tipo para o nome das abas
type TabName = 'users' | 'metrics' | 'logs';

const ViewSectorPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [sector, setSector] = useState<Sector>({} as Sector);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- 2. Estado para controlar a aba ativa ---
  const [activeTab, setActiveTab] = useState<TabName>('users');

  // O seu useEffect para buscar dados permanece o mesmo
  useEffect(() => {
    if (!id) {
      setError('ID do setor não fornecido.');
      setIsLoading(false);
      return;
    }
    const fetchSectorData = async () => {
      try {
        const response = await sectorService.getSectorById(Number(id));
        setSector(response.data.data); // Você usou response.data.data, mantive assim
      } catch (err) {
        console.error("Falha ao buscar dados do setor:", err);
        setError("Não foi possível carregar os dados do setor.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSectorData();
  }, [id]);

  // --- 3. Estilos simples para a navegação das abas ---
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
        borderBottom: '3px solid blue', // Simples indicador de "ativo"
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

  // O seu 'if (!sector)' não funciona como esperado pois você inicializou
  // com '{} as Sector'. Se 'sector.name' estiver undefined, o card
  // apenas renderizará em branco. Isso é ok por enquanto.

  return (
    <div style={{ padding: '20px' }}>
      {/* Card no Topo (Seu código original) */}
      <div style={{ border: '1px solid #ccc', padding: '16px', borderRadius: '8px', marginBottom: '40px' }}>
        <h2 style={{ marginTop: 0 }}>{sector.name}</h2>
        
        <img 
          src={sector.image || 'https://via.placeholder.com/100'} 
          alt={sector.name} 
          style={{ width: '100px', height: '100px', objectFit: 'cover', float: 'right' }} 
        />
        
        {/* Corrigi para usar 'sector.id' como na interface */}
        <p><strong>ID do Setor:</strong> {sector.sector_id}</p> 
        <p><strong>Empresa:</strong> {sector.enterprise_name}</p>
        <p><strong>Gerente:</strong> {sector.manager_name}</p>
        {/* Corrigi para formatar a data */}
        <p><strong>Data de Criação:</strong> {sector.creation_date ? new Date(sector.creation_date).toLocaleDateString() : 'N/A'}</p>
        <p><strong>Status:</strong> {sector.is_active ? 'Ativo' : 'Inativo'}</p>
        
        <button onClick={() => navigate(-1)} style={{ marginTop: '10px' }}>
          Voltar
        </button>
      </div>

      {/* --- 4. Navegação por Abas --- */}
      <nav style={{ borderBottom: '1px solid #ccc' }}>
        <button style={getActiveTabStyle('users')} onClick={() => setActiveTab('users')}>
          Usuários
        </button>
        <button style={getActiveTabStyle('metrics')} onClick={() => setActiveTab('metrics')}>
          Métricas
        </button>
        <button style={getActiveTabStyle('logs')} onClick={() => setActiveTab('logs')}>
          Registros
        </button>
      </nav>

      {/* --- 5. Conteúdo da Aba Ativa --- */}
      <div style={{ padding: '20px 0' }}>
        {activeTab === 'users' && <SectorUsers sectorId={sector.sector_id} />}
        {activeTab === 'metrics' && <SectorMetrics sectorId={sector.sector_id} />}
        {activeTab === 'logs' && <SectorLogs sectorId={sector.sector_id} />}
      </div>

      {/* Placeholder do Dashboard no Fundo */}
      <h1>DASHBOARD</h1>
    </div>
  );
};

export default ViewSectorPage;