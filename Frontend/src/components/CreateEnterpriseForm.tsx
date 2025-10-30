import { useState } from 'react';
import Validate from '../utils/enterprise_validation';
import { useNavigate } from 'react-router-dom';
import enterpriseService from '../services/Enterprise/api';

const CreateEnterpriseForm = () => {
    const [name, setName] = useState('');
    // 1. Mude o estado para 'File | null'
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    // 2. Adicione um handler para o input de arquivo
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
              setLoading(false); // Pare o loading se a validação falhar
              return;
            }

            // 3. Verifique se um arquivo foi selecionado
            if (!imageFile) {
              setError("Por favor, selecione uma imagem.");
              setLoading(false);
              return;
            }
            
            // 4. Crie o FormData
            const formData = new FormData();
            formData.append('name', name);
            formData.append('image', imageFile);

            // 5. Envie o formData para o serviço
            const api_response = await enterpriseService.createEnterprise(formData);

            if (api_response) {
                alert('Empresa criada com sucesso!');
                setName('');
                setImageFile(null); // Limpe o estado do arquivo
                navigate("/empresas");
            }

        } catch (err: any) {
            const errorMessage = err.response?.data?.detail || 'Falha ao criar a empresa.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleCreateEnterprise}>
            <div>
                <h2>Cadastrar Nova Empresa</h2>
                <label htmlFor="name">Nome da Empresa</label>
                <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <br />
                {/* 6. Mude o input para 'file' e adicione 'accept' */}
                <label htmlFor="image">Imagem da Empresa (JPG, PNG, SVG)</label>
                <input
                    type="file"
                    id="image"
                      accept="image/jpeg, image/png, image/svg+xml"
                      onChange={handleImageChange}
                    required
                />
                <br />
                <button type="submit" disabled={loading}>
                    {loading ? 'Salvando...' : 'Salvar Empresa'}
                </button>

                {error && <p style={{ color: 'red' }}>{error}</p>}
            </div>
        </form>
    )
}

export default CreateEnterpriseForm;