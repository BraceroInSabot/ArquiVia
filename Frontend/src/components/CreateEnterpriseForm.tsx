import { useState } from 'react';
import Validate from '../utils/enterprise_validation';
import { useNavigate } from 'react-router-dom';
import enterpriseService from '../services/Enterprise/api';
import { Save, AlertCircle, UploadCloud, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const CreateEnterpriseForm = () => {
  const [name, setName] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setImageFile(event.target.files[0]);
    } else {
      setImageFile(null);
    }
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
        toast.error('Empresa criada com sucesso!');
        setName('');
        setImageFile(null);
        navigate("/empresas");
      }

    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Falha ao criar a empresa.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleCreateEnterprise}>
      
      {/* Erro Geral */}
      {error && (
        <div className="alert alert-danger d-flex align-items-center mb-4" role="alert">
          <AlertCircle className="me-2" size={20} />
          <div>{error}</div>
        </div>
      )}

      {/* Campo Nome */}
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
          placeholder="Ex: Minha Empresa S.A."
        />
      </div>

      {/* Campo Imagem (Estilizado) */}
      <div className="mb-4">
        <label htmlFor="image" className="form-label fw-semibold text-secondary">
          Logo da Empresa <small className="text-muted fw-normal">(Opcional)</small>
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
          
          {/* Visual Customizado do Input File */}
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

      {/* Botão de Salvar */}
      <button 
        type="submit" 
        className="btn btn-primary-custom w-100 py-2 d-flex align-items-center justify-content-center gap-2"
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            Salvando...
          </>
        ) : (
          <>
            <Save size={20} />
            Salvar Empresa
          </>
        )}
      </button>

    </form>
  );
}

export default CreateEnterpriseForm;