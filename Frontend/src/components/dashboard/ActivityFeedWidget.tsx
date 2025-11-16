import React from 'react';
import { useNavigate } from 'react-router-dom';
import { History, PlusCircle, Pencil, Trash2 } from 'lucide-react';
import type { ActivityFeedItem } from '../../services/core-api';

interface FeedProps {
  feed: ActivityFeedItem[];
}

// Helper para formatar o tempo (ex: "há 5 min")
// (Esta é uma função de lógica de UI, não de negócios)
const timeAgo = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " anos atrás";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " meses atrás";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " dias atrás";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " horas atrás";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " min atrás";
  return "agora mesmo";
};

// Helper para ícone e cor da ação
const getActionIcon = (action: string) => {
  if (action === '+') {
    return <PlusCircle size={16} className="text-success" />;
  }
  if (action === '-') {
    return <Trash2 size={16} className="text-danger" />;
  }
  return <Pencil size={16} className="text-primary-custom" />; // '~' (Editado)
};

const ActivityFeedWidget: React.FC<FeedProps> = ({ feed }) => {
  const navigate = useNavigate();
  
  return (
    <div className="card h-100 shadow-sm border-0 custom-card">
      <div className="card-header d-flex justify-content-between align-items-center bg-white">
        <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
          <History size={20} className="text-muted" />
          Atividade Recente
        </h5>
        <a href="#" className="small text-decoration-none">Ver tudo</a>
      </div>
      
      {feed.length === 0 ? (
        <div className="card-body text-center text-muted d-flex align-items-center justify-content-center">
          <p className="mb-0">Nenhuma atividade recente registrada.</p>
        </div>
      ) : (
        <ul className="list-group list-group-flush">
          {feed.slice(0, 10).map((item, index) => ( // Limita a 10 itens
            <li 
              key={index} 
              className="list-group-item list-group-item-action d-flex align-items-start gap-3 py-3 cursor-pointer"
              onClick={() => navigate(`/documento/editar/${item.metadata.document_id}`)}
            >
              <div className="activity-icon">
                {getActionIcon(item.action_type)}
              </div>
              <div className="activity-text w-100">
                <p className="mb-0 small text-dark" dangerouslySetInnerHTML={{ __html: item.message }} />
                <small className="text-muted">{timeAgo(new Date(item.timestamp))}</small>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ActivityFeedWidget;