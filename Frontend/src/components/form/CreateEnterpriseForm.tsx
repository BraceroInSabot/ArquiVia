import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, AlertCircle, UploadCloud, Building, Image as ImageIcon, X } from 'lucide-react';
import enterpriseService from '../../services/Enterprise/api';
import Validate from '../../utils/enterprise_validation';

const CreateEnterpriseForm = () => {
  const [name, setName] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  // Novo estado para o preview
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Limpeza de memória do preview quando o componente desmonta ou a imagem muda
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setImageFile(file);
      
      // Gera a URL de pré-visualização
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);
    } 
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.preventDefault(); // Previne abrir o seletor de arquivos
    e.stopPropagation();
    setImageFile(null);
    setImagePreview(null);
    // Reseta o input file (necessário se for selecionar o mesmo arquivo novamente)
    const input = document.getElementById('image') as HTMLInputElement;
    if (input) input.value = '';
  };

  const handleCreateEnterprise = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const nameValidation = Validate.name(name);
      if (!nameValidation[0]) {
        setError(nameValidation[1] as string);
        setLoading(false);
        return;
      }
      
      const formData = new FormData();
      formData.append('name', name);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const api_response = await enterpriseService.createEnterprise(formData);

      if (api_response) {
        navigate("/empresas");
      }

    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Falha ao criar a empresa.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/empresas');
  };

  return (
    <form onSubmit={handleCreateEnterprise} className="flex flex-col gap-6">
      
      {/* Erro Geral */}
      {error && (
        <div className="alert alert-error shadow-sm">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Campo Nome */}
      <div className="form-control w-full">
        <label htmlFor="name" className="label">
          <span className="label-text font-bold text-secondary">Nome da Empresa</span>
        </label>
        <div className="relative">
            <input
            type="text"
            id="name"
            className="input input-bordered input-primary w-full pl-10 text-lg"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Ex: Minha Empresa S.A."
            />
            <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        </div>
      </div>

      {/* Campo Imagem (Com Preview) */}
      <div className="form-control w-full">
        <label htmlFor="image" className="label">
          <span className="label-text font-bold text-secondary">Logo da Empresa</span>
          <span className="label-text-alt text-gray-400">(Opcional)</span>
        </label>
        
        <div className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl transition-all overflow-hidden group
            ${imagePreview ? 'border-primary bg-base-100 p-0' : 'border-base-300 hover:border-primary bg-base-100 p-8'}`}
            style={{ minHeight: '200px' }}
        >
          {/* Input Invisível (cobre toda a área) */}
          <input
            type="file"
            id="image"
            accept="image/jpeg, image/png, image/svg+xml"
            onChange={handleImageChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          
          {imagePreview ? (
            // Estado: COM IMAGEM
            <div className="relative w-full h-full flex items-center justify-center bg-base-200">
               {/* Imagem Preview */}
               <img 
                 src={imagePreview} 
                 alt="Preview" 
                 className="max-h-[300px] w-auto object-contain shadow-sm"
               />
               
               {/* Overlay de Ação ao passar o mouse */}
               <div style={{paddingTop: '15%'} } className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity text-white pointer-events-none z-10">
                <ImageIcon size={32} className="mb-2" />
                <p className="font-bold">Clique para trocar</p>
              </div>

               {/* Botão de Remover (precisa de z-index maior que o input) */}
               <button 
                  type="button"
                  onClick={handleRemoveImage}
                  className="btn btn-circle btn-sm btn-error absolute top-2 right-2 z-20 shadow-md"
                  title="Remover imagem"
               >
                  <X size={16} color="white" />
               </button>
            </div>
          ) : (
            // Estado: SEM IMAGEM
            <>
              <div className="bg-base-200 p-4 rounded-full mb-3 group-hover:scale-110 transition-transform">
                 <UploadCloud className="text-primary" size={32} />
              </div>
              <p className="font-bold text-secondary group-hover:text-primary transition-colors">
                Clique ou arraste para fazer upload
              </p>
              <span className="text-xs text-gray-500 mt-1">JPG, PNG ou SVG</span>
            </>
          )}
        </div>
      </div>

      {/* Botão de Salvar */}
      <div className="card-actions justify-end mt-4">
        <button className='btn btn-ghost text-secondary hover:bg-base-200' onClick={handleCancel}>
          Cancelar
        </button>
          <button 
            type="submit" 
            className="btn btn-primary text-white w-full md:w-auto px-8"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Salvando...
              </>
            ) : (
              <>
                <Save size={20} />
                Criar Empresa
              </>
            )}
          </button>
      </div>

    </form>
  );
}

export default CreateEnterpriseForm;