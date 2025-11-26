import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Send, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

import userService from '../../services/User/api';
import { type RequestPasswordReset } from '../../services/core-api';

const RequestResetPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const goToIndex = () => {
        navigate("/");
    };

    const handleSendEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!email) {
            setError("Por favor, digite seu e-mail.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await userService.requestPasswordReset({ email } as RequestPasswordReset);

            if (response) {
                setSuccess('E-mail enviado! Verifique sua caixa de entrada (e spam) para redefinir sua senha.');
            } else {
                setError("Não foi possível enviar o e-mail. Tente novamente.");
            }
        } catch (err: any) {
            console.error(err);
            setError("Erro ao solicitar redefinição. Verifique se o e-mail está correto.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-base-100 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 
                        className="text-4xl font-bold text-primary cursor-pointer hover:opacity-80 transition-opacity mb-2 no-underline hover:no-underline"
                        onClick={goToIndex}
                    >
                        ArquiVia
                    </h1>
                    <h2 className="text-2xl font-bold text-secondary mb-2">Recuperar Senha</h2>
                    <p className="text-secondary/70">
                        Informe seu e-mail para receber o link de redefinição.
                    </p>
                </div>

                {/* Card */}
                <div className="card bg-white shadow-xl border border-gray-100">
                    <div className="card-body">
                        {/* Success State */}
                        {success ? (
                            <div className="text-center py-4">
                                <div className="mb-4 flex justify-center">
                                    <div className="rounded-full bg-success/10 p-4">
                                        <CheckCircle2 className="w-12 h-12 text-success" />
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-secondary mb-3">
                                    Verifique seu e-mail
                                </h3>
                                <p className="text-secondary/70 text-sm mb-6">
                                    {success}
                                </p>
                                <button 
                                    onClick={() => navigate('/entrar')} 
                                    className="btn btn-primary text-white w-full font-semibold"
                                >
                                    Voltar para o Login
                                </button>
                            </div>
                        ) : (
                            /* Form State */
                            <form onSubmit={handleSendEmail} className="space-y-4">
                                {/* Error Alert */}
                                {error && (
                                    <div className="alert alert-error shadow-lg">
                                        <AlertCircle className="w-5 h-5" />
                                        <span className="text-sm">{error}</span>
                                    </div>
                                )}

                                {/* Email Field */}
                                <div className="form-control">
                                    <label className="label" htmlFor="email">
                                        <span className="label-text font-semibold text-secondary text-xs uppercase tracking-wide">
                                            E-mail Cadastrado
                                        </span>
                                        <span className="bg-base-000 border-r-0">
                                            <Mail className="w-5 h-5 text-secondary/60" />
                                        </span>
                                    </label>
                                    <label className="input-group">
                                        <input 
                                            type="email" 
                                            id="email"
                                            name="email" 
                                            className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-primary"
                                            placeholder="exemplo@email.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            autoFocus
                                            disabled={isLoading}
                                        />
                                    </label>
                                </div>

                                {/* Submit Button */}
                                <div className="form-control mt-6">
                                    <button 
                                        type="submit" 
                                        className="btn btn-primary text-white w-full font-semibold"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Enviando...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-5 h-5" />
                                                Enviar Link
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>

                {/* Footer / Back Button */}
                {!success && (
                    <div className="text-center mt-6">
                        <button 
                            onClick={() => navigate('/entrar')} 
                            className="btn btn-ghost text-secondary hover:text-primary gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Voltar para o Login
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RequestResetPassword;
