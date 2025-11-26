import type { Enterprise } from '../services/core-api';
import EnterpriseCard from './EnterpriseCard';
import { Building2 } from 'lucide-react'; 

interface EnterpriseListProps {
  enterprises: Enterprise[] | any; 
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onToggleStatus: (id: number, currentStatus: boolean) => void;
  onDelete: (id: number) => void;
}

const EnterpriseList = ({ enterprises, onView, onEdit, onToggleStatus, onDelete }: EnterpriseListProps) => {
  
  const listaSegura = Array.isArray(enterprises) ? enterprises : [];
  
  console.log("Lista processada:", listaSegura);

  if (listaSegura.length === 0) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5 text-center">
        <div className="bg-light rounded-circle p-4 mb-3">
          <Building2 size={48} className="text-secondary" style={{ opacity: 0.5 }} />
        </div>
        <h5 className="fw-bold text-body-custom">Nenhuma empresa encontrada</h5>
        <p className="text-muted mb-0" style={{ maxWidth: '300px' }}>
          Não há empresas cadastradas no momento ou houve um erro na leitura dos dados.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="row g-4">
        {listaSegura.map(enterprise => (
          <div key={enterprise.enterprise_id} className="col-12 col-md-6 col-xl-4">
            <EnterpriseCard
              enterprise={enterprise}
              onView={onView}
              onEdit={onEdit}
              onToggleStatus={onToggleStatus}
              onDelete={onDelete}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default EnterpriseList;