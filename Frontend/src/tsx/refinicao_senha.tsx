import { useNavigate } from "react-router-dom";
import { redefinirSenha } from "../api/apiHandler";

const verificarConfirmacaoSenha = (p:string, cP:string) => {
    console.log(p, cP)
    if (p !== cP) {
      return false;
    } else {
      return true;
    }
};

const handlePasswordChange = async (
    isValid: boolean, 
    token: string | undefined, 
    password: string,
    setMessage: (msg: string) => void,
    navigate: (path: string) => void
) => {
    if (!isValid) {
        setMessage("Token inválido ou expirado.");
        return;
    }

    const success = await redefinirSenha({ token: String(token), password });

    if (success) {
        setMessage("Senha alterada com sucesso! Redirecionando...");
        setTimeout(() => navigate('/login'), 2000);
    } else {
        setMessage("Houve um erro no momento de redefinir a senha.");
    }
};

export {handlePasswordChange, verificarConfirmacaoSenha};