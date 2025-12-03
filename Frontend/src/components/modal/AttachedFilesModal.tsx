import React, { useState, useEffect, useRef, type ChangeEvent } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import { 
  X, Download, Trash2, UploadCloud, File as FileIcon, 
  Loader2, AlertCircle, Paperclip, Plus 
} from 'lucide-react'; 

import documentService from '../../services/Document/api';
import type { AttachedFile } from '../../services/core-api';
import ConfirmModal from './ConfirmModal'; 

const FORBIDDEN_EXTENSIONS = [
  '.exe', '.bat', '.sh', '.cmd', '.msi', '.com', '.jar', '.vbs', '.ps1', '.php', '.py', '.pl', '.cgi'
];
const MAX_FILE_SIZE_MB = 50;

interface AttachedFilesModalProps {
  documentId: number;
  onClose: () => void;
}

export default function AttachedFilesModal({ documentId, onClose }: AttachedFilesModalProps) {
  const [files, setFiles] = useState<AttachedFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{ isOpen: boolean; fileId: number | null }>({
    isOpen: false,
    fileId: null
  });

  const [isUploadFormOpen, setIsUploadFormOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = async () => {
    setIsLoading(true);
    setListError(null);
    try {
      const response = await documentService.listAttachedFiles(documentId);
      setFiles(response.data.data || []);
    } catch (err: any) {
      console.error("Erro ao buscar anexos:", err);
      setListError("Falha ao carregar arquivos anexados.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (documentId) fetchFiles();
  }, [documentId]);

  const handleDownload = (fileUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const requestDetach = (attachedFileId: number) => {
    setConfirmConfig({
        isOpen: true,
        fileId: attachedFileId
    });
  };

  const handleConfirmDetach = async () => {
    const fileId = confirmConfig.fileId;
    if (!fileId) return;

    setIsActionLoading(true);
    try {
      await documentService.detachFile(fileId);
      setFiles(prevFiles => prevFiles.filter(f => f.attached_file_id !== fileId));
      toast.success("Arquivo removido com sucesso.");
      setConfirmConfig({ isOpen: false, fileId: null });
    } catch (err: any) {
      console.error("Erro ao remover anexo:", err);
      toast.error("Não foi possível remover o anexo. Tente novamente.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError(null);

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > MAX_FILE_SIZE_MB) {
      setUploadError(`O arquivo excede o limite de ${MAX_FILE_SIZE_MB}MB.`);
      e.target.value = '';
      setSelectedFile(null);
      return;
    }

    const fileName = file.name.toLowerCase();
    const hasForbiddenExtension = FORBIDDEN_EXTENSIONS.some(ext => fileName.endsWith(ext));
    
    if (hasForbiddenExtension) {
      setUploadError("Este tipo de arquivo (executável/script) não é permitido por segurança.");
      e.target.value = '';
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    if (!uploadTitle) {
      setUploadTitle(file.name);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !uploadTitle) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('title', uploadTitle);
      formData.append('file', selectedFile);

      await documentService.attachFile(documentId, formData);

      setUploadTitle('');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setIsUploadFormOpen(false); 
      fetchFiles(); 
      toast.success("Arquivo anexado com sucesso.");

    } catch (err: any) {
      console.error("Erro no upload:", err);
      const msg = err.response?.data?.message || "Falha ao enviar arquivo.";
      setUploadError(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const renderContent = () => {
    if (isLoading) {
        return (
            <div className="flex flex-col justify-center items-center py-12 text-gray-400">
                <Loader2 className="animate-spin mb-2" size={32} />
                <span>Carregando arquivos...</span>
            </div>
        );
    }
    if (listError) {
        return (
            <div className="alert alert-error shadow-sm my-4">
                <AlertCircle size={20} />
                <span>{listError}</span>
            </div>
        );
    }
    
    return (
      <div className="overflow-y-auto max-h-[50vh] px-1">
        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400 border-2 border-dashed border-base-200 rounded-xl bg-base-100/50">
              <Paperclip size={40} className="opacity-30 mb-3" />
              <p className="text-sm font-medium">Nenhum arquivo anexado.</p>
              <p className="text-xs mt-1">Faça o upload para adicionar documentos complementares.</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {files.map(file => (
              <li key={file.attached_file_id} className="flex items-center justify-between p-3 bg-base-100 border border-base-200 rounded-lg shadow-sm hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <FileIcon size={20} />
                      </div>
                      <div className="min-w-0">
                          <h4 className="font-medium text-sm text-secondary truncate max-w-[200px]" title={file.title}>
                              {file.title}
                          </h4>
                          <p className="text-xs text-gray-500">
                              {file.attached_at}
                          </p>
                      </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                      <div className="tooltip tooltip-left" data-tip="Baixar">
                        <button 
                            className="btn btn-square btn-sm btn-ghost text-primary hover:bg-primary/10" 
                            onClick={() => handleDownload(file.file, file.title)}
                        >
                            <Download size={16} />
                        </button>
                      </div>
                      
                      <div className="tooltip tooltip-left" data-tip="Remover">
                        <button 
                            className="btn btn-square btn-sm btn-ghost text-error hover:bg-error/10" 
                            onClick={() => requestDetach(file.attached_file_id)}
                            disabled={isActionLoading && confirmConfig.fileId === file.attached_file_id}
                        >
                            {isActionLoading && confirmConfig.fileId === file.attached_file_id ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Trash2 size={16} />
                            )}
                        </button>
                      </div>
                  </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  return createPortal(
    <>
      <div className="modal modal-open" role="dialog">
        <div className="modal-box relative max-w-lg p-0 overflow-hidden">
            
            {/* Cabeçalho Fixo */}
            <div className="flex justify-between items-center p-4 border-b border-base-200 bg-base-100">
                <h3 className="font-bold text-lg flex items-center gap-2 text-secondary">
                    <Paperclip size={20} className="text-primary" />
                    Arquivos Anexados
                </h3>
                <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}>
                    <X size={20} />
                </button>
            </div>

            {/* Conteúdo Rolável */}
            <div className="p-4 bg-base-100/50">
                {renderContent()}
            </div>

            {/* Rodapé (Formulário de Upload) */}
            <div className="p-4 border-t border-base-200 bg-base-100">
                {!isUploadFormOpen ? (
                    <button 
                        className="btn btn-outline btn-primary w-full gap-2 border-dashed" 
                        onClick={() => setIsUploadFormOpen(true)}
                    >
                        <Plus size={18} />
                        Anexar Novo Arquivo
                    </button>
                ) : (
                    <form onSubmit={handleUpload} className="bg-base-100 rounded-lg animate-fade-in-up">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-sm font-bold text-secondary">Novo Anexo</span>
                            <button 
                                type="button"
                                className="btn btn-xs btn-circle btn-ghost"
                                onClick={() => {
                                    setIsUploadFormOpen(false);
                                    setUploadError(null);
                                }}
                            >
                                <X size={14} />
                            </button>
                        </div>
                        
                        {uploadError && (
                            <div className="alert alert-error shadow-sm py-2 text-sm mb-3">
                                <AlertCircle size={16} />
                                <span>{uploadError}</span>
                            </div>
                        )}

                        <div className="space-y-3">
                            <input 
                                type="text"
                                className="input input-bordered input-sm w-full"
                                placeholder="Título do arquivo (ex: Contrato Assinado)"
                                value={uploadTitle}
                                onChange={(e) => setUploadTitle(e.target.value)}
                                required
                                disabled={isUploading}
                            />

                            <input 
                                type="file"
                                className="file-input file-input-bordered file-input-primary file-input-sm w-full"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                required
                                disabled={isUploading}
                            />
                            <p className="text-xs text-gray-500 px-1">
                                Máx: 50MB. Proibido: .exe, .bat, .sh, etc.
                            </p>

                            <div className="flex justify-end mt-2">
                                <button 
                                    type="submit" 
                                    className="btn btn-sm btn-primary text-white gap-2"
                                    disabled={isUploading || !selectedFile || !uploadTitle}
                                >
                                    {isUploading ? (
                                        <>
                                            <Loader2 className="animate-spin" size={16} /> Enviando...
                                        </>
                                    ) : (
                                        <>
                                            <UploadCloud size={16} /> Anexar
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </div>
        
        <form method="dialog" className="modal-backdrop">
            <button onClick={onClose}>close</button>
        </form>
      </div>

      <ConfirmModal 
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ isOpen: false, fileId: null })}
        onConfirm={handleConfirmDetach}
        isLoading={isActionLoading}
        title="Remover Anexo"
        message="Tem certeza que deseja remover este arquivo? Esta ação não pode ser desfeita."
        variant="danger"
        confirmText="Sim, Remover"
      />
    </>,
    document.body
  );
}