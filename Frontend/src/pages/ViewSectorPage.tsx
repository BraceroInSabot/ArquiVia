import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Pencil, Loader2, AlertCircle, 
  Users, FolderTree, BarChart2, History, Layers, Lock
} from 'lucide-react'; 

import sectorService from '../services/Sector/api';
import type { Sector } from '../services/core-api';
import { useAuth } from '../contexts/AuthContext'; // Importe o AuthContext

import SectorUsers from '../components/SectorUsers';  
import SectorCategories from '../components/SectorCategories'; 
import SectorMetrics from '../components/SectorMetrics'; // Importe o componente real

import '../assets/css/EnterprisePage.css'; 

// Componente de Logs (Placeholder)
const SectorLogs = ({ sectorId }: { sectorId: number }) => (
  <div className="p-4 text-center bg-light rounded border border-dashed">
    <History size={48} className="text-secondary opacity-25 mb-3" />
    <h5 className="text-muted">Logs de Atividade</h5>
    <p className="text-muted small">O histórico de ações do setor {sectorId} aparecerá aqui.</p>
  </div>
);

// Componente de Acesso Negado (Bonito)
const AccessDenied = () => (
  <div className="p-5 text-center">
    <div className="bg-danger-subtle p-3 rounded-circle d-inline-block mb-3">
        <Lock size={32} className="text-danger" />
    </div>
    <h5 className="fw-bold text-dark">Acesso Restrito</h5>
    <p className="text-muted mb-0">Você não tem permissão para visualizar esta seção.</p>
  </div>
);

type TabName = 'users' | 'metrics' | 'logs' | 'categories';

const ViewSectorPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth(); // Pega o usuário logado

  const [sector, setSector] = useState<Sector>({} as Sector);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabName>('users');

  // --- LÓGICA ---
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

  const goToEditSectorPage = () => {
    navigate(`/setor/editar/${sector.sector_id}`);
  };

  // --- VERIFICAÇÃO DE PERMISSÕES ---
  // Nota: Esta é uma verificação básica no front-end. 
  // O ideal é que o backend também bloqueie o acesso aos dados.
  
  const currentUserId = user?.data.user_id;
  const isOwner = currentUserId === sector.owner_id;
  const isManager = currentUserId === sector.manager_id;
  // (Para verificar 'Admin' vs 'Membro', precisaríamos da lista de usuários do setor.
  //  Como não temos aqui no pai, assumimos que se não é Dono nem Gerente, é Membro/Admin).
  
  const canViewMetrics = isOwner || isManager; // Só Dono e Gerente veem métricas
  const canViewLogs = isOwner || isManager;    // Só Dono e Gerente veem logs

  // --- RENDERIZAÇÃO ---

  if (isLoading) {
    return (
        <div className="page-container d-flex justify-content-center align-items-center">
            <div className="text-center text-muted">
                <Loader2 className="animate-spin text-primary-custom mb-3" size={48} />
                <p>Carregando setor...</p>
            </div>
        </div>
    );
  }

  if (error) {
    return (
        <div className="page-container container py-5">
            <div className="alert alert-danger d-flex align-items-center" role="alert">
                <AlertCircle className="me-2" size={20} />
                <div>{error}</div>
            </div>
            <button className="btn btn-secondary mt-3" onClick={() => navigate(-1)}>Voltar</button>
        </div>
    );
  }

  return (
    <div className="page-container">
      <div className="container py-5">
        
        {/* Cabeçalho */}
        <div className="d-flex align-items-center mb-4">
            <button 
                onClick={() => navigate(-1)} 
                className="btn btn-light btn-sm me-3 text-secondary"
                title="Voltar"
            >
                <ArrowLeft size={20} />
            </button>
            <div>
                <h1 className="h3 mb-1 fw-bold text-body-custom">Detalhes do Setor: {sector.name}</h1>
                <span className="badge bg-light text-secondary border">ID: {sector.sector_id}</span>
            </div>
            
            <div className="ms-auto">
                {(isOwner || isManager) && (
                    <button 
                        onClick={goToEditSectorPage}
                        className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2"
                    >
                        <Pencil size={16} />
                        <span className="d-none d-sm-inline">Editar</span>
                    </button>
                )}
            </div>
        </div>

        {/* Hero Card */}
        <div className="custom-card p-4 mb-4">
            <div className="row align-items-center">
                <div className="col-auto">
                    <div className="rounded-circle overflow-hidden border d-flex align-items-center justify-content-center bg-light" style={{ width: '100px', height: '100px' }}>
                        {sector.image ? (
                            <img src={sector.image} alt={sector.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <Layers size={40} className="text-secondary opacity-50" />
                        )}
                    </div>
                </div>
                <div className="col">
                    <h2 className="h4 fw-bold text-dark mb-1">{sector.name}</h2>
                    <p className="text-muted mb-2">{sector.enterprise_name}</p>
                    <div className="d-flex flex-wrap gap-3 text-sm text-secondary">
                        <div><span className="fw-semibold">Gerente:</span> {sector.manager_name}</div>
                        <div className="vr opacity-25 d-none d-sm-block"></div>
                        <div><span className="fw-semibold">Criado em:</span> {sector.creation_date}</div>
                        <div className="vr opacity-25 d-none d-sm-block"></div>
                        <div><span className={`badge ${sector.is_active ? 'bg-success' : 'bg-secondary'}`}>{sector.is_active ? 'Ativo' : 'Inativo'}</span></div>
                    </div>
                </div>
            </div>
        </div>

        {/* Tabs */}
        <div className="custom-card">
            <div className="card-header bg-white border-bottom-0 pt-3 px-3">
                <ul className="nav nav-tabs card-header-tabs">
                    <li className="nav-item">
                        <button 
                            className={`nav-link d-flex align-items-center gap-2 ${activeTab === 'users' ? 'active fw-bold text-primary-custom' : 'text-secondary'}`}
                            onClick={() => setActiveTab('users')}
                        >
                            <Users size={18} /> Usuários
                        </button>
                    </li>
                    <li className="nav-item">
                        <button 
                            className={`nav-link d-flex align-items-center gap-2 ${activeTab === 'categories' ? 'active fw-bold text-primary-custom' : 'text-secondary'}`}
                            onClick={() => setActiveTab('categories')}
                        >
                            <FolderTree size={18} /> Categorias
                        </button>
                    </li>
                    
                    {/* Aba Métricas (Condicional) */}
                    {canViewMetrics && (
                        <li className="nav-item">
                            <button 
                                className={`nav-link d-flex align-items-center gap-2 ${activeTab === 'metrics' ? 'active fw-bold text-primary-custom' : 'text-secondary'}`}
                                onClick={() => setActiveTab('metrics')}
                            >
                                <BarChart2 size={18} /> Métricas
                            </button>
                        </li>
                    )}

                    {/* Aba Logs (Condicional) */}
                    {canViewLogs && (
                        <li className="nav-item">
                            <button 
                                className={`nav-link d-flex align-items-center gap-2 ${activeTab === 'logs' ? 'active fw-bold text-primary-custom' : 'text-secondary'}`}
                                onClick={() => setActiveTab('logs')}
                            >
                                <History size={18} /> Registros
                            </button>
                        </li>
                    )}
                </ul>
            </div>

            <div className="card-body p-4">
                {activeTab === 'users' && sector.sector_id && <SectorUsers sectorId={sector.sector_id} />}
                {activeTab === 'categories' && <SectorCategories sectorId={sector.sector_id} />}
                
                {/* Renderiza o conteúdo ou AccessDenied se tentar forçar */}
                {activeTab === 'metrics' && (canViewMetrics ? <SectorMetrics sectorId={sector.sector_id} /> : <AccessDenied />)}
                {activeTab === 'logs' && (canViewLogs ? <SectorLogs sectorId={sector.sector_id} /> : <AccessDenied />)}
            </div>
        </div>

      </div>
    </div>
  );
};

export default ViewSectorPage;