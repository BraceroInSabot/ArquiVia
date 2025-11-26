import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Loader2, AlertTriangle, FileText, FileWarning, 
  CheckCircle2, Archive, Eye, Users, TrendingUp 
} from 'lucide-react';

import sectorService from '../../services/Sector/api';
import type { SectorDashboardData } from '../../services/core-api';

// Não precisamos mais de CSS externo
// import '../../assets/css/SectorMetrics.css';

interface SectorMetricsProps {
  sectorId: number;
}

// Helper para formatar o tempo
const timeAgo = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " anos";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " meses";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " dias";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " horas";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " min";
    return "agora";
  } catch { return ""; }
};

// Componente interno para um item de KPI (usando DaisyUI Stat)
const KpiStat: React.FC<{ title: string, value: number, icon: React.ReactNode, colorClass: string }> = 
  ({ title, value, icon, colorClass }) => (
  <div className="stat bg-base-100 shadow p-4 rounded-xl border border-base-200">
    <div className={`stat-figure ${colorClass} opacity-80`}>
      {icon}
    </div>
    <div className="stat-title text-xs font-bold uppercase tracking-wider text-gray-400">{title}</div>
    <div className={`stat-value text-2xl ${colorClass}`}>{value}</div>
  </div>
);

const SectorMetrics: React.FC<SectorMetricsProps> = ({ sectorId }) => {
  const navigate = useNavigate();
  const [data, setData] = useState<SectorDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sectorId) return;

    const fetchDashboard = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await sectorService.getSectorDashboard(sectorId);
        setData(response.data.data);
      } catch (err: any) {
        console.error("Erro ao buscar dashboard gerencial:", err);
        if (err.response && err.response.status === 403) {
          setError("Você não tem permissão de Gerente ou Proprietário para ver este dashboard.");
        } else {
          setError("Não foi possível carregar as métricas do setor.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, [sectorId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-gray-400">
        <Loader2 className="animate-spin mb-2" size={32} />
        <span>Carregando métricas...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error shadow-lg my-6">
        <AlertTriangle size={24} />
        <span>{error}</span>
      </div>
    );
  }

  if (!data) return null;

  const { kpis, insights } = data;

  return (
    <div className="mt-6">
      
      {/* --- 1. KPIs (Grid de Stats) --- */}
      <h3 className="font-bold text-lg text-secondary mb-4 flex items-center gap-2">
        <TrendingUp size={20} /> Métricas de Volume
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <KpiStat title="Total Docs" value={kpis.total_documentos} icon={<FileText size={32} />} colorClass="text-primary" />
        <KpiStat title="Pendentes" value={kpis.pendentes} icon={<FileWarning size={32} />} colorClass="text-warning" />
        <KpiStat title="Concluídos" value={kpis.concluidos} icon={<CheckCircle2 size={32} />} colorClass="text-success" />
        <KpiStat title="Arquivados" value={kpis.arquivados} icon={<Archive size={32} />} colorClass="text-neutral" />
        <KpiStat title="Públicos" value={kpis.publicos} icon={<Eye size={32} />} colorClass="text-info" />
      </div>

      {/* --- 2. INSIGHTS (Grid de Cards) --- */}
      <h3 className="font-bold text-lg text-secondary mb-4 flex items-center gap-2">
        <AlertTriangle size={20} /> Insights de Fluxo
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Coluna Esquerda: Gargalos */}
        <div className="card bg-base-100 shadow-xl border border-base-200 lg:col-span-2">
          <div className="card-body p-0">
            <div className="p-4 border-b border-base-200 bg-base-100 rounded-t-xl flex justify-between items-center">
               <div className="flex items-center gap-2 font-bold text-secondary">
                  <FileWarning size={20} className="text-error" />
                  Gargalos Pendentes (Mais Antigos)
               </div>
            </div>

            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <tbody>
                  {insights.gargalos_pendentes.length > 0 ? (
                    insights.gargalos_pendentes.map(doc => (
                      <tr key={doc.document_id} className="hover cursor-pointer" onClick={() => navigate(`/documento/editar/${doc.document_id}`)}>
                        <td>
                            <div className="font-medium text-secondary truncate max-w-xs" title={doc.title}>
                                {doc.title}
                            </div>
                        </td>
                        <td className="text-right">
                            <span className="badge badge-error badge-outline font-bold gap-1">
                                🕒 {timeAgo(doc.created_at)}
                            </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                        <td colSpan={2} className="text-center text-gray-400 py-6">Nenhum gargalo encontrado.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Coluna Direita: Alertas */}
        <div className="flex flex-col gap-6">
            
            {/* Card de Alerta */}
            <div className="card bg-warning/10 border border-warning/20 shadow-sm">
                <div className="card-body flex flex-row items-center gap-4 p-5">
                    <div className="p-3 bg-warning text-white rounded-full">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-warning-content/80">Risco de Perda</h4>
                        <p className="text-sm text-gray-600">
                            <strong className="text-lg">{insights.alerta_exclusoes_7dias}</strong> documentos excluídos nos últimos 7 dias.
                        </p>
                    </div>
                </div>
            </div>

            {/* Card de Top Colaboradores */}
            <div className="card bg-base-100 shadow-xl border border-base-200 flex-grow">
                <div className="card-body p-0">
                    <div className="p-4 border-b border-base-200 bg-base-100 rounded-t-xl font-bold text-secondary flex items-center gap-2">
                        <Users size={20} className="text-primary" />
                        Top Colaboradores
                    </div>
                    <ul className="menu w-full p-2">
                        {insights.top_colaboradores.length > 0 ? (
                            insights.top_colaboradores.map((colab, index) => (
                                <li key={index}>
                                    <a className="flex justify-between items-center active:bg-base-200 hover:bg-base-200 cursor-default">
                                        <div className="flex items-center gap-3">
                                            <span className={`font-bold w-6 text-center ${index === 0 ? 'text-warning text-lg' : 'text-gray-400'}`}>
                                                {index + 1}
                                            </span>
                                            <span className="font-medium text-secondary">{colab.history_user__name}</span>
                                        </div>
                                        <span className="badge badge-ghost">{colab.activity_count} ações</span>
                                    </a>
                                </li>
                            ))
                        ) : (
                            <li className="disabled">
                                <a className="justify-center text-gray-400 italic">Sem dados.</a>
                            </li>
                        )}
                    </ul>
                </div>
            </div>

        </div>
        
      </div>
    </div>
  );
};

export default SectorMetrics;