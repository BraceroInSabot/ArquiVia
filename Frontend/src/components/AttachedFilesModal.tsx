import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import documentService from '../services/Document/api';
import type { AttachedFile } from '../services/core-api';
import '../assets/css/ClassificationModal.css'; 
import '../assets/css/AttachedFilesModal.css'; 

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
  const [files, setFiles] = useState<AttachedFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFiles = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await documentService.listAttachedFiles(documentId);
        setFiles(response.data.data || []);
      } catch (err: any) {
        console.error("Erro ao buscar anexos:", err);
        setError("Falha ao carregar arquivos anexados.");
      } finally {
        setIsLoading(false);
      }
    };

    if (documentId) {
      fetchFiles();
    }
  }, [documentId]);

  const handleDownload = (fileUrl: string, fileName: string) => {
    // Cria um link temporário para forçar o download em nova aba
    const link = document.createElement('a');
    link.href = fileUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderContent = () => {
    if (isLoading) return <p>Carregando arquivos...</p>;
    if (error) return <p className="classification-error">{error}</p>;
    
    if (files.length === 0) {
      return <p className="empty-files-text">Nenhum arquivo anexado a este documento.</p>;
    }

    return (
      <ul className="attached-files-list">
        {files.map(file => (
          <li key={file.attached_file_id} className="attached-file-item">
            <div className="file-info">
              <span className="file-title">{file.title}</span>
              <span className="file-date">
                Anexado em: {new Date(file.attached_at).toLocaleDateString()}
              </span>
            </div>
            <div className="file-actions">
              <button 
                className="file-action-btn" 
                title="Baixar/Visualizar"
                onClick={() => handleDownload(file.file, file.title)}
              >
                <DownloadIcon />
              </button>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>&times;</button>
        <h2>Arquivos Anexados</h2>
        {renderContent()}
        
        {/* Futuro botão de upload ficará aqui */}
      </div>
    </div>,
    document.body
  );
}