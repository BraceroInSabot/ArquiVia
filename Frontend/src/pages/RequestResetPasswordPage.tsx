import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Send, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'; // Ícones

import userService from '../services/User/api';
import { type RequestPasswordReset } from '../services/core-api';

// Reutiliza o CSS da página de Login para manter consistência (fundo, centralização)
import '../assets/css/LoginPage.css'; 

const RequestResetPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSendEmail = async (e: React.FormEvent) => {
        e.preventDefault(); // Evita recarregamento da página
        
        if (!email) {
            setError("Por favor, digite seu e-mail.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            // Chama o serviço
            const response = await userService.requestPasswordReset({ email } as RequestPasswordReset);

            // Se chegou aqui sem cair no catch, assumimos sucesso ou verificamos response
            if (response) {
                setSuccess('E-mail enviado! Verifique sua caixa de entrada (e spam) para redefinir sua senha.');
            } else {
                setError("Não foi possível enviar o e-mail. Tente novamente.");
            }
        } catch (err: any) {
            console.error(err);
            // Mensagem genérica ou vinda do backend
            setError("Erro ao solicitar redefinição. Verifique se o e-mail está correto.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page-container">
            <div className="login-content" style={{ maxWidth: '450px' }}>
                
                {/* Cabeçalho */}
                <div className="login-header mb-4 text-center">
                    <h1 className="logo-text text-primary-custom fw-bold">Recuperar Senha</h1>
                    <p className="text-muted">Informe seu e-mail para receber o link de redefinição.</p>
                </div>

                <div className="login-card shadow-sm p-4">
                    
                    {/* Estado de Sucesso */}
                    {success ? (
                        <div className="text-center py-3">
                            <div className="mb-3 text-success">
                                <CheckCircle2 size={48} className="mx-auto" />
                            </div>
                            <h5 className="fw-bold text-dark">Verifique seu e-mail</h5>
                            <p className="text-muted small mb-4">{success}</p>
                            
                            <button 
                                onClick={() => navigate('/entrar')} 
                                className="btn btn-outline-secondary w-100"
                            >
                                Voltar para o Login
                            </button>
                        </div>
                    ) : (
                        /* Estado de Formulário */
                        <form onSubmit={handleSendEmail}>
                            
                            {/* Alerta de Erro */}
                            {error && (
                                <div className="alert alert-danger d-flex align-items-center p-2 small mb-3" role="alert">
                                    <AlertCircle className="me-2 flex-shrink-0" size={16} />
                                    <div>{error}</div>
                                </div>
                            )}

                            <div className="mb-4">
                                <label htmlFor="email" className="form-label small fw-bold text-secondary text-uppercase">
                                    E-mail Cadastrado
                                </label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-end-0 text-muted">
                                        <Mail size={18} />
                                    </span>
                                    <input 
                                        type="email" 
                                        id="email"
                                        name="email" 
                                        className="form-control border-start-0 ps-0 bg-light"
                                        placeholder="exemplo@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className="d-grid gap-2">
                                <button 
                                    type="submit" 
                                    className="btn btn-primary-custom py-2 fw-bold d-flex align-items-center justify-content-center gap-2"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="animate-spin" size={20} />
                                            Enviando...
                                        </>
                                    ) : (
                                        <>
                                            <Send size={18} />
                                            Enviar Link
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* Rodapé / Voltar */}
                {!success && (
                    <div className="text-center mt-4">
                        <button 
                            onClick={() => navigate('/entrar')} 
                            className="btn btn-link text-decoration-none text-muted d-flex align-items-center justify-content-center gap-2 mx-auto"
                            style={{ fontSize: '0.9rem' }}
                        >
                            <ArrowLeft size={16} />
                            Voltar para o Login
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default RequestResetPassword;