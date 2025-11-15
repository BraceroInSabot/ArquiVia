import type { Sector, ToggleSectorStatusPayload } from '../services/core-api';
import { Eye, Pencil, Trash2, Power, FileText, Layers } from 'lucide-react'; // Ícones
import '../assets/css/SectorCard.css';

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

  // Helper para cor do badge de hierarquia
  const getHierarchyBadgeClass = (level: string) => {
    switch (level) {
      case 'Proprietário': return 'bg-warning text-dark';
      case 'Gestor': return 'bg-primary text-white';
      case 'Administrador': return 'bg-info text-white';
      default: return 'bg-secondary text-white';
    }
  };

  if (!canView) return null;

  return (
    <div className="card h-100 border-0 shadow-sm hover-effect">
      <div className="card-body d-flex flex-column">
        
        {/* Cabeçalho: Imagem e Nome */}
        <div className="d-flex align-items-center mb-3">
          {/* Container da Imagem com Indicador de Status */}
          <div className="position-relative flex-shrink-0">
            <div 
              className="rounded-circle overflow-hidden border d-flex align-items-center justify-content-center bg-light"
              style={{ width: '48px', height: '48px' }}
            >
              {sector.image ? (
                <img 
                  src={sector.image} 
                  alt={sector.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              ) : (
                <Layers size={24} className="text-secondary opacity-50" />
              )}
            </div>
            {/* Bolinha de Status */}
            <span 
              className={`position-absolute top-0 start-100 translate-middle p-1 border border-light rounded-circle ${isSectorActive ? 'bg-success' : 'bg-secondary'}`}
              style={{ width: '12px', height: '12px' }}
              title={isSectorActive ? "Ativo" : "Inativo"}
            ></span>
          </div>

          {/* Informações de Texto */}
          <div className="ms-3 overflow-hidden">
            <h5 className="fw-bold text-dark mb-1 text-truncate" title={sector.name}>
              {sector.name}
            </h5>
            <span className={`badge ${getHierarchyBadgeClass(sector.hierarchy_level)} fw-normal`}>
              {sector.hierarchy_level}
            </span>
          </div>
        </div>

        <hr className="my-2 text-muted opacity-25" />

        {/* Barra de Ações */}
        <div className="d-flex justify-content-end align-items-center gap-2 mt-auto pt-2">
          
          {/* Botão Documentos (Sempre visível se o card renderiza) */}
          <button className="btn btn-light btn-sm text-secondary" title="Ver Documentos">
            <FileText size={18} />
          </button>

          {canView && (
            <button 
              onClick={() => onView(sector.sector_id)} 
              className="btn btn-light btn-sm text-primary-custom"
              title="Consultar Detalhes"
            >
              <Eye size={18} />
            </button>
          )}

          {/* Ações de Edição (Proprietário, Gestor, Admin) */}
          {(isOwner || isManager || isAdmin) && (
            <button 
              onClick={() => onEdit(sector.sector_id)} 
              className="btn btn-light btn-sm text-primary-custom"
              title="Editar Setor"
            >
              <Pencil size={18} />
            </button>
          )}

          {/* Ações Administrativas (Apenas Proprietário) */}
          {isOwner && (
            <>
              <div className="vr mx-1 bg-secondary opacity-25"></div> {/* Divisor vertical */}
              
              <button 
                onClick={() => 
                  //@ts-ignore
                  onDeactivateOrActivate(sector.sector_id as ToggleSectorStatusPayload)
                } 
                className={`btn btn-sm ${sector.is_active ? 'btn-light text-warning' : 'btn-light text-success'}`}
                title={sector.is_active ? 'Desativar' : 'Ativar'}
              >
                <Power size={18} />
              </button>

              <button 
                onClick={() => onDelete(sector.sector_id)} 
                className="btn btn-light btn-sm text-danger"
                title="Remover Setor"
              >
                <Trash2 size={18} />
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default SectorCard;