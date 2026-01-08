import React, { useEffect, useState } from 'react';
import { 
  Building, 
  Layers, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import paymentService from '../../services/Payment/api'; 
import PlanSelectionPage from '../../components/Payment/PlanSelectionPage'; 
import type { PlanData, UsageMetric } from '../../types/plans';

const Plan_Console: React.FC = () => {
    //@ts-ignore
  const navigate = useNavigate();
  const [data, setData] = useState<PlanData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPlanData();
  }, []);

  const fetchPlanData = async () => {
    try {
      const response = await paymentService.getPlanData();
      console.log(response.data.data);
      setData(response.data.data);  
    } catch (error) {
      console.error(error);
      //@ts-ignore
      if (error.response && error.response.status !== 404) {
        toast.error('Erro ao carregar informações do plano.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  /**
   * Renderiza a barra de progresso com cor dinâmica baseada na porcentagem
   */
  const renderProgressBar = (metric: UsageMetric, label: string, icon: React.ReactNode) => {
    let colorClass = 'progress-primary';
    if (metric.percentage >= 90) colorClass = 'progress-error';
    else if (metric.percentage >= 70) colorClass = 'progress-warning';
    else colorClass = 'progress-success';

    return (
      <div className="mb-6 last:mb-0 group">
        <div className="flex justify-between items-end mb-2">
          <div className="flex items-center gap-2 text-gray-700 font-medium">
            <div className="p-1.5 bg-base-200 rounded-md text-secondary">
                {icon}
            </div>
            {label}
          </div>
          <div className="text-right">
            <span className="text-sm font-bold text-secondary">
                {metric.used} <span className="text-gray-400 text-xs font-normal">/ {metric.limit}</span>
            </span>
          </div>
        </div>
        <progress 
            className={`progress w-full h-3 ${colorClass}`} 
            value={metric.used} 
            max={metric.limit}
        ></progress>
        <div className="text-right mt-1">
            <span className="text-xs text-gray-400 font-semibold">{metric.percentage}% utilizado</span>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-base-100">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Carregando informações da assinatura...</p>
      </div>
    );
  }

  // --- ALTERAÇÃO AQUI ---
  // Estado: Usuário sem plano (has_plan: false)
  // Agora renderizamos diretamente o componente de Vendas/Seleção de Plano
  if (!data?.has_plan || !data.plan_details) {
    return <PlanSelectionPage />;
  }

  // Estado: Usuário com plano (Dashboard)
  const { plan_details, usage } = data;
  const isStatusActive = plan_details.status_color === 'green';

  return (
    <div className="min-h-screen bg-base-200/50 p-4 md:p-8 font-sans text-neutral">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold text-secondary flex items-center gap-3">
                    Meu Plano
                    {isStatusActive ? (
                         <span className="badge badge-success gap-1 text-white p-3">
                            <CheckCircle2 size={14} /> Ativo
                         </span>
                    ) : (
                        <span className="badge badge-error gap-1 text-white p-3">
                            <AlertCircle size={14} /> {plan_details.status}
                         </span>
                    )}
                </h1>
                <p className="text-gray-500 mt-1">Gerencie sua assinatura e acompanhe seu consumo.</p>
            </div>
            
            {plan_details.payment_link && (
                <a 
                    href={plan_details.payment_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline btn-secondary gap-2 rounded-full"
                >
                    <ExternalLink size={18} />
                    Gerenciar Pagamento
                </a>
            )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Card Principal: Detalhes do Plano */}
            <div className="card bg-base-100 shadow-xl border border-base-200 lg:col-span-1 h-full">
                <div className="card-body">
                    <h2 className="card-title text-lg text-gray-400 uppercase tracking-wide text-xs font-bold mb-4">
                        Detalhes da Assinatura
                    </h2>
                    
                    <div className="flex flex-col h-full justify-between gap-6">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Plano Atual</p>
                            <p className="text-3xl font-black text-primary">{plan_details.name}</p>
                        </div>

                        <div className="bg-base-200 p-4 rounded-xl border border-base-300">
                             <div className="flex items-center gap-3 mb-1">
                                <Calendar size={20} className="text-secondary" />
                                <span className="text-sm font-semibold text-gray-600">Próxima Cobrança</span>
                             </div>
                             <p className="text-xl font-bold text-secondary pl-8">
                                {formatDate(plan_details.next_due_date)}
                             </p>
                        </div>

                        {!isStatusActive && plan_details.payment_link && (
                            <div className="alert alert-warning shadow-sm">
                                <AlertCircle size={20} />
                                <span className="text-xs font-medium">
                                    Seu plano requer atenção. Regularize o pagamento para evitar bloqueios.
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Card: Métricas de Uso */}
            <div className="card bg-base-100 shadow-xl border border-base-200 lg:col-span-2">
                <div className="card-body">
                    <div className="flex items-center gap-2 mb-6">
                        <TrendingUp size={20} className="text-primary" />
                        <h2 className="card-title text-lg text-secondary">Consumo de Recursos</h2>
                    </div>

                    {usage ? (
                        <div className="space-y-8">
                            {renderProgressBar(
                                usage.enterprises, 
                                "Empresas Cadastradas", 
                                <Building size={16} />
                            )}
                            
                            <div className="divider my-2"></div>
                            
                            {renderProgressBar(
                                usage.sectors, 
                                "Setores Criados", 
                                <Layers size={16} />
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-gray-400">
                            Não foi possível carregar os dados de uso.
                        </div>
                    )}

                    <div className="mt-8 bg-blue-50 text-blue-800 p-4 rounded-lg text-sm flex items-start gap-3 border border-blue-100">
                        <AlertCircle size={18} className="shrink-0 mt-0.5" />
                        <p>
                            Precisa de mais limites? Considere fazer o upgrade do seu plano para adicionar mais empresas e setores à sua conta.
                        </p>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default Plan_Console;