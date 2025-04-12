import "../../assets/css/AlterarSetor.css";
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
import { toast } from "sonner"
import { alterarSetor } from "../../api/apiHandler";

function AlterarSetorUsuario() {
    const [codigoChave, setCodigoChave] = useState("");
    const [codigoChave2, setCodigoChave2] = useState("");

    const validarCodigo = (codigo: string) => /^[A-Za-z]{3}[0-9]{3}$/.test(codigo);

    const handleAlterarSetor = async () => {
        if (!validarCodigo(codigoChave) || !validarCodigo(codigoChave2)) {
            toast("Erro!", {
                description: "Um dos códigos estão incorretos."
            })
            return false;
        }

        try {
            const sucesso = await alterarSetor(codigoChave.toLowerCase(), codigoChave2.toLowerCase());

            if (sucesso) {
                toast("Sucesso!", {
                    description: "Saia da sua conta e entre novamente para garantir a alteração!"
                })
            } else {
                toast("Erro!", {
                    description: "Não foi possível fazer a troca de setor."
                })
            }
        } catch {
            toast("Erro!", {
                description: "Houve uma exceção inesperada."
            })
        }
    };

    return (
        <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">Alterar Setor</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-white">Alteração de Setor</DialogTitle>
          <DialogDescription>
            Preencha os campos para fazer a alteração do seu setor. É necessário entrar em contato com os Gestores (as) de ambos setores.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Código Chave atual */}
          <div className="grid grid-cols-4 items-center gap-4 relative">
            <Label htmlFor="acPassword" className="text-right text-white">
              Código Chave Atual
            </Label>
            <Input
              id="codigoChave"
              className="col-span-3 text-gray-400 pr-10"
              onChange={(e) => setCodigoChave(e.target.value)}
            />
          </div>

          {/* Código Chave Alvo */}
          <div className="grid grid-cols-4 items-center gap-4 relative">
            <Label htmlFor="newPassword" className="text-right text-white">
              Código Chave Alvo
            </Label>
            <Input
              id="codigoChave2"
              className="col-span-3 text-gray-400 pr-10"
              onChange={(e) => setCodigoChave2(e.target.value)}
            />
          </div>
          </div>
        <DialogFooter>
          <Button onClick={handleAlterarSetor}>Salvar Alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    );
}

export default AlterarSetorUsuario;
