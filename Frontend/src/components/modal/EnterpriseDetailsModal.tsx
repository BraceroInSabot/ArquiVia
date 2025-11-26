import React from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Calendar, Hash, Building2, Layers, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';
import type { Enterprise } from '../../services/core-api';
import '../../assets/css/ClassificationModal.css'; // Reutiliza CSS base

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
      <div className="modal-backdrop fade show" style={{ zIndex: 1050 }} onClick={onClose}></div>
      
      <div className="modal fade show d-block" tabIndex={-1} onClick={onClose}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            
            {/* Cabeçalho Decorativo */}
            <div className="modal-header bg-light border-bottom-0 pb-5 position-relative">
                <button 
                    type="button" 
                    className="btn-close position-absolute top-0 end-0 m-3" 
                    onClick={onClose}
                    aria-label="Fechar"
                ></button>
            </div>

            <div className="modal-body pt-0 px-4 pb-4">
                
                {/* Bloco de Identidade (Logo e Nome) */}
                <div className="text-center mt-n5 mb-4">
                    <div className="position-relative d-inline-block">
                        <div className="rounded-circle bg-white p-1 shadow-sm">
                            <div 
                                className="rounded-circle d-flex align-items-center justify-content-center bg-light overflow-hidden"
                                style={{ width: '90px', height: '90px', border: '1px solid #eee' }}
                            >
                                {enterprise.image ? (
                                    <img src={enterprise.image} alt={enterprise.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <Building2 size={40} className="text-secondary opacity-50" />
                                )}
                            </div>
                        </div>
                        {/* Badge de Status Principal */}
                        <span 
                            className={`position-absolute bottom-0 end-0 p-2 rounded-circle border border-white ${enterprise.is_active ? 'bg-success' : 'bg-secondary'}`}
                            title={enterprise.is_active ? "Empresa Ativa" : "Empresa Inativa"}
                        ></span>
                    </div>

                    <h3 className="fw-bold text-dark mt-3 mb-1">{enterprise.name}</h3>
                    <p className="text-muted small mb-0">
                        Proprietário: <span className="fw-medium text-dark">{enterprise.owner_name}</span>
                    </p>
                </div>

                {/* Grid de Metadados */}
                <div className="row g-3 mb-4">
                    <div className="col-6">
                        <div className="p-2 border rounded bg-light d-flex align-items-center gap-2">
                            <div className="bg-white p-1 rounded border text-muted"><Hash size={16} /></div>
                            <div className="d-flex flex-column">
                                <span className="text-muted" style={{fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 'bold'}}>ID</span>
                                <span className="fw-bold text-dark small">#{enterprise.enterprise_id}</span>
                            </div>
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="p-2 border rounded bg-light d-flex align-items-center gap-2">
                            <div className="bg-white p-1 rounded border text-muted"><Calendar size={16} /></div>
                            <div className="d-flex flex-column">
                                <span className="text-muted" style={{fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 'bold'}}>Criação</span>
                                <span className="fw-bold text-dark small">
                                    {enterprise.created_at}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lista de Setores com Scroll */}
                <div>
                    <h6 className="fw-bold text-secondary small text-uppercase mb-3 d-flex align-items-center gap-2">
                        <Layers size={16} />
                        Setores Vinculados ({enterprise.sectors?.length || 0})
                    </h6>
                    
                    {/* Container da lista com Scroll */}
                    <div 
                        className="list-group list-group-flush border rounded" 
                        style={{ maxHeight: '220px', overflowY: 'auto' }} // <-- Scroll habilitado aqui
                    >
                        {enterprise.sectors && enterprise.sectors.length > 0 ? (
                            enterprise.sectors.map((sector) => (
                                <button
                                    key={sector.sector_id}
                                    type="button"
                                    className="list-group-item list-group-item-action d-flex justify-content-between align-items-center px-3 py-3 border-bottom"
                                    onClick={() => handleSectorClick(sector.sector_id)}
                                >
                                    <div className="d-flex align-items-center gap-2">
                                        {sector.is_active ? (
                                            <CheckCircle2 size={16} className="text-success" />
                                        ) : (
                                            <XCircle size={16} className="text-secondary opacity-50" />
                                        )}
                                        <span className={sector.is_active ? 'text-dark fw-medium' : 'text-muted'}>
                                            {sector.name}
                                        </span>
                                    </div>
                                    <ChevronRight size={16} className="text-muted" />
                                </button>
                            ))
                        ) : (
                            <div className="text-center py-5 text-muted small bg-light">
                                Nenhum setor vinculado a esta empresa.
                            </div>
                        )}
                    </div>
                </div>

            </div>

            <div className="modal-footer border-top-0 bg-light justify-content-center py-3">
                <button className="btn btn-secondary px-4" onClick={onClose}>
                    Fechar
                </button>
            </div>

          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

export default EnterpriseDetailsModal;