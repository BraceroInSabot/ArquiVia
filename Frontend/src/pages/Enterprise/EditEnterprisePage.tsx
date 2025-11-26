import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, UploadCloud, Check, Loader2, AlertCircle, Layers } from 'lucide-react';
import toast from 'react-hot-toast';

import enterpriseService from '../../services/Enterprise/api';

const EditEnterprisePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('');
  
  // Dados estáticos para exibição (Read-only)
  const [staticData, setStaticData] = useState<{ created: string; status: boolean } | null>(null);

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
        // @ts-ignore (Ajuste conforme sua resposta real)
        const enterprise = response.data.data || response.data;
        
        setName(enterprise.name);
        setCurrentImageUrl(enterprise.image);
        setImageFile(null);
        
        setStaticData({
            created: enterprise.created_at,
            status: enterprise.is_active
        });
        
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
      const file = event.target.files[0];
      setImageFile(file);
      setCurrentImageUrl(URL.createObjectURL(file)); // Preview instantâneo
    } else {
      setImageFile(null);
    }
  };

  const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!id) return; 

    setIsSubmitting(true);
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
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Renderização ---

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex flex-col items-center justify-center text-secondary">
        <Loader2 className="animate-spin text-primary mb-4" size={48} />
        <p className="font-medium">Carregando dados...</p>
      </div>
    );
  }

  if (error && !name) {
     return (
        <div className="min-h-screen bg-base-200 p-8 flex flex-col items-center justify-center">
            <div className="alert alert-error shadow-lg max-w-md">
                <AlertCircle size={24} />
                <span>{error}</span>
            </div>
            <button className="btn btn-outline mt-4" onClick={() => navigate('/empresas')}>Voltar</button>
        </div>
     );
  }

  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-8 font-sans text-neutral">
        <div className="max-w-4xl mx-auto">

            {/* Card Principal */}
            <div className="card bg-base-100 shadow-xl border border-base-300">
                <div className="card-body">
                    
                    <form onSubmit={handleUpdate} className="flex flex-col gap-6">
                        
                        {/* Informações Estáticas */}
                        <div className="stats shadow w-full bg-base-200/50 border border-base-300">
                            <div className="stat">
                                <div className="stat-title text-xs uppercase font-bold tracking-wider text-gray-500">Criado em</div>
                                <div className="stat-value text-lg text-secondary">
                                    {staticData?.created ? new Date(staticData.created).toLocaleDateString() : '-'}
                                </div>
                            </div>
                            <div className="stat">
                                <div className="stat-title text-xs uppercase font-bold tracking-wider text-gray-500">Status</div>
                                <div className={`stat-value text-lg ${staticData?.status ? 'text-success' : 'text-gray-400'}`}>
                                    {staticData?.status ? 'Ativo' : 'Inativo'}
                                </div>
                            </div>
                        </div>

                        {/* Nome */}
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text font-bold text-secondary">Nome da Empresa</span>
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="input input-bordered input-primary w-full text-lg"
                            />
                        </div>

                        {/* Imagem (Upload Customizado) */}
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text font-bold text-secondary">Logo da Empresa</span>
                                <span className="label-text-alt text-gray-400">(Opcional)</span>
                            </label>

                            <div className="flex items-center gap-6 p-4 border-2 border-dashed border-base-300 rounded-xl hover:border-primary transition-colors bg-base-100 relative">
                                {/* Preview */}
                                <div className="avatar">
                                    <div className="w-24 rounded bg-base-200 ring ring-base-300 ring-offset-base-100 ring-offset-2 flex items-center justify-center">
                                        {currentImageUrl ? (
                                            <img src={currentImageUrl} alt="Preview" className="object-cover" />
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
                                    <p className="text-xs text-gray-500">JPG, PNG ou SVG (Máx. 5MB)</p>
                                    
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
                        
                        {/* Ações */}
                        <div className="card-actions justify-end mt-4 pt-4 border-t border-base-200">
                            <button 
                                type="button" 
                                className="btn btn-ghost text-secondary hover:bg-base-200" 
                                onClick={() => navigate('/empresas')}
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

export default EditEnterprisePage;