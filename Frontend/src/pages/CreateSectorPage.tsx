import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import userService from '../services/User/api';
import enterpriseService from '../services/Enterprise/api';
import sectorService from '../services/Sector/api';
import type { Enterprise, CreateSectorData } from '../services/core-api';

const CreateSectorPage = () => {
  const navigate = useNavigate();
  const { username } = useAuth(); 

  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [selectedEnterpriseId, setSelectedEnterpriseId] = useState('');

  const [ownedEnterprises, setOwnedEnterprises] = useState<Enterprise[]>([]);
  
  const [isLoading, setIsLoading] = useState(true); 
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDataForForm = async () => {
      if (!username) {
        setError("Usuário não autenticado.");
        setIsLoading(false);
        return;
      }

      try {
        const userDetailsPromise = userService.getUserDetails(username);
        const enterprisesPromise = enterpriseService.getEnterprises();

        const [userResponse, enterprisesResponse] = await Promise.all([
          userDetailsPromise,
          enterprisesPromise,
        ]);

        //@ts-ignore
        const userId = userResponse.data.data.user_id;
        const allEnterprises = enterprisesResponse.data.data; 
        
        //@ts-ignore
        const userOwnedEnterprises = allEnterprises.filter(
        //@ts-ignore
          (enterprise) => enterprise.owner === userId
        );

        setOwnedEnterprises(userOwnedEnterprises);

      } catch (err) {
        console.error("Falha ao carregar dados para o formulário:", err);
        setError("Não foi possível carregar os dados necessários.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDataForForm();
  }, [username]); 

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedEnterpriseId) {
      setError("Por favor, selecione uma empresa.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    console.log("enterprise_id selecionado:", selectedEnterpriseId.enterprise_id);

    const data: CreateSectorData = {
      name,
      image,
      enterprise_id: Number(selectedEnterpriseId),
    };

    try {
      await sectorService.createSector(data);
      alert('Setor criado com sucesso!');
      navigate('/setores'); 
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || "Falha ao criar o setor.";
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <p>Carregando dados do formulário...</p>;
  }

  return (
    <div>
      <h1>Criar Novo Setor</h1>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="enterprise">Empresa</label>
          <br />
          <select
            id="enterprise"
            value={selectedEnterpriseId}
            onChange={(e) => setSelectedEnterpriseId(e.target.value)}
            required
          >
            <option value="">Selecione a empresa</option>
            {ownedEnterprises.length > 0 ? (
              ownedEnterprises.map((enterprise) => (
                //@ts-ignore
                <option key={enterprise.enterprise_id} value={enterprise.enterprise_id}>
                  {enterprise.name}
                </option>
              ))
            ) : (
              <option disabled>Você não é dono de nenhuma empresa</option>
            )}
          </select>
        </div>
        <br />

        <div>
          <label htmlFor="name">Nome do Setor</label>
          <br />
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <br />

        <div>
          <label htmlFor="image">Caminho da Imagem</label>
          <br />
          <input
            type="text"
            id="image"
            value={image}
            onChange={(e) => setImage(e.target.value)}
          />
        </div>
        <br />

        <button type="submit" disabled={isLoading || isSubmitting || ownedEnterprises.length === 0}>
          {isSubmitting ? 'Salvando...' : 'Criar Setor'}
        </button>
      </form>
    </div>
  );
};

export default CreateSectorPage;