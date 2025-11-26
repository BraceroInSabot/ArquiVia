import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Pencil, Loader2, AlertCircle, 
  Users, FolderTree, BarChart2, History, Layers, Lock
} from 'lucide-react'; 

import sectorService from '../../services/Sector/api';
import type { Sector } from '../../services/core-api';
import { useAuth } from '../../contexts/AuthContext'; 

import SectorUsers from '../../components/Sector/SectorUsers';  
import SectorCategories from '../../components/Sector/SectorCategories'; // Caminho ajustado para pages/tabs? Verifique.
import SectorMetrics from '../../components/Sector/SectorMetrics';

// --- Componentes Locais Estilizados ---

const SectorLogs = ({ sectorId }: { sectorId: number }) => (
  <div className="flex flex-col items-center justify-center p-10 bg-base-200/50 rounded-xl border-2 border-dashed border-base-300">
    <History size={48} className="text-base-300 mb-4" />
    <h5 className="text-lg font-bold text-secondary">Logs de Atividade</h5>
    <p className="text-sm text-gray-500">O histórico de ações do setor {sectorId} aparecerá aqui.</p>
  </div>
);

const AccessDenied = () => (
  <div className="flex flex-col items-center justify-center p-12 bg-base-100 rounded-xl">
    <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mb-4 text-error">
        <Lock size={32} />
    </div>
    <h5 className="text-xl font-bold text-secondary">Acesso Restrito</h5>
    <p className="text-gray-500">Você não tem permissão para visualizar esta seção.</p>
  </div>
);

type TabName = 'users' | 'metrics' | 'logs' | 'categories';

const ViewSectorPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [sector, setSector] = useState<Sector>({} as Sector);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabName>('users');

  // --- LÓGICA (INTACTA) ---
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

  const currentUserId = user?.data.user_id;
  const isOwner = currentUserId === sector.owner_id;
  const isManager = currentUserId === sector.manager_id;
  
  const canViewMetrics = isOwner || isManager; 
  const canViewLogs = isOwner || isManager;   
  // --- FIM DA LÓGICA ---

  if (isLoading) {
    return (
        <div className="min-h-screen bg-base-200 flex flex-col items-center justify-center text-secondary">
            <Loader2 className="animate-spin text-primary mb-4" size={48} />
            <p className="font-medium">Carregando setor...</p>
        </div>
    );
  }

  if (error) {
    return (
        <div className="min-h-screen bg-base-200 p-8 flex flex-col items-center justify-center">
            <div className="alert alert-error shadow-lg max-w-md">
                <AlertCircle size={24} />
                <span>{error}</span>
            </div>
            <button className="btn btn-outline mt-4" onClick={() => navigate(-1)}>Voltar</button>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 p-4 md:p-8 font-sans text-neutral">
      <div className="max-w-7xl mx-auto">
        
        {/* Cabeçalho de Navegação */}
        <div className="flex items-center gap-4 mb-6">
            <button 
                onClick={() => navigate(-1)} 
                className="btn btn-circle btn-ghost btn-sm"
                title="Voltar"
            >
                <ArrowLeft size={24} className="text-secondary" />
            </button>
            <div className="flex-1">
                <div className="flex items-center gap-3">
                   <h1 className="text-2xl md:text-3xl font-bold text-secondary">Detalhes do Setor</h1>
                   <div className="badge badge-ghost font-mono text-xs p-2">ID: {sector.sector_id}</div>
                </div>
            </div>
            
            {(isOwner || isManager) && (
                <button 
                    onClick={goToEditSectorPage}
                    className="btn btn-outline btn-sm gap-2"
                >
                    <Pencil size={16} />
                    <span className="hidden sm:inline">Editar</span>
                </button>
            )}
        </div>

        {/* Hero Card */}
        <div className="card bg-base-100 shadow-xl mb-8 border border-base-300">
            <div className="card-body flex-row items-center gap-6 p-6">
                {/* Imagem */}
                <div className="avatar">
                    <div style={{display: 'flex !important',
              justifyContent: 'center !important',
              textJustify: 'auto',
              justifyItems: 'center',
              justifySelf: 'center',
              justifyTracks: 'center',
              alignItems: 'center',
              alignContent: 'center'
            }} className="w-24 h-24 rounded-xl ring ring-base-300 ring-offset-base-100 ring-offset-2 bg-base-200 flex items-center justify-center overflow-hidden">
                        {sector.image ? (
                            <img src={sector.image} alt={sector.name} className="object-cover w-full h-full" />
                        ) : (
                            <Layers size={40} className="text-gray-400" />
                        )}
                    </div>
                </div>

                {/* Informações */}
                <div className="flex-1 min-w-0">
                    <h2 className="card-title text-3xl text-primary mb-1">{sector.name}</h2>
                    <p className="text-gray-500 font-medium mb-3 flex items-center gap-2">
                        <Building2 size={16} /> {sector.enterprise_name}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mt-2">
                         <div className="badge badge-lg bg-secondary badge-ghost gap-2 p-3">
                            <span className="font-bold text-gray-500 text-xs text-white uppercase">Gerente:</span> 
                            <span className='text-white'>{sector.manager_name}</span>
                         </div>
                         <div className="badge badge-lg badge-ghost gap-2 p-3">
                            <span className="font-bold text-gray-500 text-xs uppercase">Criado em:</span> 
                            {sector.creation_date}
                         </div>
                         <div className={`badge badge-lg gap-2 p-3 text-white ${sector.is_active ? 'badge-success' : 'badge-neutral'}`}>
                            {sector.is_active ? 'Ativo' : 'Inativo'}
                         </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Tabs Navigation */}
        <div className="mb-6 border-b border-base-300">
            <div role="tablist" className="tabs tabs-bordered tabs-lg">
                <a 
                    role="tab" 
                    className={`tab ${activeTab === 'users' ? 'tab-active text-primary font-bold border-primary' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('users')}
                >
                    <Users size={18} className="mr-2" /> Usuários
                </a>
                <a 
                    role="tab" 
                    className={`tab ${activeTab === 'categories' ? 'tab-active text-primary font-bold border-primary' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('categories')}
                >
                    <FolderTree size={18} className="mr-2" /> Categorias
                </a>
                
                {canViewMetrics && (
                    <a 
                        role="tab" 
                        className={`tab ${activeTab === 'metrics' ? 'tab-active text-primary font-bold border-primary' : 'text-gray-500'}`}
                        onClick={() => setActiveTab('metrics')}
                    >
                        <BarChart2 size={18} className="mr-2" /> Métricas
                    </a>
                )}

                {canViewLogs && (
                    <a 
                        role="tab" 
                        className={`tab ${activeTab === 'logs' ? 'tab-active text-primary font-bold border-primary' : 'text-gray-500'}`}
                        onClick={() => setActiveTab('logs')}
                    >
                        <History size={18} className="mr-2" /> Registros
                    </a>
                )}
            </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[300px]">
            {activeTab === 'users' && sector.sector_id && <SectorUsers sectorId={sector.sector_id} />}
            {activeTab === 'categories' && <SectorCategories sectorId={sector.sector_id} />}
            
            {activeTab === 'metrics' && (canViewMetrics ? <SectorMetrics sectorId={sector.sector_id} /> : <AccessDenied />)}
            {activeTab === 'logs' && (canViewLogs ? <SectorLogs sectorId={sector.sector_id} /> : <AccessDenied />)}
        </div>

      </div>
    </div>
  );
};

// Ícone extra necessário que não estava importado
import { Building2 } from 'lucide-react'; 

export default ViewSectorPage;