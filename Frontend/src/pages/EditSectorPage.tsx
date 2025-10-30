import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import sectorService from '../services/Sector/api';

const EditSectorPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('');
  const [name, setName] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null); // Changed to File | null
  
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
 setImageFile(null); // Clear image file on load, user will re-upload if needed
    
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
      setImageFile(event.target.files[0]);
      setCurrentImageUrl(URL.createObjectURL(event.target.files[0]));
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

  if (isLoading) {
    return <p>Carregando dados para edição...</p>;
  }

  if (error && !staticData) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  console.log("Current Image File:", imageFile);
  return (
    <div style={{ padding: '20px' }}>
      <form onSubmit={handleSubmit}>
        <div style={{ border: '1px solid #ccc', padding: '16px', borderRadius: '8px', marginBottom: '40px' }}>
          <h2 style={{ marginTop: 0 }}>Editando Setor: {name}</h2>
          
          <p><strong>Empresa:</strong> {staticData?.enterprise}</p>
          <p><strong>Status:</strong> {staticData?.status ? 'Ativo' : 'Inativo'}</p>

          <hr/>
          
          <div style={{ margin: '15px 0' }}>
            <label htmlFor="name" style={{ display: 'block', fontWeight: 'bold' }}>Nome do Setor:</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%', padding: '8px' }}
            />
          </div>

          <div style={{ margin: '15px 0' }}>
            <label htmlFor="image" style={{ display: 'block', fontWeight: 'bold' }}>Imagem do Setor (JPG, PNG, SVG):</label>
            <img src={currentImageUrl} alt="" />
            <input
              type="file"
              id="image"
 accept="image/jpeg, image/png, image/svg+xml"
              onChange={handleImageChange}
              style={{ width: '100%', padding: '8px' }}
 // value={imageFile ? imageFile.name : ''} // Display selected file name
            />
          </div>
        </div>

        <div>
          <button type="submit" disabled={isSubmitting} style={{ marginRight: '10px' }}>
            {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
          </button>
          <button type="button" onClick={handleCancel} disabled={isSubmitting}>
            Cancelar
          </button>
        </div>

        {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
      </form>
    </div>
  );
};

export default EditSectorPage;