import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react"; // Ícone de voltar
import CreateEnterpriseForm from "../components/form/CreateEnterpriseForm";
import '../assets/css/EnterprisePage.css'; // Reutiliza o CSS da listagem

const CreateEnterprisePage = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/empresas');
  };

  return (
    <div className="page-container">
      <div className="container py-5">
        
        {/* Cabeçalho com Botão Voltar */}
        <div className="d-flex align-items-center mb-4">
          <button 
            onClick={handleBack} 
            className="btn btn-light btn-sm me-3 text-secondary"
            title="Voltar para lista"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="h3 mb-1 fw-bold text-body-custom">Nova Empresa</h1>
            <p className="text-muted mb-0">Preencha os dados para cadastrar uma nova organização</p>
          </div>
        </div>

        {/* Conteúdo Centralizado */}
        <div className="row justify-content-center">
          <div className="col-12 col-lg-8 col-xl-6">
            <div className="custom-card p-4">
              <CreateEnterpriseForm />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default CreateEnterprisePage;