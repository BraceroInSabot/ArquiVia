import React from 'react';
import { UserSearch, Filter, FunnelX } from 'lucide-react';
import { STATUS_OPTIONS, PRIVACITY_OPTIONS } from '../types/classification';
// 1. Importe a interface de filtros
import type { DocumentFilters } from '../services/core-api';

interface DocumentFilterSearchProps {
  // 2. Recebe os filtros atuais do pai
  currentFilters: DocumentFilters; 
  // 3. Recebe a função para notificar o pai sobre mudanças
  onAdvancedChange: (filters: Partial<DocumentFilters>) => void;
  // 4. Recebe a função para disparar a busca
  onApply: () => void;
}

const DocumentFilterSearch: React.FC<DocumentFilterSearchProps> = ({
  currentFilters,
  onAdvancedChange,
  onApply
}) => {

  // 5. O handleChange agora é genérico e chama a prop
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    onAdvancedChange({ [e.target.name]: e.target.value });
  };

  const handleClearFilters = () => {
    // 6. Reseta o estado no PAI
    onAdvancedChange({
      reviewer: '',
      isReviewed: '',
      statusId: '',
      privacityId: '',
      categories: ''
    });
  };

  return (
    <div className="p-3">
      {/* 1ª Linha */}
      <div className="row g-3">
        <div className="col-md-4">
          <label htmlFor="filter-reviewed" className="form-label fw-semibold text-secondary small">
            Está Revisado?
          </label>
          <select 
            id="filter-reviewed" 
            name="isReviewed" // 7. 'name' deve bater com a interface
            className="form-select"
            value={currentFilters.isReviewed || ''}
            onChange={handleChange}
          >
            <option value="">Todos</option>
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
            name="statusId"
            className="form-select"
            value={currentFilters.statusId || ''}
            onChange={handleChange}
          >
            <option value="">Todos os Status</option>
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
            name="privacityId"
            className="form-select"
            value={currentFilters.privacityId || ''}
            onChange={handleChange}
          >
            <option value="">Público e Privado</option>
            {PRIVACITY_OPTIONS.map(opt => (
              <option key={opt.id} value={opt.id}>{opt.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 2ª Linha */}
      <div className="row g-3 mt-3">
        <div className="col-md-6">
          <label htmlFor="filter-reviewer" className="form-label fw-semibold text-secondary small">
            Revisado Por:
          </label>
          <div className="input-group">
            <span className="input-group-text bg-light border-end-0 text-muted">
              <UserSearch size={18} />
            </span>
            <input 
              type="text" 
              name="reviewer"
              className="form-control border-start-0 ps-0" 
              placeholder="Digite o nome do revisor..."
              value={currentFilters.reviewer || ''}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="col-md-6">
          <label htmlFor="filter-categories" className="form-label fw-semibold text-secondary small">
            Categorias (separar por ;)
          </label>
          <input 
            type="text"
            id="filter-categories"
            name="categories"
            className="form-control"
            value={currentFilters.categories || ''}
            onChange={handleChange}
            placeholder="Ex: contrato 2024; financeiro"
          />
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
        <button
          type="button" 
          className="btn btn-light d-flex align-items-center gap-2"
          onClick={handleClearFilters}
        >
          <FunnelX size={16}/>
          Limpar Filtros
        </button>
        <button 
          type="button" 
          className="btn btn-primary-custom d-flex align-items-center gap-2"
          onClick={onApply} // 8. Chama a prop 'onApply'
        >
          <Filter size={16} />
          Aplicar Filtros
        </button>
      </div>

    </div>
  );
};

export default DocumentFilterSearch;