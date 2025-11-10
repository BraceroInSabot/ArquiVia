import React, { useState, useEffect, useMemo, type ChangeEvent } from 'react';
import { createPortal } from 'react-dom';
import documentService from '../services/Document/api';
import type { 
  Classification, 
  UpdateClassificationPayload,
  Category,
  AddCategoriesPayload
} from '../services/core-api';
import { useAuth } from '../contexts/AuthContext'; 
import '../assets/css/ClassificationModal.css';

// Importa os componentes filhos e os tipos/constantes
import { 
  type ClassificationFormData, 
  STATUS_OPTIONS, 
  PRIVACITY_OPTIONS 
} from '../types/classification';
import ConfirmCloseModal from './ConfirmCloseModal';
import ClassificationForm from './ClassificationForm';
import CategoryManager from './CategoryManager';

interface ClassificationModalProps {
  documentId: number;
  onClose: () => void;
}

export default function ClassificationModal({ documentId, onClose }: ClassificationModalProps) {
  const { user } = useAuth(); 

  // Estados da Classificação
  const [originalData, setOriginalData] = useState<ClassificationFormData | null>(null);
  const [formData, setFormData] = useState<ClassificationFormData | null>(null);
  const [reviewerName, setReviewerName] = useState<string>("Nenhum");
  
  // Estados das Categorias
  const [originalCategories, setOriginalCategories] = useState<Category[]>([]);
  const [linkedCategories, setLinkedCategories] = useState<Category[]>([]);
  
  // Estados de Controle do Modal
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmClose, setShowConfirmClose] = useState(false);

  // 'isDirty' agora verifica tanto o formulário quanto as categorias
  const isDirty = useMemo(() => {
    const classificationDirty = JSON.stringify(originalData) !== JSON.stringify(formData);
    
    const originalCatIds = originalCategories.map(c => c.category_id).sort().join(',');
    const currentCatIds = linkedCategories.map(c => c.category_id).sort().join(',');
    const categoriesDirty = originalCatIds !== currentCatIds;
    
    return classificationDirty || categoriesDirty;
  }, [originalData, formData, originalCategories, linkedCategories]);

  // --- LÓGICA DE BUSCA (Promise.all) ---
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
  
  // --- LÓGICA DE SALVAR (Promise.all) ---
  const handleSave = async () => {
    if (!isDirty || !user || !user.data) {
       if (!user || !user.data) {
          setError("Você não está logado. Impossível salvar.");
       }
       return;
    }

    setIsSaving(true);
    setError(null);

    const savePromises: Promise<any>[] = [];

    // 1. Verifica se a Classificação mudou
    if (JSON.stringify(originalData) !== JSON.stringify(formData) && formData) {
      const classificationPayload: UpdateClassificationPayload = {
        is_reviewed: formData.is_reviewed,
        classification_status: formData.classification_status,
        privacity: formData.privacity,
        reviewer: formData.reviewer
      };
      savePromises.push(documentService.updateClassification(documentId, classificationPayload));
    }

    // 2. Verifica se as Categorias mudaram
    const originalCatIds = originalCategories.map(c => c.category_id).sort().join(',');
    const currentCatIds = linkedCategories.map(c => c.category_id).sort().join(',');
    
    if (originalCatIds !== currentCatIds) {
      const categoryPayload: AddCategoriesPayload = {
        categories_id: linkedCategories.map(c => c.category_id)
      };
      savePromises.push(documentService.linkCategoriesToDocument(documentId, categoryPayload));
    }

    try {
      // Envia todas as requisições de salvamento pendentes
      const results = await Promise.all(savePromises);
      
      // Atualiza os estados "originais" com base nas respostas
      // (Isso "limpa" o 'isDirty' e sincroniza o estado)
      results.forEach(response => {
        const updatedData = response.data.data;
        
        // Verifica se é uma resposta de Classificação (pela presença de 'is_reviewed')
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
        }
        // Verifica se é uma resposta de Categoria (se for um array)
        else if (Array.isArray(updatedData)) {
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

  // --- LÓGICA DE FECHAR ---
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
      // Preserva o estado anterior, mas atualiza o revisor
      ...prev,
      is_reviewed: true,
      classification_status: prev?.classification_status || null,
      privacity: prev?.privacity || null,
      reviewer: user.data.user_id 
    }));
    
    setReviewerName(user.data.name);
  };

  // --- RENDERIZAÇÃO ---
  const renderContent = () => {
    if (isLoading || !formData) { 
      return <p>Carregando dados...</p>;
    }
    if (error) {
      return <p className="classification-error">{error}</p>;
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
          onSave={handleSave} // O 'Salvar' agora salva TUDO
        />

        {/* Divisor Visual */}
        <hr className="modal-divider" />

        {/* Componente 2: Gerenciador de Categorias */}
        <CategoryManager
          documentId={documentId}
          linkedCategories={linkedCategories}
          onCategoryChange={setLinkedCategories} // Passa o 'setter' para o filho
        />
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