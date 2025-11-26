import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, UploadCloud, Check, Loader2, AlertCircle, Building2 } from 'lucide-react'; // Ícones
import toast from 'react-hot-toast';

import { useAuth } from '../../contexts/AuthContext';
import enterpriseService from '../../services/Enterprise/api';
import sectorService from '../../services/Sector/api';
import type { Enterprise } from '../../services/core-api';
import '../../assets/css/EnterprisePage.css'; // Reutiliza CSS global

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

   // --- LÓGICA (INTACTA) ---
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
            
            // @ts-ignore (Ajuste se necessário conforme sua API real)
            const userOwnedEnterprises = (Array.isArray(allEnterprises.data) ? allEnterprises.data : allEnterprises).filter(
               (e: any) => e.owner === userId || e.owner_id === userId // Verifica ambos os campos possíveis
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
   // --- FIM DA LÓGICA ---


   // --- RENDERIZAÇÃO ---

   if (isLoading) {
      return (
          <div className="page-container d-flex justify-content-center align-items-center">
              <div className="text-center text-muted">
                  <Loader2 className="animate-spin text-primary-custom mb-3" size={48} />
                  <p>Carregando dados...</p>
              </div>
          </div>
      );
   }

   return (
      <div className="page-container">
        <div className="container py-5">
          
          {/* Cabeçalho */}
          <div className="d-flex align-items-center mb-4">
            <button 
              onClick={() => navigate('/setores')} 
              className="btn btn-light btn-sm me-3 text-secondary"
              title="Voltar"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="h3 mb-1 fw-bold text-body-custom">Novo Setor</h1>
              <p className="text-muted mb-0">Adicione um novo setor a uma de suas empresas</p>
            </div>
          </div>

          {/* Card Centralizado */}
          <div className="row justify-content-center">
            <div className="col-12 col-lg-8 col-xl-6">
              <div className="custom-card p-4">
                
                <form onSubmit={handleSubmit}>
                  
                  {/* Mensagem de Erro */}
                  {error && (
                    <div className="alert alert-danger d-flex align-items-center mb-4" role="alert">
                      <AlertCircle className="me-2" size={20} />
                      <div>{error}</div>
                    </div>
                  )}

                  {/* Seleção de Empresa */}
                  <div className="mb-4">
                    <label htmlFor="enterprise" className="form-label fw-semibold text-secondary">
                        Empresa Vinculada
                    </label>
                    <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                            <Building2 size={18} className="text-muted" />
                        </span>
                        <select
                           id="enterprise"
                           className="form-select form-select-lg border-start-0 ps-0 bg-light"
                           value={selectedEnterpriseId}
                           onChange={(e) => setSelectedEnterpriseId(e.target.value)}
                           required
                           disabled={ownedEnterprises.length === 0}
                        >
                           <option value="">Selecione uma empresa...</option>
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
                    </div>
                    {ownedEnterprises.length === 0 && (
                        <div className="form-text text-warning mt-2">
                            Você precisa ser dono de uma empresa para criar setores.
                        </div>
                    )}
                  </div>

                  {/* Nome do Setor */}
                  <div className="mb-4">
                    <label htmlFor="name" className="form-label fw-semibold text-secondary">
                        Nome do Setor
                    </label>
                    <input
                       type="text"
                       id="name"
                       className="form-control form-control-lg"
                       value={name}
                       onChange={(e) => setName(e.target.value)}
                       required
                       placeholder="Ex: Recursos Humanos"
                    />
                  </div>

                  {/* Imagem do Setor (Upload) */}
                  <div className="mb-4">
                    <label htmlFor="image" className="form-label fw-semibold text-secondary">
                        Ícone ou Imagem <small className="text-muted fw-normal">(Opcional)</small>
                    </label>
                    
                    <div className="position-relative">
                        <input
                            type="file"
                            id="image"
                            className="form-control"
                            accept="image/jpeg, image/png, image/svg+xml"
                            onChange={handleImageChange}
                            style={{ opacity: 0, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                        />
                        
                        <div className={`d-flex align-items-center justify-content-center p-4 border rounded-3 bg-light ${imageFile ? 'border-success' : 'border-dashed'}`}>
                            <div className="text-center">
                                {imageFile ? (
                                    <>
                                        <Check className="text-success mb-2" size={32} />
                                        <p className="mb-0 fw-medium text-success">{imageFile.name}</p>
                                        <small className="text-muted">Clique para trocar</small>
                                    </>
                                ) : (
                                    <>
                                        <UploadCloud className="text-secondary mb-2" size={32} />
                                        <p className="mb-0 fw-medium text-dark">Clique ou arraste para fazer upload</p>
                                        <small className="text-muted">JPG, PNG ou SVG</small>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                  </div>

                  {/* Botão Salvar */}
                  <button 
                     type="submit" 
                     className="btn btn-primary-custom w-100 py-2 d-flex align-items-center justify-content-center gap-2"
                     disabled={isLoading || isSubmitting || ownedEnterprises.length === 0}
                  >
                     {isSubmitting ? (
                        <>
                           <Loader2 className="animate-spin" size={20} />
                           Criando Setor...
                        </>
                     ) : (
                        <>
                           <Save size={20} />
                           Criar Setor
                        </>
                     )}
                  </button>

                </form>

              </div>
            </div>
          </div>
        </div>
      </div>
   );
};

export default CreateSectorPage;