import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import userService from '../services/User/api';
import { type RequestPasswordReset } from '../services/core-api';

const RequestResetPassword = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSendEmail = async () => {
        const response = await userService.requestPasswordReset({email} as RequestPasswordReset);

        if (!response) {
            setError("E-mail não enviado. Tente novamente mais tarde.");

            return false
        }
        
        setSuccess('E-mail enviado para sua caixa de entrada. Se não receber o email dentro de alguns minutos, verifique a sua caixa de spam.');
        return true;
    }
    return (
        <div>
            <h1>Página de Redefinição de Senha</h1>

                {error && <p style={{ color: 'red' }}>{error}</p>}
                {success && <p style={{ color: 'green' }}>{success}</p>}

                <label htmlFor="email">Insira o seu E-mail</label><br />
                <input type="text" name="email" onChange={(e) => {
                    const emailInput = e.target.value;
                    setEmail(emailInput);
                }} /><br />

                <button onClick={handleSendEmail}>Solicitar E-mail de Redefinição de Senha</button>

        </div>
    )
}

export default RequestResetPassword;