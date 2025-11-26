import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, AlertCircle, Building2, Layers } from 'lucide-react'; // 'Layers' será removido do JSX

import sectorService from '../../services/Sector/api'; 
import type { Sector } from '../../services/core-api';

import '../../assets/css/ClassificationModal.css'; 
import '../../assets/css/EnterprisePage.css'; // Para estilos de imagem, badges, etc.

interface SectorSelectionModalProps {
  onClose: () => void;
  onSelectSector: (sectorId: number) => void; 
}

const SectorSelectionModal = ({ onClose, onSelectSector }: SectorSelectionModalProps) => {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSectors = async () => {
      try {
        setIsLoading(true);
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

  const getHierarchyBadgeClass = (level: string) => {
    switch (level) {
      case 'Proprietário': return 'bg-warning text-dark';
      case 'Gestor': return 'bg-primary text-white';
      case 'Administrador': return 'bg-info text-white';
      default: return 'bg-secondary text-white';
    }
  };

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content p-0 overflow-hidden" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '550px', borderRadius: '12px' }}
      >
        
        <div className="d-flex justify-content-between align-items-center p-4 border-bottom bg-light">
            <div>
                <h4 className="fw-bold text-dark mb-1">Selecionar Setor</h4>
                <p className="text-muted small mb-0">Escolha onde o documento será criado</p>
            </div>
            <button 
                onClick={onClose} 
                className="btn btn-link text-secondary p-0 text-decoration-none hover-danger"
                title="Fechar"
            >
                <X size={24} />
            </button>
        </div>

        <div className="sector-list-container" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          
          {isLoading && (
            <div className="d-flex flex-column justify-content-center align-items-center py-5 text-muted">
                <Loader2 className="animate-spin mb-2" size={32} />
                <span>Buscando setores...</span>
            </div>
          )}

          {error && (
             <div className="p-4">
                <div className="alert alert-danger d-flex align-items-center" role="alert">
                    <AlertCircle className="me-2" size={20} />
                    <div>{error}</div>
                </div>
             </div>
          )}
          
          {!isLoading && !error && (
            <>
              {sectors.length === 0 ? (
                <div className="text-center py-5 px-4">
                    {/* Mantive o ícone 'Layers' aqui para o estado vazio, para não ficar sem nada */}
                    <Layers size={48} className="text-secondary opacity-25 mb-3" />
                    <h6 className="text-muted">Você não está vinculado a nenhum setor.</h6>
                    <p className="small text-muted mb-0">Solicite acesso a um gestor ou crie uma empresa.</p>
                </div>
              ) : (
                <ul className="list-group list-group-flush">
                  {sectors.map((sector) => (
                    <li 
                      key={sector.sector_id} 
                      className="list-group-item list-group-item-action p-3 cursor-pointer border-bottom-0 border-top"
                      onClick={() => onSelectSector(sector.sector_id)}
                      style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        
                        {/* Lado Esquerdo: Imagem do Setor e Info */}
                        <div className="d-flex align-items-center">
                            {/* IMAGEM DO SETOR AQUI */}
                            <div className="me-3 bg-light rounded d-flex align-items-center justify-content-center overflow-hidden" 
                                 style={{ width: '48px', height: '48px', flexShrink: 0, border: '1px solid var(--bs-border-color)' }}>
                                {sector.image ? (
                                    <img 
                                        src={sector.image} 
                                        alt={sector.name} 
                                        className="img-fluid" // Torna a imagem responsiva ao contêiner
                                        style={{ objectFit: 'cover', width: '100%', height: '100%' }} // Garante que preencha o espaço
                                    />
                                ) : (
                                    // Fallback para quando não há imagem: um ícone genérico ou a primeira letra
                                    <Layers size={24} className="text-muted" /> 
                                )}
                            </div>
                            <div>
                                <h6 className="fw-bold text-dark mb-1">{sector.name}</h6>
                                <div className="d-flex align-items-center text-muted small">
                                    <Building2 size={14} className="me-1" />
                                    {sector.enterprise_name}
                                </div>
                            </div>
                        </div>

                        {/* Lado Direito: Badge */}
                        <span className={`badge ${getHierarchyBadgeClass(sector.hierarchy_level)} fw-normal rounded-pill px-3`}>
                          {sector.hierarchy_level}
                        </span>
                        
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
        
        <div className="bg-light p-2 border-top"></div>

      </div>
    </div>,
    document.body
  );
}

export default SectorSelectionModal;