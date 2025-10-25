import type { Sector } from '../services/core-api';

interface SectorCardProps {
  sector: Sector;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onDeactivateOrActivate: (id: number) => void;
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

  console.log("Setor:", sector);

  return (
    <div style={cardStyle}>
      <div style={infoStyle}>
        <img 
          src='https://picsum.photos/200/300' 
          // TODO: Ajustar imagem do setor ao configurar recebimento de imagem da API
          // tecnicamente seria: sector.image || 'https://www.svgrepo.com/show/59087/group.svg'
          alt={sector.name} 
          style={imageStyle} 
        />
        <div>
          <strong style={{ display: 'block' }}>{sector.name}</strong>
          <small>{sector.hierarchy_level}</small>
        </div>
      </div>

      <div>
        <button onClick={() => onView(sector.sector_id)} style={{ marginRight: '5px' }}>
          Consultar
        </button>
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
                <button onClick={() => onDeactivateOrActivate(sector.sector_id)}>
                    Desativar / Ativar
                </button>
            </div>
        ) : null}
      </div>
    </div>
  );
};

export default SectorCard;