import React, { useEffect, useState } from 'react';
import { X, Calendar, CreditCard, User, Phone, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/core-api'; // Ajuste para seu serviço base
import paymentService from '../../services/Payment/api'; // Ajuste para seu serviço de pagamento
import type { PlanType } from '../../types/plans';

interface CheckoutModalProps {
  plan: PlanType;
  billingCycle: 'monthly' | 'yearly';
  isOpen: boolean;
  onClose: () => void;
}

interface UserPrivateData {
  cpf_cnpj: string;
  phone_mobile: string;
}

const PaymentCheckoutModal: React.FC<CheckoutModalProps> = ({ plan, billingCycle, isOpen, onClose }) => {
  const [step, setStep] = useState<'loading' | 'confirm' | 'processing'>('loading');
  const [formData, setFormData] = useState({
    cpf_cnpj: '',
    phone_mobile: '',
    payment_day: '5' // Dia padrão
  });
  const [originalData, setOriginalData] = useState<UserPrivateData | null>(null);

  // Calcula preço final
  const finalPrice = billingCycle === 'yearly' ? Number(plan.price) * 0.8 : Number(plan.price);

  useEffect(() => {
    if (isOpen) {
      fetchUserData();
    }
  }, [isOpen]);

  const fetchUserData = async () => {
    setStep('loading');
    try {
      const response = await api.get('usuario/informacoes-privadas/');
      const data = response.data; // Ajuste conforme payload real { cpf_cnpj: '...', phone_mobile: '...' }
      
      setFormData(prev => ({
        ...prev,
        cpf_cnpj: data.data.cpf_cnpj || '',
        phone_mobile: data.data.phone_mobile || ''
      }));
      setOriginalData(data);
      setStep('confirm');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao carregar seus dados.');
      setStep('confirm'); // Deixa prosseguir mesmo se falhar load, para preencher manual
    }
  };

  // --- Máscaras ---
  const handleCpfCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 14) value = value.slice(0, 14);

    if (value.length <= 11) {
      // CPF: 000.000.000-00
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
      // CNPJ: 00.000.000/0000-00
      value = value.replace(/^(\d{2})(\d)/, '$1.$2');
      value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
      value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
      value = value.replace(/(\d{4})(\d)/, '$1-$2');
    }
    setFormData(prev => ({ ...prev, cpf_cnpj: value }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    
    // (00) 00000-0000
    value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
    value = value.replace(/(\d)(\d{4})$/, '$1-$2');
    
    setFormData(prev => ({ ...prev, phone_mobile: value }));
  };

  // --- Envio ---
  const handleConfirm = async () => {
    // Validação básica
    const cleanCpfCnpj = formData.cpf_cnpj.replace(/\D/g, '');
    const cleanPhone = formData.phone_mobile.replace(/\D/g, '');

    if (cleanCpfCnpj.length !== 11 && cleanCpfCnpj.length !== 14) {
      toast.error('CPF ou CNPJ inválido.');
      return;
    }
    if (cleanPhone.length < 10) {
      toast.error('Telefone inválido.');
      return;
    }

    setStep('processing');

    try {
      // 1. Se dados mudaram ou não existiam, atualiza info privada
      const hasChanged = 
        cleanCpfCnpj !== originalData?.cpf_cnpj?.replace(/\D/g, '') || 
        cleanPhone !== originalData?.phone_mobile?.replace(/\D/g, '');

      if (hasChanged || !originalData) {
        await api.patch('usuario/informacoes-privadas/', {
            cpf_cnpj: cleanCpfCnpj,
            phone_mobile: cleanPhone
        });
      }

      // 2. Cria Checkout/Assinatura
      // Envia cycle e payment_day
      const response = await paymentService.createSubscription(plan.plan_type_id, {
        preferable_payment_day: parseInt(formData.payment_day),
        billing_cycle: billingCycle
      });

      // 3. Redireciona para URL de pagamento (se houver) ou sucesso
      if (response.data.payment_url) {
        window.location.href = response.data.payment_url;
      } else {
        toast.success('Assinatura criada! Verifique seu email.');
        onClose();
      }

    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || 'Erro ao processar assinatura.';
      toast.error(msg);
      setStep('confirm');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open z-50">
      <div className="modal-box max-w-lg p-0 bg-white rounded-2xl overflow-hidden shadow-2xl">
        
        {/* Header Visual */}
        <div className="bg-slate-900 p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
            <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 text-white/70 hover:text-white">
                <X size={20} />
            </button>
            <h3 className="text-xl font-bold flex items-center gap-2 relative z-10">
                <CreditCard className="text-primary" /> Confirmar Assinatura
            </h3>
            <p className="text-slate-400 text-sm mt-1 relative z-10">
                Você está a um passo de desbloquear o plano <span className="text-white font-bold">{plan.plan_type}</span>.
            </p>
        </div>

        {step === 'loading' ? (
           <div className="p-12 flex flex-col items-center justify-center gap-4 text-gray-500">
              <Loader2 className="animate-spin text-primary" size={40} />
              <p>Carregando seus dados...</p>
           </div>
        ) : (
           <div className="p-6 space-y-6">
              
              {/* Resumo do Plano */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between items-center">
                 <div>
                    <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Plano Selecionado</div>
                    <div className="font-bold text-slate-800 text-lg">{plan.plan_type} <span className="text-sm font-normal text-slate-500">({billingCycle === 'monthly' ? 'Mensal' : 'Anual'})</span></div>
                 </div>
                 <div className="text-right">
                    <div className="text-2xl font-black text-primary">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(finalPrice)}
                    </div>
                    <div className="text-xs text-slate-400">/mês</div>
                 </div>
              </div>

              {/* Formulário */}
              <div className="space-y-4">
                  
                  {/* CPF / CNPJ */}
                  <div className="form-control">
                      <label className="label pb-1">
                          <span className="label-text font-semibold flex items-center gap-1.5"><User size={14}/> CPF ou CNPJ</span>
                      </label>
                      <input 
                        type="text" 
                        className="input input-bordered w-full focus:border-primary focus:ring-1 focus:ring-primary"
                        placeholder="000.000.000-00 ou 00.000.000/0000-00"
                        value={formData.cpf_cnpj}
                        required={true}
                        onChange={handleCpfCnpjChange}
                      />
                  </div>

                  {/* Telefone */}
                  <div className="form-control">
                      <label className="label pb-1">
                          <span className="label-text font-semibold flex items-center gap-1.5"><Phone size={14}/> Telefone</span>
                      </label>
                      <input 
                        type="text" 
                        className="input input-bordered w-full focus:border-primary focus:ring-1 focus:ring-primary"
                        placeholder="(00) 00000-0000"
                        value={formData.phone_mobile}
                        required={true}
                        onChange={handlePhoneChange}
                      />
                  </div>

                  {/* Dia de Pagamento */}
                  <div className="form-control">
                      <label className="label pb-1">
                          <span className="label-text font-semibold flex items-center gap-1.5"><Calendar size={14}/> Melhor dia para vencimento</span>
                      </label>
                      <select 
                        className="select select-bordered w-full focus:border-primary"
                        value={formData.payment_day}
                        onChange={e => setFormData(prev => ({ ...prev, payment_day: e.target.value }))}
                      >
                          {[1, 5, 10, 15, 20, 25].map(day => (
                              <option key={day} value={day}>Dia {day}</option>
                          ))}
                      </select>
                  </div>
              </div>

              {/* Botão de Ação */}
              <button 
                className="btn btn-primary btn-block rounded-xl text-lg shadow-lg shadow-primary/20 h-14"
                onClick={handleConfirm}
                disabled={step === 'processing'}
              >
                 {step === 'processing' ? (
                    <><Loader2 className="animate-spin" /> Processando...</>
                 ) : (
                    <><CheckCircle2 /> Confirmar e Ir para Pagamento</>
                 )}
              </button>

              <div className="flex justify-center items-center gap-2 text-xs text-slate-400">
                  <ShieldCheck size={14} /> Seus dados estão seguros e criptografados.
              </div>

           </div>
        )}
      </div>
      <div className="modal-backdrop bg-black/60" onClick={onClose}></div>
    </div>
  );
};

export default PaymentCheckoutModal;