import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { 
  X, Loader2, AlertCircle, Building2, Layers, 
  FilePlus, UploadCloud, ChevronLeft, FileText, CheckCircle2, AlertTriangle, ArrowRight, Lock, Users
} from 'lucide-react';
import toast from 'react-hot-toast';

import sectorService from '../../services/Sector/api';
import documentService from '../../services/Document/api';
import type { Sector } from '../../services/core-api';
import { useAuth } from '../../contexts/AuthContext';

const defaultEmptyContent = {
  "root": {
    "children": [
      {
        "children": [],
        "direction": null,
        "format": "",
        "indent": 0,
        "type": "paragraph",
        "version": 1
      }
    ],
    "direction": null,
    "format": "",
    "indent": 0,
    "type": "root",
    "version": 1
  }
};

interface SectorSelectionModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

interface SectorUser {
    user_id: number;
    name: string;
    hierarquia: string;
}

type WizardStep = 'SELECT_SECTOR' | 'SELECT_TYPE' | 'IMPORT_UPLOAD' | 'IMPORT_PROCESSING' | 'IMPORT_FORM';
type ImportStatus = 'IDLE' | 'UPLOADING' | 'PROCESSING' | 'DONE' | 'ERROR';

const SectorSelectionModal = ({ onClose, onSuccess }: SectorSelectionModalProps) => {
  const navigate = useNavigate();

  const [step, setStep] = useState<WizardStep>('SELECT_SECTOR');
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [sectors, setSectors] = useState<Sector[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [privacityId, setPrivacityId] = useState<number>(1);
  const [sectorUsers, setSectorUsers] = useState<SectorUser[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [importStatus, setImportStatus] = useState<ImportStatus>('IDLE');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [mediaAssetId, setMediaAssetId] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const pollingIntervalRef = useRef<number | null>(null);
  const [docTitle, setDocTitle] = useState('');
  const [docDesc, setDocDesc] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchSectors = async () => {
      try {
        setIsLoading(true);
        const response = await sectorService.getSectors();
        setSectors(response.data.data || []); 
      } catch (err) {
        console.error("Erro ao buscar setores:", err);
        setError("Não foi possível carregar os setores.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSectors();
  }, []);
  useEffect(() => {
    if (!selectedSector) return;

    const fetchUsers = async () => {
        setIsLoadingUsers(true);
        try {
      
            const response = await sectorService.listSectorUsersWithHierarchy(selectedSector.sector_id);
            const users_list = response.data.data || [];
            //@ts-ignore
            setSectorUsers(users_list.filter((u) => u.user_id !== user?.data.user_id));
        } catch (error) {
            console.error("Erro ao buscar usuários do setor:", error);
            toast.error("Erro ao carregar lista de usuários.");
        } finally {
            setIsLoadingUsers(false);
        }
    };

    fetchUsers();
    setPrivacityId(1);
    setSelectedUserIds([]);
  }, [selectedSector]);

  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    };
  }, []);

  const handleSelectSector = (sector: Sector) => {
    setSelectedSector(sector);
    setStep('SELECT_TYPE');
  };

  const toggleUserSelection = (userId: number) => {
    setSelectedUserIds(prev => 
        prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const validateConfiguration = () => {
      if (privacityId === 3 && selectedUserIds.length === 0) {
          toast.error("Para privacidade Exclusiva, selecione pelo menos um usuário.");
          return false;
      }
      return true;
  };

  const handleCreateDraft = async () => {
    if (!selectedSector) return;
    if (!validateConfiguration()) return;

    setIsLoading(true);
    try {
      const payload = {
        content: defaultEmptyContent,
        sector: selectedSector.sector_id,
        categories: [],
        privacity_id: privacityId,
        users_exclusive_access: privacityId === 3 ? selectedUserIds : []
      };

      const response = await documentService.createDocument(payload);
      const newDocId = response.data.data?.document_id;
      
      if (newDocId) {
        toast.success("Documento criado!");
        if (onSuccess) onSuccess();
        onClose();
        navigate(`/documento/editar/${newDocId}`);
      }
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.users_exclusive_access?.[0] || "Erro ao criar documento.";
      toast.error(msg);
      setIsLoading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!validateConfiguration()) {
  
        e.target.value = ''; 
        return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    setDocTitle(file.name.split('.').slice(0, -1).join('.'));
    setImportStatus('UPLOADING');
    setStep('IMPORT_PROCESSING');

    try {
      console.log(privacityId)
      const res = await documentService.uploadMedia(
        file, 
        selectedSector ? selectedSector.sector_id : undefined, 
        privacityId, 
        privacityId === 3 ? selectedUserIds : []
      );
      
      //@ts-ignore
      if (res.status === 201) {
        toast.success("Documento importado com sucesso!");
        if (onSuccess) onSuccess();
        onClose();
        return;
      }

      //@ts-ignore
      const assetId = res.data.media_asset_id || res.data.data?.asset_id;
      
      setMediaAssetId(assetId);
      setImportStatus('PROCESSING');
      startPolling(assetId);
    } catch (err) {
      setImportStatus('ERROR');
      toast.error("Falha no upload.");
      setStep('IMPORT_UPLOAD');
    }
  };

  const startPolling = (assetId: string) => {
    pollingIntervalRef.current = window.setInterval(async () => {
      try {
        const res = await documentService.checkMediaStatus(assetId);
        const status = res.data.status;
        
        if (status === 'DONE') {
          if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
          setImportStatus('DONE');
          setThumbnailUrl(res.data.thumbnail_url || null);
          setStep('IMPORT_FORM');
        } else if (status === 'ERROR') {
          if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
          setImportStatus('ERROR');
          toast.error("Erro no processamento.");
        }
      } catch {
        setImportStatus('ERROR');
      }
    }, 2000);
  };

  const handleFinishImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaAssetId || !selectedSector) return;
    if (!validateConfiguration()) return;

    setIsLoading(true);
    try {
      await documentService.createDocumentFromImport({
        title: docTitle,
        description: docDesc,
        sector_id: selectedSector.sector_id,
        privacity_id: privacityId,
        users_exclusive_access: privacityId === 3 ? selectedUserIds : [],
        media_asset_id: mediaAssetId
      });
      
      toast.success("Importação concluída!");
      if (onSuccess) onSuccess();
      onClose();
      window.location.reload(); 
    } catch (err: any) {
      const msg = err.response?.data?.users_exclusive_access?.[0] || "Erro ao salvar documento.";
      toast.error(msg);
      setIsLoading(false);
    }
  };

  const renderHeader = () => (
    <div className="flex items-center justify-between px-6 py-4 border-b border-base-200 bg-base-100">
       <div className="flex items-center gap-3">
          {step !== 'SELECT_SECTOR' && (
            <button 
                onClick={() => {
                    if (step === 'SELECT_TYPE') setStep('SELECT_SECTOR');
                    else if (step === 'IMPORT_UPLOAD') setStep('SELECT_TYPE');
                    else if (step === 'IMPORT_FORM') setStep('IMPORT_UPLOAD'); 
                }} 
                className="btn btn-sm btn-circle btn-ghost text-gray-500"
            >
                <ChevronLeft size={22} />
            </button>
          )}
          <div>
              <h2 className="text-xl font-bold text-secondary">Novo Documento</h2>
              <p className="text-xs text-gray-500 font-medium">
                  {step === 'SELECT_SECTOR' && "Passo 1: Selecione o Setor"}
                  {step === 'SELECT_TYPE' && `Passo 2: Configuração e Formato`}
                  {step.includes('IMPORT') && "Passo 3: Finalização"}
              </p>
          </div>
       </div>
       <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost text-gray-400 hover:text-error">
          <X size={22} />
       </button>
    </div>
  );

  const renderSectorList = () => (
    <div className="h-full w-full p-6 bg-base-200/30 overflow-y-auto">
        {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
                <Loader2 className="animate-spin text-primary" size={40} />
                <span>Carregando setores...</span>
            </div>
        ) : error ? (
            <div className="alert alert-error shadow-sm">
                <AlertCircle size={20} />
                <span>{error}</span>
            </div>
        ) : (
            <div className="grid grid-cols-1 gap-3 pb-6">
                {sectors.map((sector) => (
                    <div 
                        key={sector.sector_id} 
                        onClick={() => handleSelectSector(sector)}
                        className="group bg-base-100 p-4 rounded-xl border border-base-200 shadow-sm hover:shadow-md hover:border-primary/50 cursor-pointer transition-all flex items-center justify-between"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-primary/5 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                                {sector.image ? (
                                    <img src={sector.image} alt="" className="w-full h-full object-cover rounded-lg" />
                                ) : (
                                    <Building2 size={24} />
                                )}
                            </div>
                            <div>
                                <h4 className="font-bold text-secondary text-base group-hover:text-primary transition-colors">
                                    {sector.name}
                                </h4>
                                <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                                    <Layers size={12} />
                                    <span>{sector.enterprise_name}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="badge badge-ghost badge-sm text-gray-500 font-medium">
                                {sector.hierarchy_level}
                            </span>
                            <ArrowRight size={18} className="text-gray-300 group-hover:text-primary -translate-x-2 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all" />
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
  const renderTypeSelection = () => (
    <div className="flex flex-col h-full bg-base-200/30">
        
        {/* Área de Scroll: Configurações */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Seção 1: Privacidade */}
            <div className="bg-base-100 p-5 rounded-xl border border-base-200 shadow-sm">
                <h3 className="font-bold text-secondary mb-3 flex items-center gap-2">
                    <Lock size={18} className="text-primary" /> Privacidade do Documento
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Opção 1: Privado */}
                    <label className={`cursor-pointer border p-3 rounded-lg flex flex-col gap-2 transition-all ${privacityId === 1 ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-base-300 hover:bg-base-200'}`}>
                        <div className="flex justify-between w-full">
                            <span className="font-semibold text-sm">🔒 Privado</span>
                            <input type="radio" name="privacity" className="radio radio-primary radio-sm" checked={privacityId === 1} onChange={() => setPrivacityId(1)} />
                        </div>
                        <p className="text-xs text-gray-500">Apenas eu, gestores e admins.</p>
                    </label>

                    {/* Opção 2: Público */}
                    <label className={`cursor-pointer border p-3 rounded-lg flex flex-col gap-2 transition-all ${privacityId === 2 ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-base-300 hover:bg-base-200'}`}>
                        <div className="flex justify-between w-full">
                            <span className="font-semibold text-sm">🌍 Público</span>
                            <input type="radio" name="privacity" className="radio radio-primary radio-sm" checked={privacityId === 2} onChange={() => setPrivacityId(2)} />
                        </div>
                        <p className="text-xs text-gray-500">Visível para toda a empresa.</p>
                    </label>

                    {/* Opção 3: Exclusivo */}
                    <label className={`cursor-pointer border p-3 rounded-lg flex flex-col gap-2 transition-all ${privacityId === 3 ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-base-300 hover:bg-base-200'}`}>
                        <div className="flex justify-between w-full">
                            <span className="font-semibold text-sm">👥 Exclusivo</span>
                            <input type="radio" name="privacity" className="radio radio-primary radio-sm" checked={privacityId === 3} onChange={() => setPrivacityId(3)} />
                        </div>
                        <p className="text-xs text-gray-500">Selecione usuários específicos.</p>
                    </label>
                </div>
            </div>

            {/* Seção 2: Seleção de Usuários (Aparece apenas se Exclusivo) */}
            {privacityId === 3 && (
                <div className="bg-base-100 p-5 rounded-xl border border-base-200 shadow-sm animate-fade-in-down">
                    <h3 className="font-bold text-secondary mb-1 flex items-center gap-2">
                        <Users size={18} className="text-primary" /> Usuários com Acesso
                    </h3>
                    <p className="text-xs text-gray-500 mb-4">Selecione quem poderá visualizar este documento além dos administradores.</p>

                    {isLoadingUsers ? (
                         <div className="flex justify-center py-4"><Loader2 className="animate-spin text-primary" /></div>
                    ) : (
                        <div className="max-h-48 overflow-y-auto border border-base-200 rounded-lg divide-y divide-base-200">
                            {sectorUsers.map(user => (
                                <label key={user.user_id} className="flex items-center justify-between p-3 cursor-pointer hover:bg-base-200/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <p className="text-sm font-semibold leading-none">{user.name}</p>
                                            <p className="text-xs text-gray-500 leading-none mt-1">{user.hierarquia}</p>
                                        </div>
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        className="checkbox checkbox-primary checkbox-sm"
                                        checked={selectedUserIds.includes(user.user_id)}
                                        onChange={() => toggleUserSelection(user.user_id)}
                                    />
                                </label>
                            ))}
                            {sectorUsers.length === 0 && <p className="p-4 text-center text-sm text-gray-400">Nenhum usuário encontrado no setor.</p>}
                        </div>
                    )}
                </div>
            )}
            
        </div>

        {/* Rodapé: Botões de Ação */}
        <div className="p-4 bg-base-100 border-t border-base-200 grid grid-cols-2 gap-4 shrink-0">
             {/* Botão Rascunho */}
             <button 
                onClick={handleCreateDraft}
                disabled={isLoading}
                className="btn h-auto min-h-[3.5rem] flex flex-col gap-0 border-base-300 bg-base-100 hover:border-primary hover:bg-primary/5"
            >
                <div className="flex items-center gap-2 font-bold text-secondary">
                    {isLoading ? <Loader2 className="animate-spin" size={18} /> : <FilePlus size={18} />}
                    Criar Rascunho
                </div>
                <span className="text-[10px] text-gray-500 font-normal">Editor em branco</span>
            </button>

            {/* Botão Importar */}
            <button 
                onClick={() => setStep('IMPORT_UPLOAD')}
                disabled={isLoading}
                className="btn h-auto min-h-[3.5rem] flex flex-col gap-0 border-base-300 bg-base-100 hover:border-secondary hover:bg-secondary/5"
            >
                <div className="flex items-center gap-2 font-bold text-secondary">
                    <UploadCloud size={18} />
                    Importar Arquivo
                </div>
                <span className="text-[10px] text-gray-500 font-normal">PDF, Word ou Imagem</span>
            </button>
        </div>
    </div>
  );

  const renderImportUpload = () => (
    <div className="p-8 h-full flex flex-col items-center justify-center bg-base-200/30">
        <div className="w-full max-w-lg">
            <label className="flex flex-col items-center justify-center w-full h-80 border-3 border-dashed border-gray-300 rounded-3xl cursor-pointer bg-base-100 hover:bg-base-100/50 hover:border-primary hover:text-primary transition-all group relative overflow-hidden">
                <div className="flex flex-col items-center justify-center pt-5 pb-6 z-10">
                    <div className="w-20 h-20 bg-base-200 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <UploadCloud size={36} className="text-gray-400 group-hover:text-primary transition-colors" />
                    </div>
                    <p className="mb-2 text-lg font-semibold text-gray-500 group-hover:text-primary">
                        Clique para selecionar o arquivo
                    </p>
                    <p className="text-xs text-gray-400">PDF, DOCX, PNG ou JPG (Máx. 25MB)</p>
                </div>
                <input type="file" className="hidden" onChange={handleFileSelect} accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" />
            </label>
        </div>
    </div>
  );

  const renderProcessing = () => (
    <div className="p-8 h-full flex flex-col items-center justify-center bg-base-200/30">
        <div className="bg-base-100 p-8 rounded-2xl shadow-sm border border-base-200 text-center max-w-sm w-full">
            {importStatus === 'ERROR' ? (
                <>
                    <div className="w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Falha no Processamento</h3>
                    <button onClick={() => setStep('IMPORT_UPLOAD')} className="btn btn-outline w-full mt-4">Tentar Outro Arquivo</button>
                </>
            ) : (
                <>
                    <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
                    <h3 className="text-lg font-bold text-gray-800 animate-pulse">Processando...</h3>
                </>
            )}
        </div>
    </div>
  );

  const renderImportForm = () => (
    <div className="flex flex-col md:flex-row h-full overflow-hidden">
        {/* Preview */}
        <div className="w-full md:w-1/3 bg-base-200/50 p-6 border-r border-base-200 flex flex-col items-center justify-start overflow-y-auto">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 w-full text-center">Arquivo</h4>
            <div className="w-full aspect-[3/4] bg-white rounded-xl shadow-sm border border-base-300 overflow-hidden relative group">
                {thumbnailUrl ? (
                    <img src={thumbnailUrl} alt="Preview" className="w-full h-full object-cover object-top" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300"><FileText size={48} /></div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="badge badge-success gap-2 text-white p-3 h-auto"><CheckCircle2 size={16} /> Pronto</div>
                </div>
            </div>
            <p className="font-bold text-sm text-secondary truncate px-2 mt-4 text-center w-full" title={importFile?.name}>{importFile?.name}</p>
        </div>

        {/* Formulário */}
        <div className="w-full md:w-2/3 bg-base-100 p-8 overflow-y-auto">
            <form onSubmit={handleFinishImport} className="flex flex-col gap-5 max-w-lg mx-auto">
                <div className="form-control w-full">
                    <label className="label"><span className="label-text font-semibold">Título do Documento</span></label>
                    <input type="text" className="input input-bordered w-full" value={docTitle} onChange={e => setDocTitle(e.target.value)} required />
                </div>

                {/* Privacidade (Visualização / Edição) */}
                <div className="form-control w-full">
                    <label className="label"><span className="label-text font-semibold">Privacidade Configurada</span></label>
                    <div className="grid grid-cols-2 gap-2">
                        <select 
                            className="select select-bordered w-full" 
                            value={privacityId} 
                            onChange={e => setPrivacityId(Number(e.target.value))}
                        >
                            <option value={1}>🔒 Privado</option>
                            <option value={2}>🌍 Público</option>
                            <option value={3}>👥 Exclusivo</option>
                        </select>
                        {privacityId === 3 && (
                             <div className="badge badge-outline h-full w-full gap-2">
                                <Users size={14} /> {selectedUserIds.length} usuários
                             </div>
                        )}
                    </div>
                    {privacityId === 3 && <p className="text-xs text-gray-400 mt-1">*Edite os usuários voltando ao Passo 2 se necessário.</p>}
                </div>

                <div className="form-control w-full">
                    <label className="label"><span className="label-text font-semibold">Descrição (Opcional)</span></label>
                    <textarea className="textarea textarea-bordered h-24 resize-none" value={docDesc} onChange={e => setDocDesc(e.target.value)}></textarea>
                </div>

                <div className="pt-4 mt-2 border-t border-base-200 flex justify-end gap-3">
                    <button type="submit" className="btn btn-primary px-8" disabled={isLoading}>
                        {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'Finalizar Importação'}
                    </button>
                </div>
            </form>
        </div>
    </div>
  );

  return createPortal(
    <div className="modal modal-open" role="dialog">
      <div className="modal-box p-0 w-11/12 max-w-4xl h-[80vh] flex flex-col bg-base-100 rounded-2xl shadow-2xl overflow-hidden">
        <div className="shrink-0">{renderHeader()}</div>
        <div className="flex-1 min-h-0 relative w-full">
             {step === 'SELECT_SECTOR' && renderSectorList()}
             {step === 'SELECT_TYPE' && renderTypeSelection()}
             {step === 'IMPORT_UPLOAD' && renderImportUpload()}
             {(step === 'IMPORT_PROCESSING' || importStatus === 'PROCESSING') && renderProcessing()}
             {step === 'IMPORT_FORM' && renderImportForm()}
        </div>
      </div>
      <form method="dialog" className="modal-backdrop bg-black/60"><button onClick={onClose}>close</button></form>
    </div>,
    document.body
  );
}

export default SectorSelectionModal;