import type { Enterprise } from '../services/core-api';

interface EnterpriseCardProps {
  enterprise: Enterprise;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onToggleStatus: (id: number, currentStatus: boolean) => void;
  onDelete: (id: number) => void;
}

// Estilos simples para o layout
const cardStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  border: '1px solid #ccc',
  padding: '15px',
  margin: '10px 0',
  borderRadius: '8px',
};

const infoStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
};

const imageStyle: React.CSSProperties = {
  width: '50px',
  height: '50px',
  borderRadius: '8px', // Bordas quadradas ficam boas para logos
  marginRight: '15px',
  objectFit: 'cover',
  // Cor de fundo caso a imagem falhe ou não tenha sido enviada
  backgroundColor: '#f0f0f0', 
};

const EnterpriseCard = ({ enterprise, onView, onEdit, onToggleStatus, onDelete }: EnterpriseCardProps) => {
  const isActive = enterprise.is_active; 

  return (
    <div style={cardStyle}>
      {/* Lado Esquerdo: Imagem e Informações */}
      <div style={infoStyle}>
        {/* 1. Imagem da Empresa Adicionada */}
        <img
          // Use a URL da imagem vinda da API.
          // Adicione um placeholder caso ela não exista.
          src={enterprise.image || 'https://via.placeholder.com/50'}
          alt={enterprise.name}
          style={imageStyle}
        />
        <div>
          <h3 style={{ margin: 0 }}>{enterprise.name}</h3>
          {/* 2. Correção: 'enterprise.id' em vez de 'enterprise.enterprise_id' */}
          <p style={{ margin: 0, color: '#555' }}>ID: {enterprise.enterprise_id}</p>
        </div>
      </div>

      {/* Lado Direito: Ações */}
      <div>
        {/* 2. Correção: 'enterprise.id' em todos os botões */}
        <button onClick={() => onView(enterprise.enterprise_id)} style={{ marginRight: '5px' }}>Consultar</button>
        <button onClick={() => onEdit(enterprise.enterprise_id)} style={{ marginRight: '5px' }}>Alterar</button>
        <button onClick={() => onDelete(enterprise.enterprise_id)} style={{ marginRight: '5px' }}>Deletar</button>

        <label style={{ marginLeft: '5px' }}>
          <input
            type="checkbox"
            checked={isActive}
            onChange={() => onToggleStatus(enterprise.enterprise_id, isActive)}
          />
          {isActive ? 'Ativa' : 'Inativa'}
        </label>
      </div>
    </div>
  );
};

export default EnterpriseCard;