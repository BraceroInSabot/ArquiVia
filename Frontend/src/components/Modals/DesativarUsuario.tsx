import "../../assets/css/AlterarSetor.css";
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
import { toast } from "sonner"
import { desativarUsuario } from "../../api/apiHandler";
import { useState } from "react";
import { useNavigate } from "react-router";

function DesativarUsuarioModal() {
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleDeactivateAcc = async () => {
        try {
            const sucesso = await desativarUsuario({password});

            if (sucesso) {
                toast("Sucesso!", {
                    description: "Você desativou a sua conta com sucesso."
                })
                await new Promise((resolve) => setTimeout(resolve, 3000));
                navigate("/login");
                
            } else if (typeof sucesso === "string") {
                toast("Erro!", {
                    description: "" + sucesso
                })
            }
        } catch {
            toast("Erro!", {
                description: "Houve alguma exceção não identificada."
            })
        }
    };

    return (
        <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Desativar Conta</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-white">Desativação de Conta</DialogTitle>
          <DialogDescription>
            Para desativar a sua conta, é necessário inserir a sua senha e confirmar. Sua conta será desativada e não excluída. Qualquer dúvida, entre em contato com um dos administradores do Setor.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Código Chave atual */}
          <div className="grid grid-cols-4 items-center gap-4 relative">
            <Label htmlFor="acPassword" className="text-right text-white">
              Senha
            </Label>
            <Input
              id="codigoChave"
              type="password"
              className="col-span-3 text-gray-400 pr-10"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          </div>
        <DialogFooter>
          <Button onClick={handleDeactivateAcc} variant={"destructive"}>Salvar Alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    );
}

export default DesativarUsuarioModal;
