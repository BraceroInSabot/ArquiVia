import { useEffect, useState } from "react"
import { verificar_dados_usuario } from "../api/apiHandler"

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Separator } from "../components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog"
import { Input } from "../components/ui/input"
import { alterarDadosUsuario } from "../api/apiHandler"
import { toast } from "sonner"
import { Pencil } from "lucide-react"
import logo from "../assets/img/logos/AnnotaPs-Logo-Pequeno.png"
import AlterarSenhaUsuario from "../components/Modals/AlterarSenha"
import AlterarSetorUsuario from "../components/Modals/AlterarSetor"
import DesativarUsuarioModal from "../components/Modals/DesativarUsuario"

interface UsuarioInterface {
  nome: string
  username: string
  setor: string
  email: string
  data_criacao: string
  ultimo_login: string
  inicio_expediente: string
  final_expediente: string
}

export default function Perfil() {
  const [usuario, setUsuario] = useState<UsuarioInterface | null>(null)

  const [editField, setEditField] = useState<"nome" | "username" | "email" | null>(null)
  const [inputValue, setInputValue] = useState("")

  useEffect(() => {
    document.title = "Perfil - AnnotaPS"
    const fetchData = async () => {
      const dadosUsuario = await verificar_dados_usuario()
      setUsuario(dadosUsuario["usuario"][0])
    }
    fetchData()
  }, [])

  const alterarNome = async () => {
    const success = await alterarDadosUsuario({data:inputValue,type:3})

    if (success) {
      toast("Sucesso!", {
        description: "Seus dados foram alterados com sucesso!",
      });
    } else {
      toast("Falha!", {
        description: "Houve alguma exceção ao alterar os seus dados.",
      });
    }
  }

  const alterarUsuario = async () => {
    const success = await alterarDadosUsuario({data:inputValue,type:2})

    if (success) {
      toast("Sucesso!", {
        description: "Seus dados foram alterados com sucesso!",
      });
    } else {
      toast("Falha!", {
        description: "Houve alguma exceção ao alterar os seus dados.",
      });
    }
  }

  const alterarEmail = async () => {
    const success = await alterarDadosUsuario({data:inputValue,type:1})

    if (success) {
      toast("Sucesso!", {
        description: "Seus dados foram alterados com sucesso!",
      });
    } else {
      toast("Falha!", {
        description: "Houve alguma exceção ao alterar os seus dados.",
      });
    }
  }

  return (
    <div className="flex items-start justify-center mt-8">
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <Card className="shadow-xl border border-muted-foreground/10">
          <CardContent className="flex flex-col md:flex-row items-center md:items-start gap-6 p-6">
            <Avatar className="w-24 h-24 border">
              <AvatarImage src={logo} />
              <AvatarFallback>{usuario?.nome?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1.5 text-center md:text-left">
              <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
                {usuario?.nome}
                <Dialog>
                  <DialogTrigger asChild>
                    <Pencil
                      size={18}
                      className="cursor-pointer text-muted-foreground hover:text-primary"
                      onClick={() => {
                        setEditField("nome")
                        setInputValue(usuario?.nome ?? "")
                      }}
                    />
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Editar Nome</DialogTitle>
                      <DialogDescription>Altere seu nome.</DialogDescription>
                    </DialogHeader>
                    <Input value={inputValue} onChange={(e) => setInputValue(e.target.value)} className="text-gray-200" />
                    <DialogFooter>
                      <Button onClick={alterarNome}>Salvar</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </h1>
              <Badge variant="outline" className="text-sm px-3 py-1 rounded-full">
                {usuario?.setor}
              </Badge>
              <p className="text-muted-foreground text-sm">
                Conta criada em <strong>{usuario?.data_criacao}</strong> | Último login em{" "}
                <strong>{usuario?.ultimo_login}</strong>
              </p>
            </div>
          </CardContent>
        </Card>

        <Separator />

        <Card className="border border-muted-foreground/10">
          <CardHeader>
            <CardTitle>Informações da Conta</CardTitle>
            <CardDescription>Dados pessoais e expediente</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Início do expediente</p>
              <p>{usuario?.inicio_expediente || "--:--"}</p>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-muted-foreground">Email</p>
                <p>{usuario?.email}</p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Pencil
                    size={18}
                    className="cursor-pointer text-muted-foreground hover:text-primary"
                    onClick={() => {
                      setEditField("email")
                      setInputValue(usuario?.email ?? "")
                    }}
                  />
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Editar Email</DialogTitle>
                    <DialogDescription>Altere seu email.</DialogDescription>
                  </DialogHeader>
                  <Input value={inputValue} onChange={(e) => setInputValue(e.target.value)} className="text-gray-200"/>
                  <DialogFooter>
                    <Button onClick={alterarEmail}>Salvar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <div>
              <p className="text-muted-foreground">Fim do expediente</p>
              <p>{usuario?.final_expediente || "--:--"}</p>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-muted-foreground">Nome de Usuário</p>
                <p>{usuario?.usuario}</p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Pencil
                    size={18}
                    className="cursor-pointer text-muted-foreground hover:text-primary"
                    onClick={() => {
                      setEditField("usuario")
                      setInputValue(usuario?.usuario ?? "")
                    }}
                  />
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Editar Usuário</DialogTitle>
                    <DialogDescription>Altere seu nome de usuário.</DialogDescription>
                  </DialogHeader>
                  <Input value={inputValue} onChange={(e) => setInputValue(e.target.value)} className="text-gray-200"/>
                  <DialogFooter>
                    <Button onClick={alterarUsuario}>Salvar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>



        <Separator/>   
        {/* Ações */}
        <Card className="border border-muted-foreground/10">
            <CardHeader>
            <CardTitle>Gerenciar Conta</CardTitle>
                <CardDescription>Atualize suas informações de acesso</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row flex-wrap gap-4">
              <AlterarSenhaUsuario/>
              <AlterarSetorUsuario/>
              <DesativarUsuarioModal/>
            </CardContent>
        </Card>    

      </div>
    </div>
  )
}
