import { useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { alterarDadosUsuario } from "../../api/apiHandler";
import { toast } from "sonner";
import { verificaremail } from "../../tsx/verificacoes";


function AlterarDadosUsuarioModal() {
  const [InpName, setInpName] = useState("");
  const [InpUsername, setInpUsername] = useState("");
  const [InpEmail, setInpEmail] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(true);

  const handleAlterarDados = async () => {
    const valido = await verificaremail(InpEmail);
    setIsEmailValid(valido);

    if (!valido) {
      toast("E-mail inválido", {
        description: "Informe um e-mail válido e não utilizado.",
      });
      return;
    }

    const sucesso = await alterarDadosUsuario({
      data: InpName,
      type: 1
    });

    if (sucesso) {
      toast("Sucesso!", {
        description: "Seus dados foram alterados com sucesso!",
      });
    } else {
      toast("Falha!", {
        description: "Houve alguma exceção ao alterar os seus dados.",
      });
    }
  };


  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">Edit Profile</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-white">Edit profile</DialogTitle>
          <DialogDescription>
            Faça alterações no seu perfil. Clique em salvar quando terminar.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right text-white">
              Nome
            </Label>
            <Input
              id="name"
              className="col-span-3 text-gray-400"
              value={InpName}
              onChange={(e) => setInpName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right text-white">
              Usuário
            </Label>
            <Input
              id="username"
              className="col-span-3 text-gray-400"
              value={InpUsername}
              onChange={(e) => setInpUsername(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right text-white">
              E-mail
            </Label>
            <Input
              id="email"
              className={`col-span-3 text-gray-400 ${!isEmailValid ? "border-red-500" : ""}`}
              value={InpEmail}
              onChange={(e) => setInpEmail(e.target.value)}
              onBlur={async () => {
                const valido = await verificaremail(InpEmail);
                setIsEmailValid(valido);
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleAlterarDados}>Salvar Alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AlterarDadosUsuarioModal;
