import React, { useState, useRef, type DragEvent } from 'react';
import { createPortal } from 'react-dom';
import type { CreateVideoNodePayload } from '../components/node/VideoNode'; // Verifique o caminho
import toast from 'react-hot-toast';

interface VideoUploadModalProps {
  onClose: () => void;
  onSubmit: (payload: CreateVideoNodePayload) => void;
}

export default function VideoUploadModal({ onClose, onSubmit }: VideoUploadModalProps) {
  const [uploadType, setUploadType] = useState<'file' | 'url'>('file');
  const [isDragging, setIsDragging] = useState(false);
  
  // Para o upload de URL
  const [url, setUrl] = useState('');
  
  // Ref para o input de arquivo (que fica escondido)
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Lógica para o Dropzone (Arrastar e Soltar) ---

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  // --- Lógica para o Clique (Abrir seletor de arquivo) ---
  
  const handleDropzoneClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  // --- Processamento (Arquivo ou URL) ---

  const processFile = (file: File) => {
    // Validação simples de tipo
    if (!file.type.startsWith('video/')) {
      toast.error('Por favor, selecione um arquivo de vídeo.');
      return;
    }
    
    // Para vídeos locais, criamos uma URL temporária
    const videoUrl = URL.createObjectURL(file);
    onSubmit({
      sourceType: 'generic',
      src: videoUrl,
    });
  };

  const handleUrlSubmit = () => {
    if (!url) {
      toast.error('Por favor, insira uma URL.');
      return;
    }

    // Tenta extrair o ID do YouTube
    const videoIDRegex = /(?:\?v=|\/embed\/|\.be\/)([^& \/\?]+)/;
    const match = url.match(videoIDRegex);

    if (match && match[1]) {
      // É YouTube
      onSubmit({ sourceType: 'youtube', src: match[1] });
    } else {
      // Trata como URL genérica (pode não funcionar para todos os vídeos)
      onSubmit({ sourceType: 'generic', src: url });
    }
  };


  return createPortal(
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close-btn" onClick={onClose}>&times;</button>
        
        <h2>Adicionar Vídeo</h2>

        {uploadType === 'file' ? (
          <>
            <div 
              className={`drop-zone ${isDragging ? 'dragging' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleDropzoneClick}
            >
              <p>Arraste o arquivo de vídeo aqui ou clique para fazer o upload.</p>
              
              <a href="#" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setUploadType('url'); }}>
                Fazer upload por URL
              </a>
            </div>
            
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept="video/*"
              onChange={handleFileSelected}
            />
          </>
        ) : (
          <div className="url-upload-container">
            <input
              type="text"
              className="url-input"
              placeholder="Cole a URL do YouTube ou do vídeo aqui..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <button className="url-submit-btn" onClick={handleUrlSubmit}>
              Enviar URL
            </button>
            <a href="#" onClick={(e) => { e.preventDefault(); setUploadType('file'); }}>
              Voltar para o upload de arquivo
            </a>
          </div>
        )}
        
      </div>
    </div>,
    document.body
  );
}