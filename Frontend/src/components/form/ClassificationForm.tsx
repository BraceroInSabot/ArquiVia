import React, { type ChangeEvent } from 'react';
import { Shield, UserCheck } from 'lucide-react';
import { type ClassificationFormData, STATUS_OPTIONS, PRIVACITY_OPTIONS } from '../../types/classification';

// Adicionando a tipagem para o novo objeto de detalhes (baseado no payload que você enviou)
export interface ReviewDetails {
  review_age_days: number;
  last_review_date_from_log: string;
}

interface ClassificationFormProps {
  formData: ClassificationFormData;
  reviewerName: string;
  // Nova prop para receber os detalhes
  reviewDetails?: ReviewDetails | null; 
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
  reviewDetails,
  isCurrentUserTheReviewer,
  onFormChange,
  onTakeReview,
}) => {

  // Função auxiliar para formatar a data por extenso
  const formatReviewDate = (isoString: string) => {
    if (!isoString) return '';
    const date = React.useMemo(() => new Date(isoString), [isoString]);
    
    return date.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  console.log("Review Details:", reviewDetails);
  console.log("Last Review Date:", formData);
  return (
    <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-5">
      
      {/* Toggle de Revisão */}
      <div className="form-control">
        <label className="label cursor-pointer justify-start gap-4 p-4 border border-base-300 rounded-xl bg-base-100 hover:border-primary/50 transition-all shadow-sm">
          <input
            type="checkbox"
            name="is_reviewed"
            className="toggle toggle-success"
            checked={formData.is_reviewed}
            onChange={onFormChange}
          />
          <div className="flex flex-col">
            <span className={`label-text font-bold text-base ${formData.is_reviewed ? 'text-secondary' : 'text-gray-500'}`}>
                {formData.is_reviewed ? 'Documento Revisado' : 'Marcar como Revisado'}
            </span>
            <span className="label-text-alt text-xs text-gray-400">
                Habilita a atribuição de um revisor responsável.
            </span>
          </div>
        </label>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Select Status */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-semibold text-secondary text-xs uppercase tracking-wide">Status</span>
            </label>
            <select 
                name="classification_status"
                className="select select-bordered w-full focus:select-primary text-base-content"
                value={formData.classification_status || "null"}
                onChange={onFormChange}
            >
                <option value="null" disabled>Selecione...</option>
                {STATUS_OPTIONS.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.name}</option>
                ))}
            </select>
          </div>

          {/* Select Privacidade */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-semibold text-secondary text-xs uppercase tracking-wide">Privacidade</span>
            </label>
            <select 
                name="privacity"
                className="select select-bordered w-full focus:select-primary text-base-content"
                value={formData.privacity || "null"}
                onChange={onFormChange}
            >
                <option value="null" disabled>Selecione...</option>
                {PRIVACITY_OPTIONS.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.name}</option>
                ))}
            </select>
          </div>
      </div>

      {/* Card de Revisor e Detalhes da Revisão */}
      <div className="form-control w-full">
        <label className="label">
            <span className="label-text font-semibold text-secondary text-xs uppercase tracking-wide">Revisor Responsável</span>
        </label>
        
        <div className="flex justify-between items-center p-3 border border-base-300 rounded-lg bg-base-100 min-h-[4.5rem]">
            
            {/* Lado Esquerdo: Ícone e Nome */}
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${formData.is_reviewed ? 'bg-success/10 text-success' : 'bg-base-200 text-base-content/30'}`}>
                    {formData.is_reviewed ? <UserCheck size={20} /> : <Shield size={20} />}
                </div>
                <span className={`font-medium text-sm truncate max-w-[150px] sm:max-w-[180px] ${formData.is_reviewed ? 'text-secondary' : 'text-gray-400 italic'}`}>
                    {formData.is_reviewed ? reviewerName : "Sem revisor informado"}
                </span>
            </div>
          
            {/* Lado Direito: Ação OU Detalhes de Data */}
            <div className="flex items-center">
                {formData.is_reviewed && !isCurrentUserTheReviewer ? (
                    <button 
                        type="button" 
                        className="btn btn-xs btn-outline btn-primary"
                        onClick={onTakeReview}
                        title="Assumir a revisão deste documento"
                    >
                        Assumir
                    </button>
                ) : (
                    // Exibe os detalhes de data se houver (e se não estiver mostrando o botão de assumir)
                    reviewDetails && formData.is_reviewed && (
                        <div className="text-right flex flex-col justify-center">
                            <span className="text-xs font-bold text-secondary flex items-center justify-end gap-1">
                                {reviewDetails.review_age_days === 0 
                                    ? "Hoje" 
                                    : `há ${reviewDetails.review_age_days} ${reviewDetails.review_age_days === 1 ? 'dia' : 'dias'}`
                                }
                            </span>
                            <span className="text-[10px] text-gray-400 font-medium">
                                ({formatReviewDate(reviewDetails.last_review_date_from_log)})
                            </span>
                        </div>
                    )
                )}
            </div>
        </div>
      </div>

    </form>
  );
};

export default ClassificationForm;