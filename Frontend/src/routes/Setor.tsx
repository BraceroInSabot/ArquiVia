import { useEffect, useState } from "react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from "../components/ui/card"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogFooter,
  DialogDescription
} from "../components/ui/dialog"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Separator } from "../components/ui/separator"
import image from "../assets/img/user.jpg"
import "../assets/css/setor.css"
import { Edit, Lock, XCircle, Filter, MoveUp, MoveDown, RefreshCw, Clock, UserRound  } from "lucide-react"
import { 
  dataSetor, 
  updateADM, 
  userAutority as userAutorityAPI, 
  DeactivateReactivate, 
  esqueci_senha,
  changeCollaboratorData,
  create_codigo_chave
} from "../api/apiHandler"
import { Checkbox } from "../components/ui/checkbox"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "../components/ui/context-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover"
import { toast } from "sonner"
import {
    TimePickerInput
} from "../components/ui/time-picker-input"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { Badge } from "../components/ui/badge"

interface Colaborador {
  username: string
  nome: string
  email: string
  imagem: string
  is_active: boolean
  admin: boolean
  gestor: boolean
  horario: {
    initH: number
    finalH: number
    initM: number
    finalM: number
  }
}

interface SetorData {
  name: string
  leader: string
  leaderEmail: string
  imageURL: string
  stats: {
    ColaboradoresAtivos: number
  }
}

interface userAutority {
  data: {
    Gestor: boolean
    ADM: boolean
    }
}

interface updateADM {
    username: string
    opType: boolean
}

interface updatePassword {
    emailGestor: string
    emailUsuario: string
}

interface CollaboratorChangeData {
  username: string
  name: string
  email: string
}

