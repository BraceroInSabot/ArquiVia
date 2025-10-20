import { useState, useEffect } from 'react';
import enterpriseService from '../services/Enterprise/api';
import type { Enterprise } from '../services/core-api';
import EnterpriseList from '../components/EnterpriseList'; 
import { useNavigate } from 'react-router-dom';

const EnterprisePage = () => {
  const navigate = useNavigate();
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEnterprises = async () => {
      try {
        const response = await enterpriseService.getEnterprises();

        console.log('Resposta completa da API:', response.data);

        const listaDeEmpresas = response.data.data; 

        if (Array.isArray(listaDeEmpresas)) {
          setEnterprises(listaDeEmpresas);
        } else if (response.data && Array.isArray(response.data)) {
          setEnterprises(response.data);
        } else {
          console.error("A resposta da API não é um array nem contém uma chave 'results' com um array.", response.data);
          setError('Formato de dados inesperado recebido do servidor.');
        }

      } catch (err) {
        setError('Falha ao carregar as empresas.');
        console.error(err);
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

      alert(enterpriseData);

    } catch (error) {
      console.error(`Falha ao consultar empresa com ID ${id}:`, error);
      alert('Não foi possível carregar os dados atualizados da empresa. Tente novamente.');
    }
  };

  const handleEdit = (id: number) => {
    alert(`Editar empresa com ID: ${id}`);
    // Futuramente: navigate(`/empresas/editar/${id}`);
  };

  const handleToggleStatus = (id: number, currentStatus: boolean) => {
    alert(`Mudar status da empresa ${id} de ${currentStatus} para ${!currentStatus}`);
    // Futuramente: chamar a API para atualizar o status e depois atualizar o estado local
  };

  const handleDelete = (id: number) => {
    if (window.confirm(`Tem certeza que deseja deletar a empresa com ID: ${id}?`)) {
      alert(`Deletando empresa com ID: ${id}`);
      // Futuramente: chamar enterpriseService.deleteEnterprise(id)
      // e depois remover a empresa do estado 'enterprises'
      // setEnterprises(current => current.filter(e => e.id !== id));
    }
  };

  const goToCreateEnterprisePage = () => {
    navigate("/criar-empresa");
  }

  return (
    <div>
      <h1>Gestão de Empresas</h1>
      <button onClick={goToCreateEnterprisePage}>Criar Empresa</button>
      
      {isLoading && <p>Carregando empresas...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {!isLoading && !error && (
        // 3. Renderize o componente de lista, passando os dados e as funções de ação
        <EnterpriseList
          enterprises={enterprises}
          onView={handleView}
          onEdit={handleEdit}
          onToggleStatus={handleToggleStatus}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default EnterprisePage;