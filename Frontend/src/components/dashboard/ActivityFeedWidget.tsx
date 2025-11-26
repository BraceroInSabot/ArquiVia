import React from 'react';
import { useNavigate } from 'react-router-dom';
import { History, PlusCircle, Pencil, Trash2 } from 'lucide-react';
import type { ActivityFeedItem } from '../../services/core-api';

interface FeedProps {
  feed: ActivityFeedItem[];
}

// Helper de tempo
const timeAgo = (dateString: string): string => {
  try {
      const date = new Date(dateString);
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
  } catch { return ""; }
};

const getActionIcon = (action: string) => {
  if (action === '+') return <PlusCircle size={18} className="text-success" />;
  if (action === '-') return <Trash2 size={18} className="text-error" />;
  return <Pencil size={18} className="text-info" />; 
};

const ActivityFeedWidget: React.FC<FeedProps> = ({ feed }) => {
  const navigate = useNavigate();
  
  return (
    <div className="card bg-base-100 shadow-xl h-full border border-base-200">
      <div className="card-body p-0">
        {/* Header */}
        <div className="p-4 border-b border-base-200 flex justify-between items-center bg-base-100 rounded-t-xl">
            <div className="flex items-center gap-2 font-bold text-lg text-secondary">
                <History size={20} className="text-primary" />
                Atividade Recente
            </div>
        </div>

        {/* Feed */}
        <div className="overflow-y-auto max-h-[400px] p-0">
             {feed.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                   <p>Nenhuma atividade recente registrada.</p>
                </div>
             ) : (
                <ul className="menu w-full p-0">
                    {feed.slice(0, 10).map((item, index) => (
                        <li key={index} className="border-b border-base-200 last:border-none">
                            <a 
                                className="grid grid-cols-[auto_1fr] gap-3 py-3 px-4 items-start hover:bg-base-200 active:bg-base-200"
                                onClick={() => navigate(`/documento/editar/${item.metadata.document_id}`)}
                            >
                                <div className="mt-1">{getActionIcon(item.action_type)}</div>
                                <div className="flex flex-col">
                                    {/* Renderiza HTML seguro vindo do backend */}
                                    <p className="text-sm text-secondary leading-snug" dangerouslySetInnerHTML={{ __html: item.message }} />
                                    <span className="text-xs text-gray-400 mt-1">{timeAgo(item.timestamp)}</span>
                                </div>
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

export default ActivityFeedWidget;