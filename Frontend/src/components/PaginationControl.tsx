import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationControlProps {
  currentPage: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

const PaginationControl: React.FC<PaginationControlProps> = ({
  currentPage,
  totalCount,
  pageSize,
  onPageChange
}) => {
  const totalPages = Math.ceil(totalCount / pageSize);

  // Se tiver apenas 1 página ou menos, não mostra nada
  if (totalPages <= 1) {
    return null;
  }

  // Lógica para gerar os números das páginas (com '...' se for muito grande)
  const generatePageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisibleButtons = 5; // Quantos botões numéricos mostrar no máximo

    if (totalPages <= maxVisibleButtons + 2) {
      // Se forem poucas páginas, mostra todas: [1, 2, 3, 4, 5]
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Se forem muitas páginas, usamos lógica de '...'
      
      // Sempre mostra a primeira página
      pages.push(1);

      // Se a página atual estiver longe do início, põe '...'
      if (currentPage > 3) {
        pages.push('...');
      }

      // Mostra vizinhos da página atual
      // Ex: se current é 10, mostra 9, 10, 11
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Se a página atual estiver longe do fim, põe '...'
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      // Sempre mostra a última página
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = generatePageNumbers();

  return (
    <div className="d-flex justify-content-center align-items-center mt-4 gap-2">
      
      {/* Botão Anterior */}
      <button
        className="btn btn-light border shadow-sm p-2"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        title="Página Anterior"
      >
        <ChevronLeft size={20} />
      </button>

      {/* Números das Páginas */}
      <div className="d-flex gap-1">
        {pageNumbers.map((page, index) => {
          if (page === '...') {
            return (
              <span key={`dots-${index}`} className="px-2 d-flex align-items-end text-muted">
                ...
              </span>
            );
          }

          const pageNum = page as number;
          const isActive = pageNum === currentPage;

          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`btn btn-sm fw-bold ${
                isActive 
                  ? 'btn-primary-custom text-white' // Sua cor primária personalizada
                  : 'btn-light text-secondary border'
              }`}
              style={{ 
                width: '35px', 
                height: '35px', 
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {pageNum}
            </button>
          );
        })}
      </div>

      {/* Botão Próximo */}
      <button
        className="btn btn-light border shadow-sm p-2"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        title="Próxima Página"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

export default PaginationControl;