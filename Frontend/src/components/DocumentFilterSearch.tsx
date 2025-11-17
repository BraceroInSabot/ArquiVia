import React, { useState } from 'react';
import { UserSearch, Filter, FunnelX } from 'lucide-react';
// Importe as constantes que definimos
import { STATUS_OPTIONS, PRIVACITY_OPTIONS } from '../types/classification';

// Interface das props (os filtros atuais e o handler)
interface DocumentFilterSearchProps {
  // onApplyFilters: (advancedFilters: AdvancedFilterData) => void;
  // TODO: Implementar a passagem de estado para a página principal
}

const DocumentFilterSearch: React.FC<DocumentFilterSearchProps> = () => {
  const [reviewer, setReviewer] = useState<string>(''); 
  const [isReviewed, setIsReviewed] = useState<string>('');
  const [statusId, setStatusId] = useState<string>('');
  const [privacityId, setPrivacityId] = useState<string>('');
  const [categories, setCategories] = useState('');

  const handleApplyFilters = () => {
  };

  return (
    <div className="p-3">
      {/* 1ª Linha: Status e Privacidade */}
      <div className="row g-3">
        <div className="col-md-4">
          <label htmlFor="filter-reviewed" className="form-label fw-semibold text-secondary small">
            Está Revisado?
          </label>
          <select 
            id="filter-reviewed" 
            className="form-select"
            value={isReviewed}
            onChange={(e) => setIsReviewed(e.target.value)}
          >
            <option value="all">Todos</option>
            <option value="true">Sim, Revisados</option>
            <option value="false">Não, Pendentes</option>
          </select>
        </div>

        <div className="col-md-4">
          <label htmlFor="filter-status" className="form-label fw-semibold text-secondary small">
            Status da Classificação
          </label>
          <select 
            id="filter-status" 
            className="form-select"
            value={statusId}
            onChange={(e) => setStatusId(e.target.value)}
          >
            <option value="all">Todos os Status</option>
            {STATUS_OPTIONS.map(opt => (
              <option key={opt.id} value={opt.id}>{opt.name}</option>
            ))}
          </select>
        </div>

        <div className="col-md-4">
          <label htmlFor="filter-privacity" className="form-label fw-semibold text-secondary small">
            Privacidade
          </label>
          <select 
            id="filter-privacity" 
            className="form-select"
            value={privacityId}
            onChange={(e) => setPrivacityId(e.target.value)}
          >
            <option value="all">Público e Privado</option>
            {PRIVACITY_OPTIONS.map(opt => (
              <option key={opt.id} value={opt.id}>{opt.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 2ª Linha: Revisor e Categorias */}
      <div className="row g-3 mt-3">
        <div className="col-md-6">
          <label htmlFor="filter-reviewer" className="form-label fw-semibold text-secondary small">
            Revisado Por:
          </label>
          <div className="input-group">
            <span className="input-group-text bg-light border-end-0 text-muted">
              <UserSearch size={18} />
            </span>
            <input type="text" className='form-control border-start-0 ps-0' />
          </div>
        </div>

        <div className="col-md-6">
          <label htmlFor="filter-categories" className="form-label fw-semibold text-secondary small">
            Categorias (separar por ;)
          </label>
          <input 
            type="text"
            id="filter-categories"
            className="form-control"
            value={categories}
            onChange={(e) => setCategories(e.target.value)}
            placeholder="Ex: contrato 2024; financeiro"
          />
        </div>
      </div>

      <div className="d-flex justify-content-end mt-4 pt-3 border-top">
        <button
          type="button" 
          className="btn btn-secondary-custom d-flex align-items-center gap-2"
          onClick={handleApplyFilters}>
          <FunnelX size={16}/>
          Limpar Filtros
        </button>
        <button 
          type="button"
          className="btn btn-primary-custom d-flex align-items-center gap-2"
          onClick={handleApplyFilters}
        >
          <Filter size={16} />
          Aplicar Filtros
        </button>
      </div>

    </div>
  );
};

export default DocumentFilterSearch;