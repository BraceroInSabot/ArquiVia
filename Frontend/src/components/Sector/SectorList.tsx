import type { SectorGroup } from './SectorList.types';
import SectorCard from './SectorCard';
import type { ToggleSectorStatusPayload } from '../../services/core-api';
import { Layers, Building } from 'lucide-react'; // Ícones

interface SectorListProps {
  groups: SectorGroup[];
  onViewSector: (id: number) => void;
  onEditSector: (id: number) => void;
  onDeleteSector: (id: number) => void;
  onDeactivateOrActivate: (id: ToggleSectorStatusPayload) => void;
}

const SectorList = ({ groups, onViewSector, onEditSector, onDeleteSector, onDeactivateOrActivate }: SectorListProps) => {
  
  // Empty State (Nenhum setor encontrado)
  if (groups.length === 0) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5 text-center">
        <div className="bg-light rounded-circle p-4 mb-3">
          <Layers size={48} className="text-secondary" style={{ opacity: 0.5 }} />
        </div>
        <h5 className="fw-bold text-body-custom">Nenhum setor encontrado</h5>
        <p className="text-muted mb-0" style={{ maxWidth: '350px' }}>
          Não encontramos setores vinculados às suas empresas. Comece criando um novo setor.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4">
      {groups.map((group, index) => (
        <div key={group.enterpriseName} className={`mb-5 ${index !== groups.length - 1 ? 'border-bottom pb-5' : ''}`}>
          
          {/* Cabeçalho do Grupo (Nome da Empresa) */}
          <div className="d-flex align-items-center mb-4">
            <div className="bg-light p-2 rounded me-3 text-primary-custom">
              <Building size={24} />
            </div>
            <h4 className="fw-bold text-dark mb-0">{group.enterpriseName}</h4>
            <span className="badge bg-light text-secondary ms-3 border">
              {group.sectors.length} {group.sectors.length === 1 ? 'setor' : 'setores'}
            </span>
          </div>
          
          {/* Grid de Cards de Setor */}
          <div className="row g-4">
            {group.sectors.map(sector => (
              <div key={sector.sector_id} className="col-12 col-md-6 col-xl-4">
                <SectorCard
                  sector={sector}
                  onView={onViewSector}
                  onEdit={onEditSector}
                  onDelete={onDeleteSector}
                  onDeactivateOrActivate={onDeactivateOrActivate}
                />
              </div>
            ))}
          </div>
          
        </div>
      ))}
    </div>
  );
};

export default SectorList;