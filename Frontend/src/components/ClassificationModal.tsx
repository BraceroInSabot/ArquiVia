import { useState, useEffect, useMemo, type ChangeEvent } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, Loader2, AlertCircle, ShapesIcon } from 'lucide-react'; // Ícones

import documentService from '../services/Document/api';
import type { UpdateClassificationPayload, Category, AddCategoriesPayload } from '../services/core-api';
import { useAuth } from '../contexts/AuthContext'; 
import '../assets/css/ClassificationModal.css';
import { type ClassificationFormData, STATUS_OPTIONS, PRIVACITY_OPTIONS } from '../types/classification';

import ConfirmCloseModal from './ConfirmCloseModal';
import ClassificationForm from './ClassificationForm';
import CategoryManager from './CategoryManager';

interface ClassificationModalProps {
  documentId: number;
  onClose: () => void;
}

export default function ClassificationModal({ documentId, onClose }: ClassificationModalProps) {
  const { user } = useAuth(); 

  // Estados (Mantidos iguais)
  const [originalData, setOriginalData] = useState<ClassificationFormData | null>(null);
  const [formData, setFormData] = useState<ClassificationFormData | null>(null);
  const [reviewerName, setReviewerName] = useState<string>("Nenhum");
  const [originalCategories, setOriginalCategories] = useState<Category[]>([]);
  const [linkedCategories, setLinkedCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmClose, setShowConfirmClose] = useState(false);

  const isDirty = useMemo(() => {
    const classificationDirty = JSON.stringify(originalData) !== JSON.stringify(formData);
    const originalCatIds = originalCategories.map(c => c.category_id).sort().join(',');
    const currentCatIds = linkedCategories.map(c => c.category_id).sort().join(',');
    const categoriesDirty = originalCatIds !== currentCatIds;
    return classificationDirty || categoriesDirty;
  }, [originalData, formData, originalCategories, linkedCategories]);

  // --- Lógica de Busca (Mantida igual) ---
  useEffect(() => {
    const fetchData = async () => {
      if (!documentId) return;
      setIsLoading(true);
      setError(null);
      try {
        const [classificationRes, categoriesRes] = await Promise.all([
          documentService.getClassification(documentId),
          documentService.listCategoriesByDocument(documentId)
        ]);

        const classificationData = classificationRes.data.data;
        const statusId = STATUS_OPTIONS.find(opt => opt.name === classificationData.classification_status?.status)?.id || null;
        const privacityId = PRIVACITY_OPTIONS.find(opt => opt.name === classificationData.privacity?.privacity)?.id || null;
        
        const initialFormData: ClassificationFormData = {
          is_reviewed: classificationData.is_reviewed,
          classification_status: statusId,
          privacity: privacityId,
          reviewer: classificationData.reviewer?.user_id || null, 
        };

        setOriginalData(initialFormData);
        setFormData(initialFormData);
        setReviewerName(classificationData.reviewer?.name || "Nenhum");

        const categoryData = categoriesRes.data.data || [];
        setOriginalCategories(categoryData);
        setLinkedCategories(categoryData);

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

  // --- Lógica de Salvar (Mantida igual) ---
  const handleSave = async () => {
    if (!formData || !isDirty || !user || !user.data) return;

    setIsSaving(true);
    setError(null);
    const savePromises: Promise<any>[] = [];

    if (JSON.stringify(originalData) !== JSON.stringify(formData)) {
      const classificationPayload: UpdateClassificationPayload = {
        is_reviewed: formData.is_reviewed,
        classification_status: formData.classification_status,
        privacity: formData.privacity,
        reviewer: formData.reviewer
      };
      savePromises.push(documentService.updateClassification(documentId, classificationPayload));
    }

    const originalCatIds = originalCategories.map(c => c.category_id).sort().join(',');
    const currentCatIds = linkedCategories.map(c => c.category_id).sort().join(',');
    
    if (originalCatIds !== currentCatIds) {
      const categoryPayload: AddCategoriesPayload = {
        categories_id: linkedCategories.map(c => c.category_id)
      };
      savePromises.push(documentService.linkCategoriesToDocument(documentId, categoryPayload));
    }

    try {
      const results = await Promise.all(savePromises);
      results.forEach(response => {
        const updatedData = response.data.data;
        if (updatedData.is_reviewed !== undefined) {
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
        } else if (Array.isArray(updatedData)) {
          setOriginalCategories(updatedData);
          setLinkedCategories(updatedData);
        }
      });
    } catch (err: any) {
      console.error("Erro ao salvar:", err);
      const errMsg = err.response?.data?.message || "Falha ao salvar. Tente novamente.";
      setError(errMsg);
    } finally {
      setIsSaving(false);
    }
  };

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
        
        // CASO 1: Usuário DESMARCOU
        if (!checked) {
          setReviewerName("Nenhum"); // <--- Limpa o nome visual
          return { ...prev, is_reviewed: false, reviewer: null };
        }

        // CASO 2: Usuário MARCOU
        // Se já havia um revisor antes (ex: vindo do banco), mantemos.
        // Se não, o usuário logado assume a revisão.
        const currentReviewerId = prev.reviewer || user?.data.user_id || null;
        
        // Aqui está a correção: Atualizamos o nome visualmente também
        if (!prev.reviewer && user?.data) {
            setReviewerName(user.data.name); // <--- Define o nome do usuário atual
        }

        return { 
          ...prev, 
          is_reviewed: true,
          reviewer: currentReviewerId
        };
      }

      // Lógica padrão para Selects
      const processedValue = (value === "null" || value === "") ? null : Number(value);
      return { ...prev, [name]: processedValue };
    });
  };

  const handleTakeReview = () => {
    if (!user || !user.data) return;
    setFormData(prev => ({
      ...prev!,
      is_reviewed: true,
      reviewer: user.data.user_id 
    }));
    setReviewerName(user.data.name);
  };

  const renderContent = () => {
    if (isLoading || !formData) { 
      return (
        <div className="d-flex flex-column justify-content-center align-items-center py-5 text-muted">
            <Loader2 className="animate-spin mb-2" size={32} />
            <span>Carregando dados...</span>
        </div>
      );
    }
    if (error) {
      return (
        <div className="alert alert-danger d-flex align-items-center" role="alert">
            <AlertCircle className="me-2" size={20} />
            <div>{error}</div>
        </div>
      );
    }

    const isCurrentUserTheReviewer = formData.reviewer !== null && formData.reviewer === user?.data.user_id;

    return (
      <>
        <div className="modal-body p-4 overflow-auto" style={{ maxHeight: '70vh' }}>
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

            <hr className="my-4 text-muted opacity-25" />

            <CategoryManager
                documentId={documentId}
                linkedCategories={linkedCategories}
                onCategoryChange={setLinkedCategories} 
            />
        </div>

        {/* Footer Fixo com o Botão Salvar */}
        <div className="modal-footer border-top bg-light p-3 d-flex justify-content-end gap-2">
             <button 
                className="btn btn-light text-secondary" 
                onClick={handleCloseAttempt}
                disabled={isSaving}
             >
                Cancelar
             </button>
             <button 
                className="btn btn-primary-custom d-flex align-items-center gap-2 px-4" 
                onClick={handleSave}
                disabled={!isDirty || isSaving}
             >
                {isSaving ? (
                    <>
                        <Loader2 className="animate-spin" size={18} />
                        Salvando...
                    </>
                ) : (
                    <>
                        <Save size={18} />
                        Salvar Alterações
                    </>
                )}
             </button>
        </div>
      </>
    );
  };

  return createPortal(
    <>
      <div className="modal-overlay" onClick={handleCloseAttempt}>
        <div 
            className="modal-content p-0 overflow-hidden" 
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '600px' }}
        >
          
          {/* Cabeçalho do Modal */}
          <div className="d-flex justify-content-between align-items-center p-3 px-4 border-bottom">
            <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <ShapesIcon size={20} className="text-primary-custom" />
                Classificação do Documento
            </h5>
            <button className="btn btn-link text-secondary p-0" onClick={handleCloseAttempt}>
                <X size={24} />
            </button>
          </div>

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
    </>,
    document.body
  );
}