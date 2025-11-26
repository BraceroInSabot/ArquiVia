import type { SectorGroup } from './SectorList.types';
import SectorCard from './SectorCard';
import type { ToggleSectorStatusPayload } from '../../services/core-api';
import { Layers, Building } from 'lucide-react'; 

interface SectorListProps {
  groups: SectorGroup[];
  onViewSector: (id: number) => void;
  onEditSector: (id: number) => void;
  onDeleteSector: (id: number) => void;
  onDeactivateOrActivate: (id: ToggleSectorStatusPayload) => void;
}

const SectorList = ({ groups, onViewSector, onEditSector, onDeleteSector, onDeactivateOrActivate }: SectorListProps) => {
  
  // --- Estado Vazio ---
  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center bg-base-100 rounded-box border border-base-200 border-dashed">
        <div className="w-20 h-20 bg-base-200 rounded-full flex items-center justify-center mb-4">
          <Layers size={40} className="text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-secondary">Nenhum setor encontrado</h3>
        <p className="text-gray-500 max-w-sm mt-2">
          Não encontramos setores vinculados às suas empresas. Comece criando um novo setor.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12 py-6">
      {groups.map((group, index) => (
        <div key={group.enterpriseName} className={`${index !== groups.length - 1 ? 'border-b border-base-200 pb-10' : ''}`}>
          
          {/* Cabeçalho do Grupo (Empresa) */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Building size={24} />
            </div>
            <h2 className="text-2xl font-bold text-secondary">{group.enterpriseName}</h2>
            <div className="badge badge-secondary ml-2 mt-1 font-mono">
              {group.sectors.length} {group.sectors.length === 1 ? 'setor' : 'setores'}
            </div>
          </div>
          
          {/* Grid de Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {group.sectors.map(sector => (
              <SectorCard
                key={sector.sector_id}
                sector={sector}
                onView={onViewSector}
                onEdit={onEditSector}
                onDelete={onDeleteSector}
                onDeactivateOrActivate={onDeactivateOrActivate}
              />
            ))}
          </div>
          
        </div>
      ))}
    </div>
  );
};

export default SectorList;