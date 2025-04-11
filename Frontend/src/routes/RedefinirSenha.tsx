import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { validar_token } from "../api/apiHandler";
import { verificarsenha } from "../tsx/verificacoes";
import {
  handlePasswordChange,
  verificarConfirmacaoSenha,
} from "../tsx/refinicao_senha";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";
import { X, EyeOff, Eye } from "lucide-react";

import "../assets/css/redefinicao_senha.css";

function RedefinirSenha() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [cPassword, setCPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(true);
  const [validatePassword, setValidatePassword] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [showAlert, setShowAlert] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showCPassword, setShowCPassword] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      const isValidToken = await validar_token(String(token));
      if (isValidToken) {
        setIsValid(true);
      } else {
        setMessage("Token inválido ou expirado.");
        setIsValid(false);
      }
    };

    if (token) validateToken();
  }, [token]);

  useEffect(() => {
    const result = verificarConfirmacaoSenha(password, cPassword);
    setConfirmPassword(result);
  }, [password, cPassword]);

  const handlePasswordValidation = (password: string) => {
    const errors = verificarsenha(password);
    setValidatePassword(errors);
  };

  return (
    <section className="bg-background justify-center items-center">
      {message && (
        <Alert
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 w-1/2 z-50 ${
            isValid
              ? "bg-green-200 border-l-4 border-green-900 text-green-700"
              : "bg-red-100 border-l-4 border-red-500 text-red-700"
          }`}
        >
          <div className="w-full">
            <div>
              <span className="inline-block text-lg font-semibold">
                {isValid ? "Sucesso" : "Erro"}
              </span>
              <button
                onClick={() => setShowAlert(false)}
                className={`float-right ${
                  isValid ? "text-green-700" : "text-red-700"
                } hover:text-opacity-70`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {showAlert && (
              <div className="mt-2">
                <AlertDescription className="text-sm">{message}</AlertDescription>
              </div>
            )}
          </div>
        </Alert>
      )}

      <div className="flex h-screen items-center justify-center">
        <Card className="w-[340px] border-1 !border-[#8E44AD]">
          <CardHeader>
            <CardTitle className="text-center text-lg font-semibold">
              Redefinir Senha
            </CardTitle>
            <CardDescription className="text-center text-sm">
              Digite e confirme sua nova senha.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Nova Senha */}
            <div className="space-y-2">
              <Label htmlFor="password">Nova Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="border-1 !border-[#8E44AD] pr-10"
                  placeholder="Digite sua nova senha"
                  onChange={(e) => {
                    const newPassword = e.target.value;
                    setPassword(newPassword);
                    handlePasswordValidation(newPassword);
                  }}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {validatePassword.length > 0 && (
                <ul className="text-sm text-red-600 mt-1 list-disc pl-4">
                  {validatePassword.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              )}
            </div>

            {/* Confirmar Senha */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showCPassword ? "text" : "password"}
                  className={`border-1 ${
                    confirmPassword
                      ? "!border-[#8E44AD]"
                      : "!border-red-500 bg-red-50"
                  } pr-10`}
                  placeholder="Confirme sua senha"
                  onChange={(e) => setCPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowCPassword(!showCPassword)}
                >
                  {showCPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {!confirmPassword && (
                <p className="text-sm text-red-600">As senhas não coincidem.</p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="ghost"
              className="w-full !rounded-sm !border !border-[#8E44AD] px-6 py-2"
              onClick={() =>
                handlePasswordChange(
                  isValid,
                  token,
                  password,
                  setMessage,
                  navigate
                )
              }
              disabled={!isValid || validatePassword.length > 0 || !confirmPassword}
            >
              Alterar Senha
            </Button>
          </CardFooter>
        </Card>
      </div>
    </section>
  );
}

export default RedefinirSenha;
