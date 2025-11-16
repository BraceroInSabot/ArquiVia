import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import sectorService from '../services/Sector/api';
import type { SectorDashboardData } from '../services/core-api';
import { 
  Loader2, AlertTriangle, FileText, FileWarning, 
  CheckCircle2, Archive, Eye, Users 
} from 'lucide-react';

// Importe o CSS que criaremos
import '../assets/css/SectorMetrics.css';

interface SectorMetricsProps {
  sectorId: number;
}

// Helper para formatar o tempo (ex: "há 5 dias")
const timeAgo = (dateString: string): string => {
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
};

// Componente interno para os 5 cards de KPI
const KpiCard: React.FC<{ title: string, value: number, icon: React.ReactNode, colorClass: string }> = 
  ({ title, value, icon, colorClass }) => (
  <div className="col">
    <div className={`card card-kpi border-0 shadow-sm h-100 ${colorClass}`}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center">
          <div className="kpi-icon">{icon}</div>
          <div className="text-end">
            <h3 className="kpi-value fw-bold mb-0">{value}</h3>
            <span className="kpi-title text-muted text-uppercase small">{title}</span>
          </div>
        </div>
      </div>
    </div>
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
        // Trata erro de permissão (403 Forbidden)
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
      <div className="d-flex justify-content-center align-items-center py-5 text-muted">
        <Loader2 className="animate-spin me-2" size={24} />
        <span>Carregando métricas gerenciais...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger d-flex align-items-center" role="alert">
        <AlertTriangle className="me-2" size={20} />
        <div>{error}</div>
      </div>
    );
  }

  if (!data) return null;

  const { kpis, insights } = data;

  return (
    <div className="sector-metrics-container mt-4">
      
      {/* --- 1. LINHA DE KPIs --- */}
      <h5 className="fw-bold text-secondary mb-3">Métricas de Volume</h5>
      <div className="row row-cols-1 row-cols-md-3 row-cols-xl-5 g-3 mb-5">
        <KpiCard title="Total de Documentos" value={kpis.total_documentos} icon={<FileText size={24} />} colorClass="text-primary" />
        <KpiCard title="Pendentes" value={kpis.pendentes} icon={<FileWarning size={24} />} colorClass="text-warning" />
        <KpiCard title="Concluídos" value={kpis.concluidos} icon={<CheckCircle2 size={24} />} colorClass="text-success" />
        <KpiCard title="Arquivados" value={kpis.arquivados} icon={<Archive size={24} />} colorClass="text-secondary" />
        <KpiCard title="Públicos" value={kpis.publicos} icon={<Eye size={24} />} colorClass="text-info" />
      </div>

      {/* --- 2. LINHA DE INSIGHTS --- */}
      <h5 className="fw-bold text-secondary mb-3">Insights de Fluxo</h5>
      <div className="row g-4">
        
        {/* Coluna Esquerda (Gargalos e Colaboradores) */}
        <div className="col-lg-8">
          {/* Gargalos */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white d-flex align-items-center">
              <FileWarning size={18} className="me-2 text-danger" />
              <h6 className="fw-bold text-dark mb-0">Gargalos Pendentes (Mais Antigos)</h6>
            </div>
            <ul className="list-group list-group-flush">
              {insights.gargalos_pendentes.length > 0 ? (
                insights.gargalos_pendentes.map(doc => (
                  <li 
                    key={doc.document_id} 
                    className="list-group-item list-group-item-action d-flex justify-content-between align-items-center cursor-pointer"
                    onClick={() => navigate(`/documento/editar/${doc.document_id}`)}
                  >
                    <span className="fw-medium text-dark text-truncate" style={{maxWidth: '400px'}}>{doc.title}</span>
                    <span className="text-danger small fw-bold">{timeAgo(doc.created_at)}</span>
                  </li>
                ))
              ) : (
                <li className="list-group-item text-muted text-center small p-4">
                  Nenhum gargalo encontrado.
                </li>
              )}
            </ul>
          </div>
          
          {/* Top Colaboradores */}
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white d-flex align-items-center">
              <Users size={18} className="me-2 text-primary-custom" />
              <h6 className="fw-bold text-dark mb-0">Top Colaboradores (Atividade)</h6>
            </div>
            <ul className="list-group list-group-flush">
              {insights.top_colaboradores.length > 0 ? (
                insights.top_colaboradores.map((colab, index) => (
                  <li key={index} className="list-group-item d-flex align-items-center gap-3">
                    <span className="fw-bold text-primary-custom" style={{width: '20px'}}>{index + 1}</span>
                    <span className="fw-medium text-dark flex-grow-1">{colab.history_user__name}</span>
                    <span className="badge bg-light text-dark border">{colab.activity_count} atividades</span>
                  </li>
                ))
              ) : (
                <li className="list-group-item text-muted text-center small p-4">
                  Sem dados de colaboração.
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Coluna Direita (Alertas) */}
        <div className="col-lg-4">
          <div className="alert alert-warning d-flex align-items-center h-100" role="alert">
            <AlertTriangle className="me-3 flex-shrink-0" size={32} />
            <div>
              <h5 className="alert-heading fw-bold">Alerta de Risco</h5>
              <p className="mb-0">
                <strong>{insights.alerta_exclusoes_7dias}</strong> documentos foram excluídos nos últimos 7 dias.
              </p>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default SectorMetrics;