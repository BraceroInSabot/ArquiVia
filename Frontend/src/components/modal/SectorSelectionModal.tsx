import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { 
  X, Loader2, AlertCircle, Building2, Layers, 
  FilePlus, UploadCloud, ChevronLeft, AlertTriangle, ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

import sectorService from '../../services/Sector/api';
import documentService from '../../services/Document/api';
import type { Sector } from '../../services/core-api';

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

type WizardStep = 'SELECT_SECTOR' | 'SELECT_TYPE' | 'IMPORT_UPLOAD' | 'IMPORT_PROCESSING' | 'IMPORT_FORM';
type ImportStatus = 'IDLE' | 'UPLOADING' | 'PROCESSING' | 'DONE' | 'ERROR';

const SectorSelectionModal = ({ onClose, onSuccess }: SectorSelectionModalProps) => {
  const navigate = useNavigate();
  
  // --- ESTADOS ---
  const [step, setStep] = useState<WizardStep>('SELECT_SECTOR');
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Importação
  const [importStatus, setImportStatus] = useState<ImportStatus>('IDLE');
  //@ts-ignore
  const [importFile, setImportFile] = useState<File | null>(null);
  //@ts-ignore
  const [mediaAssetId, setMediaAssetId] = useState<string | null>(null);

  // Formulário
  //@ts-ignore
  const [docTitle, setDocTitle] = useState('');

  // --- EFEITOS ---
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

  // --- LÓGICA DE AÇÃO ---

  const handleSelectSector = (sector: Sector) => {
    setSelectedSector(sector);
    setStep('SELECT_TYPE');
  };

  const handleCreateDraft = async () => {
    if (!selectedSector) return;
    setIsLoading(true);
    try {
      const payload = {
        content: defaultEmptyContent,
        sector: selectedSector.sector_id,
        categories: []
      };
      const response = await documentService.createDocument(payload);
      const newDocId = response.data.data?.document_id;
      
      if (newDocId) {
        toast.success("Documento criado!");
        if (onSuccess) onSuccess();
        onClose();
        navigate(`/documento/editar/${newDocId}`);
      }
    } catch (err) {
      toast.error("Erro ao criar documento.");
      setIsLoading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    setDocTitle(file.name.split('.').slice(0, -1).join('.'));
    setImportStatus('UPLOADING');
    setStep('IMPORT_PROCESSING');

    try {
      const res = await documentService.uploadMedia(file, selectedSector ? selectedSector.sector_id : undefined);
      
      //@ts-ignore
      if (res.status === 201) {
        toast.success("Documento importado com sucesso!");
        
        if (onSuccess) onSuccess();
        onClose();
        
        return;
      }

      //@ts-ignore
      const assetId = res.data.media_asset_id || res.data.data?.asset_id;
      
      if (assetId) {
        setMediaAssetId(assetId);
        setImportStatus('PROCESSING');
      } else {
        throw new Error("Resposta do servidor não contém ID do asset.");
      }
      
    } catch (err) {
      console.error(err);
      setImportStatus('ERROR');
      toast.error("Falha no upload.");
      setStep('IMPORT_UPLOAD');
    }
  };

  // --- RENDERIZADORES DE UI ---

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
                  {step === 'SELECT_TYPE' && `Passo 2: Definir formato em ${selectedSector?.name}`}
                  {step.includes('IMPORT') && "Passo 3: Importação de Arquivo"}
              </p>
          </div>
       </div>
       <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost text-gray-400 hover:text-error">
          <X size={22} />
       </button>
    </div>
  );

  const renderSectorList = () => (
    // MUDANÇA: h-full w-full overflow-y-auto (removemos flex-1 e deixamos h-full explícito)
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
            <div className="grid grid-cols-1 gap-3 pb-6"> {/* Adicionei pb-6 para garantir espaço no fim do scroll */}
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
    <div className="p-8 h-full flex flex-col justify-center items-center bg-base-200/30">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-3xl">
            {/* Rascunho */}
            <button 
                onClick={handleCreateDraft}
                disabled={isLoading}
                className="relative bg-base-100 p-8 rounded-2xl border-2 border-transparent hover:border-primary shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group text-left flex flex-col gap-4 h-64 justify-center items-center"
            >
                <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    {isLoading ? <Loader2 className="animate-spin" size={32} /> : <FilePlus size={40} />}
                </div>
                <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-800 group-hover:text-primary">Documento em Branco</h3>
                    <p className="text-sm text-gray-500 mt-2 max-w-[200px] mx-auto leading-relaxed">
                        Comece do zero usando nosso editor de texto rico. Ideal para atas, ofícios e relatórios.
                    </p>
                </div>
            </button>

            {/* Importar */}
            <button 
                onClick={() => setStep('IMPORT_UPLOAD')}
                disabled={isLoading}
                className="relative bg-base-100 p-8 rounded-2xl border-2 border-transparent hover:border-secondary shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group text-left flex flex-col gap-4 h-64 justify-center items-center"
            >
                <div className="w-20 h-20 rounded-full bg-secondary/10 text-secondary flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <UploadCloud size={40} />
                </div>
                <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-800 group-hover:text-secondary">Importar Arquivo</h3>
                    <p className="text-sm text-gray-500 mt-2 max-w-[200px] mx-auto leading-relaxed">
                        Faça upload de um PDF, Word ou Imagem existente e transforme-o em um documento oficial.
                    </p>
                </div>
            </button>
        </div>
    </div>
  );

  const renderImportUpload = () => (
    <div className="p-8 h-full flex flex-col items-center justify-center bg-base-200/30">
        <div className="w-full max-w-lg">
            <label className="flex flex-col items-center justify-center w-full h-80 border-3 border-dashed border-gray-300 rounded-3xl cursor-pointer bg-base-100 hover:bg-base-100/50 hover:border-primary hover:text-primary transition-all group relative overflow-hidden">
                
                {/* Visual */}
                <div className="flex flex-col items-center justify-center pt-5 pb-6 z-10">
                    <div className="w-20 h-20 bg-base-200 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <UploadCloud size={36} className="text-gray-400 group-hover:text-primary transition-colors" />
                    </div>
                    <p className="mb-2 text-lg font-semibold text-gray-500 group-hover:text-primary">
                        Clique para selecionar o arquivo
                    </p>
                    <p className="text-xs text-gray-400">PDF, DOCX, PNG ou JPG (Máx. 25MB)</p>
                </div>

                <input 
                    type="file" 
                    className="hidden" 
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                />
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
                    <p className="text-sm text-gray-500 mt-2 mb-6">Não foi possível preparar o arquivo. Tente novamente.</p>
                    <button onClick={() => setStep('IMPORT_UPLOAD')} className="btn btn-outline w-full">
                        Tentar Outro Arquivo
                    </button>
                </>
            ) : (
                <>
                    <div className="relative w-16 h-16 mx-auto mb-6">
                         <div className="loading loading-spinner loading-lg text-primary absolute inset-0"></div>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 animate-pulse">Processando...</h3>
                    <p className="text-sm text-gray-500 mt-2">
                        Estamos gerando a visualização e lendo os dados do arquivo.
                    </p>
                </>
            )}
        </div>
    </div>
  );

  return createPortal(
    <div className="modal modal-open" role="dialog">
      {/* Container Principal: h-[80vh] flex flex-col */}
      <div className="modal-box p-0 w-11/12 max-w-4xl h-[80vh] flex flex-col bg-base-100 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header Fixo */}
        <div className="shrink-0">
            {renderHeader()}
        </div>
        
        {/* Corpo Flexível: Onde o scroll acontece */}
        {/* MUDANÇA: Adicionei 'flex-1 min-h-0' para forçar o cálculo correto de altura em flexbox aninhados */}
        <div className="flex-1 min-h-0 relative w-full">
             {step === 'SELECT_SECTOR' && renderSectorList()}
             {step === 'SELECT_TYPE' && renderTypeSelection()}
             {step === 'IMPORT_UPLOAD' && renderImportUpload()}
             {(step === 'IMPORT_PROCESSING' || importStatus === 'PROCESSING') && renderProcessing()}
        </div>
      </div>
      <form method="dialog" className="modal-backdrop bg-black/60"><button onClick={onClose}>close</button></form>
    </div>,
    document.body
  );
}

export default SectorSelectionModal;