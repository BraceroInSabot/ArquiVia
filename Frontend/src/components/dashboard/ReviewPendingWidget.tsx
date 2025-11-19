import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileWarning, ChevronRight } from 'lucide-react';
import type { ReviewPendingDocument } from '../../services/core-api';

interface ReviewProps {
  documents: ReviewPendingDocument[];
}

const ReviewPendingWidget: React.FC<ReviewProps> = ({ documents }) => {
  const navigate = useNavigate();

  return (
    <div className="card h-100 shadow-sm border-0 custom-card">
      <div className="card-header d-flex justify-content-between align-items-center bg-white">
        <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
          <FileWarning size={20} className="text-warning" />
          Revisão Pendente
        </h5>
        <span className="badge bg-warning text-dark rounded-pill">
          {documents.length}
        </span>
      </div>
      
      {documents.length === 0 ? (
        <div className="card-body text-center text-muted d-flex align-items-center justify-content-center">
          <p className="mb-0">Nenhum documento pendente de revisão. Bom trabalho!</p>
        </div>
      ) : (
        <ul className="list-group list-group-flush">
          {documents.map(doc => (
            <li 
              key={doc.document_id} 
              className="list-group-item list-group-item-action d-flex justify-content-between align-items-center cursor-pointer"
              onClick={() => navigate(`/documento/editar/${doc.document_id}`)}
            >
              <div>
                <span className="fw-medium text-dark d-block text-truncate" style={{ maxWidth: '300px' }}>
                  {doc.title}
                </span>
                <small className="text-muted">
                  Criado em: {doc.created_at}
                </small>
              </div>
              <ChevronRight size={18} className="text-muted" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ReviewPendingWidget;