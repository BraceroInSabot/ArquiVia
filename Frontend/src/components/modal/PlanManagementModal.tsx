import React, { useEffect, useState, useMemo } from 'react';
import { X, Search, Building, Layers, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

// Serviços
import enterpriseService from '../../services/Enterprise/api'; // Caminho solicitado
import paymentService from '../../services/Payment/api';
import sectorService from '../../services/Sector/api';

// Componentes
import PlanResourceToggle from '../Payment/PlanResourceToggle';

interface ResourceItem {
  enterprise_id: number;
  name: string;
}

interface PlanManagementModalProps {
  type: 'enterprise' | 'sector';
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void; // Atualiza o dashboard pai
}

const PlanManagementModal: React.FC<PlanManagementModalProps> = ({ 
  type, 
  isOpen, 
  onClose, 
  onUpdate 
}) => {
  const [items, setItems] = useState<ResourceItem[]>([]);
  const [activeIds, setActiveIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');


  // Título e Ícone dinâmicos baseados no tipo
  const modalConfig = useMemo(() => ({
    title: type === 'enterprise' ? 'Gerenciar Empresas' : 'Gerenciar Setores',
    icon: type === 'enterprise' ? <Building className="text-primary" /> : <Layers className="text-secondary" />,
    placeholder: type === 'enterprise' ? 'Buscar por nome ou CNPJ...' : 'Buscar por nome ou sigla...',
    emptyMsg: type === 'enterprise' ? 'Nenhuma empresa encontrada.' : 'Nenhum setor encontrado.'
  }), [type]);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
    // Limpa estado ao fechar (opcional, mas boa prática)
    return () => {
      setSearchTerm('');
    };
  }, [isOpen, type]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // 1. Busca a lista de recursos (Empresas ou Setores)
      let listPromise;
      
      if (type === 'enterprise') {
        // Usa o service específico solicitado
        listPromise = enterpriseService.getEnterprises(); 
      } else {
        // Fallback para setores (ajuste a rota se tiver um sectorService)
        listPromise = sectorService.getOwnSectors(); 
      }

      // 2. Busca quais itens estão ativos no plano financeiro
      const activePromise = paymentService.getActiveItems();

      const [listRes, activeRes] = await Promise.all([listPromise, activePromise]);
      // Normalização de dados para interface comum
      const rawList = listRes.data?.data || listRes.data;
      const normalizedItems: ResourceItem[] = rawList.map((item: any) => ({
        enterprise_id: item.enterprise_id,
        name: item.name,
      }));

      setItems(normalizedItems);
      setActiveIds(type === 'enterprise' ? activeRes.active_enterprises : activeRes.active_sectors);

    } catch (error) {
      //@ts-ignore
      if (error.response && error.response.status === 404) {
        setError(true);
        //@ts-ignore
        setErrorMessage(error.response.data.mensagem)
        return;
      }
      toast.error(`Erro ao carregar lista de ${type === 'enterprise' ? 'empresas' : 'setores'}.`);
    } finally {
      setIsLoading(false);
    }
  };

  // Atualização otimista local para evitar re-fetch a cada clique
  const handleToggleSuccess = (id: number, isNowActive: boolean) => {
    if (isNowActive) {
      setActiveIds(prev => [...prev, id]);
    } else {
      setActiveIds(prev => prev.filter(activeId => activeId !== id));
    }
    // Notifica o componente pai (PlanConsole) para atualizar as barras de progresso
    onUpdate();
  };

  // Filtragem local
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="modal modal-open z-50">
      <div className="modal-box w-11/12 max-w-2xl h-[85vh] flex flex-col p-0 bg-base-100 shadow-2xl rounded-2xl overflow-hidden">
        
        {/* --- Header --- */}
        <div className="flex justify-between items-center p-5 border-b border-base-200 bg-base-100 sticky top-0 z-10">
          <h3 className="font-bold text-xl flex items-center gap-3 text-secondary">
            <div className="p-2 bg-base-200 rounded-lg">
                {modalConfig.icon}
            </div>
            {modalConfig.title}
          </h3>
          <button 
            className="btn btn-sm btn-circle btn-ghost hover:bg-base-200 text-gray-500" 
            onClick={onClose}
          >
            <X size={22}/>
          </button>
        </div>

        {/* --- Barra de Busca --- */}
        <div className="p-4 bg-base-200/40 border-b border-base-200">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              className="input input-bordered w-full pl-11 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary rounded-xl transition-all"
              placeholder={modalConfig.placeholder}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        {/* --- Lista de Itens --- */}
        <div className="flex-1 overflow-y-auto bg-base-100 scrollbar-thin scrollbar-thumb-base-300 scrollbar-track-base-100">
          {isLoading ? (
            <div className="flex flex-col justify-center items-center h-full text-gray-400 gap-3">
               <Loader2 size={32} className="animate-spin text-primary/50" />
               <span className="text-sm font-medium">Carregando dados...</span>
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="divide-y divide-base-200">
              {error && (
                <span>
                  {errorMessage}
                </span>
              )}
              {filteredItems.map(item => {
                const isActive = activeIds.includes(item.enterprise_id);
                console.log(item);
                
                return (
                  <div 
                    key={item.enterprise_id} 
                    className={`flex items-center justify-between p-4 hover:bg-base-200/50 transition-colors ${isActive ? 'bg-primary/5' : ''}`}
                  >
                    <div className="flex flex-col">
                      <span className={`font-semibold text-sm ${isActive ? 'text-primary' : 'text-neutral'}`}>
                        {item.name}
                      </span>
                    </div>

                    <div className="flex items-center">
                      <PlanResourceToggle 
                        resourceId={item.enterprise_id}
                        resourceType={type}
                        resourceName={item.name}
                        isInitiallyActive={isActive}
                        onToggleSuccess={(newState) => handleToggleSuccess(item.enterprise_id, newState)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center h-full text-gray-400 gap-2 opacity-60">
                <AlertCircle size={40} />
                <p>{modalConfig.emptyMsg}</p>
                {error && (
            <span>
              {errorMessage}
            </span>
          )}
            </div>
          )}
        </div>

        {/* --- Footer Informativo --- */}
        <div className="p-4 bg-base-200/50 text-xs text-gray-500 text-center border-t border-base-200">
          <p>
            <span className="font-bold text-gray-700">Nota:</span> Itens ativos consomem sua cota mensal. 
            Desative itens não utilizados para liberar espaço no plano.
          </p>
        </div>
      </div>
      
      {/* Backdrop com blur para foco */}
      <div className="modal-backdrop bg-neutral/60" onClick={onClose}></div>
    </div>
  );
};

export default PlanManagementModal;