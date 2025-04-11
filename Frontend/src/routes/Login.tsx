import { Button } from "../components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip"
import { Alert, AlertDescription } from "../components/ui/alert"
import { X, Eye, EyeOff, MessageCircleQuestionIcon } from "lucide-react"

import { useState } from "react"
import "../assets/css/login.css"
import { login, registrar } from "../api/apiHandler"
import { useNavigate } from "react-router-dom"
import { verificarsenha, verificaremail, verificarusuario } from "../tsx/verificacoes"

export function Login() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [CChave, setCChave] = useState("")
  const [Cpassword, setCpassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null | [boolean, string] | false>("")
  const [successMessage, setSuccessMessage] = useState<string | null>("")
  const [confirmPassword, setConfirmPassword] = useState(true)
  const [confirmCPassword, setConfirmCPassword] = useState(true)
  const [isEmailValid, setIsEmailValid] = useState(true)
  const [isUsernameValid, setIsUsernameValid] = useState(true)
  const [isNameValid, setIsNameValid] = useState(true)
  const [isValid, setIsValid] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async () => {
    const response = await login({ username, password })

    if (response === true) {
      navigate("/")
    } else if (Array.isArray(response) && !response[0]) {
      setErrorMessage(response[1])
    } else {
      alert("Erro ao fazer login")
    }
  }

  const handleRegister = async () => {
    if (!verificarsenha(password)) {
      setErrorMessage("As senhas não coincidem.")
      return
    }

    const response = await registrar({
      usuario: username,
      nome: name,
      email,
      senha: password,
      cSenha: Cpassword,
      cChave: CChave,
    })

    if (response === true) {
      setErrorMessage(null)
      setSuccessMessage("Usuário registrado com sucesso!\n\nVocê já pode acessar o sistema, entre com a sua conta.")
      navigate("/login")
    } else {
      setSuccessMessage(null)
      setErrorMessage("Erro ao registrar. Verifique os dados e tente novamente.")
    }
  }

  const handlePasswordValidation = (password: string) => {
    const result = verificarsenha(password)
    if (result.length > 0) {
      setIsValid(false)
      setConfirmPassword(false)
    } else {
      setIsValid(true)
      setConfirmPassword(true)
    }
  }

  const handleEmailValidation = (email: string) => {
    if (verificaremail(email)) {
      setIsEmailValid(true);
    } else {
      setIsEmailValid(false);
    }
    return;
  }

  const handleUsernameValidation = (username: string) => {
    if (verificarusuario(username)) {
      setIsUsernameValid(true);
    } else {
      setIsUsernameValid(false);
    }
  }

  const handlePasswordConfirmValidation = (password: string, Cpassword: string) => {
    console.log(password, Cpassword)
    if (password !== Cpassword) {
      setConfirmCPassword(false)
    } else {
      setConfirmCPassword(true)
    }
  }

  const handleNameValidation = (name: string) => {
    if (verificarusuario(name)) {
      setIsNameValid(true);
    } else {
      setIsNameValid(false);
    }
  }

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
              <AlertDescription className="text-sm">
                {errorMessage?.detail || errorMessage}
              </AlertDescription>
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
      <div className="flex h-screen items-center justify-center mb-4">
        <Tabs defaultValue="account" className="w-[300px]">
          <TabsList className="grid w-full grid-cols-2 rounded-sm p-1 bg-background">
            <TabsTrigger
              value="account"
              className="border !border-transparent data-[state=active]:!border-[#902E9A] data-[state=active]:!border-[2px] data-[state=active]:!rounded-sm"
            >
              Entrar
            </TabsTrigger>
            <TabsTrigger
              value="password"
              className="border !border-transparent data-[state=active]:!border-[#902E9A] data-[state=active]:!border-[2px] data-[state=active]:!rounded-sm"
            >
              Registrar
            </TabsTrigger>
          </TabsList>

          {/* Entrar */}
          <TabsContent value="account">
            <Card className="border-1 !border-[#8E44AD]">
              <CardHeader>
                <CardTitle className="text-center text-lg font-semibold">Entrar</CardTitle>
                <CardDescription className="text-center text-sm">
                  Acesse o sistema com o seu usuário e senha.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="name">Usuário</Label>
                  <Input id="name" className="border-1 !border-[#8E44AD]" onChange={(e) => setUsername(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Senha</Label>
                  <Input id="username" type="password" className="border-1 !border-[#8E44AD]" onChange={(e) => setPassword(e.target.value)} />
                </div>
              </CardContent>
              <CardFooter>
                <div className="flex flex-col items-center justify-center gap-4 w-full">
                  <Button
                    variant="ghost"
                    className="w-full !rounded-sm !border !border-[#8E44AD] px-6 py-2"
                    onClick={handleLogin}
                  >
                    Acessar
                  </Button>
                  <span className="text-center text-xm text-gray-500">
                    <a href="/esqueci-minha-senha" className="text-white !no-underline">Esqueci minha senha</a>
                  </span>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Registrar */}
          <TabsContent value="password">
            <Card className="border-1 !border-[#8E44AD]">
              <CardHeader>
                <CardTitle className="text-center text-lg font-semibold">Registrar</CardTitle>
                <CardDescription className="text-center text-sm">
                  Crie sua conta para acessar o sistema.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username-register">Usuário</Label>
                    <Input 
                      id="username-register" 
                      className={`border-1 ${
                        isUsernameValid
                          ? "!border-[#8E44AD]"
                          : "!border-red-500 bg-red-50"
                      } pr-10`}
                      placeholder="joao.silva" 
                      onChange={(e) => {
                        const nUsername = e.target.value;
                        setUsername(nUsername);
                        handleUsernameValidation(nUsername);
                      }} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name-register">Nome</Label>
                    <Input 
                      id="name-register" 
                      className={`border-1 ${
                        isNameValid
                          ? "!border-[#8E44AD]"
                          : "!border-red-500 bg-red-50"
                      } pr-10`}
                      placeholder="João Silva" 
                      onChange={(e) => {
                        const nName = e.target.value;
                        setName(nName);
                        handleNameValidation(nName)
                      }} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    className={`border-1 ${
                        isEmailValid
                          ? "!border-[#8E44AD]"
                          : "!border-red-500 bg-red-50"
                      } pr-10`}
                    placeholder="joao.silva@inovafarma.com.br" 
                    onChange={(e) => {
                      const nEmail = e.target.value;
                      setEmail(nEmail);
                      handleEmailValidation(nEmail);
                      
                    }} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password-register">Senha</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <MessageCircleQuestionIcon className="size-5" />
                        </TooltipTrigger>
                        <TooltipContent className="border-1 !border-[#8E44AD] bg-background">
                          <p className="text-sm text-gray-300">
                            A senha deve conter pelo menos 8 caracteres, incluindo letras maiúsculas, minúsculas, números e símbolos.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="relative">
                    <Input
                      id="password-register"
                      type={showPassword ? "text" : "password"}
                      className={`border-1 ${
                        confirmPassword
                          ? "!border-[#8E44AD]"
                          : "!border-red-500 bg-red-50"
                      } pr-10`}
                      onChange={(e) => {
                        const nPassword = e.target.value
                        setPassword(nPassword); 
                        handlePasswordValidation(nPassword)
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="Cpassword-register">Confirmar Senha</Label>
                  <div className="relative">
                    <Input
                      id="Cpassword-register"
                      type={showConfirm ? "text" : "password"}
                      className={`border-1 ${
                        confirmCPassword
                          ? "!border-[#8E44AD]"
                          : "!border-red-500 bg-red-50"
                      } pr-10`}
                      onChange={(e) => {
                        const nCPassword = e.target.value
                        setCpassword(nCPassword); 
                        handlePasswordConfirmValidation(password, nCPassword);
                      }}
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                      onClick={() => setShowConfirm(!showConfirm)}
                    >
                      {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="CChave-register">Código Chave</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <MessageCircleQuestionIcon className="size-5" />
                        </TooltipTrigger>
                        <TooltipContent className="border-1 !border-[#8E44AD] bg-background">
                          <p className="text-sm text-gray-300">
                            O código chave é um código único de cada setor. Ele pode ser gerado e solicitado na aba "Perfil" pelo administrador ou gestor (a) do setor.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input id="CChave-register" type="text" className="border-1 !border-[#8E44AD]" onChange={(e) => setCChave(e.target.value)} />
                </div>
              </CardContent>
              <CardFooter>
                <div className="flex flex-col items-center justify-center gap-4 w-full">
                  <Button
                    variant="ghost"
                    className="w-full !rounded-sm !border !border-[#8E44AD] px-6 py-2"
                    onClick={handleRegister}
                    disabled={!isValid}
                  >
                    Registrar
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <style>
        {`.alert-title { display: flex; justify-content: space-between; }`}
      </style>
    </section>
  )
}

export default Login
