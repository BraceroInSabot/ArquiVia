import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ChevronRight } from 'lucide-react'; // FileWarning -> AlertTriangle
import type { ReviewPendingDocument } from '../../services/core-api';

interface ReviewProps {
  documents: ReviewPendingDocument[];
}

const ReviewPendingWidget: React.FC<ReviewProps> = ({ documents }) => {
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
     try { return new Date(dateString).toLocaleDateString(); } 
     catch { return dateString; }
  }

  return (
    <div className="card bg-base-100 shadow-xl h-full border border-base-200">
      <div className="card-body p-0">
        {/* Header */}
        <div className="p-4 border-b border-base-200 flex justify-between items-center bg-base-100 rounded-t-xl">
            <div className="flex items-center gap-2 font-bold text-lg text-secondary">
                <AlertTriangle size={20} className="text-warning" />
                Revisão Pendente
            </div>
            <div className="badge badge-warning gap-1 font-bold">
                {documents.length}
            </div>
        </div>

        {/* Lista */}
        <div className="overflow-y-auto max-h-[400px]">
            {documents.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                    <p>Nenhum documento pendente. Bom trabalho!</p>
                </div>
            ) : (
                <ul className="menu bg-base-100 w-full p-2">
                    {documents.map((doc) => (
                        <li key={doc.document_id} className="border-b border-base-200 last:border-none">
                            <a 
                                onClick={() => navigate(`/documento/editar/${doc.document_id}`)}
                                className="flex justify-between items-center py-3 active:bg-base-200 hover:bg-base-200"
                            >
                                <div className="flex flex-col gap-1 overflow-hidden">
                                    <span className="font-medium text-secondary truncate max-w-[200px]">{doc.title}</span>
                                    <span className="text-xs text-gray-500">Criado em: {formatDate(doc.created_at)}</span>
                                </div>
                                <ChevronRight size={16} className="text-gray-400" />
                            </a>
                        </li>
                    ))}
                </ul>
            )}
        </div>
      </div>
    </div>
  );
};

export default ReviewPendingWidget;