import { useState, useEffect, useMemo, type ChangeEvent } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, Loader2, AlertCircle, Settings } from 'lucide-react';

import documentService from '../../services/Document/api';
import sectorService from '../../services/Sector/api'; 

import type { 
  UpdateClassificationPayload,
  Category,
  AddCategoriesPayload
} from '../../services/core-api';
import { useAuth } from '../../contexts/AuthContext';
import { STATUS_OPTIONS, PRIVACITY_OPTIONS } from '../../types/classification';

import ConfirmCloseModal from './ConfirmCloseModal';
import ClassificationForm from '../form/ClassificationForm';
import { type ClassificationFormData } from '../../types/classification';
import type { ExclusiveUser } from '../../services/core-api';
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
  
  // Lista de usuários do setor para o autocomplete
  const [sectorUsers, setSectorUsers] = useState<ExclusiveUser[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmClose, setShowConfirmClose] = useState(false);

  // Verifica se houve mudanças (Dirty Check)
  const isDirty = useMemo(() => {
    // 1. Comparação dos dados básicos e array de usuários exclusivos
    const safeOriginal = { ...originalData, exclusive_users: originalData?.exclusive_users?.map(u => u.user_id).sort() };
    const safeForm = { ...formData, exclusive_users: formData?.exclusive_users?.map(u => u.user_id).sort() };
    
    const classificationDirty = JSON.stringify(safeOriginal) !== JSON.stringify(safeForm);

    // 2. Comparação das categorias
    const originalCatIds = originalCategories.map(c => c.category_id).sort().join(',');
    const currentCatIds = linkedCategories.map(c => c.category_id).sort().join(',');
    const categoriesDirty = originalCatIds !== currentCatIds;

    return classificationDirty || categoriesDirty;
  }, [originalData, formData, originalCategories, linkedCategories]);

  // Função auxiliar para extrair usuários caso a API retorne uma hierarquia aninhada
  const flattenSectorUsers = (data: any[]): ExclusiveUser[] => {
    let users: ExclusiveUser[] = [];
    data.forEach(item => {
      // Tenta adaptar o objeto item para ExclusiveUser
      if (item.id || item.user_id) {
         users.push({
           user_id: item.user_id || item.id,
           name: item.name || item.username,     // Fallback caso venha como 'nome'
           email: item.email
         });
      }
      // Se houver filhos (estrutura de árvore), chama recursivamente
      if (item.children && Array.isArray(item.children)) {
        users = [...users, ...flattenSectorUsers(item.children)];
      }
      // Se houver propriedade 'users' dentro do nó
      if (item.users && Array.isArray(item.users)) {
         users = [...users, ...flattenSectorUsers(item.users)];
      }
    });
    return users;
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!documentId) return;
      setIsLoading(true);
      setError(null);
      try {
        // 1. Buscar classificação e categorias
        // 2. Buscar detalhes do documento para saber o sector_id (assumindo que existe um método getDocument ou getById)
        const [classificationRes, categoriesRes, documentRes] = await Promise.all([
          documentService.getClassification(documentId),
          documentService.listCategoriesByDocument(documentId),
          documentService.getDocumentById(documentId) // <--- Buscando dados do doc para ter o setor
        ]);

        const classificationData = classificationRes.data.data;
        const documentData = documentRes.data.data; // Assumindo estrutura padrão

        // Se tivermos o ID do setor, buscamos os usuários
        let fetchedUsers: ExclusiveUser[] = [];
        if (documentData && documentData.sector_id) {
            try {
                const usersRes = await sectorService.listSectorUsersWithHierarchy(documentData.sector_id);
                // O usuário disse que retorna { data: ResponseStructure<[]> }. Assumindo que o array está em data.data
                // ou ajustando conforme a estrutura real do ResponseStructure.
                const rawUsers = usersRes.data?.data || []; 
                fetchedUsers = flattenSectorUsers(Array.isArray(rawUsers) ? rawUsers : []);
            } catch (userErr) {
                console.warn("Não foi possível buscar usuários do setor:", userErr);
            }
        }

        const statusId = STATUS_OPTIONS.find(opt => opt.name === classificationData.classification_status?.status)?.id || null;
        const privacityId = PRIVACITY_OPTIONS.find(opt => opt.name === classificationData.privacity?.privacity)?.id || null;
        
        // Mapeia e garante tipagem dos usuários exclusivos já salvos
        const exclusiveUsers: ExclusiveUser[] = (classificationData.exclusive_users || []).map((u: any) => ({
             user_id: u.user_id || u.id,
             name: u.name,
             email: u.email
        }));

        const initialFormData: ClassificationFormData = {
          is_reviewed: classificationData.is_reviewed,
          classification_status: statusId,
          privacity: privacityId,
          reviewer: classificationData.reviewer?.user_id || null, 
          review_details: classificationData.review_details || null,
          exclusive_users: exclusiveUsers, 
        };

        setOriginalData(initialFormData);
        setFormData(initialFormData);
        setReviewerName(classificationData.reviewer?.name || "Nenhum");
        setReviewDetails(classificationData.review_details || null);

        setOriginalCategories(categoriesRes.data.data || []);
        setLinkedCategories(categoriesRes.data.data || []);
        setSectorUsers(fetchedUsers);

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
      const classificationPayload: UpdateClassificationPayload & { exclusive_users?: number[] } = {
        is_reviewed: formData.is_reviewed,
        classification_status: formData.classification_status,
        privacity: formData.privacity,
        reviewer: formData.reviewer,
      };

      if (Number(formData.privacity) === 3 && formData.exclusive_users) {
        classificationPayload.exclusive_users = formData.exclusive_users.map(u => u.user_id);
      } else {
        classificationPayload.exclusive_users = []; 
      }

      savePromises.push(documentService.updateClassification(documentId, classificationPayload));
    }

    // Lógica de categorias mantida
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
      
      // Atualiza o estado local com a resposta para resetar o "isDirty"
      results.forEach(response => {
        const updatedData = response.data.data;
        if (updatedData && updatedData.is_reviewed !== undefined) {
          const statusId = STATUS_OPTIONS.find(opt => opt.name === updatedData.classification_status?.status)?.id || null;
          const privacityId = PRIVACITY_OPTIONS.find(opt => opt.name === updatedData.privacity?.privacity)?.id || null;
          
          const newFormData: ClassificationFormData = {
            is_reviewed: updatedData.is_reviewed,
            classification_status: statusId,
            privacity: privacityId,
            reviewer: updatedData.reviewer?.user_id || null,
            exclusive_users: (updatedData.exclusive_users || []).map((u:any) => ({
                user_id: u.user_id || u.id,
                name: u.name,
                email: u.email
            })),
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
        return { ...prev, is_reviewed: true, reviewer: currentReviewerId };
      }

      const processedValue = (value === "null" || value === "") ? null : Number(value);
      return { ...prev, [name]: processedValue };
    });
  };

  const handleExclusiveUsersChange = (newUsers: ExclusiveUser[]) => {
    setFormData(prev => prev ? ({ ...prev, exclusive_users: newUsers }) : null);
  };

  const handleTakeReview = () => {
    if (!user || !user.data) return;
    setFormData(prev => prev ? ({
      ...prev,
      is_reviewed: true,
      reviewer: user.data.user_id 
    }) : null);
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
                allUsers={sectorUsers} // Lista filtrada por setor
                isCurrentUserTheReviewer={isCurrentUserTheReviewer}
                isDirty={isDirty}
                isSaving={isSaving}
                onFormChange={handleFormChange}
                onExclusiveUsersChange={handleExclusiveUsersChange}
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
      <div className="modal modal-open" role="dialog">
        <div className="modal-box w-11/12 max-w-3xl h-[80vh] flex flex-col relative p-0 overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-base-200 bg-base-100 z-10">
                <h3 className="font-bold text-lg flex items-center gap-2 text-secondary">
                    <Settings size={20} className="text-primary" />
                    Configurações do Documento
                </h3>
                <button className="btn btn-sm btn-circle btn-ghost" onClick={handleCloseAttempt}>
                    <X size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                {renderContent()}
            </div>

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
        <div className="modal-backdrop bg-black/50" onClick={handleCloseAttempt}></div>
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