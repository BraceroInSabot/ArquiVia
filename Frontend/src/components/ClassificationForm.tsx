import React, { type ChangeEvent } from 'react';
import { Shield, UserCheck } from 'lucide-react'; // Ícones
import { type ClassificationFormData, STATUS_OPTIONS, PRIVACITY_OPTIONS } from '../types/classification';

interface ClassificationFormProps {
  formData: ClassificationFormData;
  reviewerName: string;
  isCurrentUserTheReviewer: boolean;
  isDirty: boolean;
  isSaving: boolean;
  onFormChange: (e: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => void;
  onTakeReview: () => void;
  onSave: () => void;
}

const ClassificationForm: React.FC<ClassificationFormProps> = ({
  formData,
  reviewerName,
  isCurrentUserTheReviewer,
  onFormChange,
  onTakeReview,
}) => {
  return (
    <form onSubmit={(e) => e.preventDefault()}>
      
      {/* Checkbox Revisado */}
      <div className="mb-3 p-3 bg-light rounded border d-flex align-items-center">
        <div className="form-check form-switch mb-0">
            <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                id="is_reviewed"
                name="is_reviewed"
                checked={formData.is_reviewed}
                onChange={onFormChange}
                style={{ cursor: 'pointer' }}
            />
            <label className="form-check-label fw-bold text-dark ms-2" htmlFor="is_reviewed" style={{ cursor: 'pointer' }}>
                Documento Revisado
            </label>
        </div>
      </div>
      
      <div className="row g-3 mb-3">
          {/* Status */}
          <div className="col-md-6">
            <label htmlFor="classification_status" className="form-label fw-semibold text-secondary small text-uppercase">Status</label>
            <select 
                id="classification_status" 
                name="classification_status"
                className="form-select"
                value={formData.classification_status || "null"}
                onChange={onFormChange}
            >
                <option value="null" className="text-muted">Selecione...</option>
                {STATUS_OPTIONS.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.name}</option>
                ))}
            </select>
          </div>

          {/* Privacidade */}
          <div className="col-md-6">
            <label htmlFor="privacity" className="form-label fw-semibold text-secondary small text-uppercase">Privacidade</label>
            <select 
                id="privacity" 
                name="privacity"
                className="form-select"
                value={formData.privacity || "null"}
                onChange={onFormChange}
            >
                <option value="null" className="text-muted">Selecione...</option>
                {PRIVACITY_OPTIONS.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.name}</option>
                ))}
            </select>
          </div>
      </div>

      {/* Revisor */}
      <div className="mb-4">
        <label className="form-label fw-semibold text-secondary small text-uppercase">Revisor Responsável</label>
        <div className="d-flex justify-content-between align-items-center p-2 border rounded bg-white">
            <div className="d-flex align-items-center gap-2">
                <div className={`p-1 rounded-circle ${formData.is_reviewed ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'}`}>
                    {formData.is_reviewed ? <UserCheck size={25} /> : <Shield size={25} />}
                </div>
                <span className="info-value fw-semibold small">
                    {formData.is_reviewed ? reviewerName : "Sem revisor informado"}
                </span>
            </div>
          
          {formData.is_reviewed && !isCurrentUserTheReviewer && (
            <button 
              type="button" 
              className="take-review-btn" 
              onClick={onTakeReview}
              title="Assumir a revisão deste documento"
            >
              Assumir Revisão
            </button>
          )}
        </div>
      </div>

      {/* Botão Salvar (Escondido aqui pois agora está no footer do modal pai, mas mantido se necessário lógica local) */}
      {/* A lógica de renderização do botão está no componente Pai para unificar o footer */}
    </form>
  );
};

export default ClassificationForm;