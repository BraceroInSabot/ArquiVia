import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, Clock, Loader2, AlertCircle } from 'lucide-react';
import sectorService from '../../services/Sector/api';
import toast from 'react-hot-toast';

interface ReviewPolicyModalProps {
  sectorId: number;
  onClose: () => void;
}

export default function ReviewPolicyModal({ sectorId, onClose }: ReviewPolicyModalProps) {
  const [days, setDays] = useState<number>(30); // Default 30 dias
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar dados existentes
  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        setIsLoading(true);
        // Assumindo que seu backend tem um endpoint GET /sectors/{id}/review-policy/
        const response = await sectorService.getReviewPolicy(sectorId);
        if (response.data.data) {
            setDays(response.data.data.days);
            setIsActive(response.data.data.is_active);
        }
      } catch (err: any) {
        // Se for 404, significa que ainda não tem política, usamos o padrão
        if (err.response?.status !== 404) {
            console.error("Erro ao buscar política:", err);
            setError("Falha ao carregar configurações.");
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchPolicy();
  }, [sectorId]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      
      const payload = { days, is_active: isActive };
      
      // Assumindo endpoint POST ou PUT /sectors/{id}/review-policy/
      await sectorService.updateReviewPolicy(sectorId, payload);
      
      toast.success("Política de revisão atualizada!");
      onClose();
    } catch (err: any) {
      console.error("Erro ao salvar:", err);
      setError("Não foi possível salvar as alterações.");
    } finally {
      setIsSaving(false);
    }
  };

  return createPortal(
    <div className="modal modal-open">
      <div className="modal-box relative">
        <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            <X size={20} />
        </button>
        
        <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
            <Clock className="text-primary" /> 
            Configurar Revisão (SLA)
        </h3>

        {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div>
        ) : (
            <div className="space-y-6">
                {error && (
                    <div className="alert alert-error text-sm py-2"><AlertCircle size={16}/> {error}</div>
                )}

                {/* Toggle Ativo/Inativo */}
                <div className="form-control">
                    <label className="label cursor-pointer justify-start gap-4 border p-3 rounded-lg hover:bg-base-200 transition-colors">
                        <input 
                            type="checkbox" 
                            className="toggle toggle-primary" 
                            checked={isActive} 
                            onChange={(e) => setIsActive(e.target.checked)}
                        />
                        <div className="flex flex-col">
                            <span className="label-text font-bold">Ativar Política de Revisão</span>
                            <span className="label-text-alt text-gray-500">Documentos exigirão revisão periódica.</span>
                        </div>
                    </label>
                </div>

                {/* Input de Dias */}
                <div className={`form-control ${!isActive ? 'opacity-50 pointer-events-none' : ''}`}>
                    <label className="label">
                        <span className="label-text font-semibold">Validade (Dias)</span>
                    </label>
                    <div className="join w-full">
                        <input 
                            type="number" 
                            min="1"
                            value={days}
                            onChange={(e) => setDays(Number(e.target.value))}
                            className="input input-bordered join-item w-full"
                            placeholder="Ex: 30"
                        />
                        <div className="btn join-item no-animation">Dias</div>
                    </div>
                    <p className="text-xs text-red-500 mt-2">
                        Após este período, os documentos revisados fora da data de validade serão marcados como "Revisão necessária". <strong>Esta ação não é reversível.</strong>
                    </p>
                </div>
            </div>
        )}

        <div className="modal-action">
            <button className="btn btn-ghost" onClick={onClose} disabled={isSaving}>Cancelar</button>
            <button 
                className="btn btn-primary gap-2" 
                onClick={handleSave} 
                disabled={isSaving || isLoading}
            >
                {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                Salvar Configuração
            </button>
        </div>
      </div>
      
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </div>,
    document.body
  );
}