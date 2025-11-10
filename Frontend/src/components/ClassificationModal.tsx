import React, { useState, useEffect, useMemo, type ChangeEvent } from 'react';
import { createPortal } from 'react-dom';
import documentService from '../services/Document/api';
import type { 
  Classification, 
  UpdateClassificationPayload 
} from '../services/core-api';
import { useAuth } from '../contexts/AuthContext'; 
import '../assets/css/ClassificationModal.css';

// --- Mapeamento Estático (IDs DEVE BATER COM O BANCO) ---
const STATUS_OPTIONS = [
  { id: 1, name: "Concluído" },
  { id: 2, name: "Em andamento" },
  { id: 3, name: "Revisão necessária" },
  { id: 4, name: "Arquivado" }
];

const PRIVACITY_OPTIONS = [
  { id: 1, name: "Privado" },
  { id: 2, name: "Público" }
];

interface ClassificationModalProps {
  documentId: number;
  onClose: () => void;
}

// Interface do formulário (só IDs)
interface FormData {
  is_reviewed: boolean;
  classification_status: number | null;
  privacity: number | null;
  reviewer: number | null; // Armazena o ID do revisor
}

// Modal de Confirmação (aninhado - sem mudanças)
const ConfirmCloseModal: React.FC<{ onConfirm: () => void, onCancel: () => void }> = ({ onConfirm, onCancel }) => (
  createPortal(
    <div className="modal-overlay confirm-overlay">
      <div className="modal-content confirm-modal">
        <h4>Sair sem Salvar?</h4>
        <p>Você tem alterações não salvas. Deseja realmente sair?</p>
        <div className="confirm-actions">
          <button className="confirm-btn cancel-btn" onClick={onCancel}>Cancelar</button>
          <button className="confirm-btn confirm-exit-btn" onClick={onConfirm}>Sair Sem Salvar</button>
        </div>
      </div>
    </div>,
    document.body
  )
);

