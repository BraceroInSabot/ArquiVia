import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Save, UploadCloud, Check, 
  Loader2, AlertCircle, Layers 
} from 'lucide-react'; // Ícones
import toast from 'react-hot-toast';
import sectorService from '../../services/Sector/api';

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
      toast.success('Setor atualizado com sucesso!');
      navigate(`/setor/${id}`); 

    } catch (err: any) {
      setError(err.response?.data?.detail || 'Falha ao salvar as alterações.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- RENDERIZAÇÃO ---

  if (isLoading) {
    return (
        <div className="min-h-screen bg-base-200 flex flex-col items-center justify-center text-secondary">
            <Loader2 className="animate-spin text-primary mb-4" size={48} />
            <p className="font-medium">Carregando dados...</p>
        </div>
    );
  }

  if (error && !staticData) {
    return (
        <div className="min-h-screen bg-base-200 p-8 flex flex-col items-center justify-center">
            <div className="alert alert-error shadow-lg max-w-md">
                <AlertCircle size={24} />
                <span>{error}</span>
            </div>
            <button className="btn btn-outline mt-4" onClick={handleCancel}>Voltar</button>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-8 font-sans text-neutral">
      <div className="max-w-4xl mx-auto">
        
        {/* Cabeçalho */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={handleCancel} 
            className="btn btn-circle btn-ghost"
            title="Cancelar e Voltar"
          >
            <ArrowLeft size={24} className="text-secondary" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-secondary">Editar Setor</h1>
            <p className="text-sm text-gray-500">Atualize as informações do setor</p>
          </div>
        </div>

        {/* Card Centralizado */}
        <div className="card bg-base-100 shadow-xl border border-base-300 max-w-2xl mx-auto">
          <div className="card-body p-8">

              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                
                {/* Informações Estáticas (Stats) */}
                <div className="stats shadow w-full bg-base-200/50 border border-base-300">
                    <div className="stat">
                        <div className="stat-title text-xs uppercase font-bold tracking-wider text-gray-500">Empresa</div>
                        <div className="stat-value text-lg text-secondary truncate" title={staticData?.enterprise}>{staticData?.enterprise}</div>
                    </div>
                    <div className="stat">
                        <div className="stat-title text-xs uppercase font-bold tracking-wider text-gray-500">Status</div>
                        <div className={`stat-value text-lg ${staticData?.status ? 'text-success' : 'text-gray-400'}`}>
                            {staticData?.status ? 'Ativo' : 'Inativo'}
                        </div>
                    </div>
                </div>

                {/* Campo Nome */}
                <div className="form-control w-full">
                    <label className="label">
                        <span className="label-text font-bold text-secondary">Nome do Setor</span>
                    </label>
                    <input
                        type="text"
                        className="input input-bordered input-primary w-full text-lg"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                {/* Campo Imagem (Upload Customizado com Preview) */}
                <div className="form-control w-full">
                    <label className="label">
                        <span className="label-text font-bold text-secondary">Imagem do Setor</span>
                        <span className="label-text-alt text-gray-400">(Opcional)</span>
                    </label>
                    
                    <div className="flex items-center gap-6 p-4 border-2 border-dashed border-base-300 rounded-xl hover:border-primary transition-colors bg-base-100 relative">
                        {/* Preview */}
                        <div className="avatar">
                            <div style={{display: 'flex !important',
              justifyContent: 'center !important',
              textJustify: 'auto',
              justifyItems: 'center',
              justifySelf: 'center',
              justifyTracks: 'center',
              alignItems: 'center',
              alignContent: 'center'
            }} className="w-20 h-20 rounded bg-base-200 ring ring-base-300 ring-offset-base-100 ring-offset-2 flex items-center justify-center overflow-hidden">
                                {currentImageUrl ? (
                                    <img src={currentImageUrl} alt="Preview" className="object-cover w-full h-full" />
                                ) : (
                                    <Layers size={32} className="text-gray-400" />
                                )}
                            </div>
                        </div>

                        {/* Texto e Input Invisível */}
                        <div className="flex-1">
                            <p className="font-medium text-secondary mb-1">
                                {imageFile ? imageFile.name : "Clique para alterar a imagem"}
                            </p>
                            <p className="text-xs text-gray-500">JPG, PNG ou SVG</p>
                            
                            <input
                                type="file"
                                accept="image/jpeg, image/png, image/svg+xml"
                                onChange={handleImageChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                        </div>

                        {imageFile && <Check className="text-success" size={24} />}
                        {!imageFile && <UploadCloud className="text-primary" size={24} />}
                    </div>
                </div>

                {/* Erro */}
                {error && (
                    <div className="alert alert-error shadow-sm">
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}

                {/* Botões de Ação */}
                <div className="card-actions justify-end mt-4 pt-4 border-t border-base-200">
                    <button 
                        type="button" 
                        className="btn btn-ghost text-secondary hover:bg-base-200" 
                        onClick={handleCancel}
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit" 
                        className="btn btn-primary text-white px-8"
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
                </div>

              </form>

          </div>
        </div>

      </div>
    </div>
  );
};

export default EditSectorPage;