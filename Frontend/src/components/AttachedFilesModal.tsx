import React, { useState, useEffect, useRef, type ChangeEvent } from 'react';
import { createPortal } from 'react-dom';
import documentService from '../services/Document/api';
import type { AttachedFile } from '../services/core-api';
import '../assets/css/ClassificationModal.css'; 
import '../assets/css/AttachedFilesModal.css'; 

// Constantes de validação
const FORBIDDEN_EXTENSIONS = [
  '.exe', '.bat', '.sh', '.cmd', '.msi', '.com', '.jar', '.vbs', '.ps1', '.php', '.py', '.pl', '.cgi'
];
const MAX_FILE_SIZE_MB = 50;

// --- ÍCONES SVG ---
const DownloadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const TrashIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

interface AttachedFilesModalProps {
  documentId: number;
  onClose: () => void;
}

export default function AttachedFilesModal({ documentId, onClose }: AttachedFilesModalProps) {
  // Estados da Lista
  const [files, setFiles] = useState<AttachedFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  
  // Estado para feedback visual de exclusão
  const [deletingFileId, setDeletingFileId] = useState<number | null>(null);

  // Estados do Upload
  const [isUploadFormOpen, setIsUploadFormOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Busca de Arquivos ---
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

  // --- Handler de Download ---
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

  // --- NOVA FUNÇÃO: Handler de Exclusão (Desvincular) ---
  const handleDetach = async (attachedFileId: number) => {
    if (!window.confirm("Tem certeza que deseja remover este anexo?")) return;

    setDeletingFileId(attachedFileId);
    try {
      await documentService.detachFile(attachedFileId);
      
      // Sucesso: Remove da lista localmente
      setFiles(prevFiles => prevFiles.filter(f => f.attached_file_id !== attachedFileId));
      
    } catch (err: any) {
      console.error("Erro ao remover anexo:", err);
      alert("Não foi possível remover o anexo. Tente novamente.");
    } finally {
      setDeletingFileId(null);
    }
  };

  // --- Handlers de Upload (Sem mudanças na lógica) ---
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

    } catch (err: any) {
      console.error("Erro no upload:", err);
      const msg = err.response?.data?.message || "Falha ao enviar arquivo.";
      setUploadError(msg);
    } finally {
      setIsUploading(false);
    }
  };

  // --- Renderização ---
  const renderContent = () => {
    if (isLoading) return <p>Carregando arquivos...</p>;
    if (listError) return <p className="classification-error">{listError}</p>;
    
    return (
      <>
        {/* Lista de Arquivos */}
        {files.length === 0 ? (
          <p className="empty-files-text">Nenhum arquivo anexado a este documento.</p>
        ) : (
          <ul className="attached-files-list">
            {files.map(file => (
              <li key={file.attached_file_id} className="attached-file-item">
                <div className="file-info">
                  <span className="file-title">{file.title}</span>
                  <span className="file-date">
                    Anexado em: {new Date(file.attached_at).toLocaleDateString()} às {new Date(file.attached_at).toLocaleTimeString()}
                  </span>
                </div>
                <div className="file-actions">
                  {/* Botão Download */}
                  <button 
                    className="file-action-btn" 
                    title="Baixar"
                    onClick={() => handleDownload(file.file, file.title)}
                  >
                    <DownloadIcon />
                  </button>
                  
                  {/* --- NOVO BOTÃO: Excluir --- */}
                  <button 
                    className="file-action-btn delete-btn" 
                    title="Remover Anexo"
                    onClick={() => handleDetach(file.attached_file_id)}
                    disabled={deletingFileId === file.attached_file_id}
                  >
                    {deletingFileId === file.attached_file_id ? (
                      <span style={{fontSize: '0.8rem'}}>...</span>
                    ) : (
                      <TrashIcon />
                    )}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Seção de Upload (Sem mudanças) */}
        <div className="upload-section">
          {!isUploadFormOpen ? (
            <button 
              className="toggle-upload-btn" 
              onClick={() => setIsUploadFormOpen(true)}
            >
              + Anexar Novo Arquivo
            </button>
          ) : (
            <form className="upload-form" onSubmit={handleUpload}>
              <h4>Novo Anexo</h4>
              
              {uploadError && <p className="classification-error" style={{fontSize: '0.9rem'}}>{uploadError}</p>}

              <div>
                <input 
                  type="text"
                  className="upload-input"
                  placeholder="Título do arquivo"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  required
                  disabled={isUploading}
                />
              </div>

              <div className="file-input-wrapper">
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  required
                  disabled={isUploading}
                />
                <p style={{fontSize: '0.8rem', color: '#888', marginTop: '4px'}}>
                  Máx: 50MB. Proibido: .exe, .bat, .sh, etc.
                </p>
              </div>

              <div className="upload-actions">
                <button 
                  type="button" 
                  className="cancel-upload-btn"
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
                  className="confirm-upload-btn"
                  disabled={isUploading || !selectedFile || !uploadTitle}
                >
                  {isUploading ? 'Enviando...' : 'Anexar'}
                </button>
              </div>
            </form>
          )}
        </div>
      </>
    );
  };

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>&times;</button>
        <h2>Arquivos Anexados</h2>
        {renderContent()}
      </div>
    </div>,
    document.body
  );
}