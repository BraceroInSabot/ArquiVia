import type { Enterprise } from '../services/core-api';

interface EnterpriseCardProps {
  enterprise: Enterprise;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onToggleStatus: (id: number, currentStatus: boolean) => void;
  onDelete: (id: number) => void;
}

const EnterpriseCard = ({ enterprise, onView, onEdit, onToggleStatus, onDelete }: EnterpriseCardProps) => {
  const isActive = true; // No futuro, isso viria de `enterprise.status` ou algo similar
  console.log(enterprise);
  return (
    <div style={{ border: '1px solid black', margin: '10px', padding: '10px' }}>
      <h3>{enterprise.name}</h3>
      <p>ID: {enterprise.enterprise_id}</p>

      {/* Botões de Ação */}
      {/* Cada botão chama a função recebida via prop, passando o ID da empresa */}
      <button onClick={() => onView(enterprise.enterprise_id)}>Consultar</button>
      <button onClick={() => onEdit(enterprise.enterprise_id)}>Alterar</button>
      <button onClick={() => onDelete(enterprise.enterprise_id)}>Deletar</button>

      {/* Switch para Ativar/Desativar */}
      <label>
        <input
          type="checkbox"
          checked={isActive}
          onChange={() => onToggleStatus(enterprise.enterprise_id, isActive)}
        />
        {isActive ? 'Ativa' : 'Inativa'}
      </label>
    </div>
  );
};

export default EnterpriseCard;