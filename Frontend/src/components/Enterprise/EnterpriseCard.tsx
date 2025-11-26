import type { Enterprise } from '../../services/core-api';
import { Eye, Pencil, Trash2, Building2 } from 'lucide-react'; // Ícones

interface EnterpriseCardProps {
  enterprise: Enterprise;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onToggleStatus: (id: number, currentStatus: boolean) => void;
  onDelete: (id: number) => void;
}

const EnterpriseCard = ({ enterprise, onView, onEdit, onToggleStatus, onDelete }: EnterpriseCardProps) => {
  const isActive = enterprise.is_active;

  return (
    <div className="card bg-base-100 shadow-md border border-base-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full">
      <div className="card-body p-5 flex flex-col h-full">
        
        {/* --- Topo: Imagem e Info --- */}
        <div className="flex items-center gap-4 mb-2">
          {/* Avatar / Logo */}
          <div className="avatar">
            <div style={{display: 'flex !important',
              justifyContent: 'center !important',
              textJustify: 'auto',
              justifyItems: 'center',
              justifySelf: 'center',
              justifyTracks: 'center',
              alignItems: 'center',
              alignContent: 'center'
            }} className="w-14 h-14 rounded-xl bg-base-200 ring-1 ring-base-300 flex items-center justify-center  overflow-hidden">
              {enterprise.image ? (
                <img
                  src={enterprise.image}
                  alt={enterprise.name}
                  className="object-cover w-full h-full"
                />
              ) : (
                <Building2 size={24} className="text-gray-400" />
              )}
            </div>
          </div>

          {/* Textos */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-secondary truncate" title={enterprise.name}>
              {enterprise.name}
            </h3>
            <div className="badge badge-ghost badge-sm text-xs font-mono text-gray-500">
              ID: {enterprise.enterprise_id}
            </div>
          </div>
        </div>

        {/* --- Rodapé: Ações e Status --- */}
        <div className="flex flex-wrap items-center justify-between mt-auto gap-3">
          
          {/* Toggle de Status (DaisyUI) */}
          <div className="form-control">
            <label className="label cursor-pointer gap-2 p-0">
              <input 
                type="checkbox" 
                className={`toggle toggle-sm ${isActive ? 'toggle-success' : 'toggle-neutral'}`}
                checked={isActive} 
                onChange={() => onToggleStatus(enterprise.enterprise_id, isActive)}
              />
              <span className={`label-text text-xs font-semibold ${isActive ? 'text-success' : 'text-gray-400'}`}>
                {isActive ? 'Ativa' : 'Inativa'}
              </span>
            </label>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-1">
            <div className="tooltip tooltip-bottom" data-tip="Consultar">
              <button 
                onClick={() => onView(enterprise.enterprise_id)} 
                className="btn btn-square btn-sm btn-ghost text-primary hover:bg-primary/10"
              >
                <Eye size={18} />
              </button>
            </div>

            <div className="tooltip tooltip-bottom" data-tip="Editar">
              <button 
                onClick={() => onEdit(enterprise.enterprise_id)} 
                className="btn btn-square btn-sm btn-ghost text-secondary hover:bg-secondary/10"
              >
                <Pencil size={18} />
              </button>
            </div>

            <div className="tooltip tooltip-bottom" data-tip="Excluir">
              <button 
                onClick={() => onDelete(enterprise.enterprise_id)} 
                className="btn btn-square btn-sm btn-ghost text-error hover:bg-error/10"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default EnterpriseCard;