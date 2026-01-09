import type { Enterprise } from '../../services/core-api';
import EnterpriseCard from './EnterpriseCard';
import { Building2 } from 'lucide-react'; 
import type { EnterpriseListProps } from '../../types/enterprise';

const EnterpriseList = ({ enterprises, onView, onEdit, onToggleStatus, onDelete }: EnterpriseListProps) => {
  
  // Tratamento de segurança para garantir array
  const listaSegura = Array.isArray(enterprises) ? enterprises : [];
  
  // --- Estado Vazio ---
  if (listaSegura.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center bg-base-100 rounded-box border border-base-200 border-dashed">
        <div className="w-20 h-20 bg-base-200 rounded-full flex items-center justify-center mb-4">
          <Building2 size={40} className="text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-secondary">Nenhuma empresa encontrada</h3>
        <p className="text-gray-500 max-w-xs mt-2">
          Não há empresas cadastradas no momento. Utilize o botão acima para criar uma nova.
        </p>
      </div>
    );
  }

  // --- Lista em Grid (Tailwind) ---
  return (
    <div className="card bg-base-100 shadow-xl border border-base-300">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 p-8 gap-6">
        {listaSegura.map((enterprise: Enterprise) => (
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
    </div>
  );
};

export default EnterpriseList;