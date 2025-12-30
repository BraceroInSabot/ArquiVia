import React, { useState, useMemo, type ChangeEvent } from 'react';
import { Shield, UserCheck, X, Search, Plus } from 'lucide-react';
import { STATUS_OPTIONS, PRIVACITY_OPTIONS, type ClassificationFormData } from '../../types/classification';
import type { ExclusiveUser } from '../../services/core-api';
import { toast } from 'react-hot-toast';

export interface ReviewDetails {
  review_age_days: number;
  last_review_date_from_log: string;
}

interface ClassificationFormProps {
  formData: ClassificationFormData;
  reviewerName: string;
  reviewDetails?: ReviewDetails | null; 
  allUsers: ExclusiveUser[]; // Lista completa para o autocomplete
  isCurrentUserTheReviewer: boolean;
  isDirty: boolean;
  isSaving: boolean;
  onFormChange: (e: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => void;
  onExclusiveUsersChange: (users: ExclusiveUser[]) => void;
  onTakeReview: () => void;
  onSave: () => void;
}

const ClassificationForm: React.FC<ClassificationFormProps> = ({
  formData,
  reviewerName,
  reviewDetails,
  allUsers = [],
  isCurrentUserTheReviewer,
  onFormChange,
  onExclusiveUsersChange,
  onTakeReview,
}) => {
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const formatReviewDate = (isoString: string) => {
    if (!isoString) return '';
    const date = React.useMemo(() => new Date(isoString), [isoString]);
    return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // Filtra usuários disponíveis (que ainda não foram selecionados)
  const filteredUsers = useMemo(() => {
    if (!userSearchQuery) return [];
    const lowerQuery = userSearchQuery.toLowerCase();

    console.log('All Users:', allUsers);
    console.log('Selected Exclusive Users:', formData.exclusive_users);
    console.log('Lower Query:', lowerQuery);
    
    return allUsers.filter(user => 
      user.name?.toLowerCase().includes(lowerQuery) && 
      !formData.exclusive_users?.some(selected => selected.user_id === user.user_id)
    );
  }, [userSearchQuery, allUsers, formData.exclusive_users]);

  const handleAddUser = (user: ExclusiveUser) => {
    const currentUsers = formData.exclusive_users || [];
    onExclusiveUsersChange([...currentUsers, user]);
    setUserSearchQuery(""); 
    setIsSearchFocused(false);
  };

  const handleRemoveUser = (userId: number) => {
    const currentUsers = formData.exclusive_users || [];
    const isExclusiveMode = Number(formData.privacity) === 3;

    if (isExclusiveMode && currentUsers.length <= 1) {
      toast.error("No modo Exclusivo, é necessário manter pelo menos um usuário na lista.");
      return;
    }

    onExclusiveUsersChange(currentUsers.filter(u => u.user_id !== userId));
  };
  // Verifica se a privacidade é "Exclusivo" (ID 3)
  const isExclusive = Number(formData.privacity) === 3;

  return (
    <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-5">
      
      {/* Toggle de Revisão */}
      <div className="form-control">
        <label className="label cursor-pointer justify-start gap-4 p-4 border border-base-300 rounded-xl bg-base-100 hover:border-primary/50 transition-all shadow-sm">
          <input
            type="checkbox"
            name="is_reviewed"
            className="toggle toggle-success"
            checked={!!formData.is_reviewed}
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
          {/* Status */}
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

          {/* Privacidade */}
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

      {/* ÁREA DE USUÁRIOS EXCLUSIVOS */}
      {isExclusive && (
        <div className="form-control w-full animate-in fade-in slide-in-from-top-2 duration-300">
          <label className="label">
             <span className="label-text font-semibold text-secondary text-xs uppercase tracking-wide">
                Usuários com Acesso (Exclusivo)
             </span>
          </label>
          
          <div className="p-4 border border-base-300 rounded-lg bg-base-100 relative">
             {/* Input de Busca */}
             <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text"
                  className="input input-bordered w-full pl-10 focus:input-primary input-sm h-10"
                  placeholder="Pesquisar usuário do setor..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                />

                {/* Dropdown de Resultados */}
                {isSearchFocused && userSearchQuery && (
                  <ul className="absolute z-50 w-full menu bg-base-100 p-2 shadow-lg rounded-box border border-base-200 mt-1 max-h-48 overflow-y-auto">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map(user => (
                        <li key={user.user_id}>
                          <button 
                            className="flex justify-between items-center py-2"
                            onClick={() => handleAddUser(user)}
                          >
                            <span>{user.name}</span>
                            <Plus size={14} className="text-primary" />
                          </button>
                        </li>
                      ))
                    ) : (
                      <li className="disabled"><span className="text-gray-400">Nenhum usuário encontrado no setor.</span></li>
                    )}
                  </ul>
                )}
             </div>

             {/* Lista de Selecionados */}
             <div className="flex flex-wrap gap-2 min-h-[30px]">
                {formData.exclusive_users && formData.exclusive_users.length > 0 ? (
                  formData.exclusive_users.map(user => (
                    <div key={user.user_id} className="badge badge-neutral gap-2 py-3 pl-3 pr-2">
                      {user.name}
                      <button 
                        onClick={() => handleRemoveUser(user.user_id)}
                        className="hover:bg-gray-600 rounded-full p-0.5 transition-colors"
                      >
                        <X size={14} className="text-white" />
                      </button>
                    </div>
                  ))
                ) : (
                   <span className="text-xs text-gray-400 italic py-1">Nenhum usuário selecionado.</span>
                )}
             </div>
          </div>
        </div>
      )}

      {/* Card de Revisor */}
      <div className="form-control w-full">
        <label className="label">
            <span className="label-text font-semibold text-secondary text-xs uppercase tracking-wide">Revisor Responsável</span>
        </label>
        
        <div className="flex justify-between items-center p-3 border border-base-300 rounded-lg bg-base-100 min-h-[4.5rem]">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${formData.is_reviewed ? 'bg-success/10 text-success' : 'bg-base-200 text-base-content/30'}`}>
                    {formData.is_reviewed ? <UserCheck size={20} /> : <Shield size={20} />}
                </div>
                <span className={`font-medium text-sm truncate max-w-[150px] sm:max-w-[180px] ${formData.is_reviewed ? 'text-secondary' : 'text-gray-400 italic'}`}>
                    {formData.is_reviewed ? reviewerName : "Sem revisor informado"}
                </span>
            </div>
            <div className="flex items-center">
                {formData.is_reviewed && !isCurrentUserTheReviewer ? (
                    <button 
                        type="button" 
                        className="btn btn-xs btn-outline btn-primary"
                        onClick={onTakeReview}
                    >
                        Assumir
                    </button>
                ) : (
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