function VisualizarSetor() {
  const [busca, setBusca] = useState("")
  const [data, setData] = useState<SetorData | null>(null)
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([])
  const [filtro, setFiltro] = useState({
    admin: false,
    desativado: false,
    gestor: false,
  })
  const [userAutority, setUserAutority] = useState<userAutority>({
    data: {
      Gestor: false,
      ADM: false,
    }
  })
  const [nameUpCol, setNameUpCol] = useState('');
  const [emailUpColl, setEmailUpColl] = useState('');
  // const [] = useState()

  useEffect(() => {
    document.title = "Visualizar Setor - AnnotaPS"
  }, [])

  useEffect(() => {
    const fetchDataSetor = async () => {
      const dSetor = await dataSetor()
      setData(dSetor.Data[0])
      setColaboradores(dSetor.Data[1].lista)
    }
    fetchDataSetor()
  }, [])

  useEffect(() => {
    const fetchAutority = async () => {
      const uAutor = await userAutorityAPI()
      setUserAutority(uAutor)
    }
    fetchAutority()
    }, [])

  const colaboradoresFiltrados = colaboradores.filter((colab) => {
    const nomeMatch = colab.nome.toLowerCase().includes(busca.toLowerCase())

    const filtroAdmin = filtro.admin ? colab.admin : true
    const filtroDesativado = filtro.desativado ? !colab.is_active : colab.is_active
    const filtroGestor = filtro.gestor ? colab.gestor : true

    console.log(colab.nome)

    return nomeMatch && filtroAdmin && filtroDesativado && filtroGestor
  })

  const handleFiltroChange = (campo: string) => {
    setFiltro(prev => ({ ...prev, [campo]: !prev[campo] }))
  }

  const handleAlterarADM = async ({username, opType}: updateADM) => {
    const response = await updateADM({username, opType});

    if (response) {
        toast("Sucesso!", {
            description: "O usuário selecionado agora é um Administrador!",
        });
        await new Promise((resolve) => setTimeout(resolve, 2000));
        window.location.reload();
        return true
    } 

    toast("Falha!", {
        description: "Houve uma falha no processo.",
    });
    return false
  }

  const handleDesativacaoReativacao = async (username: string, optype: boolean) => {
    const response = await DeactivateReactivate(username, optype);
    console.log(response)
    if (response) {
        toast("Sucesso!", {
            description: (optype ? "Usuário desativado com sucesso!" : "Usuário reativado com sucesso!"),
        });
        await new Promise((resolve) => setTimeout(resolve, 4000));
        window.location.reload();
        return true;
    }

    toast("Falha!", {
        description: "Houve uma falha no processo!",
    });
    return false;
  }

  const handleUpdatePassword = async ({emailGestor, emailUsuario}: updatePassword) => {
    const response = await esqueci_senha({emailGestor, emailUsuario});

    if (response.data['Sucesso']) {
        toast("Sucesso!", {
            description: "Usuário desativado com sucesso!",
        });
        await new Promise((resolve) => setTimeout(resolve, 4000));
        window.location.reload();
        return true;
    }

    toast("Falha!", {
        description: "Houve uma falha no processo!",
    });
    return false;
  }

  const handleChangeUserData = async (username: string) => {
    const response = await changeCollaboratorData({
      username: username,
      name: nameUpCol,
      email: emailUpColl,
    } as CollaboratorChangeData)

    if (response) {
      toast("Sucesso!", {
          description: "Credenciais do usuário alteradas.",
      });
      await new Promise((resolve) => setTimeout(resolve, 4000));
      window.location.reload();
      return true;
    }

    toast("Falha!", {
        description: "Houve uma falha no processo!",
    });

    }


  const handleMinutesInput = async (minutes: string) => {
    let minutesInt: number = parseInt(minutes)

    if (minutesInt < 0) {
      minutesInt = 0
    } else if (minutesInt > 23) {
      minutesInt = 23
    }

    console.log(minutesInt)
    return minutesInt.toString()
  }

  const handleCreateCodigoChave = async (user) => {
    const response = await create_codigo_chave();

    if (response) {
      toast("Sucesso!", {
        description: "Código Chave criado!",
      });
      await new Promise((resolve) => setTimeout(resolve, 4000));
      window.location.reload();
      return true;
    }

    toast("Falha!", {
      description: "Houve uma falha no processo!",
    });
    return false
  }
  return (
    <div className="p-6 space-y-8">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl text-white font-bold">Visualização do Setor</h1>
        <p className="text-muted-foreground">Veja informações do seu setor e colaboradores</p>
      </div>

      {/* Informações do setor */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Informações do Setor</CardTitle>
          <CardDescription>Detalhes da sua equipe atual</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 bg-muted p-6 rounded-md">
            <div className="flex-shrink-0">
              <img
                src={image}
                alt="Imagem do Setor"
                className="w-28 h-28 rounded-full object-cover border-4 border-white shadow"
              />
            </div>
            <div className="text-center md:text-left space-y-2">
              <h2 className="text-2xl font-bold text-white">{data?.name}</h2>
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-white">Líder:</span> {data?.leader}
                { userAutority.data.ADM && (
                  <>
                  <br/><br/>
                  <span className="font-semibold text-white">Código Chave:</span> { data?.codigoChave ? (<>{data?.codigoChave}</>) : (<Button
  variant="default"
  className="justify-center align-middle text-white bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-5 transition-all duration-300"
  onClick={handleCreateCodigoChave}>
  Criar
</Button>)}
                  <br/><br/>
                  </>
                )}
              </p>
              <div className="flex gap-4 text-center">
                <Card className="w-auto px-6 py-4">
                  <CardTitle>Colaboradores <br /> Ativos</CardTitle>
                  <CardDescription>
                    <h2 className="text-3xl">{data?.stats.ColaboradoresAtivos}</h2>
                  </CardDescription>
                </Card>
                <Card className="w-auto px-6 py-4">
                  <CardTitle>Anotações</CardTitle>
                  <CardDescription><h2>{/* conteúdo */}</h2></CardDescription>
                </Card>
                <Card className="w-auto px-6 py-4">
                  <CardTitle>Documentações</CardTitle>
                  <CardDescription><h2>{/* conteúdo */}</h2></CardDescription>
                </Card>
                <Card className="w-auto px-6 py-4">
                  <CardTitle>Revisões realizadas</CardTitle>
                  <CardDescription><h2>{/* conteúdo */}</h2></CardDescription>
                </Card>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Colaboradores */}
      <section>
        <h2 className="text-xl text-white font-semibold mb-4">Buscar Colaboradores</h2>
        <div className="flex justify-center mt-5 mb-5">
          <Input
            placeholder="Digite o nome do colaborador..."
            className="mb-6 w-full max-w-md justify-center"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button className="ml-3 p-3"><Filter /></Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="admin" checked={filtro.admin} onCheckedChange={() => handleFiltroChange("admin")} />
                <label htmlFor="admin" className="text-sm">Administrador</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="gestor" checked={filtro.gestor} onCheckedChange={() => handleFiltroChange("gestor")} />
                <label htmlFor="gestor" className="text-sm">Gestor(a)</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="desativado" checked={filtro.desativado} onCheckedChange={() => handleFiltroChange("desativado")} />
                <label htmlFor="desativado" className="text-sm">Desativados</label>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {colaboradoresFiltrados.map((colab, index) => (
            <ContextMenu key={index}>
              <ContextMenuTrigger onSelect={(e) => e.preventDefault()}>
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <img
                        src={colab.imagem || image}
                        alt={colab.nome}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>                    
                        <CardTitle>{colab.nome}</CardTitle>
                        <CardDescription className="mt-1">
                        { (colab.gestor && colab.admin) ? (
                          <Badge className="bg-orange-600 text-white">Gestor (a)</Badge>
                        ) : (!colab.gestor && colab.admin) && (
                          <Badge className="bg-blue-500 text-white">Administrador (a)</Badge>
                        )}
                        { (!colab.gestor && !colab.admin) && (
                          <Badge>Colaborador</Badge>
                        )}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </ContextMenuTrigger>
              
              { userAutority.data.ADM ? (
                <ContextMenuContent>

                  {/* Alterar Dados */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <ContextMenuItem onSelect={(e) => e.preventDefault()}>
                        <Edit className="text-amber-300" />
                        <span className="text-amber-300 ml-2">Alterar Dados</span>
                      </ContextMenuItem>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="text-white">Alterar dados de {colab.nome}</DialogTitle>
                        <DialogDescription>
                            <span>Insira os dados para serem alterados para o usuário.</span>
                            <div className="mt-3">
                                <Label htmlFor="name" className="text-white mb-1.5">Nome</Label>
                                <Input type="text" id="name" onChange={(e) => {
                                    const nameColl: string = e.target.value
                                    setNameUpCol(nameColl)
                                }} defaultValue={colab.nome}></Input>
                            </div>
                            <div className="mt-3">
                                <Label htmlFor="email" className="text-white mb-1.5">E-mail</Label>
                                <Input type="email" id="email" onChange={(e) => {
                                    const emailColl: string = e.target.value
                                    setEmailUpColl(emailColl)
                                }} defaultValue={colab.email}></Input>
                            </div>
                            
                        </DialogDescription>

                      </DialogHeader>
                      <DialogFooter className="mt-3">
                        <Button onClick={() => {
                          handleChangeUserData(colab.username);
                        }}>Salvar alterações</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {/* Trocar Senha */}
                  {((userAutority.data.Gestor === true) && (!colab.gestor) && (colab.is_active)) && (
                    <Dialog>
                        <DialogTrigger asChild>
                        <ContextMenuItem onSelect={(e) => e.preventDefault()}>
                            <Lock className="text-blue-500" />
                            <span className="text-blue-500 ml-2">Trocar Senha</span>
                        </ContextMenuItem>
                        </DialogTrigger>
                        <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="text-white">Trocar senha de {colab.nome}</DialogTitle>
                            <DialogDescription>
                                <span>Esta ação enviará uma confirmação para o email do usuário registrado. Ao acessar o link, ele vai poder alterar a sua senha. Será o mesmo processo de redefinição de senha, na tela de Login.</span>
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button onClick={() => 
                                handleUpdatePassword(
                                    { emailGestor: data.leaderEmail, emailUsuario: colab.email } 
                                )}>
                            Enviar nova senha
                            </Button>
                        </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    )}

                  {/* Promover à Adm. */}
                { ((userAutority.data.Gestor === true) && (!colab.gestor) && (colab.is_active)) && (
                    <Dialog>
                        <DialogTrigger asChild>
                        <ContextMenuItem onSelect={(e) => e.preventDefault()}>
                            { colab.admin ? 
                            <MoveDown className="text-amber-500"/>    
                            :
                            <MoveUp className="text-green-400"/>
                            }
                            <span className={ colab.admin ? "text-amber-500 ml-2" : "text-green-400 ml-2" }>{ colab.admin ? "Rebaixar Adm." : "Promover à Adm." }</span>
                        </ContextMenuItem>
                        </DialogTrigger>
                        <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="text-white"> { colab.admin ? "Deseja rebaixar o usuário" + colab.nome + "?" : "Promover " + colab.nome + " a administrador?"}</DialogTitle>
                            <DialogDescription>{ colab.admin ? "Esta ação vai remover os privilégios administrativos do usuário em questão." : "Esta ação dará privilégios administrativos ao usuário." }</DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                        <Button
                            variant="default"
                            onClick={async () =>
                                await handleAlterarADM({
                                username: colab.username,
                                opType: !colab.admin, // Define `opType` com base no estado atual de `colab.admin`
                                })
                            }
                            className={colab.admin ? "bg-amber-500 text-white" : "bg-green-400 text-white"}
                            >
                            {colab.admin ? "Confirmar rebaixamento" : "Confirmar promoção"}
                        </Button>
                        </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}

                  {/* Desativar */}
                  { ((userAutority.data.Gestor === true) && (userAutority.data.ADM === true) && (!colab.gestor)) && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <ContextMenuItem onSelect={(e) => e.preventDefault()}>
                        { !colab.is_active ?
                        <RefreshCw className="text-green-400" />
                        :
                        <XCircle className="text-red-500" />
                        }
                        { !colab.is_active ?
                        <span className="text-green-400 ml-2">Reativar</span>
                        :
                        <span className="text-red-500 ml-2">Desativar</span>
                        }
                      </ContextMenuItem>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="text-white">
                            { !colab.is_active ?
                            "Deseja reativar o usuário " + colab.nome + "?"
                            :
                            "Deseja desativar o usuário " + colab.nome + "?"
                            }
                        </DialogTitle>
                        <DialogDescription>
                            { !colab.is_active ?
                                "Essa ação faz com que o usuário posso logar ao sistema novamente."
                                :
                                "Essa ação impedirá o acesso do usuário ao sistema."
                            }
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                      { !colab.is_active ? (
                        <Button
                        className="bg-green-400 text-white"
                        onClick={() => handleDesativacaoReativacao(colab.username, true)} // Passa uma função de callback
                        >
                        Confirmar Reativação
                        </Button>
                    ) : (
                        <Button
                        variant="destructive"
                        onClick={() => handleDesativacaoReativacao(colab.username, false)} // Passa uma função de callback
                        >
                        Confirmar Desativação
                        </Button>
                    )}
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  )}


                </ContextMenuContent>
              ): (<>{/* Consultar Perfil */}
                <ContextMenuContent>
                <Dialog>
                  <DialogTrigger asChild>
                    <ContextMenuItem onSelect={(e) => e.preventDefault()}>
                      <UserRound className="text-purple-400" />
                      <span className="text-purple-400 ml-2">Ver Perfil</span>
                    </ContextMenuItem>
                  </DialogTrigger>
                  <DialogContent>
                  <Card className="w-full max-w-xl p-6 bg-background border rounded-2xl shadow-lg">
                    <CardContent className="flex flex-col items-center gap-4">
                      <Avatar className="w-24 h-24">
                        <AvatarImage src={colab.imagem || undefined} />
                        <AvatarFallback>{colab.nome[0]}</AvatarFallback>
                      </Avatar>
  
                      <div className="text-center">
                        <h2 className="text-xl font-bold">{colab.nome}</h2>
                        <p className="text-sm text-muted-foreground">@{colab.username}</p>
                      </div>
  
                      <Separator className="my-4" />
  
                      <div className="grid grid-cols-2 gap-4 w-full">
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="text-base">{colab.email}</p>
                        </div>
  
                        <div>
                          <p className="text-sm text-muted-foreground">Setor</p>
                          <p className="text-base">{data?.name}</p>
                        </div>
  
                        <div>
                          <p className="text-sm text-muted-foreground">Status</p>
                          <Badge variant={colab.is_active ? "default" : "destructive"}>
                            {colab.is_active ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  </DialogContent>
                </Dialog>
                </ContextMenuContent></>)}
            </ContextMenu>
          ))}
        </div>
      </section>
    </div>
  );
}

export default VisualizarSetor
