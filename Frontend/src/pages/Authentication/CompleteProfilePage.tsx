import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, User, Loader2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { useAuth } from '../../contexts/AuthContext';
import userService from '../../services/User/api';

const CompleteProfilePage = () => {
  const { user, logout } = useAuth(); // Precisamos do refreshUser para atualizar o contexto após salvar
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preenche os dados iniciais assim que o usuário (que acabou de logar) for carregado
  useEffect(() => {
    if (user?.data) {
      setName('');
      setUsername('');
    }
  }, [user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.data.user_id) {
        toast.error("Erro de identificação do usuário.");
        return;
    }

    setIsSaving(true);
    const toastId = toast.loading("Salvando perfil...");

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('username', username);
      
      if (selectedFile) {
        formData.append('image', selectedFile);
      }

      // Chama a API
      await userService.completeProfileGoogle(user.data.user_id, formData);
      
      toast.success("Perfil completado com sucesso! Entre novamente para atualizar as informações da sua conta.", { id: toastId });
      
      logout();
    } catch (error: any) {
      const errorMsg = error.response?.data.data?.non_field_errors?.[0] || "Erro ao salvar perfil. Tente outro nome de usuário.";
      setError(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4 font-sans">
      <div className="card w-full max-w-md bg-base-100 shadow-xl animate-fade-in-up">
        <div className="card-body">
            
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-secondary">Complete seu Perfil</h2>
                <p className="text-gray-500 text-sm">Defina como você será visto no ArquiVia</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                
                {/* Upload de Avatar */}
                <div className="flex flex-col items-center">
                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <div className="w-28 h-28 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden bg-base-200 flex items-center justify-center">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <User size={48} className="text-base-300" />
                            )}
                        </div>
                        
                        {/* Overlay de Edição */}
                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="text-white" size={24} />
                        </div>
                    </div>
                    <span className="text-xs text-gray-400 mt-2">Toque para alterar a foto</span>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleImageChange} 
                        className="hidden" 
                        accept="image/*"
                    />
                </div>

                {/* Campos de Texto */}
                <div className="form-control w-full">
                    <label className="label">
                        <span className="label-text font-semibold">Nome Completo</span>
                    </label>
                    <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: João Silva" 
                        className="input input-bordered w-full focus:input-primary" 
                        required
                    />
                </div>

                <div className="form-control w-full">
                    <label className="label">
                        <span className="label-text font-semibold">Nome de Usuário (@)</span>
                    </label>
                    <input 
                        type="text" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Ex: joaosilva" 
                        className="input input-bordered w-full focus:input-primary" 
                        required
                    />
                    <label className="label">
                        <span className="label-text-alt text-gray-400">Usado para login e menções. <strong>Atenção:</strong> Atributo não alteravel depois de escolhido e confirmado.</span>
                    </label>
                </div>
                
                {error && (
                    <div className="alert alert-error shadow-lg">
                        <div className="flex items-center gap-2">
                            <span className="text-sm">{error}</span>
                        </div>
                    </div>
                )}


                {/* Botão de Ação */}
                <button 
                    type="submit" 
                    className="btn btn-primary w-full mt-4 gap-2"
                    disabled={isSaving}
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="animate-spin" size={20} /> Salvando...
                        </>
                    ) : (
                        <>
                            <CheckCircle2 size={20} /> Concluir Cadastro
                        </>
                    )}
                </button>

            </form>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfilePage;