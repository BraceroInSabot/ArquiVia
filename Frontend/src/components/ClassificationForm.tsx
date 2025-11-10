import React, { type ChangeEvent } from 'react';
import { type ClassificationFormData, STATUS_OPTIONS, PRIVACITY_OPTIONS } from '../types/classification';

// Props que o formulário espera
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
  isDirty,
  isSaving,
  onFormChange,
  onTakeReview,
  onSave,
}) => {
  return (
    <form className="classification-form" onSubmit={(e) => e.preventDefault()}>
      <div className="form-item">
        <label htmlFor="is_reviewed">Revisado</label>
        <input
          type="checkbox"
          id="is_reviewed"
          name="is_reviewed"
          checked={formData.is_reviewed}
          onChange={onFormChange}
        />
      </div>
      
      <div className="form-item">
        <label htmlFor="classification_status">Status</label>
        <select 
          id="classification_status" 
          name="classification_status"
          value={formData.classification_status || "null"}
          onChange={onFormChange}
        >
          <option value="null">Não definido</option>
          {STATUS_OPTIONS.map(opt => (
            <option key={opt.id} value={opt.id}>{opt.name}</option>
          ))}
        </select>
      </div>

      <div className="form-item">
        <label htmlFor="privacity">Privacidade</label>
        <select 
          id="privacity" 
          name="privacity"
          value={formData.privacity || "null"}
          onChange={onFormChange}
        >
          <option value="null">Não definido</option>
          {PRIVACITY_OPTIONS.map(opt => (
            <option key={opt.id} value={opt.id}>{opt.name}</option>
          ))}
        </select>
      </div>

      <div className="form-item">
        <label>Revisor</label>
        <div className="reviewer-field">
          <span className="info-value">
            {formData.is_reviewed ? reviewerName : "Nenhum"}
          </span>
          
          {formData.is_reviewed && !isCurrentUserTheReviewer && (
            <button 
              type="button" 
              className="take-review-btn" 
              onClick={onTakeReview}
            >
              Tornar-se Revisor
            </button>
          )}
        </div>
      </div>

      <div className="modal-footer">
        <button 
          type="button" 
          className="modal-save-btn"
          onClick={onSave}
          disabled={!isDirty || isSaving}
        >
          {isSaving ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
};

export default ClassificationForm;