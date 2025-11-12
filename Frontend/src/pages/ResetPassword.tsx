import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Validate from "../utils/credential_validation";
import userService from "../services/User/api";

const ResetPassword = () => {
    const { token } = useParams<{ token: string }>();
    const [p1, setP1] = useState('');
    const [p2, setP2] = useState('');
    
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [canSubmit, setCanSubmit] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            navigate('/entrar');
        }

        const validateToken = async () => {
            const response = await userService.validateToken(token as string);

            if (!response.data.sucesso) {
                navigate('/entrar');
            }
        }
        validateToken();
    }, []);

    // A função agora recebe as senhas como argumentos
    const validatePasswords = (currentP1: string, currentP2: string) => {
        // Só executa a validação completa se ambos os campos tiverem algo digitado
        if (currentP1 && currentP2) {
            const validation = Validate.password(currentP1, currentP2);
            if (!validation[0]) {   
                setError(validation[1] as string);
                setCanSubmit(false); // Desabilita o botão se houver erro
            } else {
                setError(''); // Limpa o erro se a validação passar
                setCanSubmit(true); // Habilita o botão
            }
        } else {
            // Se um dos campos estiver vazio, desabilita o botão
            setCanSubmit(false);
        }
    }

    const handleResetPassword = async () => {
        const response = await userService.resetPasswordByToken(token as string, p1)

        if (response.data.sucesso) {
            setSuccess("Senha redefinida com sucesso! Redirecionando para a tela de login...");
            setTimeout(() => {
                navigate('/entrar');
            }, 5000);
            return;
        } 

        setError("Erro ao redefinir senha. Tente novamente mais tarde.");
        return
    }
    
    return (
        <div>
            <h1>Página de Redefinição de Senha</h1>

            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}

            <label htmlFor="new-password">Insira a sua nova senha</label>
            <input type="password" name="new-password" value={p1} onChange={(e) => {
                const newP1 = e.target.value;
                setP1(newP1);
                validatePasswords(newP1, p2); // Passa o novo valor de p1 e o valor atual de p2
            }}/>
            <label htmlFor="confirm-new-password">Confirme a sua nova senha</label>
            <input type="password" name="confirm-new-password" value={p2} onChange={(e) => {
                const newP2 = e.target.value;
                setP2(newP2);
                validatePasswords(p1, newP2); // Passa o valor atual de p1 e o novo valor de p2
            }}/>

            <button onClick={handleResetPassword} disabled={(!canSubmit)} >Redefinir Senha</button>
        </div>
    )
}

export default ResetPassword;