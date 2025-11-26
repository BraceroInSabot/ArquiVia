import React from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Calendar, Hash, Building2, Layers, ChevronRight, CheckCircle2, XCircle, X } from 'lucide-react';
import type { Enterprise } from '../../services/core-api';

interface EnterpriseDetailsModalProps {
  enterprise: Enterprise;
  onClose: () => void;
}

const EnterpriseDetailsModal: React.FC<EnterpriseDetailsModalProps> = ({ enterprise, onClose }) => {
  const navigate = useNavigate();

  const handleSectorClick = (sectorId: number) => {
    onClose();
    navigate(`/setor/${sectorId}`);
  };

  return createPortal(
    <>
      {/* Backdrop */}
      <div className="modal modal-open">
        <div className="modal-box relative p-0 overflow-hidden w-11/12 max-w-lg">
            
            {/* Botão Fechar Flutuante */}
            <button 
                className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 z-10 text-white hover:bg-white/20" 
                onClick={onClose}
            >
                <X size={20} />
            </button>

            {/* Cabeçalho Decorativo (Banner) */}
            <div className="h-24 bg-gradient-to-r from-secondary to-neutral"></div>

            <div className="px-6 pb-6">
                
                {/* Bloco de Identidade (Logo e Nome) */}
                <div className="text-center -mt-12 mb-6 relative z-0">
                    <div className="avatar indicator">
                        {/* Badge de Status */}
                        <span 
                            className={`indicator-item badge ${enterprise.is_active ? 'badge-success' : 'badge-neutral'} badge-sm border-2 border-base-100 p-1`}
                            title={enterprise.is_active ? "Ativa" : "Inativa"}
                        ></span>
                        
                        <div className="w-24 h-24 rounded-full ring ring-base-100 ring-offset-base-100 ring-offset-2 bg-base-100 flex items-center justify-center overflow-hidden shadow-md">
                             {enterprise.image ? (
                                <img src={enterprise.image} alt={enterprise.name} />
                            ) : (
                                <Building2 size={32} className="text-base-300" />
                            )}
                        </div>
                    </div>

                    <h3 className="font-bold text-2xl text-secondary mt-3">{enterprise.name}</h3>
                    <p className="text-sm text-gray-500">
                        Proprietário: <span className="font-semibold text-secondary">{enterprise.owner_name}</span>
                    </p>
                </div>

                {/* Grid de Metadados */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="stat bg-base-200 rounded-box p-3 place-items-center">
                        <div className="stat-title flex items-center gap-1 text-xs uppercase font-bold text-gray-500">
                            <Hash size={12} /> ID
                        </div>
                        <div className="stat-value text-lg text-secondary">#{enterprise.enterprise_id}</div>
                    </div>
                    <div className="stat bg-base-200 rounded-box p-3 place-items-center">
                        <div className="stat-title flex items-center gap-1 text-xs uppercase font-bold text-gray-500">
                            <Calendar size={12} /> Criação
                        </div>
                        <div className="stat-value text-lg text-secondary">
                            {/* Tratamento seguro de data */}
                            {enterprise.created_at ? new Date(enterprise.created_at).toLocaleDateString() : "-"}
                        </div>
                    </div>
                </div>

                {/* Lista de Setores */}
                <div>
                    <h4 className="font-bold text-sm text-gray-500 uppercase mb-3 flex items-center gap-2">
                        <Layers size={16} />
                        Setores Vinculados <span className="badge badge-sm badge-ghost">{enterprise.sectors?.length || 0}</span>
                    </h4>
                    
                    <div className="bg-base-100 border border-base-200 rounded-xl overflow-hidden max-h-52 overflow-y-auto">
                        {enterprise.sectors && enterprise.sectors.length > 0 ? (
                            <ul className="menu bg-base-100 w-full p-0">
                                {enterprise.sectors.map((sector) => (
                                    <li key={sector.sector_id} className="border-b border-base-200 last:border-none">
                                        <a 
                                            onClick={() => handleSectorClick(sector.sector_id)}
                                            className="flex justify-between items-center py-3 px-4 hover:bg-base-200 active:bg-base-300"
                                        >
                                            <div className="flex items-center gap-3">
                                                {sector.is_active ? (
                                                    <CheckCircle2 size={18} className="text-success" />
                                                ) : (
                                                    <XCircle size={18} className="text-gray-300" />
                                                )}
                                                <span className={`font-medium ${sector.is_active ? 'text-secondary' : 'text-gray-400'}`}>
                                                    {sector.name}
                                                </span>
                                            </div>
                                            <ChevronRight size={16} className="text-gray-400" />
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="py-8 text-center text-gray-400 text-sm italic">
                                Nenhum setor vinculado a esta empresa.
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
        {/* Clica fora para fechar */}
        <form method="dialog" className="modal-backdrop">
            <button onClick={onClose}>close</button>
        </form>
      </div>
    </>,
    document.body
  );
};

export default EnterpriseDetailsModal;