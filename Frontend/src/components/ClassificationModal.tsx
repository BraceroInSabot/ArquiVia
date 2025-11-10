import { useState, useEffect, useMemo, type ChangeEvent } from 'react';
import { createPortal } from 'react-dom';
import documentService from '../services/Document/api';
import type { 
  Classification, 
  UpdateClassificationPayload,
  Category // <-- 1. Importe o tipo Category
} from '../services/core-api';
import { useAuth } from '../contexts/AuthContext'; 
import '../assets/css/ClassificationModal.css';

// Importe os componentes filhos e tipos
import { type ClassificationFormData, STATUS_OPTIONS, PRIVACITY_OPTIONS } from '../types/classification';
import ConfirmCloseModal from './ConfirmCloseModal';
import ClassificationForm from './ClassificationForm';
import CategoryManager from './CategoryManager'; // <-- 2. Importe o Gerenciador de Categoria

interface ClassificationModalProps {
  documentId: number;
  onClose: () => void;
}

export default function ClassificationModal({ documentId, onClose }: ClassificationModalProps) {
  const { user } = useAuth(); 

  const [originalData, setOriginalData] = useState<ClassificationFormData | null>(null);
  const [formData, setFormData] = useState<ClassificationFormData | null>(null);
  const [reviewerName, setReviewerName] = useState<string>("Nenhum");
  
  // --- 3. ADICIONE O ESTADO PARA CATEGORIAS ---
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmClose, setShowConfirmClose] = useState(false);

  const isDirty = useMemo(() => {
    return JSON.stringify(originalData) !== JSON.stringify(formData);
  }, [originalData, formData]);

  // --- 4. ATUALIZE A LÓGICA DE BUSCA (Promise.all) ---
  useEffect(() => {
    const fetchData = async () => {
      if (!documentId) return;
      setIsLoading(true);
      setError(null);
      try {
        // Busca Classificação E Categorias em paralelo
        const [classificationRes, categoriesRes] = await Promise.all([
          documentService.getClassification(documentId),
          documentService.listCategoriesByDocument(documentId)
        ]);

        // Processa Classificação
        const classificationData = classificationRes.data.data;
        const statusId = STATUS_OPTIONS.find(
          opt => opt.name === classificationData.classification_status?.status
        )?.id || null;
        const privacityId = PRIVACITY_OPTIONS.find(
          opt => opt.name === classificationData.privacity?.privacity
        )?.id || null;
        
        const initialFormData: ClassificationFormData = {
          is_reviewed: classificationData.is_reviewed,
          classification_status: statusId,
          privacity: privacityId,
          reviewer: classificationData.reviewer?.user_id || null, 
        };

        setOriginalData(initialFormData);
        setFormData(initialFormData);
        setReviewerName(classificationData.reviewer?.name || "Nenhum");

        // Processa Categorias
        setCategories(categoriesRes.data.data || []);

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
  
  // --- (Lógica de handleSave - Sem mudanças) ---
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
      const payload: UpdateClassificationPayload = {
        is_reviewed: formData.is_reviewed,
        classification_status: formData.classification_status,
        privacity: formData.privacity,
        reviewer: formData.reviewer
      };
      
      const response = await documentService.updateClassification(documentId, payload);
      
      const updatedData = response.data.data;
      const statusId = STATUS_OPTIONS.find(opt => opt.name === updatedData.classification_status?.status)?.id || null;
      const privacityId = PRIVACITY_OPTIONS.find(opt => opt.name === updatedData.privacity?.privacity)?.id || null;

      const newFormData: ClassificationFormData = {
        is_reviewed: updatedData.is_reviewed,
        classification_status: statusId,
        privacity: privacityId,
        reviewer: updatedData.reviewer?.user_id || null,
      };
      
      setOriginalData(newFormData);
      setFormData(newFormData);
      setReviewerName(updatedData.reviewer?.name || "Nenhum");
      
    } catch (err: any) {
      console.error("Erro ao salvar:", err);
      const errMsg = err.response?.data?.message || "Falha ao salvar. Tente novamente.";
      setError(errMsg);
    } finally {
      setIsSaving(false);
    }
  };

  // --- (Lógica de handleCloseAttempt, handleFormChange, handleTakeReview - Sem mudanças) ---
  const handleCloseAttempt = () => {
    if (isDirty) {
      setShowConfirmClose(true);
    } else {
      onClose();
    }
  };

  const handleFormChange = (e: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData(prev => {
      if (!prev) return null;

      if (name === 'is_reviewed') {
        const { checked } = e.target as HTMLInputElement;
        if (!checked) {
          setReviewerName("Nenhum");
          return { ...prev, is_reviewed: false, reviewer: null };
        }
        return { 
          ...prev, 
          is_reviewed: true,
          reviewer: prev.reviewer || user?.data.user_id || null 
        };
      }

      const processedValue = (value === "null" || value === "") ? null : Number(value);
      return { ...prev, [name]: processedValue };
    });
  };

  const handleTakeReview = () => {
    if (!user || !user.data) return;
    
    setFormData(prev => ({
      ...prev,
      is_reviewed: true,
      classification_status: prev?.classification_status || null,
      privacity: prev?.privacity || null,
      reviewer: user.data.user_id 
    }));
    
    setReviewerName(user.data.name);
  };


  // --- 5. RENDERIZAÇÃO ATUALIZADA ---
  const renderContent = () => {
    if (isLoading) { 
      return <p>Carregando dados do documento...</p>;
    }
    if (error) {
      return <p className="classification-error">{error}</p>;
    }
    if (!formData) {
      return <p>Nenhuma informação de classificação encontrada.</p>;
    }

    const isCurrentUserTheReviewer = formData.reviewer !== null && formData.reviewer === user?.data.user_id;

    return (
      <>
        {/* Componente 1: Formulário de Classificação */}
        <ClassificationForm
          formData={formData}
          reviewerName={reviewerName}
          isCurrentUserTheReviewer={isCurrentUserTheReviewer}
          isDirty={isDirty}
          isSaving={isSaving}
          onFormChange={handleFormChange}
          onTakeReview={handleTakeReview}
          onSave={handleSave}
        />

        {/* Divisor Visual */}
        <hr className="modal-divider" />

        {/* Componente 2: Gerenciador de Categorias */}
        <CategoryManager categories={categories} />
      </>
   );
  };

  return createPortal(
    <>
      <div className="modal-overlay" onClick={handleCloseAttempt}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close-btn" onClick={handleCloseAttempt}>&times;</button>
          <h2>Editar Documento</h2> 
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