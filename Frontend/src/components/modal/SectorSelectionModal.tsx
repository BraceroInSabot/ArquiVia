import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, AlertCircle, Building2, Layers } from 'lucide-react';

import sectorService from '../../services/Sector/api'; 
import type { Sector } from '../../services/core-api';

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
      case 'Proprietário': return 'badge-warning text-warning-content';
      case 'Gestor': return 'badge-primary text-primary-content';
      case 'Administrador': return 'badge-info text-info-content';
      default: return 'badge-ghost';
    }
  };

  return createPortal(
    <div className="modal modal-open" role="dialog">
      <div className="modal-box p-0 w-11/12 max-w-xl overflow-hidden flex flex-col max-h-[80vh]">
        
        {/* Cabeçalho Fixo */}
        <div className="flex justify-between items-center p-4 border-b border-base-200 bg-base-100 sticky top-0 z-10">
            <div>
                <h3 className="font-bold text-lg text-secondary">Selecionar Setor</h3>
                <p className="text-xs text-gray-500">Escolha onde o documento será criado</p>
            </div>
            <button 
                onClick={onClose} 
                className="btn btn-sm btn-circle btn-ghost"
                title="Fechar"
            >
                <X size={20} />
            </button>
        </div>

        {/* Corpo com Scroll */}
        <div className="overflow-y-auto flex-1">
          
          {/* Loading */}
          {isLoading && (
            <div className="flex flex-col justify-center items-center py-10 text-gray-400">
                <Loader2 className="animate-spin mb-2" size={32} />
                <span>Buscando setores...</span>
            </div>
          )}

          {/* Erro */}
          {error && (
             <div className="p-4">
                <div className="alert alert-error shadow-sm text-sm">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                </div>
             </div>
          )}
          
          {/* Lista */}
          {!isLoading && !error && (
            <>
              {sectors.length === 0 ? (
                <div className="text-center py-10 px-4">
                    <div className="mx-auto bg-base-200 w-16 h-16 rounded-full flex items-center justify-center mb-3">
                        <Layers size={32} className="text-gray-400" />
                    </div>
                    <h6 className="font-bold text-secondary">Você não está vinculado a nenhum setor.</h6>
                    <p className="text-sm text-gray-500 mt-1">Solicite acesso a um gestor ou crie uma empresa.</p>
                </div>
              ) : (
                <ul className="menu w-full p-0">
                  {sectors.map((sector) => (
                    <li key={sector.sector_id} className="border-b border-base-200 last:border-none">
                      <a 
                        onClick={() => onSelectSector(sector.sector_id)}
                        className="flex justify-between items-center py-3 px-4 gap-4 active:bg-base-200 hover:bg-base-200"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                            {/* Imagem do Setor */}
                            <div className="avatar">
                                <div style={{display: 'flex !important',
                                      justifyContent: 'center !important',
                                      textJustify: 'auto',
                                      justifyItems: 'center',
                                      justifySelf: 'center',
                                      justifyTracks: 'center',
                                      alignItems: 'center',
                                      alignContent: 'center'
                                    }} className="w-12 h-12 rounded-lg bg-base-200 ring-1 ring-base-300 flex items-center justify-center overflow-hidden">
                                    {sector.image ? (
                                        <img 
                                            src={sector.image} 
                                            alt={sector.name} 
                                            className="object-cover w-full h-full"
                                        />
                                    ) : (
                                        <Layers size={24} className="text-gray-400" /> 
                                    )}
                                </div>
                            </div>
                            
                            <div className="min-w-0">
                                <div className="font-bold text-secondary truncate">{sector.name}</div>
                                <div className="text-xs text-gray-500 flex items-center gap-1 truncate">
                                    <Building2 size={12} /> {sector.enterprise_name}
                                </div>
                            </div>
                        </div>

                        {/* Badge */}
                        <span className={`badge badge-sm ${getHierarchyBadgeClass(sector.hierarchy_level)} whitespace-nowrap`}>
                          {sector.hierarchy_level}
                        </span>
                        
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
        
        {/* Rodapé Fixo (Opcional, para fechar visualmente) */}
        <div className="bg-base-100 p-2 border-t border-base-200"></div>

      </div>

      {/* Backdrop para fechar ao clicar fora */}
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </div>,
    document.body
  );
}

export default SectorSelectionModal;