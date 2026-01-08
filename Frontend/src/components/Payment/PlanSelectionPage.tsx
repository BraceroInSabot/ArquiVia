import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Check, 
  Star, 
  Shield, 
  Loader2, 
  Timer,
  Zap,
  Info,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import paymentService from '../../services/Payment/api';
import type { PlanType } from '../../types/plans';

const PlanSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<PlanType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 59 });

  useEffect(() => {
    fetchPlans();
    const timer = setInterval(() => {
        setTimeLeft(prev => {
            if (prev.minutes === 0) return { hours: prev.hours - 1, minutes: 59 };
            return { ...prev, minutes: prev.minutes - 1 };
        });
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await paymentService.getAvailablePlans();
      //@ts-ignore
      const sortedPlans = (response.data || []).sort((a: PlanType, b: PlanType) => a.order - b.order);
      setPlans(sortedPlans);
    } catch (error) {
      console.error(error);
      toast.error('Não foi possível carregar as ofertas disponíveis.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPlan = (plan: PlanType) => {
    if (plan.is_price_under_review) {
        window.open('https://wa.me/17996731503', '_blank');
        return;
    }
    navigate(`/checkout/${plan.plan_type_id}?cycle=${billingCycle}`);
  };

  const renderPrice = (plan: PlanType, isPopular: boolean) => {
    if (plan.is_price_under_review) {
        return <span className="text-2xl font-bold text-gray-700">Sob Consulta</span>;
    }
    if (plan.is_free) {
        return <span className="text-4xl font-black text-gray-900">Grátis</span>;
    }

    const numValue = Number(plan.price);
    const finalValue = billingCycle === 'yearly' ? numValue * 0.8 : numValue;
    
    return (
        <div className="flex items-baseline gap-1">
            <span className="text-sm font-medium text-gray-400 align-top mt-2">R$</span>
            <span className={`text-5xl font-extrabold tracking-tight ${isPopular ? 'text-primary' : 'text-gray-900'}`}>
                {new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 0 }).format(finalValue)}
            </span>
            <span className="text-gray-400 font-medium">/mês</span>
        </div>
    );
  };

  const renderFeatureItem = (key: string, value: string | number | boolean, isPopular: boolean) => {
    const labelMap: Record<string, string> = {
      enterprises: 'Empresas gerenciadas',
      sectors: 'Setores organizacionais',
      users: 'Usuários na equipe',
      storage: 'Armazenamento em nuvem',
      support: 'Suporte técnico',
      audit: 'Auditoria de acessos'
    };

    const label = labelMap[key] || key;
    if (value === false) return null;

    let displayValue = '';
    if (typeof value === 'boolean' && value === true) displayValue = '';
    else if (key === 'storage') displayValue = value.toString();
    else displayValue = value.toString();

    return (
      <li key={key} className="flex items-start gap-3 text-sm group-hover:text-gray-900 transition-colors">
        <div className={`mt-0.5 p-0.5 rounded-full ${isPopular ? 'bg-primary text-white' : 'bg-primary/10 text-primary'}`}>
            <Check size={12} strokeWidth={3} />
        </div>
        <span className="text-gray-600 font-medium">
          {displayValue && <strong className="text-gray-900 mr-1">{displayValue}</strong>}
          {label}
        </span>
      </li>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-gray-500 font-medium animate-pulse">Buscando ofertas...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden font-sans text-slate-800">
      
      {/* Background Decorativo */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-blue-50 to-white -z-10" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10" />

      <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        {/* --- Header --- */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-6">
            <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-4 py-1.5 rounded-full text-sm font-bold border border-red-100 shadow-sm animate-in fade-in slide-in-from-top-4 duration-700">
                <Timer size={16} />
                <span>Oferta exclusiva termina em {timeLeft.hours}h {timeLeft.minutes}m</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900">
                Escale sua operação com o <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">plano perfeito.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-500 leading-relaxed">
                Organize documentos e gerencie equipes com a potência que sua empresa precisa.
            </p>

            <div className="flex items-center justify-center mt-8">
                <div className="relative bg-slate-100 p-1 rounded-full inline-flex items-center">
                    <button 
                        className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${billingCycle === 'monthly' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                        onClick={() => setBillingCycle('monthly')}
                    >
                        Mensal
                    </button>
                    <button 
                        className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${billingCycle === 'yearly' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                        onClick={() => setBillingCycle('yearly')}
                    >
                        Anual
                    </button>
                </div>
                <span className="ml-3 badge badge-success badge-sm text-white font-bold px-2 py-3 shadow-sm">
                    -20% OFF
                </span>
            </div>
        </div>

        {/* --- Grid de Planos --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 items-stretch">
            {plans.map((plan) => {
                const isPopular = plan.is_most_popular;
                const isCustom = plan.is_price_under_review;

                return (
                    <div 
                        key={plan.plan_type_id}
                        className={`
                            group relative flex flex-col p-8 rounded-[2rem] transition-all duration-500
                            ${isPopular 
                                /* ESTILO DO MAIS POPULAR (Branco + Borda Primary + Sombra Colorida) */
                                ? 'bg-white ring-4 ring-primary/20 border-2 border-primary shadow-2xl shadow-primary/20 scale-105 z-10' 
                                /* ESTILO PADRÃO (Clean) */
                                : 'bg-white border border-slate-200 hover:border-primary/40 hover:shadow-xl hover:-translate-y-2'
                            }
                        `}
                    >
                        {isPopular && (
                            <div className="absolute -top-5 left-0 w-full flex justify-center">
                                <div className="bg-primary text-white px-6 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-lg flex items-center gap-1.5">
                                    <Star size={12} fill="white" strokeWidth={0} /> RECOMENDADO
                                </div>
                            </div>
                        )}

                        <div className="mb-6">
                            <h3 className={`text-lg font-bold uppercase tracking-wider mb-4 ${isPopular ? 'text-primary' : 'text-slate-500'}`}>
                                {plan.plan_type}
                            </h3>
                            
                            <div className="mb-4">
                                {renderPrice(plan, isPopular)}
                            </div>

                            <p className="text-sm text-slate-500 leading-relaxed min-h-[3rem]">
                                {plan.description}
                            </p>
                        </div>

                        <div className="flex-grow border-t border-dashed border-gray-200 pt-6 mb-8">
                            <ul className="space-y-4">
                                {plan.features && Object.entries(plan.features).map(([key, value]) => (
                                    <div key={key}>
                                        {renderFeatureItem(key, value, isPopular)}
                                    </div>
                                ))}
                            </ul>
                        </div>

                        <div className="mt-auto">
                            <button 
                                onClick={() => handleSelectPlan(plan)}
                                className={`
                                    w-full btn btn-lg rounded-xl font-bold border-none transition-all duration-300 flex items-center justify-between group-hover:gap-4
                                    ${isPopular 
                                        ? 'btn-primary text-white shadow-lg shadow-primary/30 hover:scale-[1.02]' 
                                        : isCustom 
                                            ? 'bg-slate-800 text-white hover:bg-slate-900'
                                            : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                                    }
                                `}
                            >
                                <span>
                                    {isCustom ? 'Falar com Consultor' : plan.is_free ? 'Plano ativo' : 'Selecionar Plano'}
                                </span>
                                {plan.is_free ? null : <ArrowRight size={20} />}
                            </button>
                            
                            {isPopular && !isCustom && (
                                <p className="text-center text-xs text-primary/80 mt-4 font-medium flex items-center justify-center gap-1">
                                    <Shield size={12} /> Garantia de 7 dias
                                </p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>

        {/* --- Footer Seguro --- */}
        <div className="mt-20 pt-10 border-t border-slate-100 flex flex-col md:flex-row justify-center items-center gap-8 text-slate-400 grayscale opacity-80">
            <div className="flex items-center gap-2">
                <Shield size={20} className="text-primary"/>
                <span className="font-medium text-sm">Pagamento criptografado</span>
            </div>
            <div className="h-4 w-px bg-slate-200 hidden md:block"></div>
            <div className="flex items-center gap-2">
                <Zap size={20} className="text-yellow-500"/>
                <span className="font-medium text-sm">Ativação instantânea</span>
            </div>
            <div className="h-4 w-px bg-slate-200 hidden md:block"></div>
            <div className="flex items-center gap-2">
                <Info size={20} className="text-blue-500"/>
                <span className="font-medium text-sm">Cancele a qualquer momento</span>
            </div>
        </div>

      </div>
    </div>
  );
};

export default PlanSelectionPage;