export default function ClassificationModal({ documentId, onClose }: ClassificationModalProps) {
  const { user } = useAuth(); 

  const [originalData, setOriginalData] = useState<FormData | null>(null);
  const [formData, setFormData] = useState<FormData | null>(null);
  
  // --- NOVO ESTADO ---
  // Armazena o NOME do revisor (para exibição)
  const [reviewerName, setReviewerName] = useState<string>("Nenhum");
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmClose, setShowConfirmClose] = useState(false);

  const isDirty = useMemo(() => {
    return JSON.stringify(originalData) !== JSON.stringify(formData);
  }, [originalData, formData]);

  // --- BUSCA DE DADOS (ATUALIZADO) ---
  useEffect(() => {
    const fetchData = async () => {
      if (!documentId) return;
      setIsLoading(true);
      setError(null);
      try {
        const response = await documentService.getClassification(documentId);
        const classificationData = response.data.data;

        const statusId = STATUS_OPTIONS.find(
          opt => opt.name === classificationData.classification_status?.status
        )?.id || null;
        
        const privacityId = PRIVACITY_OPTIONS.find(
          opt => opt.name === classificationData.privacity?.privacity
        )?.id || null;
        
        const initialFormData: FormData = {
          is_reviewed: classificationData.is_reviewed,
          classification_status: statusId,
          privacity: privacityId,
          reviewer: classificationData.reviewer?.user_id || null, 
        };

        setOriginalData(initialFormData);
        setFormData(initialFormData);
        setReviewerName(classificationData.reviewer?.name || "Nenhum");

      } catch (err: any) {
        console.error("Erro ao buscar dados do modal:", err);
        const errMsg = err.response?.data?.message || "Falha ao carregar dados.";
        setError(errMsg);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [documentId]);
  
  // --- LÓGICA DE SALVAR (ATUALIZADA) ---
  const handleSave = async () => {
    if (!formData || !isDirty || !user || !user.data) {
       if (!user || !user.data) {
          setError("Você não está logado. Impossível salvar.");
       }
       return;
    }

    setIsSaving(true);
    setError(null);
    try {
      // O payload é exatamente o que está no 'formData'
      const payload: UpdateClassificationPayload = {
        is_reviewed: formData.is_reviewed,
        classification_status: formData.classification_status,
        privacity: formData.privacity,
        reviewer: formData.reviewer // Este ID foi atualizado pelo 'handleTakeReview'
      };
      
      const response = await documentService.updateClassification(documentId, payload);
      
      // Atualiza os dados originais (SOT) com a resposta da API
      const updatedData = response.data.data;
      const statusId = STATUS_OPTIONS.find(opt => opt.name === updatedData.classification_status?.status)?.id || null;
      const privacityId = PRIVACITY_OPTIONS.find(opt => opt.name === updatedData.privacity?.privacity)?.id || null;

      const newFormData: FormData = {
        is_reviewed: updatedData.is_reviewed,
        classification_status: statusId,
        privacity: privacityId,
        reviewer: updatedData.reviewer?.user_id || null, // Pega o ID da resposta
      };
      
      setOriginalData(newFormData);
      setFormData(newFormData);
      // Atualiza o nome de exibição
      setReviewerName(updatedData.reviewer?.name || "Nenhum");
      
    } catch (err: any) {
      console.error("Erro ao salvar:", err);
      const errMsg = err.response?.data?.message || "Falha ao salvar. Tente novamente.";
      setError(errMsg);
    } finally {
      setIsSaving(false);
    }
  };

  // --- LÓGICA DE FECHAR (Dirty Check) ---
  const handleCloseAttempt = () => {
    if (isDirty) {
      setShowConfirmClose(true);
    } else {
      onClose();
    }
  };

  // --- HANDLERS DO FORMULÁRIO (ATUALIZADO) ---
  const handleFormChange = (e: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData(prev => {
      if (!prev) return null;

      if (name === 'is_reviewed') {
        const { checked } = e.target as HTMLInputElement;
        
        // Se o usuário desmarcar "Revisado", o revisor é limpo
        if (!checked) {
          setReviewerName("Nenhum"); // Limpa o nome de exibição
          return { ...prev, is_reviewed: false, reviewer: null };
        }
        // Se o usuário marcar "Revisado"
        return { 
          ...prev, 
          is_reviewed: true,
          // Se não houver revisor, define o usuário atual como revisor
          reviewer: prev.reviewer || user?.data.user_id || null 
        };
      }

      // Para <select> de status e privacidade
      const processedValue = (value === "null" || value === "") ? null : Number(value);
      return { ...prev, [name]: processedValue };
    });
  };

  // --- NOVA FUNÇÃO ---
  // Chamada pelo novo botão "Tornar-se Revisor"
  const handleTakeReview = () => {
    if (!user || !user.data) return;
    
    setFormData(prev => ({
      ...prev,
      // Ensure all properties of FormData are present, even if unchanged
      is_reviewed: true,
      classification_status: prev?.classification_status || null,
      privacity: prev?.privacity || null,
      reviewer: user.data.user_id 
    }));
    
    // Atualiza o nome de exibição imediatamente
    setReviewerName(user.data.name);
  };

  // --- RENDERIZAÇÃO (ATUALIZADO) ---
  const renderContent = () => {
    if (isLoading || !formData) { // Combinado
      return <p>Carregando classificação...</p>;
    }
    if (error) {
      return <p className="classification-error">{error}</p>;
    }

    // Verifica se o usuário logado é o revisor atual
    const isCurrentUserTheReviewer = formData.reviewer !== null && formData.reviewer === user?.data.user_id;

    return (
      <form className="classification-form" onSubmit={(e) => e.preventDefault()}>
        <div className="form-item">
          <label htmlFor="is_reviewed">Revisado</label>
          <input
            type="checkbox"
            id="is_reviewed"
            name="is_reviewed"
            checked={formData.is_reviewed}
            onChange={handleFormChange}
          />
        </div>
        
        <div className="form-item">
          <label htmlFor="classification_status">Status</label>
          <select 
            id="classification_status" 
            name="classification_status"
            value={formData.classification_status || "null"}
            onChange={handleFormChange}
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
            onChange={handleFormChange}
          >
            <option value="null">Não definido</option>
            {PRIVACITY_OPTIONS.map(opt => (
              <option key={opt.id} value={opt.id}>{opt.name}</option>
            ))}
          </select>
        </div>

        {/* --- CAMPO DE REVISOR (ATUALIZADO) --- */}
        <div className="form-item">
          <label>Revisor</label>
          <div className="reviewer-field">
            {/* Mostra o nome do revisor (do estado 'reviewerName') */}
            <span className="info-value">
              {/* Se o form está revisado, mostra o nome, senão "Nenhum" */}
              {formData.is_reviewed ? reviewerName : "Nenhum"}
            </span>
            
            {/* O botão só aparece se estiver 'Revisado' E 
                o revisor atual NÃO for o usuário logado */}
            {formData.is_reviewed && !isCurrentUserTheReviewer && (
              <button 
                type="button" 
                className="take-review-btn" 
                onClick={handleTakeReview}
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
            onClick={handleSave}
            disabled={!isDirty || isSaving}
          >
            {isSaving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    );
  };

  return createPortal(
    <>
      <div className="modal-overlay" onClick={handleCloseAttempt}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close-btn" onClick={handleCloseAttempt}>&times;</button>
          <h2>Editar Classificação</h2>
          {renderContent()}
        </div>
      </div>

      {showConfirmClose && (
        <ConfirmCloseModal
          onCancel={() => setShowConfirmClose(false)}
          onConfirm={() => {
            setShowConfirmClose(false);
            onClose();
          }}
        />
      )}
    </>
    , document.body
  );
}