import React, { useEffect, useState } from 'react';
import { 
  Building, 
  Layers, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp,
  ExternalLink,
  Loader2,
  Settings
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import PlanSelectionPage from '../../components/Payment/PlanSelectionPage'; 
import PlanManagementModal from '../../components/modal/PlanManagementModal'; 
import type { PlanData, UsageMetric } from '../../types/plans';
import paymentService from '../../services/Payment/api';


const Plan_Console: React.FC = () => {
    //@ts-ignore
  const navigate = useNavigate();
  const [data, setData] = useState<PlanData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStatusActive, setIsStatusActive] = useState(false);
  const [plan_details, setPlanDetails] = useState<PlanData['plan_details'] | null>(null);
  const [usage, setUsage] = useState<PlanData['usage'] | null>(null);
  
  // Controle do Modal de Gestão
  const [managementModal, setManagementModal] = useState<{
    isOpen: boolean;
    type: 'enterprise' | 'sector';
  }>({ isOpen: false, type: 'enterprise' });

  useEffect(() => {
    fetchPlanData();
  }, []);

  const fetchPlanData = async () => {
    try {
      // Se não for o primeiro carregamento, não mostramos loading full screen
      // para não "piscar" a tela quando voltar do modal
      if (!data) setIsLoading(true);
      
      const response = await paymentService.getPlanData();
      //@ts-ignore
      const payload = response.data.data || response.data;
      
      setData(payload);

      setPlanDetails(payload.plan_details);
      setUsage(payload.usage);

      if (payload.plan_details?.status !== 'ativo') {
          setIsStatusActive(false);
      } else {
          setIsStatusActive(true);
      }

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
    
    const date = new Date(dateString);
    
    return date.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    });
};

  const openManager = (type: 'enterprise' | 'sector') => {
    setManagementModal({ isOpen: true, type });
  };

  /**
   * Renderiza a barra de progresso com cor dinâmica e BOTÃO DE GERENCIAR
   */
  const renderProgressBar = (metric: UsageMetric, label: string, icon: React.ReactNode, type: 'enterprise' | 'sector') => {
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
          
          {/* BOTÃO DE GERENCIAR (Abre o Modal) */}
          <button 
            onClick={() => openManager(type)}
            className="btn btn-xs btn-ghost text-primary hover:bg-primary/10 gap-1 border border-transparent hover:border-primary/20 transition-all"
          >
            <Settings size={12} /> Gerenciar Cotas
          </button>
        </div>
        
        <div className="relative pt-1">
            <div className="flex mb-1 items-center justify-between">
                <div></div>
                <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-secondary">
                        {metric.used} <span className="text-gray-400 font-normal">/ {metric.limit}</span>
                    </span>
                </div>
            </div>
            <progress 
                className={`progress w-full h-3 ${colorClass}`} 
                value={metric.used} 
                max={metric.limit}
            ></progress>
            <div className="text-right mt-1">
                <span className="text-xs text-gray-400 font-semibold">{metric.percentage.toFixed(1)}% utilizado</span>
            </div>
        </div>
      </div>
    );
  };

  if (isLoading && !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-base-100">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Carregando informações da assinatura...</p>
      </div>
    );
  }

  // Se o usuário não tem plano, mostra a tela de vendas
  if (!data?.has_plan || !data.plan_details) {
    return <PlanSelectionPage />;
  }

  return (
    <div className="min-h-screen bg-base-200/50 p-4 md:p-8 font-sans text-neutral">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold text-secondary flex items-center gap-3">
                    Meu Plano
                    
                    {/* INÍCIO DO NOVO CÓDIGO */}
                    {(() => {
                        const statusConfig: Record<string, { style: string; icon: React.ReactNode }> = {
                            'Ativo': { 
                                style: 'badge-success text-white', 
                                icon: <CheckCircle2 size={14} /> 
                            },
                            'Pagamento Pendente': { 
                                style: 'badge-warning text-white', 
                                icon: <AlertCircle size={14} /> 
                            },
                            'Pagamento em Atraso': { 
                                style: 'badge-error text-white', 
                                icon: <AlertCircle size={14} /> 
                            },
                            'Devolução Realizada': { 
                                style: 'badge-info text-white', 
                                icon: <CheckCircle2 size={14} /> 
                            },
                            'Cancelado': { 
                                style: 'badge-neutral text-white', 
                                icon: <AlertCircle size={14} /> 
                            }
                        };

                        //@ts-ignore
                        const config = statusConfig[plan_details.status] || { 
                            style: 'badge-ghost', 
                            icon: <AlertCircle size={14} /> 
                        };

                        return (
                            <span className={`badge ${config.style} gap-1 p-3 font-semibold shadow-sm`}>
                                {config.icon} {plan_details?.status}
                            </span>
                        );
                    })()}
                    {/* FIM DO NOVO CÓDIGO */}
                </h1>
                <p className="text-gray-500 mt-1">Gerencie sua assinatura e aloque seus recursos.</p>
            </div>
            
            {plan_details?.payment_link && (
                <a 
                    href={plan_details?.payment_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline btn-secondary gap-2 rounded-full hover:shadow-md transition-all"
                >
                    <ExternalLink size={18} />
                    Portal do Cliente (Faturas)
                </a>
            )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Card Principal: Detalhes do Plano */}
            <div className="card bg-base-100 shadow-xl border border-base-200 lg:col-span-1 h-full">
                <div className="card-body">
                    <h2 className="card-title text-xs text-gray-400 uppercase tracking-wider font-bold mb-4">
                        Detalhes da Assinatura
                    </h2>
                    
                    <div className="flex flex-col h-full justify-between gap-6">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Plano Atual</p>
                            <p className="text-3xl font-black text-primary tracking-tight">{plan_details?.name}</p>
                        </div>

                        <div className="bg-base-200/50 p-4 rounded-xl border border-base-200">
                             <div className="flex items-center gap-2 mb-1">
                                <Calendar size={18} className="text-secondary" />
                                <span className="text-sm font-semibold text-gray-600">Próxima Cobrança</span>
                             </div>
                             <p className="text-xl font-bold text-secondary pl-7">
                                {
                                //@ts-ignore
                                formatDate(plan_details?.next_due_date)}
                             </p>
                        </div>

                        {!isStatusActive && plan_details?.payment_link && (
                            <div className="alert alert-warning shadow-sm text-sm">
                                <AlertCircle size={20} className="shrink-0" />
                                <span>Regularize o pagamento para evitar bloqueios.</span>
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
                                <Building size={16} />,
                                'enterprise'
                            )}
                            
                            <div className="divider my-2 opacity-50"></div>
                            
                            {renderProgressBar(
                                usage.sectors, 
                                "Setores Criados", 
                                <Layers size={16} />,
                                'sector'
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
                            <strong>Dica:</strong> Use o botão "Gerenciar Cotas" acima para escolher quais empresas ou setores ficam ativos no seu plano atual. Você pode trocar a qualquer momento.
                        </p>
                    </div>
                </div>
            </div>

        </div>
      </div>

      {/* MODAL DE GERENCIAMENTO */}
      {managementModal.isOpen && (
          <PlanManagementModal 
            isOpen={managementModal.isOpen}
            type={managementModal.type}
            onClose={() => setManagementModal(prev => ({ ...prev, isOpen: false }))}
            onUpdate={fetchPlanData} 
          />
      )}
    </div>
  );
};

export default Plan_Console;