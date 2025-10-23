import { useState } from 'react';
import Validate from '../utils/enterprise_validation';
import { useNavigate } from 'react-router-dom';
import enterpriseService from '../services/Enterprise/api';


const CreateEnterpriseForm = () => {
    const [name, setName] = useState('');
    const [image, setImage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();


    const handleCreateEnterprise = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setError(null);

        try {
        
            const nameValidation = Validate.name(name);
            if (!nameValidation[0]) {
            setError(nameValidation[1] as string);
            return;
            }
            
            const api_response = await enterpriseService.createEnterprise({ name, image });

            if (api_response) {
                alert('Empresa criada com sucesso!');
                
                setName('');
                setImage('');

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
                <label htmlFor="image">Caminho da Imagem</label>
                <input
                    type="text"
                    id="image"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
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