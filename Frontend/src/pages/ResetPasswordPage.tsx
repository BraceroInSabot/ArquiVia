import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Lock, Save, Loader2, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

import Validate from "../utils/credential_validation";
import userService from "../services/User/api";

const ResetPassword = () => {
    const { token } = useParams<{ token: string }>();
    const [p1, setP1] = useState('');
    const [p2, setP2] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [canSubmit, setCanSubmit] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();

    const goToIndex = () => {
        navigate("/");
    };

    // Lógica de validação do token
    useEffect(() => {
        if (!token) {
            navigate('/entrar');
            return;
        }

        const validateToken = async () => {
            try {
                const response = await userService.validateToken(token as string);
                if (!response.data.sucesso) {
                    navigate('/entrar');
                }
            } catch (err) {
                navigate('/entrar');
            }
        };
        validateToken();
    }, [token, navigate]);

    // Lógica de validação das senhas
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
            setError('');
            setCanSubmit(false);
        }
    };

    // Lógica de envio
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        
        setIsSubmitting(true);
        setError('');
        setSuccess('');

        try {
            const response = await userService.resetPasswordByToken(token as string, p1);

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
                    <h2 className="text-2xl font-bold text-secondary mb-2">Redefinir Senha</h2>
                    <p className="text-secondary/70">
                        Defina sua nova senha de acesso.
                    </p>
                </div>

                {/* Card */}
                <div className="card bg-white shadow-xl border border-gray-100">
                    <div className="card-body">
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            {/* Error Alert */}
                            {error && (
                                <div className="alert alert-error shadow-lg">
                                    <AlertCircle className="w-5 h-5" />
                                    <span className="text-sm">{error}</span>
                                </div>
                            )}
                            
                            {/* Success Alert */}
                            {success && (
                                <div className="alert alert-success shadow-lg">
                                    <CheckCircle2 className="w-5 h-5" />
                                    <span className="text-sm">{success}</span>
                                </div>
                            )}

                            {/* Form Fields - Only show if not success */}
                            {!success && (
                                <>
                                    {/* New Password Field */}
                                    <div className="form-control">
                                        <label className="label" htmlFor="new-password">
                                            <span className="label-text font-semibold text-secondary text-xs uppercase tracking-wide">
                                                Nova Senha
                                            </span>
                                        </label>
                                        <div className="relative">
                                            <label className="input-group">
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    name="new-password" 
                                                    id="new-password"
                                                    className="input input-bordered w-full pr-12 focus:outline-none focus:ring-2 focus:ring-primary"
                                                    placeholder="••••••••"
                                                    value={p1} 
                                                    onChange={(e) => {
                                                        const newP1 = e.target.value;
                                                        setP1(newP1);
                                                        validatePasswords(newP1, p2);
                                                    }}
                                                    required
                                                    disabled={isSubmitting}
                                                />
                                            </label>
                                            <button
                                                type="button"
                                                className="absolute right-3 top-1/2 -translate-y-1/2 btn btn-ghost btn-sm h-auto min-h-0 p-1 hover:bg-transparent"
                                                onClick={() => setShowPassword(!showPassword)}
                                                disabled={isSubmitting}
                                                tabIndex={-1}
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="w-5 h-5 text-secondary/60" />
                                                ) : (
                                                    <Eye className="w-5 h-5 text-secondary/60" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {/* Confirm Password Field */}
                                    <div className="form-control">
                                        <label className="label" htmlFor="confirm-new-password">
                                            <span className="label-text font-semibold text-secondary text-xs uppercase tracking-wide">
                                                Confirmar Nova Senha
                                            </span>
                                        </label>
                                        <div className="relative">
                                            <label className="input-group">
                                                <input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    name="confirm-new-password" 
                                                    id="confirm-new-password"
                                                    className="input input-bordered w-full pr-12 focus:outline-none focus:ring-2 focus:ring-primary"
                                                    placeholder="••••••••"
                                                    value={p2} 
                                                    onChange={(e) => {
                                                        const newP2 = e.target.value;
                                                        setP2(newP2);
                                                        validatePasswords(p1, newP2);
                                                    }}
                                                    required
                                                    disabled={isSubmitting}
                                                />
                                            </label>
                                            <button
                                                type="button"
                                                className="absolute right-3 top-1/2 -translate-y-1/2 btn btn-ghost btn-sm h-auto min-h-0 p-1 hover:bg-transparent"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                disabled={isSubmitting}
                                                tabIndex={-1}
                                            >
                                                {showConfirmPassword ? (
                                                    <EyeOff className="w-5 h-5 text-secondary/60" />
                                                ) : (
                                                    <Eye className="w-5 h-5 text-secondary/60" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="form-control mt-6">
                                        <button 
                                            type="submit"
                                            className="btn btn-primary text-white w-full font-semibold"
                                            disabled={!canSubmit || isSubmitting} 
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    Salvando...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="w-5 h-5" />
                                                    Redefinir Senha
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
