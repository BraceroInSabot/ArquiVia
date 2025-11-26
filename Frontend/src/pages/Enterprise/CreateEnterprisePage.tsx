import CreateEnterpriseForm from "../../components/form/CreateEnterpriseForm"; // Certifique-se do caminho

const CreateEnterprisePage = () => {
  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-8 font-sans text-neutral">
      <div className="max-w-4xl mx-auto">

        {/* Card Centralizado */}
        <div className="card bg-base-100 shadow-xl border border-base-300">
          <div className="card-body">
              <CreateEnterpriseForm />
          </div>
        </div>

      </div>
    </div>
  );
}

export default CreateEnterprisePage;