import React, { useState, useEffect, useMemo, ChangeEvent } from 'react';
import { createPortal } from 'react-dom';
import documentService from '../services/Document/api';
import type { 
  Classification, 
  UpdateClassificationPayload 
} from '../services/core-api';
// 1. Importa o hook de autenticação
import { useAuth } from '../contexts/AuthContext'; 
import '../assets/css/ClassificationModal.css';

// --- Valores Estáticos (Conforme sua definição) ---
const STATUS_OPTIONS = [
  { id: 1, name: "Concluído" },
  { id: 2, name: "Em andamento" },
  { id: 3, name: "Revisão necessária" },
  { id: 4, name: "Arquivado" }
];

const PRIVACITY_OPTIONS = [
  { id: 1, name: "Público" },
  { id: 2, name: "Privado" }
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

// Modal de Confirmação (aninhado)
const ConfirmCloseModal: React.FC<{ onConfirm: () => void, onCancel: () => void }> = ({ onConfirm, onCancel }) => {
  return createPortal(
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
  );
};

export default function ClassificationModal({ documentId, onClose }: ClassificationModalProps) {
  // 2. Pega o usuário logado (com a estrutura correta)
  const { user } = useAuth(); 

  const [originalData, setOriginalData] = useState<FormData | null>(null);
  const [formData, setFormData] = useState<FormData | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmClose, setShowConfirmClose] = useState(false);

  const isDirty = useMemo(() => {
    return JSON.stringify(originalData) !== JSON.stringify(formData);
  }, [originalData, formData]);

  // --- BUSCA DE DADOS ---
  useEffect(() => {
    const fetchData = async () => {
      if (!documentId) return;
      setIsLoading(true);
      setError(null);
      try {
        const response = await documentService.getClassification(documentId);
        const classificationData = response.data.data;

        // Mapeia Nomes (do GET) para IDs (do formulário)
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
          // 3. Usa o 'reviewer_id' vindo da API
          reviewer: classificationData.reviewer_id || null, 
        };

        setOriginalData(initialFormData);
        setFormData(initialFormData);

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
  
  // --- LÓGICA DE SALVAR (CORRIGIDA) ---
  const handleSave = async () => {
    // 4. CORREÇÃO: Verifica se 'user' e 'user.data' existem
    if (!formData || !isDirty || !user || !user.data) {
       if (!user || !user.data) {
          setError("Você não está logado. Impossível salvar.");
       }
       return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const payload: UpdateClassificationPayload = {
        is_reviewed: formData.is_reviewed,
        classification_status: formData.classification_status,
        privacity: formData.privacity,
      };

      // 5. CORREÇÃO: Lógica do Revisor usa 'user.data.user_id'
      if (formData.is_reviewed && formData.reviewer !== user.data.user_id) {
         // O usuário logado marcou 'Revisado'
        payload.reviewer = user.data.user_id; 
      }
      if (!formData.is_reviewed && originalData?.is_reviewed) {
        // O usuário desmarcou 'Revisado'
        payload.reviewer = null; 
      }
      
      const response = await documentService.updateClassification(documentId, payload);
      
      // Atualiza os dados originais (SOT) com a resposta da API
      const updatedData = response.data.data;
      const statusId = STATUS_OPTIONS.find(opt => opt.name === updatedData.classification_status?.status)?.id || null;
      const privacityId = PRIVACITY_OPTIONS.find(opt => opt.name === updatedData.privacity?.privacity)?.id || null;

      const newFormData: FormData = {
        is_reviewed: updatedData.is_reviewed,
        classification_status: statusId,
        privacity: privacityId,
        // 6. Atualiza o 'reviewer' com o ID que a API retornou
        reviewer: updatedData.reviewer_id || null, 
      };
      
      setOriginalData(newFormData); // Define o novo "original"
      setFormData(newFormData);     // Define o formulário
      
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

  // --- HANDLERS DO FORMULÁRIO ---
  const handleFormChange = (e: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData(prev => {
      if (!prev) return null;

      if (name === 'is_reviewed') {
        const { checked } = e.target as HTMLInputElement;
        return { ...prev, is_reviewed: checked };
      }

      const processedValue = (value === "null" || value === "") ? null : Number(value);
      
      return { ...prev, [name]: processedValue };
    });
  };

  // --- RENDERIZAÇÃO ---
  const renderContent = () => {
    if (isLoading) {
      return <p>Carregando classificação...</p>;
    }
    if (error) {
      return <p className="classification-error">{error}</p>;
    }

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

        {/* Campo de Revisor (agora é automático/oculto) */}
        <div className="form-item">
          <label>Revisor</label>
          {/* Mostra o nome do revisor (se houver), mas não é editável */}
          <span className="info-value">
            {originalData?.reviewer || (formData?.is_reviewed ? user?.data.name : "Nenhum")}
          </span>
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