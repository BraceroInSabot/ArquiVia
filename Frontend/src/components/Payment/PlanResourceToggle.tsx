import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import paymentService from '../../services/Payment/api';
import type { PlanResourceToggleProps } from '../../types/plans';


const PlanResourceToggle: React.FC<PlanResourceToggleProps> = ({
  resourceId,
  resourceType,
  isInitiallyActive,
  resourceName = 'Item',
  onToggleSuccess
}) => {
  const [isActive, setIsActive] = useState(isInitiallyActive);
  const [isLoading, setIsLoading] = useState(false);

  console.log(resourceId);
  const handleToggle = async () => {
    // Guarda o estado anterior para rollback em caso de erro
    const previousState = isActive;
    // Otimismo na UI: muda visualmente antes da requisição terminar
    setIsActive(!previousState);
    setIsLoading(true);

    try {
      if (!previousState) {
        // Tentar ATIVAR (Adicionar ao plano)
        await paymentService.addItem(resourceType, resourceId);
        toast.success(`${resourceName} ativado no plano!`, { id: 'plan-update' });
      } else {
        // Tentar DESATIVAR (Remover do plano)
        await paymentService.removeItem(resourceType, resourceId);
        toast.success(`${resourceName} removido do plano.`, { id: 'plan-update' });
      }
      
      if (onToggleSuccess) onToggleSuccess(!previousState);

    } catch (error: any) {
      // Reverte o estado visual em caso de erro
      setIsActive(previousState);
      
      const status = error.response?.status;
      const errorMsg = error.response?.data?.message || 'Erro ao atualizar plano.';

      if (status === 400 && errorMsg.includes('Limite')) {
        toast.error(
          <div className="flex flex-col gap-1">
            <span className="font-bold">Limite do Plano Atingido!</span>
            <span className="text-xs">Faça um upgrade para adicionar mais itens.</span>
          </div>,
          { duration: 5000 }
        );
      } else if (status === 403) {
        toast.error('Seu plano não está ativo. Verifique o pagamento.');
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2" title={isActive ? "Item ativo no plano" : "Item inativo (não conta no limite)"}>
      {isLoading ? (
        <Loader2 size={18} className="animate-spin text-primary" />
      ) : (
        <input 
          type="checkbox" 
          className={`toggle toggle-sm ${isActive ? 'toggle-success' : 'toggle-secondary opacity-60'}`}
          checked={isActive}
          onChange={handleToggle}
        />
      )}
      <span className={`text-xs font-semibold ${isActive ? 'text-success' : 'text-gray-400'}`}>
        {isActive ? 'Ativo' : 'Inativo'}
      </span>
    </div>
  );
};

export default PlanResourceToggle;