import type { Sector, ToggleSectorStatusPayload } from '../../services/core-api';
import { Eye, Pencil, Trash2, Power, Layers } from 'lucide-react';

interface SectorCardProps {
  sector: Sector;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onDeactivateOrActivate: (id: ToggleSectorStatusPayload) => void;
}

const SectorCard = ({ sector, onView, onEdit, onDelete, onDeactivateOrActivate }: SectorCardProps) => {
  
  const isSectorActive = sector.is_active;
  const isOwner = sector.hierarchy_level === 'Proprietário';
  const isManager = sector.hierarchy_level === 'Gestor';
  const isAdmin = sector.hierarchy_level === 'Administrador';

  const canView = isSectorActive || isOwner || isManager;

  const getHierarchyBadgeClass = (level: string) => {
    switch (level) {
      case 'Proprietário': return 'badge-accent text-white';
      case 'Gestor': return 'badge-primary text-white';
      case 'Administrador': return 'badge-info text-white';
      default: return 'badge-ghost text-base-content/70';
    }
  };

  if (!canView) return null;

  return (
    <div className="card bg-base-100 shadow-md border border-base-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full">
      <div className="card-body p-5 flex flex-col h-full">
        
        {/* --- Topo: Imagem e Info --- */}
        <div className="flex items-center gap-4 mb-2">
          {/* Avatar com Indicador */}
          <div className="avatar indicator">
            <span 
              className={`indicator-item badge badge-xs ${isSectorActive ? 'badge-success' : 'badge-neutral'} border-2 border-base-100`}
              title={isSectorActive ? "Ativo" : "Inativo"}
            ></span>
            <div style={{display: 'flex !important',
              justifyContent: 'center !important',
              textJustify: 'auto',
              justifyItems: 'center',
              justifySelf: 'center',
              justifyTracks: 'center',
              alignItems: 'center',
              alignContent: 'center'
            }} className="w-14 h-14 rounded-xl bg-base-200 ring-1 ring-base-300 flex items-center justify-center overflow-hidden">
              {sector.image ? (
                <img src={sector.image} alt={sector.name} className="object-cover w-full h-full" />
              ) : (
                <Layers size={24} className="text-gray-400" />
              )}
            </div>
          </div>

          {/* Textos */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-secondary truncate" title={sector.name}>
              {sector.name}
            </h3>
            <div className={`badge badge-sm ${getHierarchyBadgeClass(sector.hierarchy_level)} font-medium mt-1`}>
              {sector.hierarchy_level}
            </div>
          </div>
        </div>

        {/* --- Rodapé: Ações --- */}
        <div className="flex flex-wrap items-center justify-end mt-auto gap-2">

          {canView && (
            <div className="tooltip tooltip-bottom" data-tip="Detalhes">
                <button 
                  onClick={() => onView(sector.sector_id)} 
                  className="btn btn-square btn-sm btn-ghost text-primary hover:bg-primary/10"
                >
                  <Eye size={18} />
                </button>
            </div>
          )}

          {(isOwner || isManager || isAdmin) && (
            <div className="tooltip tooltip-bottom" data-tip="Editar">
                <button 
                  onClick={() => onEdit(sector.sector_id)} 
                  className="btn btn-square btn-sm btn-ghost text-secondary hover:bg-secondary/10"
                >
                  <Pencil size={18} />
                </button>
            </div>
          )}

          {isOwner && (
            <>
              <div className="w-px h-6 bg-base-300 mx-1"></div> {/* Divisor Vertical */}
              
              <div className="tooltip tooltip-bottom" data-tip={sector.is_active ? 'Desativar' : 'Ativar'}>
                <button 
                    onClick={() => 
                    //@ts-ignore
                    onDeactivateOrActivate(sector.sector_id as ToggleSectorStatusPayload)
                    } 
                    className={`btn btn-square btn-sm btn-ghost ${!sector.is_active ? 'text-warning hover:bg-warning/10' : 'text-success hover:bg-success/10'}`}
                >
                    <Power size={18} />
                </button>
              </div>

              <div className="tooltip tooltip-bottom" data-tip="Excluir">
                <button 
                    onClick={() => onDelete(sector.sector_id)} 
                    className="btn btn-square btn-sm btn-ghost text-error hover:bg-error/10"
                >
                    <Trash2 size={18} />
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default SectorCard;