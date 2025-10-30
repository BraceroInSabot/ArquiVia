import type { Sector, ToggleSectorStatusPayload } from '../services/core-api';

interface SectorCardProps {
  sector: Sector;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onDeactivateOrActivate: (id: ToggleSectorStatusPayload) => void;
}

const SectorCard = ({ sector, onView, onEdit, onDelete, onDeactivateOrActivate }: SectorCardProps) => {
  
  const cardStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    border: '1px solid #ccc',
    padding: '10px',
    margin: '5px 0',
  };

  const infoStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
  };

  const imageStyle: React.CSSProperties = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    marginRight: '15px',
    objectFit: 'cover',
  };

  const isSectorActive = sector.is_active;
  const isOwner = sector.hierarchy_level === 'Proprietário';
  const isManager = sector.hierarchy_level === 'Gestor';

  const canView = isSectorActive || isOwner || isManager;

  return (
    <div>
      {canView ? (
      <div style={cardStyle}>
        <div style={infoStyle}>
          <img 
            src={sector.image} 
            alt={sector.name} 
            style={imageStyle} 
          />
          <div>
            <strong style={{ display: 'block' }}>{sector.name}</strong>
            <small>{sector.hierarchy_level}</small>
          </div>
        </div>

        <div>
          {canView && (
            <button onClick={() => onView(sector.sector_id)} style={{ marginRight: '5px' }}>
              Consultar
            </button>
          )}
          
          <button style={{ marginRight: '5px' }}>
            Documentos
          </button>

          {sector.hierarchy_level === 'Proprietário' || sector.hierarchy_level === 'Gestor' || sector.hierarchy_level === 'Administrador' ? (
          <button onClick={() => onEdit(sector.sector_id)} style={{ marginRight: '5px' }}> 
            Editar 
          </button>
          ) : null}
          {sector.hierarchy_level === 'Proprietário' ? (
              <div>
                  <button onClick={() => onDelete(sector.sector_id)}>
                      Remover 
                  </button>
                  <button onClick={() => 
                    //@ts-ignore
                    onDeactivateOrActivate(sector.sector_id as ToggleSectorStatusPayload)
                    }>
                    {sector.is_active ? 'Desativar' : 'Ativar'}
                  </button>
              </div>
          ) : null}
        </div>
      </div>
      ) : null}
    </div>
  );
};

export default SectorCard;