import type { Enterprise } from '../services/core-api';
import EnterpriseCard from './EnterpriseCard';

// As props são a lista de empresas e as funções de ação
interface EnterpriseListProps {
  enterprises: Enterprise[];
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onToggleStatus: (id: number, currentStatus: boolean) => void;
  onDelete: (id: number) => void;
}


const EnterpriseList = ({ enterprises, onView, onEdit, onToggleStatus, onDelete }: EnterpriseListProps) => {
  if (enterprises.length === 0) {
    return <p>Nenhuma empresa cadastrada.</p>;
  }

  console.log(enterprises);

  return (
    <div>
      <h2>Lista de Empresas</h2>
      {enterprises.map(enterprise => (
        <EnterpriseCard
          key={enterprise.enterprise_id}
          enterprise={enterprise}
          onView={onView}
          onEdit={onEdit}
          onToggleStatus={onToggleStatus}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default EnterpriseList;