import type { SectorGroup } from './SectorList.types';
import SectorCard from './SectorCard'; 

interface SectorListProps {
  groups: SectorGroup[];
  onViewSector: (id: number) => void;
  onEditSector: (id: number) => void;
  onDeleteSector: (id: number) => void;
  onDeactivateOrActivate: (id: number) => void;
}

const SectorList = ({ groups, onViewSector, onEditSector, onDeleteSector, onDeactivateOrActivate }: SectorListProps) => {
  if (groups.length === 0) {
    return <p>Nenhum setor encontrado para as empresas que você pertence.</p>;
  }

  return (
    <div>
      {groups.map(group => (
        <div key={group.enterpriseName}>
          <h2>{group.enterpriseName}</h2>
          
          <div>
            {group.sectors.map(sector => (
              <SectorCard
                key={sector.id}
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