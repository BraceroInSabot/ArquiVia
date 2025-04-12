import { useState } from "react"
import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { alterarSenha } from "../../api/apiHandler"
import { toast } from "sonner"
import { verificarsenha } from "../../tsx/verificacoes"
import { Eye, EyeOff } from "lucide-react"

function AlterarSenhaUsuario() {
  const [actualPassword, setActualPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showAcPass, setShowAcPass] = useState(false)
  const [showNewPass, setShowNewPass] = useState(false)
  const [showConfPass, setShowConfPass] = useState(false)

  const handleAlterarSenha = async () => {
    const validacoes = verificarsenha(newPassword)

    if (!actualPassword || !newPassword || !confirmPassword) {
      toast.error("Campos inválidos!", {
        description: "Todos os campos são obrigatórios.",
      })
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error("Senhas não semelhantes!", {
        description: "A confirmação da senha não corresponde à nova senha.",
      })
      return
    }

    if (validacoes && validacoes.length > 0) {
      validacoes.forEach((erro) =>
        toast.error("Erro de validação", {
          description: erro,
        })
      )
      return
    }

    try {
      const sucesso = await alterarSenha(actualPassword, newPassword)
      if (sucesso) {
        toast.success("Sucesso!", {
          description: "Senha alterada com sucesso.",
        })
      } else {
        toast.error("Falha!", {
          description: "Não foi possível alterar a senha.",
        })
      }
    } catch {
      toast.error("Erro inesperado!", {
        description: "Houve uma exceção não especificada.",
      })
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">Alteração de Senha</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-white">Alteração de Senha</DialogTitle>
          <DialogDescription>
            Preencha os campos para fazer a alteração da sua senha.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Senha atual */}
          <div className="grid grid-cols-4 items-center gap-4 relative">
            <Label htmlFor="acPassword" className="text-right text-white">
              Senha atual
            </Label>
            <Input
              id="acPassword"
              type={showAcPass ? "text" : "password"}
              className="col-span-3 text-gray-400 pr-10"
              value={actualPassword}
              onChange={(e) => setActualPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute right-4 top-[50%] -translate-y-1/2 text-muted-foreground"
              onClick={() => setShowAcPass(!showAcPass)}
            >
              {showAcPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Nova senha */}
          <div className="grid grid-cols-4 items-center gap-4 relative">
            <Label htmlFor="newPassword" className="text-right text-white">
              Nova Senha
            </Label>
            <Input
              id="newPassword"
              type={showNewPass ? "text" : "password"}
              className="col-span-3 text-gray-400 pr-10"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute right-4 top-[50%] -translate-y-1/2 text-muted-foreground"
              onClick={() => setShowNewPass(!showNewPass)}
            >
              {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Confirmação de nova senha */}
          <div className="grid grid-cols-4 items-center gap-4 relative">
            <Label htmlFor="confNewPass" className="text-right text-white">
              Confirme a nova Senha
            </Label>
            <Input
              id="confNewPass"
              type={showConfPass ? "text" : "password"}
              className="col-span-3 text-gray-400 pr-10"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute right-4 top-[50%] -translate-y-1/2 text-muted-foreground"
              onClick={() => setShowConfPass(!showConfPass)}
            >
              {showConfPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleAlterarSenha}>Salvar Alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AlterarSenhaUsuario
