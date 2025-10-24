import type { SectorGroup } from './SectorList.types';

interface SectorListProps {
  groups: SectorGroup[];
}

const SectorList = ({ groups }: SectorListProps) => {
  // A lógica de "nenhum setor" fica aqui, mais perto da exibição
  if (groups.length === 0) {
    return <p>Nenhum setor encontrado para as empresas que você pertence.</p>;
  }

  return (
    <div>
      {groups.map(group => (
        <div key={group.enterpriseName}>
          <h2>{group.enterpriseName}</h2>
          <ul>
            {group.sectors.map(sector => (
              <li key={sector.id}>
                {sector.name}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default SectorList;