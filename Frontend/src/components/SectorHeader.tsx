interface SectorHeaderProps {
  title: string;
  onCreate: () => void;
}

const SectorHeader = ({ title, onCreate }: SectorHeaderProps) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <h1 style={{ textAlign: 'left' }}>{title}</h1>
      <button onClick={onCreate}>
        Criar Novo Setor
      </button>
    </div>
  );
};

export default SectorHeader;