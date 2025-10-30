import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import enterpriseService from '../services/Enterprise/api';
import sectorService from '../services/Sector/api';
import type { Enterprise } from '../services/core-api';

const CreateSectorPage = () => {
   const navigate = useNavigate();
   const { user } = useAuth(); 

   const [name, setName] = useState('');
   const [imageFile, setImageFile] = useState<File | null>(null);
   const [selectedEnterpriseId, setSelectedEnterpriseId] = useState('');

   const [ownedEnterprises, setOwnedEnterprises] = useState<Enterprise[]>([]);
   
   const [isLoading, setIsLoading] = useState(true); 
   const [isSubmitting, setIsSubmitting] = useState(false); 
   const [error, setError] = useState<string | null>(null);

   useEffect(() => {
      const fetchDataForForm = async () => {
         if (!user) {
            setError("Usuário não autenticado.");
            setIsLoading(false);
            return;
         }

         try {
            const enterprisesPromise = enterpriseService.getEnterprises();
        const enterprisesResponse = await enterprisesPromise;

            const userId = user.data.user_id; 
            const allEnterprises = enterprisesResponse.data; 
            
            const userOwnedEnterprises = allEnterprises.data.filter(
               (e) => e.owner === userId
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
   }, [ user]); 

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setImageFile(event.target.files[0]);
    } else {
      setImageFile(null);
    }
  };

   const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!selectedEnterpriseId) {
         setError("Por favor, selecione uma empresa.");
         return;
      }

      setIsSubmitting(true);
      setError(null);

      const formData = new FormData();
    formData.append('name', name);
    formData.append('enterprise_id', selectedEnterpriseId);

    if (imageFile) {
      formData.append('image', imageFile);
    }

      try {
         await sectorService.createSector(formData);
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
               <label htmlFor="image">Imagem do Setor (JPG, PNG, SVG)</label>
               <br />
               <input
                  type="file"
                  id="image"
            accept="image/jpeg, image/png, image/svg+xml"
                  onChange={handleImageChange}
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