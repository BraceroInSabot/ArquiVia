import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ChevronRight, RotateCw, Building } from 'lucide-react'; // Usei RotateCw pois RefreshCcw não existe em todas as versões
import type { RecentDocument } from '../../services/core-api';

interface CarouselProps {
  documents: RecentDocument[];
}

const RecentDocumentsCarousel: React.FC<CarouselProps> = ({ documents }) => {
  const navigate = useNavigate();

  // Função para formatar data sem toLocaleDateString (como pedido anteriormente)
  // ou usar new Date(doc.created_at).toLocaleDateString() se preferir.
  // Vou manter a string original para ser seguro, mas formatada se possível.
  const formatDate = (dateString: string) => {
     try {
         return new Date(dateString).toLocaleDateString();
     } catch {
         return dateString;
     }
  }

  const getStatusBadge = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus === 'concluído') return 'badge badge-success text-white';
    if (lowerStatus === 'revisão necessária') return 'badge badge-warning text-white';
    return 'badge badge-info text-white'; // Em andamento
  };

  // --- Estado Vazio (CTA) ---
  if (documents.length === 0) {
    return (
      <div className="card bg-base-100 shadow-xl border border-base-200 border-dashed">
        <div className="card-body items-center text-center py-10">
          <div className="bg-base-200 p-4 rounded-full mb-4">
             <Building size={48} className="text-primary opacity-75" />
          </div>
          <h3 className="card-title text-2xl font-bold text-secondary">Comece sua Organização</h3>
          <p className="text-gray-500 max-w-md mb-6">
            Para criar seu primeiro documento, você precisa configurar uma empresa e um setor.
          </p>
          <button 
            className="btn btn-primary text-white gap-2 rounded-full px-8"
            onClick={() => navigate('/empresas')}
          >
            Criar minha Empresa
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  // --- Carrossel DaisyUI ---
  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-4">
         <RotateCw className="text-secondary" />
         <h2 className="text-2xl font-bold text-secondary">Continue de onde parou</h2>
      </div>

      <div className="carousel w-full gap-4 p-4 bg-neutral/5 rounded-box">
        {documents.map((doc) => (
          <div key={doc.document_id} className="carousel-item w-full md:w-1/2 lg:w-1/3">
            <div 
                className="card w-full bg-secondary text-white shadow-xl cursor-pointer hover:scale-[1.02] transition-transform duration-200"
                onClick={() => navigate(`/documento/editar/${doc.document_id}`)}
            >
              <div className="card-body">
                <FileText size={40} className="opacity-50 mb-2" />
                <h3 className="card-title text-lg line-clamp-1" title={doc.title}>{doc.title}</h3>
                <div className="flex flex-col gap-2 mt-2">
                    <span className="text-xs opacity-70">Criado em: {formatDate(doc.created_at)}</span>
                    <span className={getStatusBadge(doc.status_label)}>
                        {doc.status_label}
                    </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="text-xs text-center mt-2 text-gray-400 md:hidden">Deslize para ver mais</div>
    </div>
  );
};

export default RecentDocumentsCarousel;