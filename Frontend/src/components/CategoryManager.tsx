import React from 'react';
import type { Category } from '../services/core-api';
import '../assets/css/ClassificationModal.css'; // Reutiliza o CSS do modal

interface CategoryManagerProps {
  categories: Category[];
  // Futuramente: onAddCategory: (categoryId: number) => void;
  // Futuramente: onRemoveCategory: (categoryId: number) => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ categories }) => {
  return (
    <div className="category-manager">
      <h5 className="section-title">Categorias</h5>
      
      {categories.length === 0 ? (
        <p className="category-empty-text">Este documento não possui categorias.</p>
      ) : (
        <div className="category-pill-container">
          {categories.map(category => (
            <span key={category.category_id} className="category-pill">
              {category.category}
              {/* Para implementar a remoção, precisaremos de:
                1. Uma API de "Remover Categoria" (ex: DELETE /.../categorias/remover/)
                2. Passar a função 'onRemoveCategory' como prop.
                
                <button 
                  className="remove-pill-btn" 
                  onClick={() => onRemoveCategory(category.category_id)}
                >
                  &times;
                </button> 
              */}
            </span>
          ))}
        </div>
      )}

      {/* Para implementar a adição, precisaremos de:
        1. Uma API para listar *todas* as categorias disponíveis na empresa.
        2. Renderizar um <select> ou um campo de busca aqui.
        3. Chamar a API 'linkCategoriesToDocument' que você já me passou.
      */}
      <div className="category-add-footer">
        {/* <select disabled> <option>Carregando categorias...</option> </select> */}
        {/* <button className="add-category-btn">Adicionar</button> */}
      </div>
    </div>
  );
};

export default CategoryManager;