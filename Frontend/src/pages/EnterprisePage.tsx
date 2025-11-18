import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Loader2, AlertCircle } from 'lucide-react'; // Ícones
import toast from 'react-hot-toast'; // Notificações

// Imports de Lógica/API
import enterpriseService from '../services/Enterprise/api';
import type { Enterprise } from '../services/core-api';

// Componentes
import EnterpriseList from '../components/EnterpriseList';
import EnterpriseDetailsModal from '../components/EnterpriseDetailsModal'; // Novo Modal

// Import do CSS
import '../assets/css/EnterprisePage.css'; 

const EnterprisePage = () => {
  const navigate = useNavigate();
  
  // Estados de Dados
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado do Modal de Detalhes
  const [viewingEnterprise, setViewingEnterprise] = useState<Enterprise | null>(null);

  // --- LÓGICA DE NEGÓCIO ---
  useEffect(() => {
    const fetchEnterprises = async () => {
      try {
        const response = await enterpriseService.getEnterprises();
        const listaDeEmpresas = response.data.data;

        if (Array.isArray(listaDeEmpresas)) {
          setEnterprises(listaDeEmpresas);
        } else if (response.data && Array.isArray(response.data)) {
          setEnterprises(response.data);
        } else {
          // Não é necessariamente um erro, apenas lista vazia, 
          // mas se o formato for inválido, cai aqui.
          setEnterprises([]);
        }

      } catch (err) {
        console.error(err);
        setError('Falha ao carregar as empresas.');
        toast.error('Erro de conexão ao buscar empresas.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEnterprises();
  }, []);

  // Abre o Modal de Detalhes
  const handleView = (id: number) => {
    // Busca a empresa no estado local para evitar requisição desnecessária
    const enterpriseToView = enterprises.find(e => e.enterprise_id === id);
    
    if (enterpriseToView) {
        setViewingEnterprise(enterpriseToView);
    } else {
        // Fallback: Se não achar no estado (raro), busca na API
        enterpriseService.getEnterpriseById(id)
            .then(res => {
                 // @ts-ignore
                 setViewingEnterprise(res.data.data || res.data);
            })
            .catch(() => toast.error("Erro ao carregar detalhes da empresa."));
    }
  };

  const handleEdit = (id: number) => {
    navigate(`/empresas/editar/${id}`);
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    const actionText = newStatus ? "ativar" : "desativar";

    // window.confirm é aceitável para decisões críticas
    if (window.confirm(`Tem certeza que deseja ${actionText} a empresa?`)) {
      try {
        await enterpriseService.toggleEnterpriseStatus(id, newStatus);

        setEnterprises(currentEnterprises =>
          currentEnterprises.map(enterprise => {
            if (enterprise.enterprise_id === id) {
              return { ...enterprise, is_active: newStatus };
            }
            return enterprise;
          })
        );
        
        toast.success(`Empresa ${newStatus ? 'ativada' : 'desativada'} com sucesso!`);

      } catch (error) {
        console.error(error);
        toast.error(`Não foi possível alterar o status da empresa.`);
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm(`ATENÇÃO: Tem certeza que deseja deletar esta empresa?\nIsso pode apagar todos os setores e documentos vinculados.`)) {
      try {
        await enterpriseService.deleteEnterprise(id);

        setEnterprises(currentEnterprises =>
          currentEnterprises.filter(enterprise => enterprise.enterprise_id !== id)
        );

        toast.success('Empresa deletada com sucesso!');

      } catch (error) {
        console.error(error);
        toast.error('Não foi possível deletar. Verifique se há vínculos ativos.');
      }
    }
  };

  const goToCreateEnterprisePage = () => {
    navigate("/criar-empresa");
  }
  // --- FIM DA LÓGICA ---

  return (
    <div className='page-container'>
      <div className='container py-5'>
        
        {/* Cabeçalho */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h3 mb-1 fw-bold text-body-custom">Gestão de Empresas</h1>
            <p className="text-muted mb-0" style={{ fontSize: '0.95rem' }}>
              Gerencie as organizações cadastradas no sistema
            </p>
          </div>
          
          <button 
            onClick={goToCreateEnterprisePage} 
            className="btn btn-primary-custom d-flex align-items-center gap-2 shadow-sm px-4 py-2"
          >
            <Plus size={20} strokeWidth={2.5} />
            <span>Nova Empresa</span>
          </button>
        </div>
        
        {/* Conteúdo Principal */}
        <div className="custom-card p-4">
          
          {/* Estado de Loading */}
          {isLoading && (
            <div className="d-flex flex-column justify-content-center align-items-center py-5 text-muted">
              <Loader2 className="animate-spin text-primary-custom mb-3" size={48} />
              <span>Carregando empresas...</span>
            </div>
          )}

          {/* Estado de Erro */}
          {error && (
            <div className="alert alert-danger d-flex align-items-center" role="alert">
              <AlertCircle className="me-2" size={20} />
              <div>{error}</div>
            </div>
          )}
          
          {/* Lista de Dados */}
          {!isLoading && !error && (
            <EnterpriseList
              enterprises={enterprises}
              onView={handleView} // Agora abre o Modal
              onEdit={handleEdit}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDelete}
            />
          )}
        </div>

        {/* Modal de Detalhes (Renderizado Condicionalmente) */}
        {viewingEnterprise && (
            <EnterpriseDetailsModal 
                enterprise={viewingEnterprise}
                onClose={() => setViewingEnterprise(null)}
            />
        )}

      </div>
    </div>
  );
};

export default EnterprisePage;