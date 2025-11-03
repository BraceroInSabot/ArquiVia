import React from 'react';
import { useNavigate } from 'react-router-dom';

const fabStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: '2rem',
  right: '2rem',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '3%',
  fontSize: '20px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const CreateDocumentButton = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/documento/novo');
  };

  return (
    <button 
      style={fabStyle} 
      onClick={handleClick}
      title="Criar Novo Documento"
    >
      Criar Novo Documento
    </button>
  );
};

export default CreateDocumentButton;