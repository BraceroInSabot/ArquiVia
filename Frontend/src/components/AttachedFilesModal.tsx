import React, { useState, useEffect, useRef, type ChangeEvent } from 'react';
import { createPortal } from 'react-dom';
import documentService from '../services/Document/api';
import type { AttachedFile } from '../services/core-api';
import '../assets/css/ClassificationModal.css'; 
import '../assets/css/AttachedFilesModal.css'; 

const FORBIDDEN_EXTENSIONS = [
  '.exe', '.bat', '.sh', '.cmd', '.msi', '.jar', '.ps1', '.cgi'
];

const MAX_FILE_SIZE_MB = 50;

const DownloadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
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

  // --- Handlers de Download ---
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

  // --- Validação e Seleção de Arquivo ---
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError(null);

    if (!file) {
      setSelectedFile(null);
      return;
    }

    // 1. Validação de Tamanho
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > MAX_FILE_SIZE_MB) {
      setUploadError(`O arquivo excede o limite de ${MAX_FILE_SIZE_MB}MB.`);
      e.target.value = ''; // Limpa o input
      setSelectedFile(null);
      return;
    }

    // 2. Validação de Extensão Nociva
    const fileName = file.name.toLowerCase();
    const hasForbiddenExtension = FORBIDDEN_EXTENSIONS.some(ext => fileName.endsWith(ext));
    
    if (hasForbiddenExtension) {
      setUploadError("Este tipo de arquivo (executável/script) não é permitido por segurança.");
      e.target.value = '';
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    // Sugere um título baseado no nome do arquivo se o campo estiver vazio
    if (!uploadTitle) {
      setUploadTitle(file.name);
    }
  };

  // --- Envio do Upload ---
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !uploadTitle) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      // Cria o FormData
      const formData = new FormData();
      formData.append('title', uploadTitle);
      formData.append('file', selectedFile);

      await documentService.attachFile(documentId, formData);

      // Sucesso: Limpa form e recarrega lista
      setUploadTitle('');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setIsUploadFormOpen(false); // Fecha o form
      fetchFiles(); // Recarrega a lista

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
                    {new Date(file.attached_at).toLocaleDateString()} às {new Date(file.attached_at).toLocaleTimeString()}
                  </span>
                </div>
                <div className="file-actions">
                  <button 
                    className="file-action-btn" 
                    title="Baixar"
                    onClick={() => handleDownload(file.file, file.title)}
                  >
                    <DownloadIcon />
                  </button>
                  {/* Futuro botão de excluir aqui */}
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Seção de Upload */}
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