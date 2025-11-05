import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
// 1. Importa o novo serviço de setor
import sectorService from '../services/Sector/api'; 
// 2. Importa a interface 'Sector' correta
import type { Sector } from '../services/core-api';

interface SectorSelectionModalProps {
  onClose: () => void;
  onSelectSector: (sectorId: number) => void; 
}

export default function SectorSelectionModal({ onClose, onSelectSector }: SectorSelectionModalProps) {
  // 3. Usa a nova interface 'Sector' no estado
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSectors = async () => {
      try {
        setIsLoading(true);
        // 4. Chama a função correta da API
        const response = await sectorService.getSectors();
        setSectors(response.data.data || []); 
        setError(null);
      } catch (err) {
        console.error("Erro ao buscar setores:", err);
        setError("Não foi possível carregar os setores.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSectors();
  }, []); 

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>&times;</button>
        <h2>Selecione um Setor</h2>

        <div className="sector-list-container">
          {isLoading && <p>Carregando setores...</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}
          
          {!isLoading && !error && (
            <ul className="sector-list">
              {sectors.length === 0 ? (
                <p>Você não está vinculado a nenhum setor.</p>
              ) : (
                // 5. Atualiza o JSX para usar os nomes da nova interface
                sectors.map((sector) => (
                  <li 
                    key={sector.sector_id} 
                    className="sector-list-item"
                    onClick={() => onSelectSector(sector.sector_id)} // Usa sector_id
                  >
                    <span className="sector-name">{sector.name}</span>
                    <span className="sector-enterprise">{sector.enterprise_name}</span>
                    <span className={`sector-hierarchy ${sector.hierarchy_level.toLowerCase()}`}>
                      {sector.hierarchy_level}
                    </span>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}