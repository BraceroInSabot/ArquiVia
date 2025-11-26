import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, UploadCloud, Check, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

import enterpriseService from '../../services/Enterprise/api';
import '../../assets/css/EnterprisePage.css'; // Reutiliza o CSS global de empresas

const EditEnterprisePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('ID da empresa não fornecido.');
      setLoading(false);
      return;
    }

    const fetchEnterpriseData = async () => {
      try {
        const response = await enterpriseService.getEnterpriseById(Number(id));
        // @ts-ignore
        const enterprise = response.data.data || response.data;
        
        setName(enterprise.name);
        setImageFile(null); 
        
      } catch (err) {
        setError('Falha ao carregar os dados da empresa.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEnterpriseData();
  }, [id]); 

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setImageFile(event.target.files[0]);
    } else {
      setImageFile(null);
    }
  };

  const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!id) return; 

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('name', name);
      if (imageFile) { 
        formData.append('image', imageFile);
      }
      
      await enterpriseService.updateEnterprise(Number(id), formData);

      toast.success('Empresa atualizada com sucesso!');
      
      navigate('/empresas');

    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Falha ao atualizar a empresa.';
      setError(errorMessage);
      console.error('Erro ao atualizar empresa:', err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  // --- Renderização ---

  if (loading && !name) {
    return (
      <div className="page-container d-flex justify-content-center align-items-center">
        <div className="text-center text-muted">
          <Loader2 className="animate-spin text-primary-custom mb-3" size={48} />
          <p>Carregando dados para edição...</p>
        </div>
      </div>
    );
  }

  if (error && !name) {
     return (
        <div className="page-container container py-5">
            <div className="alert alert-danger d-flex align-items-center" role="alert">
                <AlertCircle className="me-2" size={20} />
                <div>{error}</div>
            </div>
            <button className="btn btn-secondary mt-3" onClick={() => navigate('/empresas')}>Voltar</button>
        </div>
     );
  }

  return (
    <div className="page-container">
        <div className="container py-5">
            
            {/* Cabeçalho com Botão Voltar */}
            <div className="d-flex align-items-center mb-4">
                <button 
                    onClick={() => navigate('/empresas')} 
                    className="btn btn-light btn-sm me-3 text-secondary"
                    title="Cancelar e Voltar"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="h3 mb-1 fw-bold text-body-custom">Editar Empresa</h1>
                    <p className="text-muted mb-0">Atualize as informações da empresa #{id}</p>
                </div>
            </div>

            {/* Conteúdo Centralizado */}
            <div className="row justify-content-center">
                <div className="col-12 col-lg-8 col-xl-6">
                    <div className="custom-card p-4">
                        
                        <form onSubmit={handleUpdate}>
                            
                            {/* Nome */}
                            <div className="mb-4">
                                <label htmlFor="name" className="form-label fw-semibold text-secondary">
                                    Nome da Empresa
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    className="form-control form-control-lg"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Imagem (Upload Customizado) */}
                            <div className="mb-4">
                                <label htmlFor="image" className="form-label fw-semibold text-secondary">
                                    Nova Imagem <small className="text-muted fw-normal">(Opcional)</small>
                                </label>
                                
                                <div className="position-relative">
                                    <input
                                        type="file"
                                        accept="image/jpeg, image/png, image/svg+xml"
                                        id="image"
                                        className="form-control"
                                        onChange={handleImageChange}
                                        style={{ opacity: 0, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                                    />
                                    
                                    {/* Visual do Input */}
                                    <div className={`d-flex align-items-center justify-content-center p-4 border rounded-3 bg-light ${imageFile ? 'border-success' : 'border-dashed'}`}>
                                        <div className="text-center">
                                            {imageFile ? (
                                                <>
                                                    <Check className="text-success mb-2" size={32} />
                                                    <p className="mb-0 fw-medium text-success">{imageFile.name}</p>
                                                    <small className="text-muted">Arquivo selecionado para atualização</small>
                                                </>
                                            ) : (
                                                <>
                                                    <UploadCloud className="text-secondary mb-2" size={32} />
                                                    <p className="mb-0 fw-medium text-dark">Clique para alterar a imagem atual</p>
                                                    <small className="text-muted">JPG, PNG ou SVG</small>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Erro no Formulário */}
                            {error && (
                                <div className="alert alert-danger d-flex align-items-center mb-3" role="alert">
                                    <AlertCircle className="me-2" size={20} />
                                    <div>{error}</div>
                                </div>
                            )}
                            
                            {/* Botões de Ação */}
                            <div className="d-grid gap-2">
                                <button 
                                    type="submit" 
                                    className="btn btn-primary-custom py-2 d-flex align-items-center justify-content-center gap-2"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="animate-spin" size={20} />
                                            Salvando...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={20} />
                                            Salvar Alterações
                                        </>
                                    )}
                                </button>
                                
                                <button 
                                    type="button" 
                                    className="btn btn-light text-secondary" 
                                    onClick={() => navigate('/empresas')}
                                    disabled={loading}
                                >
                                    Cancelar
                                </button>
                            </div>

                        </form>

                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default EditEnterprisePage;