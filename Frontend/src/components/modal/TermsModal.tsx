import React from 'react';
import { createPortal } from 'react-dom';
import { X, ScrollText } from 'lucide-react';

interface TermsModalProps {
  onClose: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ onClose }) => {
  return createPortal(
    <div className="modal modal-open" role="dialog">
      <div className="modal-box w-11/12 max-w-3xl">
        <button 
            onClick={onClose} 
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        >
            <X size={20} />
        </button>

        <h3 className="font-bold text-xl flex items-center gap-2 mb-4 text-secondary">
            <ScrollText className="text-primary" />
            Termos de Uso e Condições
        </h3>
        
        <div className="h-96 overflow-y-auto border rounded-lg p-4 bg-base-200 text-sm text-justify leading-relaxed">
            <h4 className="font-bold text-lg mb-2">1. Sobre o ArquiVia</h4>
            <p className="mb-4">
                O ArquiVia é um software desenvolvido para fins de demonstração, portfólio e acadêmicos. 
                Atualmente, encontra-se em fase <strong>BETA</strong>.
            </p>

            <h4 className="font-bold text-lg mb-2">2. Uso Não Comercial</h4>
            <p className="mb-4">
                Este serviço é disponibilizado gratuitamente para testes. <strong>Não recomenda-se o seu uso para armazenamento de dados críticos ou sensíveis de empresas reais</strong> neste momento. 
                O desenvolvedor não se responsabiliza por eventuais perdas de dados, interrupções de serviço ou falhas de segurança.
            </p>

            <h4 className="font-bold text-lg mb-2">3. Alterações no Serviço</h4>
            <p className="mb-4">
                Reserva-se o direito de:
                <ul className="list-disc pl-5 mt-1">
                    <li>Alterar, suspender ou descontinuar qualquer aspecto do serviço a qualquer momento.</li>
                    <li>Alterar a política de preços no futuro (caso o produto venha a ser comercializado).</li>
                    <li>Refazer o banco de dados durante atualizações de versão.</li>
                </ul>
            </p>

            <h4 className="font-bold text-lg mb-2">4. Isenção de Garantias</h4>
            <p className="mb-4">
                O software é fornecido "como está" ("as is"), sem garantias de qualquer tipo, expressas ou implícitas, incluindo, mas não se limitando a garantias de comercialização ou adequação a uma finalidade específica.
            </p>
        </div>

        <div className="modal-action">
            <button className="btn btn-primary text-white px-8" onClick={onClose}>
                Entendi e Concordo
            </button>
        </div>
      </div>
      
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </div>,
    document.body
  );
};

export default TermsModal;