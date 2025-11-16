import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ChevronRight, RefreshCcw } from 'lucide-react';
import type { RecentDocument } from '../../services/core-api';

interface CarouselProps {
  documents: RecentDocument[];
}

const RecentDocumentsCarousel: React.FC<CarouselProps> = ({ documents }) => {
  const navigate = useNavigate();

  const getStatusClass = (status: string) => {
    if (status.toLowerCase() === 'concluído') return 'text-success';
    if (status.toLowerCase() === 'revisão necessária') return 'text-warning';
    return 'text-primary'; // Em andamento
  };

  return (
    <div id="recentDocsCarousel" className="carousel slide" data-bs-ride="carousel">
      <div className="carousel-inner">
        <div className="d-flex mb-2 fw-bold text-dark align-items-center gap-2 fs-2">
            <RefreshCcw />
            Continue de onde parou
        </div>
        {documents.map((doc, index) => (
          <div 
            key={doc.document_id} 
            className={`carousel-item ${index === 0 ? 'active' : ''}`}
          >
            <div 
              className="d-flex flex-column justify-content-center p-4 p-md-5 text-white rounded custom-card-dark cursor-pointer" 
              onClick={() => navigate(`/documento/editar/${doc.document_id}`)}
              style={{ minHeight: '200px' }}
            >
              <FileText size={40} className="mb-3 opacity-50" />
              <h3 className="fw-bold mb-1">{doc.title}</h3>
              <p className="mb-0">
                Criado em: {new Date(doc.created_at).toLocaleDateString()}
                <span className={`ms-3 fw-bold ${getStatusClass(doc.status_label)}`}>
                  ({doc.status_label})
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>
      

      <button className="carousel-control-next" type="button" data-bs-target="#recentDocsCarousel" data-bs-slide="next">
        <ChevronRight size={32} />
        <span className="visually-hidden">Next</span>
      </button>
    </div>
  );
};

export default RecentDocumentsCarousel;