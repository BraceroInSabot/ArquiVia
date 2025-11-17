import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Loader2, AlertCircle } from 'lucide-react'; // Ícones 
import toast from 'react-hot-toast';

// Imports de Lógica/API
import enterpriseService from '../services/Enterprise/api';
import type { Enterprise } from '../services/core-api';
import EnterpriseList from '../components/EnterpriseList';

// Import do CSS (Certifique-se de criar/salvar o arquivo CSS acima)
import '../assets/css/EnterprisePage.css'; 

const EnterprisePage = () => {
  const navigate = useNavigate();
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- LÓGICA DE NEGÓCIO (INTACTA) ---
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
          setError('Nenhuma empresa encontrada.');
        }

      } catch (err) {
        setError('Falha ao carregar as empresas.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEnterprises();
  }, []);

  const handleView = async (id: number) => {
    try {
      const response = await enterpriseService.getEnterpriseById(id);
      // @ts-ignore
      const enterprise = response.data.data;

      const enterpriseData = `
        Dados da Empresa (ID: ${enterprise.enterprise_id}):
        --------------------------
        Nome: ${enterprise.name}
        Imagem: ${enterprise.image || 'Não informada'}
        Ativo: ${enterprise.is_active ? 'Sim' : 'Não'}
        Criado em: ${new Date(enterprise.created_at).toLocaleString()}
      `;

      toast.success(enterpriseData);

    } catch (error) {
      toast.error('Não foi possível carregar os dados atualizados da empresa. Tente novamente.');
    }
  };

  const handleEdit = (id: number) => {
    navigate(`/empresas/editar/${id}`);
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    const actionText = newStatus ? "ativar" : "desativar";

    if (window.confirm(`Tem certeza que deseja ${actionText} a empresa com ID: ${id}?`)) {
      try {
        const response = await enterpriseService.toggleEnterpriseStatus(id, newStatus);

        setEnterprises(currentEnterprises =>
          currentEnterprises.map(enterprise => {
            if (enterprise.enterprise_id === id) {
              return { ...enterprise, is_active: newStatus };
            }
            return enterprise;
          })
        );
        
        toast.success(`${response.data.mensagem}`);

      } catch (error) {
        toast.error(`Não foi possível alterar o status da empresa. Tente novamente.`);
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm(`Tem certeza que deseja deletar a empresa com ID: ${id}?`)) {
      try {
        await enterpriseService.deleteEnterprise(id);

        setEnterprises(currentEnterprises =>
          currentEnterprises.filter(enterprise => enterprise.enterprise_id !== id)
        );

        toast.success(`Empresa com ID: ${id} deletada com sucesso!`);

      } catch (error) {
        toast.error('Não foi possível deletar a empresa. Verifique se ela não possui dados vinculados e tente novamente.');
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
              onView={handleView}
              onEdit={handleEdit}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EnterprisePage;