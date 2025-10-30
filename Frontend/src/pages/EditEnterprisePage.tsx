import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import enterpriseService from '../services/Enterprise/api';

const EditEnterprisePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null); // Changed from 'image' to 'imageFile'
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
        const enterprise = response.data;
        
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

      alert('Empresa atualizada com sucesso!');
      
      navigate('/empresas');

    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Falha ao atualizar a empresa.';
      setError(errorMessage);
      console.error('Erro ao atualizar empresa:', err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !name) {
    return <p>Carregando dados para edição...</p>;
  }

  if (error && !name) {
     return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <form onSubmit={handleUpdate}>
      <div>
        <h2>Editar Empresa (ID: {id})</h2>
        <label htmlFor="name">Nome da Empresa</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <br />
        <label htmlFor="image">Imagem da Empresa (JPG, PNG, SVG)</label>
        <input
          type="file"
          accept="image/jpeg, image/png, image/svg+xml"
          id="image"
          onChange={handleImageChange}
        />
        <br />
        
        <button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </button>
        
        <button type="button" onClick={() => navigate('/empresas')}>
          Cancelar
        </button>

        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    </form>
  );
};

export default EditEnterprisePage;