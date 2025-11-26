import { useState, useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import dashboardService from '../services/Dashboard/api';
import type { DashboardData } from '../services/core-api';

import RecentDocumentsCarousel from '../components/dashboard/RecentDocumentsCarousel';
import ReviewPendingWidget from '../components/dashboard/ReviewPendingWidget';
import ActivityFeedWidget from '../components/dashboard/ActivityFeedWidget';

// Importe o CSS que criaremos
import '../assets/css/Dashboard.css';

const DashboardPage = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setIsLoading(true);
        const response = await dashboardService.getDashboardData();
        setData(response.data.data);
      } catch (err) {
        console.error("Erro ao carregar dashboard:", err);
        setError("Não foi possível carregar o painel.");
      } finally {
        setIsLoading(false);
      }
    };
    loadDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center text-muted" style={{ minHeight: '60vh' }}>
        <Loader2 className="animate-spin me-2" size={32} />
        <h4>Carregando seu painel...</h4>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="alert alert-danger d-flex align-items-center m-5" role="alert">
        <AlertCircle className="me-2" size={20} />
        <div>{error || "Dados não encontrados."}</div>
      </div>
    );
  }

  return (
    <div className=" w-full py-4 p-4" style={{ backgroundColor: '#f8f9fa', minHeight: 'calc(100vh - 60px)' }}>
      
      {/* 1. Componente Superior (Full Width) - Carrossel */}
      <div className="row mb-4">
        <div className="col-12">
          <RecentDocumentsCarousel documents={data.my_recent_documents} />
        </div>
      </div>

      {/* 2. Componentes Inferiores (Split) */}
      <div className="row g-4">
        
        {/* 2a. Bottom-Left (Revisão Pendente) */}
        <div className="mt-4 col-12 col-lg-6">
          <ReviewPendingWidget documents={data.review_pending_documents} />
        </div>

        {/* 2b. Bottom-Right (Atividades) */}
        <div className="mt-4 col-12 col-lg-6">
          <ActivityFeedWidget feed={data.activity_feed} />
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;