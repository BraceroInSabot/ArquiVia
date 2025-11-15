import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Save, UploadCloud, Check, 
  Loader2, AlertCircle, Layers 
} from 'lucide-react'; // Ícones

import sectorService from '../services/Sector/api';
import '../assets/css/EnterprisePage.css'; // Reutiliza o CSS global

const EditSectorPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('');
  const [name, setName] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const [staticData, setStaticData] = useState<{ enterprise: string; created: string; status: boolean } | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        const sector = response.data.data; 

        setName(sector.name);
        setCurrentImageUrl(sector.image);
        setImageFile(null); 
    
        setStaticData({
          enterprise: sector.enterprise_name,
          created: sector.creation_date,
          status: sector.is_active,
        });

      } catch (err) {
        console.error("Falha ao carregar dados do setor:", err);
        setError("Não foi possível carregar os dados.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSectorData();
  }, [id]);

  const handleCancel = () => {
    navigate(-1); 
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setImageFile(file);
      setCurrentImageUrl(URL.createObjectURL(file));
    } else {
      setImageFile(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!id) return;

    setIsSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append('name', name);
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      await sectorService.updateSector(Number(id), formData);
      alert('Setor atualizado com sucesso!');
      navigate(`/setor/${id}`); 

    } catch (err: any) {
      setError(err.response?.data?.detail || 'Falha ao salvar as alterações.');
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
                <p>Carregando dados para edição...</p>
            </div>
        </div>
    );
  }

  if (error && !staticData) {
    return (
        <div className="page-container container py-5">
            <div className="alert alert-danger d-flex align-items-center" role="alert">
                <AlertCircle className="me-2" size={20} />
                <div>{error}</div>
            </div>
            <button className="btn btn-secondary mt-3" onClick={handleCancel}>Voltar</button>
        </div>
    );
  }

  return (
    <div className="page-container">
      <div className="container py-5">
        
        {/* Cabeçalho */}
        <div className="d-flex align-items-center mb-4">
          <button 
            onClick={handleCancel} 
            className="btn btn-light btn-sm me-3 text-secondary"
            title="Cancelar e Voltar"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="h3 mb-1 fw-bold text-body-custom">Editar Setor</h1>
            <p className="text-muted mb-0">Atualize as informações do setor</p>
          </div>
        </div>

        {/* Conteúdo Centralizado */}
        <div className="row justify-content-center">
          <div className="col-12 col-lg-8 col-xl-6">
            <div className="custom-card p-4">

              <form onSubmit={handleSubmit}>
                
                {/* Informações Estáticas (Somente Leitura) */}
                <div className="mb-4 bg-light p-3 rounded border">
                    <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted small fw-bold text-uppercase">Empresa</span>
                        <span className="fw-semibold text-dark">{staticData?.enterprise}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                        <span className="text-muted small fw-bold text-uppercase">Status</span>
                        <span className={`badge ${staticData?.status ? 'bg-success' : 'bg-secondary'}`}>
                            {staticData?.status ? 'Ativo' : 'Inativo'}
                        </span>
                    </div>
                </div>

                {/* Campo Nome */}
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
                    />
                </div>

                {/* Campo Imagem (Upload Customizado com Preview) */}
                <div className="mb-4">
                    <label htmlFor="image" className="form-label fw-semibold text-secondary">
                        Imagem do Setor <small className="text-muted fw-normal">(Opcional)</small>
                    </label>
                    
                    <div className="d-flex gap-3 align-items-start">
                        {/* Preview da Imagem Atual/Nova */}
                        <div 
                            className="flex-shrink-0 rounded overflow-hidden border bg-white d-flex align-items-center justify-content-center"
                            style={{ width: '80px', height: '80px' }}
                        >
                             {currentImageUrl ? (
                                <img src={currentImageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <Layers size={32} className="text-secondary opacity-50" />
                            )}
                        </div>

                        {/* Input de Arquivo */}
                        <div className="flex-grow-1 position-relative">
                            <input
                                type="file"
                                id="image"
                                className="form-control"
                                accept="image/jpeg, image/png, image/svg+xml"
                                onChange={handleImageChange}
                                style={{ opacity: 0, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor: 'pointer', zIndex: 2 }}
                            />
                            
                            {/* Visual do Input */}
                            <div className={`d-flex align-items-center justify-content-center p-3 border rounded-3 bg-light h-100 ${imageFile ? 'border-success' : 'border-dashed'}`}>
                                <div className="text-center">
                                    {imageFile ? (
                                        <div className="d-flex align-items-center gap-2 text-success">
                                            <Check size={20} />
                                            <span className="fw-medium small text-truncate" style={{ maxWidth: '180px' }}>{imageFile.name}</span>
                                        </div>
                                    ) : (
                                        <div className="d-flex align-items-center gap-2 text-secondary">
                                            <UploadCloud size={20} />
                                            <span className="fw-medium small">Alterar Imagem</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Erro */}
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
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
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
                        onClick={handleCancel}
                        disabled={isSubmitting}
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

export default EditSectorPage;