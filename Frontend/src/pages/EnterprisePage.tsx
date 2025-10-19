import { useState, useEffect } from 'react';
import enterpriseService from '../services/Enterprise/api';
import type { Enterprise } from '../services/core-api';
import { useNavigate } from 'react-router-dom';
// import EnterpriseList from '../components/EnterpriseList'; 
// import CreateEnterpriseForm from '../components/CreateEnterpriseForm';

const EnterprisePage = () => {
  const navigate = useNavigate();
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEnterprises = async () => {
      try {
        const response = await enterpriseService.getEnterprises();
        setEnterprises(response.data["data"]);
      } catch (err) {
        setError('Falha ao carregar as empresas.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEnterprises();
  }, []); 

  const goToPanel = () => {
    navigate('/painel');
  };

  const goToCreateEnterprise = () => {
    navigate('/criar-empresa');
  };

  return (
    <div>
      <a onClick={goToPanel}><h1>Arquivia Logo</h1></a>
      <h2>Gestão de Empresas</h2>

      <button onClick={goToCreateEnterprise}>Criar Empresa</button>
      
      {isLoading && <p>Carregando empresas...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!isLoading && !error && (
        // <EnterpriseList enterprises={enterprises} />
        <pre>{JSON.stringify(enterprises, null, 2)}</pre> // Para teste inicial
      )}
    </div>
  );
};

export default EnterprisePage;