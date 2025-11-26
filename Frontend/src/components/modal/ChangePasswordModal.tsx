import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Lock, Key, Save, X, Loader2, AlertCircle } from 'lucide-react'; 
import toast from 'react-hot-toast';

import userService from '../../services/User/api';
import { type ChangePasswordPayload } from '../../services/core-api';

interface ChangePasswordModalProps {
  onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ onClose }) => {
  const [formData, setFormData] = useState<ChangePasswordPayload>({
    old_password: '',
    new_password: '',
    c_new_password: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // @ts-ignore
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.new_password !== formData.c_new_password) {
      setError("A nova senha e a confirmação não conferem.");
      return;
    }

    if (formData.new_password === formData.old_password) {
        setError("A nova senha deve ser diferente da atual.");
        return;
    }

    setIsLoading(true);

    try {
      await userService.changePassword(formData);
      toast.success("Senha alterada com sucesso!");
      
      setTimeout(() => {
        onClose();
      }, 1000);

    } catch (err: any) {
      console.error("Erro ao alterar senha:", err);
      let msg = "Falha ao alterar senha.";
      
      if (err.response?.data?.data) {
        const fieldErrors = err.response.data.data;
        const firstKey = Object.keys(fieldErrors)[0];
        if (firstKey && Array.isArray(fieldErrors[firstKey])) {
            msg = fieldErrors[firstKey][0];
        }
      } else if (err.response?.data?.message) {
        msg = err.response.data.message;
      }
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return createPortal(
    <div className="modal modal-open">
      <div className="modal-box max-w-md relative">
        <button 
            onClick={onClose} 
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        >
            <X size={20} />
        </button>

        <h3 className="font-bold text-lg flex items-center gap-2 mb-6 text-secondary">
            <div className="p-2 bg-warning/10 rounded-lg text-warning">
                <Lock size={20} />
            </div>
            Alterar Senha
        </h3>

        {error && (
            <div className="alert alert-error shadow-sm mb-4 py-2 text-sm">
                <AlertCircle size={18} />
                <span>{error}</span>
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Senha Atual */}
          <div className="form-control">
            <label className="label pt-0">
                <span className="label-text font-semibold">Senha Atual</span>
            </label>
            <label className="input input-bordered flex items-center gap-2 focus-within:input-primary">
                <Lock size={16} className="text-gray-400" />
                <input
                    type="password"
                    name="old_password"
                    className="grow"
                    value={formData.old_password}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                />
            </label>
          </div>

          <hr />

          {/* Nova Senha */}
          <div className="form-control">
            <label className="label pt-0">
                <span className="label-text font-semibold">Nova Senha</span>
            </label>
            <label className="input input-bordered flex items-center gap-2 focus-within:input-primary">
                <Key size={16} className="text-gray-400" />
                <input
                    type="password"
                    name="new_password"
                    className="grow"
                    value={formData.new_password}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                />
            </label>
          </div>

          {/* Confirmar */}
          <div className="form-control">
            <label className="label pt-0">
                <span className="label-text font-semibold">Confirmar Nova Senha</span>
            </label>
            <label className="input input-bordered flex items-center gap-2 focus-within:input-primary">
                <Key size={16} className="text-gray-400" />
                <input
                    type="password"
                    name="c_new_password"
                    className="grow"
                    value={formData.c_new_password}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                />
            </label>
          </div>

          <div className="modal-action mt-8">
            <button 
                type="button" 
                className="btn btn-ghost text-gray-500 hover:bg-gray-100" 
                onClick={onClose}
                disabled={isLoading}
            >
                Cancelar
            </button>
            <button 
                type="submit" 
                className="btn btn-success text-white px-8"
                disabled={isLoading || !formData.old_password || !formData.new_password}
            >
                {isLoading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                Alterar Senha
            </button>
          </div>
        </form>
      </div>
      
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </div>,
    document.body
  );
};

export default ChangePasswordModal;