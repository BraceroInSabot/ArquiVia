import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, UploadCloud, Check, Loader2, AlertCircle, Building2, Layout } from 'lucide-react'; 
import toast from 'react-hot-toast';

import { useAuth } from '../../contexts/AuthContext';
import enterpriseService from '../../services/Enterprise/api';
import sectorService from '../../services/Sector/api';
import type { Enterprise } from '../../services/core-api';

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
            
            // @ts-ignore
            const userOwnedEnterprises = (Array.isArray(allEnterprises.data) ? allEnterprises.data : allEnterprises).filter(
               (e: any) => e.owner === userId || e.owner_id === userId
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
   }, [user]); 

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
         toast.success('Setor criado com sucesso!');
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
      return (
          <div className="min-h-screen bg-base-200 flex flex-col items-center justify-center text-secondary">
              <Loader2 className="animate-spin text-primary mb-4" size={48} />
              <p className="font-medium">Carregando dados...</p>
          </div>
      );
   }

   return (
      <div className="min-h-screen bg-base-200 p-4 md:p-8 font-sans text-neutral">
        <div className="max-w-4xl mx-auto">
          
          {/* Cabeçalho */}
          <div className="flex items-center gap-4 mb-8">
            <button 
              onClick={() => navigate('/setores')} 
              className="btn btn-circle btn-ghost"
              title="Voltar"
            >
              <ArrowLeft size={24} className="text-secondary" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-secondary">Novo Setor</h1>
              <p className="text-sm text-gray-500">Adicione um novo setor a uma de suas empresas</p>
            </div>
          </div>

          {/* Card Centralizado */}
          <div className="card bg-base-100 shadow-xl border border-base-300 max-w-2xl mx-auto">
            <div className="card-body p-8">
              
              {/* Erro */}
              {error && (
                <div className="alert alert-error shadow-sm mb-6">
                  <AlertCircle size={20} />
                  <span>{error}</span>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                {/* Seleção de Empresa */}
                <div className="form-control w-full">
                  <label className="label">
                      <span className="label-text font-bold text-secondary">Empresa Vinculada</span>
                  </label>
                  <div className="relative">
                      <select
                         className="select select-bordered select-primary w-full pl-10 text-lg"
                         value={selectedEnterpriseId}
                         onChange={(e) => setSelectedEnterpriseId(e.target.value)}
                         required
                         disabled={ownedEnterprises.length === 0}
                      >
                         <option value="" disabled>Selecione uma empresa...</option>
                         {ownedEnterprises.length > 0 ? (
                            ownedEnterprises.map((enterprise) => (
                               <option key={enterprise.enterprise_id} value={enterprise.enterprise_id}>
                                  {enterprise.name}
                               </option>
                            ))
                         ) : (
                            <option disabled>Nenhuma empresa encontrada</option>
                         )}
                      </select>
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                  </div>
                  {ownedEnterprises.length === 0 && (
                      <div className="label">
                          <span className="label-text-alt text-warning">Você precisa ser dono de uma empresa para criar setores.</span>
                      </div>
                  )}
                </div>

                {/* Nome do Setor */}
                <div className="form-control w-full">
                  <label className="label">
                      <span className="label-text font-bold text-secondary">Nome do Setor</span>
                  </label>
                  <div className="relative">
                    <input
                       type="text"
                       className="input input-bordered input-primary w-full pl-10 text-lg"
                       value={name}
                       onChange={(e) => setName(e.target.value)}
                       required
                       placeholder="Ex: Recursos Humanos"
                    />
                    <Layout className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  </div>
                </div>

                {/* Imagem do Setor (Upload) */}
                <div className="form-control w-full">
                  <label className="label">
                      <span className="label-text font-bold text-secondary">Ícone ou Imagem</span>
                      <span className="label-text-alt text-gray-400">(Opcional)</span>
                  </label>
                  
                  <div className={`relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl transition-colors cursor-pointer group ${imageFile ? 'border-success bg-success/5' : 'border-base-300 hover:border-primary bg-base-100'}`}>
                      <input
                          type="file"
                          accept="image/jpeg, image/png, image/svg+xml"
                          onChange={handleImageChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      
                      {imageFile ? (
                          <>
                              <Check className="text-success mb-2" size={32} />
                              <p className="font-bold text-success">{imageFile.name}</p>
                              <span className="text-xs text-gray-500 mt-1">Clique para trocar</span>
                          </>
                      ) : (
                          <>
                              <UploadCloud className="text-primary mb-2 group-hover:scale-110 transition-transform" size={32} />
                              <p className="font-bold text-secondary group-hover:text-primary transition-colors">Clique ou arraste para fazer upload</p>
                              <span className="text-xs text-gray-500 mt-1">JPG, PNG ou SVG</span>
                          </>
                      )}
                  </div>
                </div>

                {/* Botão Salvar */}
                <div className="card-actions justify-end mt-4 pt-4 border-t border-base-200">
                    <button 
                       type="submit" 
                       className="btn btn-primary text-white px-8 w-full md:w-auto"
                       disabled={isLoading || isSubmitting || ownedEnterprises.length === 0}
                    >
                       {isSubmitting ? (
                          <>
                             <Loader2 className="animate-spin" size={20} />
                             Criando...
                          </>
                       ) : (
                          <>
                             <Save size={20} />
                             Criar Setor
                          </>
                       )}
                    </button>
                </div>

              </form>

            </div>
          </div>
        </div>
      </div>
   );
};

export default CreateSectorPage;