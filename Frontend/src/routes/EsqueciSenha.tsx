import { useEffect, useState } from "react";
import { esqueci_senha } from "../api/apiHandler";
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
import { X } from "lucide-react";
import "../assets/css/login.css";

export function EsqueciSenha() {
  const [emailUsuario, setEmailUsuario] = useState("");
  const [emailGestor, setEmailGestor] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Esqueci minha senha - AnnotaPS";
  }, []);

  const handleEsqueciSenha = async () => {
    if (!emailUsuario || !emailGestor) {
      setErrorMessage("Preencha ambos os e-mails para continuar.");
      return;
    }

    try {
      const response = await esqueci_senha({ emailUsuario, emailGestor });
      
      console.log(response)
      if (response[0] === true) {
        setSuccessMessage("Solicitação enviada com sucesso! Verifique seu e-mail e acesse o site indicado para alterar a sua senha de usuário.");
        setErrorMessage(null);
      } else {
        setErrorMessage("" + response[1]);
        setSuccessMessage(null);
      }
    } catch (error: unknown | undefined) {
      setErrorMessage("Erro inesperado. Tente novamente mais tarde.\n" + error);
    }
  };

  return (
    <section className="bg-background justify-center items-center">
      {errorMessage && (
          <Alert className="fixed !flex top-4 left-1/2 transform -translate-x-1/2 w-1/2 bg-red-100 border-l-4 border-red-500 text-red-700">
          <div className="w-full">
            <div>
              <span className="inline-block text-lg font-semibold">Erro</span>
              <button
                onClick={() => setErrorMessage(null)}
                className="float-right text-red-700 hover:text-red-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-2">
              <AlertDescription className="text-sm">{errorMessage}</AlertDescription>
            </div>
          </div>
        </Alert>
        )}
        {successMessage && (
          <Alert className="fixed !flex top-4 left-1/2 transform -translate-x-1/2 w-1/2 bg-green-200 border-l-4 border-green-900 text-green-500">
          <div className="w-full">
            <div>
              <span className="inline-block text-lg font-semibold">Sucesso!</span>
              <button
                onClick={() => setSuccessMessage(null)}
                className="float-right text-green-500 hover:text-green-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-2">
              <AlertDescription className="text-sm">{successMessage}</AlertDescription>
            </div>
          </div>
        </Alert>
        )}

      <div className="flex h-screen items-center justify-center">
        <Card className="w-[340px] border-1 !border-[#8E44AD]">
          <CardHeader>
            <CardTitle className="text-center text-lg font-semibold">
              Esqueci minha senha
            </CardTitle>
            <CardDescription className="text-center text-sm">
              Preencha os campos abaixo para solicitar a redefinição.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emailUsuario">Seu e-mail</Label>
              <Input
                id="emailUsuario"
                type="email"
                placeholder="joao.silva@inovafarma.com.br"
                className="border-1 !border-[#8E44AD]"
                onChange={(e) => setEmailUsuario(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emailGestor">E-mail do seu gestor</Label>
              <Input
                id="emailGestor"
                type="email"
                placeholder="maria.gestora@inovafarma.com.br"
                className="border-1 !border-[#8E44AD]"
                onChange={(e) => setEmailGestor(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button
              variant="ghost"
              className="w-full !rounded-sm !border !border-[#8E44AD] px-6 py-2"
              onClick={handleEsqueciSenha}
            >
              Solicitar Redefinição
            </Button>
            <span className="text-center text-xm text-gray-500">
              <a href="/login" className="text-white !no-underline">Entrar</a>
            </span>
          </CardFooter>
        </Card>
      </div>
    </section>
  );
}

export default EsqueciSenha;
