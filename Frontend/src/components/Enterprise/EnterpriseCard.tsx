import type { Enterprise } from '../../services/core-api';
import { Eye, Pencil, Trash2, Building2 } from 'lucide-react'; // Ícones
import '../../assets/css/EnterpriseCard.css';

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
    <div className="card h-100 border-0 shadow-sm" style={{ transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}>
      <div className="card-body d-flex flex-column">
        
        {/* Topo: Imagem e Informações Principais */}
        <div className="d-flex align-items-center mb-3">
          {/* Área da Imagem/Logo */}
          <div 
            className="flex-shrink-0 rounded overflow-hidden d-flex align-items-center justify-content-center border"
            style={{ width: '56px', height: '56px', backgroundColor: '#f8f9fa' }}
          >
            {enterprise.image ? (
              <img
                src={enterprise.image}
                alt={enterprise.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <Building2 size={24} className="text-secondary" style={{ opacity: 0.5 }} />
            )}
          </div>

          {/* Textos */}
          <div className="ms-3 overflow-hidden">
            <h5 className="fw-bold text-dark mb-1 text-truncate" title={enterprise.name}>
              {enterprise.name}
            </h5>
            <span className="badge bg-light text-secondary border fw-normal">
              ID: {enterprise.enterprise_id}
            </span>
          </div>
        </div>

        {/* Divisor visual */}
        <hr className="my-3 text-muted" style={{ opacity: 0.1 }} />

        {/* Rodapé: Status e Ações */}
        {/* ADICIONADO: 'flex-wrap' e 'gap-3' para responsividade */}
        <div className="d-flex justify-content-between align-items-center mt-auto flex-wrap gap-3">
          
          {/* Switch de Status */}
          <div className="d-flex align-items-center">
            <div className="form-check form-switch mb-0">
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                id={`status-switch-${enterprise.enterprise_id}`}
                checked={isActive}
                onChange={() => onToggleStatus(enterprise.enterprise_id, isActive)}
                style={{ cursor: 'pointer' }}
              />
              <label 
                className={`form-check-label small fw-semibold ${isActive ? 'text-success' : 'text-muted'}`} 
                htmlFor={`status-switch-${enterprise.enterprise_id}`}
                style={{ cursor: 'pointer' }}
              >
                {isActive ? 'Ativa' : 'Inativa'}
              </label>
            </div>
          </div>

          {/* Grupo de Botões de Ação */}
          {/* ADICIONADO: 'flex-wrap' para os botões não saírem do card */}
          <div className="d-flex gap-2 flex-wrap">
            <button 
              onClick={() => onView(enterprise.enterprise_id)} 
              className="btn btn-light btn-sm text-primary-custom"
              title="Consultar Detalhes"
            >
              <Eye size={18} />
            </button>
            
            <button 
              onClick={() => onEdit(enterprise.enterprise_id)} 
              className="btn btn-light btn-sm text-primary-custom"
              title="Editar Empresa"
            >
              <Pencil size={18} />
            </button>
            
            <button 
              onClick={() => onDelete(enterprise.enterprise_id)} 
              className="btn btn-light btn-sm text-danger"
              title="Excluir Empresa"
            >
              <Trash2 size={18} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default EnterpriseCard;