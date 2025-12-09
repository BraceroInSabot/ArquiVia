import { useState, useEffect, useMemo, type ChangeEvent } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, Loader2, AlertCircle, Settings } from 'lucide-react';

import documentService from '../../services/Document/api';
import type { 
  UpdateClassificationPayload,
  Category,
  AddCategoriesPayload
} from '../../services/core-api';
import { useAuth } from '../../contexts/AuthContext';
import { type ClassificationFormData, STATUS_OPTIONS, PRIVACITY_OPTIONS } from '../../types/classification';

import ConfirmCloseModal from './ConfirmCloseModal';
import ClassificationForm from '../form/ClassificationForm';
import CategoryManager from '../Document/CategoryManager';

interface ClassificationModalProps {
  documentId: number;
  onClose: () => void;
}

export default function ClassificationModal({ documentId, onClose }: ClassificationModalProps) {
  const { user } = useAuth(); 

  const [originalData, setOriginalData] = useState<ClassificationFormData | null>(null);
  const [formData, setFormData] = useState<ClassificationFormData | null>(null);
  const [reviewerName, setReviewerName] = useState<string>("Nenhum");
  const [reviewDetails, setReviewDetails] = useState<any>(null);
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
          review_details: classificationData.review_details || null,
        };

        setOriginalData(initialFormData);
        setFormData(initialFormData);
        setReviewerName(classificationData.reviewer?.name || "Nenhum");
        setReviewDetails(classificationData.review_details || null);

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
        
        if (!checked) {
          setReviewerName("Nenhum"); 
          return { ...prev, is_reviewed: false, reviewer: null };
        }

        const currentReviewerId = prev.reviewer || user?.data.user_id || null;
        
        if (!prev.reviewer && user?.data) {
            setReviewerName(user.data.name); 
        }

        return { 
          ...prev, 
          is_reviewed: true,
          reviewer: currentReviewerId
        };
      }

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
        <div className="flex flex-col items-center justify-center py-10 text-gray-400">
            <Loader2 className="animate-spin mb-2" size={32} />
            <span>Carregando dados...</span>
        </div>
      );
    }
    if (error) {
      return (
        <div className="alert alert-error shadow-sm my-4">
            <AlertCircle size={20} />
            <span>{error}</span>
        </div>
      );
    }

    const isCurrentUserTheReviewer = formData.reviewer !== null && formData.reviewer === user?.data.user_id;

    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto px-1">
            <ClassificationForm
                formData={formData}
                reviewerName={reviewerName}
                reviewDetails={reviewDetails}
                isCurrentUserTheReviewer={isCurrentUserTheReviewer}
                isDirty={isDirty}
                isSaving={isSaving}
                onFormChange={handleFormChange}
                onTakeReview={handleTakeReview}
                onSave={handleSave}
            />

            <CategoryManager
                documentId={documentId}
                linkedCategories={linkedCategories}
                onCategoryChange={setLinkedCategories} 
            />
        </div>
      </div>
    );
  };

  return createPortal(
    <>
      {/* Modal Principal */}
      <div className="modal modal-open" role="dialog">
        <div className="modal-box w-11/12 max-w-3xl h-[80vh] flex flex-col relative p-0 overflow-hidden">
            
            {/* Cabeçalho Fixo */}
            <div className="flex justify-between items-center p-4 border-b border-base-200 bg-base-100 z-10">
                <h3 className="font-bold text-lg flex items-center gap-2 text-secondary">
                    <Settings size={20} className="text-primary" />
                    Configurações do Documento
                </h3>
                <button className="btn btn-sm btn-circle btn-ghost" onClick={handleCloseAttempt}>
                    <X size={20} />
                </button>
            </div>

            {/* Corpo Rolável */}
            <div className="flex-1 overflow-y-auto p-6">
                {renderContent()}
            </div>

            {/* Rodapé Fixo */}
            <div className="modal-action p-4 border-t border-base-200 bg-base-100 m-0 justify-end gap-2">
                <button 
                    className="btn btn-ghost text-secondary" 
                    onClick={handleCloseAttempt}
                    disabled={isSaving}
                >
                    Cancelar
                </button>
                <button 
                    className="btn btn-primary text-white min-w-[140px]" 
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
        </div>
        
        {/* Backdrop */}
        <div className="modal-backdrop bg-black/50 backdrop-blur-sm" onClick={handleCloseAttempt}></div>
      </div>

      {/* Modal de Confirmação */}
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