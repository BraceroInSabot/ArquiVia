import React from 'react';
import { useNavigate } from 'react-router-dom';
// 1. Importe os ícones necessários para o CTA
import { FileText, ChevronRight, RefreshCcw, Building } from 'lucide-react';
import type { RecentDocument } from '../../services/core-api';

interface CarouselProps {
  documents: RecentDocument[];
}

const RecentDocumentsCarousel: React.FC<CarouselProps> = ({ documents }) => {
  const navigate = useNavigate();

  const getStatusClass = (status: string) => {
    if (status.toLowerCase() === 'concluído') return 'text-success';
    if (status.toLowerCase() === 'revisão necessária') return 'text-warning';
    return 'text-primary'; // Em andamento
  };

  // --- 2. Bloco "Estado Vazio" (CTA) ---
  // Substitui o <h2>oi</h2>
  if (documents.length === 0) {
    return (
      <div 
        className="text-center p-4 p-md-5 rounded border bg-white shadow-sm custom-cta-card"
        style={{ borderStyle: 'dashed' }}
      >
        <div className="mb-3">
          <div 
            className="d-inline-flex bg-light p-3 rounded-circle border"
          >
            <Building size={40} className="text-primary-custom opacity-75" />
          </div>
        </div>
        
        <h3 className="fw-bold text-dark mb-2">Comece sua Organização</h3>
        <p className="text-muted mx-auto mb-4" style={{ maxWidth: '450px' }}>
          Para criar seu primeiro documento, você precisa configurar uma empresa e um setor.
        </p>
        
        <button 
            className="btn btn-primary-custom btn-lg d-inline-flex align-items-center gap-2"
            onClick={() => navigate('/empresas')} // Navega para a criação de empresa
        >
            Criar minha Empresa
            <ChevronRight size={20} />
        </button>
      </div>
    );
  }

  // --- 3. Bloco "Carrossel" (Quando houver documentos) ---
  return (
    <div id="recentDocsCarousel" className="carousel slide" data-bs-ride="carousel">
      
      {/* O Título agora só aparece se houver documentos */}
      <div className="d-flex mb-3 fw-bold text-dark align-items-center gap-2 fs-2">
        <RefreshCcw />
        Continue de onde parou
      </div>
      
      <div className="carousel-inner">
        {documents.map((doc, index) => (
          <div 
            key={doc.document_id} 
            className={`carousel-item ${index === 0 ? 'active' : ''}`}
          >
            <div 
              className="d-flex flex-column justify-content-center p-4 p-md-5 text-white rounded custom-card-dark cursor-pointer" 
              onClick={() => navigate(`/documento/editar/${doc.document_id}`)}
              style={{ minHeight: '200px' }}
            >
              <FileText size={40} className="mb-3 opacity-50" />
              <h3 className="fw-bold mb-1">{doc.title}</h3>
              <p className="mb-0">
                Criado em: {new Date(doc.created_at).toLocaleDateString()}
                <span className={`ms-3 fw-bold ${getStatusClass(doc.status_label)}`}>
                  ({doc.status_label})
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Controles (Removi o 'Prev' para simplificar, já que são só 3 itens) */}
      <button className="carousel-control-next" type="button" data-bs-target="#recentDocsCarousel" data-bs-slide="next">
        <ChevronRight size={32} />
        <span className="visually-hidden">Next</span>
      </button>
    </div>
  );
};

export default RecentDocumentsCarousel;