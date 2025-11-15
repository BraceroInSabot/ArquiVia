import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Lock, Save, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'; // Ícones

import Validate from "../utils/credential_validation";
import userService from "../services/User/api";

// Reutiliza o CSS da página de Login
import '../assets/css/LoginPage.css'; 

const ResetPassword = () => {
    const { token } = useParams<{ token: string }>();
    const [p1, setP1] = useState('');
    const [p2, setP2] = useState('');
    
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [canSubmit, setCanSubmit] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false); // Estado de loading para o botão

    const navigate = useNavigate();

    // Lógica de validação do token (INTACTA)
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

    // Lógica de validação das senhas (INTACTA)
    const validatePasswords = (currentP1: string, currentP2: string) => {
        if (currentP1 && currentP2) {
            const validation = Validate.password(currentP1, currentP2);
            if (!validation[0]) {  
                setError(validation[1] as string);
                setCanSubmit(false);
            } else {
                setError('');
                setCanSubmit(true);
            }
        } else {
            setCanSubmit(false);
        }
    }

    // Lógica de envio (Atualizada com try/catch e loading)
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        
        setIsSubmitting(true);
        setError('');
        setSuccess('');

        try {
            const response = await userService.resetPasswordByToken(token as string, p1)

            if (response.data.sucesso) {
                setSuccess("Senha redefinida com sucesso! Redirecionando para a tela de login...");
                setTimeout(() => {
                    navigate('/entrar');
                }, 3000);
                return;
            } 
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || "Erro ao redefinir senha. Tente novamente mais tarde.");
        } finally {
            setIsSubmitting(false);
        }
    }
    
    return (
        <div className="login-page-container">
            <div className="login-content" style={{ maxWidth: '450px' }}>

                <div className="login-header mb-4 text-center">
                    <h1 className="logo-text text-primary-custom fw-bold">ArquiVia</h1>
                    <p className="text-muted">Defina sua nova senha de acesso.</p>
                </div>

                <div className="login-card shadow-sm p-4">
                    <form onSubmit={handleResetPassword}>

                        {/* Mensagem de Erro */}
                        {error && (
                            <div className="alert alert-danger d-flex align-items-center p-2 small mb-3" role="alert">
                                <AlertCircle className="me-2 flex-shrink-0" size={16} />
                                <div>{error}</div>
                            </div>
                        )}
                        
                        {/* Mensagem de Sucesso */}
                        {success && (
                            <div className="alert alert-success d-flex align-items-center p-2 small mb-3" role="alert">
                                <CheckCircle2 className="me-2 flex-shrink-0" size={16} />
                                <div>{success}</div>
                            </div>
                        )}

                        {/* Oculta o formulário se o sucesso for exibido */}
                        {!success && (
                            <>
                                <div className="mb-3">
                                    <label htmlFor="new-password" className="form-label small fw-bold text-secondary text-uppercase">
                                        Nova Senha
                                    </label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-end-0 text-muted">
                                            <Lock size={18} />
                                        </span>
                                        <input 
                                            type="password" 
                                            name="new-password" 
                                            id="new-password"
                                            className="form-control border-start-0 ps-0 bg-light"
                                            value={p1} 
                                            onChange={(e) => {
                                                const newP1 = e.target.value;
                                                setP1(newP1);
                                                validatePasswords(newP1, p2);
                                            }}
                                        />
                                    </div>
                                </div>
                                
                                <div className="mb-4">
                                    <label htmlFor="confirm-new-password" className="form-label small fw-bold text-secondary text-uppercase">
                                        Confirmar Nova Senha
                                    </label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-end-0 text-muted">
                                            <Lock size={18} />
                                        </span>
                                        <input 
                                            type="password" 
                                            name="confirm-new-password" 
                                            id="confirm-new-password"
                                            className="form-control border-start-0 ps-0 bg-light"
                                            value={p2} 
                                            onChange={(e) => {
                                                const newP2 = e.target.value;
                                                setP2(newP2);
                                                validatePasswords(p1, newP2);
                                            }}
                                        />
                                    </div>
                                </div>

                                <button 
                                    type="submit"
                                    className="btn btn-primary-custom w-100 py-2 d-flex align-items-center justify-content-center gap-2 fw-bold"
                                    disabled={!canSubmit || isSubmitting} 
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="animate-spin" size={20} />
                                            Salvando...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={20} />
                                            Redefinir Senha
                                        </>
                                    )}
                                </button>
                            </>
                        )}
                    </form>
                </div>
            </div>
        </div>
    )
}

export default ResetPassword;