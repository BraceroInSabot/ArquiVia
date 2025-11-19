import React, { useState, useEffect, useRef, type ChangeEvent } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import { 
  Download, Trash2, UploadCloud, File as FileIcon, 
  Loader2, AlertCircle, Paperclip 
} from 'lucide-react'; 

import documentService from '../services/Document/api';
import type { AttachedFile } from '../services/core-api';
import ConfirmModal from './ConfirmModal'; // 1. Importe o Modal Genérico

import '../assets/css/ClassificationModal.css'; 
import '../assets/css/AttachedFilesModal.css'; 

const FORBIDDEN_EXTENSIONS = [
  '.exe', '.bat', '.sh', '.cmd', '.msi', '.com', '.jar', '.vbs', '.ps1', '.php', '.py', '.pl', '.cgi'
];
const MAX_FILE_SIZE_MB = 50;

interface AttachedFilesModalProps {
  documentId: number;
  onClose: () => void;
}

export default function AttachedFilesModal({ documentId, onClose }: AttachedFilesModalProps) {
  // Estados da Lista
  const [files, setFiles] = useState<AttachedFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  
  // 2. Estados para o Modal de Confirmação
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{ isOpen: boolean; fileId: number | null }>({
    isOpen: false,
    fileId: null
  });

  // Estados do Upload
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

  // --- 3. Handler para ABRIR o Modal ---
  const requestDetach = (attachedFileId: number) => {
    setConfirmConfig({
        isOpen: true,
        fileId: attachedFileId
    });
  };

  // --- 4. Handler para EXECUTAR a Ação ---
  const handleConfirmDetach = async () => {
    const fileId = confirmConfig.fileId;
    if (!fileId) return;

    setIsActionLoading(true);
    try {
      await documentService.detachFile(fileId);
      
      // Sucesso: Remove da lista localmente
      setFiles(prevFiles => prevFiles.filter(f => f.attached_file_id !== fileId));
      toast.success("Arquivo removido com sucesso.");
      
      // Fecha o modal
      setConfirmConfig({ isOpen: false, fileId: null });
    } catch (err: any) {
      console.error("Erro ao remover anexo:", err);
      toast.error("Não foi possível remover o anexo. Tente novamente.");
    } finally {
      setIsActionLoading(false);
    }
  };

  // --- Handlers de Upload (Sem mudanças) ---
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
            <div className="d-flex flex-column justify-content-center align-items-center py-5 text-muted">
                <Loader2 className="animate-spin mb-2" size={32} />
                <span>Carregando arquivos...</span>
            </div>
        );
    }
    if (listError) {
        return (
            <div className="alert alert-danger d-flex align-items-center m-3" role="alert">
                <AlertCircle className="me-2" size={20} />
                <div>{listError}</div>
            </div>
        );
    }
    
    return (
      <>
        <div className="modal-body p-0" style={{ maxHeight: '50vh', overflowY: 'auto' }}>
            {files.length === 0 ? (
            <div className="text-center py-5 px-4 text-muted">
                <Paperclip size={48} className="opacity-25 mb-3" />
                <p className="mb-0 fst-italic">Nenhum arquivo anexado a este documento.</p>
            </div>
            ) : (
            <ul className="list-group list-group-flush">
                {files.map(file => (
                <li key={file.attached_file_id} className="list-group-item d-flex justify-content-between align-items-center p-3">
                    <div className="d-flex align-items-center overflow-hidden">
                        <div className="bg-light p-2 rounded me-3 text-secondary">
                            <FileIcon size={20} />
                        </div>
                        <div className="overflow-hidden">
                            <h6 className="mb-0 text-dark text-truncate" style={{ maxWidth: '250px' }} title={file.title}>
                                {file.title}
                            </h6>
                            <small className="text-muted d-block">
                                {new Date(file.attached_at).toLocaleDateString()} • {new Date(file.attached_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </small>
                        </div>
                    </div>
                    
                    <div className="d-flex gap-2">
                        <button 
                            className="btn btn-light btn-sm text-primary" 
                            title="Baixar"
                            onClick={() => handleDownload(file.file, file.title)}
                        >
                            <Download size={18} />
                        </button>
                        
                        {/* 5. Botão atualizado para chamar requestDetach */}
                        <button 
                            className="btn btn-light btn-sm text-danger" 
                            title="Remover Anexo"
                            onClick={() => requestDetach(file.attached_file_id)}
                            disabled={isActionLoading && confirmConfig.fileId === file.attached_file_id}
                        >
                             {isActionLoading && confirmConfig.fileId === file.attached_file_id ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <Trash2 size={18} />
                            )}
                        </button>
                    </div>
                </li>
                ))}
            </ul>
            )}
        </div>

        <div className="modal-footer bg-light d-block p-3 border-top">
          {!isUploadFormOpen ? (
            <button 
              className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center gap-2" 
              onClick={() => setIsUploadFormOpen(true)}
            >
              <UploadCloud size={20} />
              Anexar Novo Arquivo
            </button>
          ) : (
            <form className="upload-form" onSubmit={handleUpload}>
              <h6 className="fw-bold text-dark mb-3">Novo Anexo</h6>
              
              {uploadError && (
                  <div className="alert alert-danger d-flex align-items-center p-2 small mb-3" role="alert">
                    <AlertCircle className="me-2 flex-shrink-0" size={16} />
                    <div>{uploadError}</div>
                  </div>
              )}

              <div className="mb-3">
                <input 
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Título do arquivo (ex: Contrato Assinado)"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  required
                  disabled={isUploading}
                />
              </div>

              <div className="mb-3">
                <input 
                  type="file"
                  className="form-control form-control-sm"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  required
                  disabled={isUploading}
                />
                <div className="form-text text-muted small mt-1">
                  Máx: 50MB. Proibido: .exe, .bat, .sh, etc.
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button 
                  type="button" 
                  className="btn btn-sm btn-light text-secondary"
                  onClick={() => {
                    setIsUploadFormOpen(false);
                    setUploadError(null);
                  }}
                  disabled={isUploading}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn btn-sm btn-success d-flex align-items-center gap-2"
                  disabled={isUploading || !selectedFile || !uploadTitle}
                >
                   {isUploading ? (
                        <>
                            <Loader2 className="animate-spin" size={16} /> Enviando...
                        </>
                    ) : (
                        'Anexar Arquivo'
                    )}
                </button>
              </div>
            </form>
          )}
        </div>
      </>
    );
  };

  return createPortal(
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
          <h2>Arquivos Anexados</h2>
          {renderContent()}
        </div>
      </div>

      {/* 6. Renderização do Modal Genérico */}
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