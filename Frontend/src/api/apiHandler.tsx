import axios from "axios";

import { AxiosError, AxiosResponse } from "axios";

const versao: string = 'v1';

const BASE_URL: string = 'http://127.0.0.1:8000/api/' + versao + '/';

// Tipos de URL
const AUTH_URL: string = BASE_URL + 'auth/token/';
const USUARIO_URL: string = BASE_URL + 'usuario/';
const SETOR_URL: string = BASE_URL + 'setor/';

// auth
const LOGIN_URL: string = AUTH_URL + 'entrar';
const LOGOUT_URL: string = AUTH_URL + 'sair';
const REFRESH_URL: string = AUTH_URL + 'atualizar-token';
const REGISTRAR_URL: string = AUTH_URL + 'criar-conta';
const ESQUECI_SENHA_URL: string = AUTH_URL + 'esqueci-senha';
const VALIDAR_TOKEN_URL: string = AUTH_URL + 'validar-token-senha/';
const REDEFINIR_SENHA_URL: string = AUTH_URL + 'redefinir-senha/';

// usuario
const VERIFICAR_URL: string = USUARIO_URL + 'verificar';
const USUARIO_DADOS_URL: string = USUARIO_URL + 'dados';
const DESATIVAR_USUARIO_URL: string = USUARIO_URL + 'desativar';
const ALTERAR_SETOR_URL: string = USUARIO_URL + 'alterar-setor';
const ALTERAR_SENHA_URL: string = USUARIO_URL + 'alterar-senha';
const ALTERAR_DADOS_URL: string = USUARIO_URL + 'alterar-dados';

// setor
const CONSULTAR_SETOR_URL: string = SETOR_URL + 'info'
const CONSTULAR_AUTORIDADE_URL: string = SETOR_URL + 'admin'
const ALTERAR_AUTORIDADE_URL: string = SETOR_URL + 'alterar-adm'
const DESATIVAR_COLABORADOR_URL: string = SETOR_URL + 'desativar-reativar-colaborador'
const ALTERAR_DADOS_COLABORADOR: string = SETOR_URL + 'alterar-dados-colaborador'
const CRIAR_CODIGO_CHAVE: string = SETOR_URL + 'criar-codigo-chave'

interface RegistroDados {
    usuario: string;
    nome: string;
    email: string;
    senha: string;
    cSenha: string;
    cChave: string;
}

interface RegistroResposta {
    sucesso?: string;
    erros?: string;
}

interface Email {
    emailUsuario: string,
    emailGestor: string
}

interface Login {
    username: string;
    password: string;
}

const login = async ({ username, password }: Login): Promise<[boolean, string] | boolean> => {
    try {
      const response = await axios.post(
        LOGIN_URL,
        {
          username: username,
          password: password,
        },
        {
          withCredentials: true,
        }
      );
  
      if (response.status === 200) {
        return true;
      } else {
        return [false, response.data.message || "Erro desconhecido"];
      }
    } catch (error: AxiosError | unknown | string) {
      return [false, error.response.data || "Erro desconhecido"];
    }
  };

const logout = async () => {
    const response = await axios.post(LOGOUT_URL, {}, {
        withCredentials: true,
    });

    return response.data.sucesso;
};


const registrar = async ({usuario, nome, email, senha, cSenha, cChave}: RegistroDados): Promise<true | false> => {
    try {
        const response: AxiosResponse<string | true> = await axios.post(
            REGISTRAR_URL,
            {
                username: usuario,
                nome: nome,
                email: email,
                password: senha,
                cpassword: cSenha,
                codigochave: cChave,
            },
            {
                withCredentials: true,
            }
        );

        return true;
    } catch (error: AxiosError | unknown | (string|boolean)[]) {
        if (axios.isAxiosError(error)) {
            return false;
        }
        return false;
    }
};

const refresh_token = async () => {
    const response = await axios.post(REFRESH_URL, {}, {
        withCredentials: true,
    });

    return response.data.atualizacao;
};

const call_refresh_token = async ({error, func}: {error:AxiosError, func: () => Promise<AxiosResponse>}) => {
    if (error.response?.status === 401) {
        const atualizacao = await refresh_token();
        
        if (atualizacao) {
            const retry = await func();
            return retry.data;
        }
    }
};

const verificar_token = async () => {  
    const response = await axios.post(VERIFICAR_URL, {}, {
        withCredentials: true,
    });

    return response.data.sucesso;
}

const verificar_dados_usuario = async () => {
    try {
        const response = await axios.get(USUARIO_DADOS_URL, {
            withCredentials: true,
        });
        
        return Array.isArray(response.data) ? response.data[0] : response.data;
    } catch (error: any) {
        call_refresh_token({
            error,
            func: () => axios.get(USUARIO_DADOS_URL, { withCredentials: true })
        });
        return window.location.reload();
    }
};

const esqueci_senha = async ({emailUsuario, emailGestor}: Email): Promise<true | false> => {
    try {
        const response: AxiosResponse = await axios.post(
            ESQUECI_SENHA_URL, 
            {
                emailUsuario: emailUsuario,
                emailGestor: emailGestor
            },
            { withCredentials: true }
        );

        return response.data['Sucesso'] || response.data['Falha'];
    } catch {
        return false
    }
}

const validar_token = async (token: string): Promise<true|false> => {
    try {
        const response = await axios.get(
            VALIDAR_TOKEN_URL + token,
        )

        return true
    } catch (error:any) {
        return false
    }
}

interface RedefinicaoSenha {
    token: string,
    password: string
}

const redefinirSenha = async (
        { token, password }: RedefinicaoSenha
    ): Promise<true | false> => 
    {
    
    try {
        const response: AxiosResponse = await axios.post(
            REDEFINIR_SENHA_URL + token,
            { 
                token: token,
                password: password
            },
            { withCredentials: true }
        );
        return response.data;
    } catch (error: any) {
        return false;
    }
};

interface DeactivateUserInterface {
    password: string
}

const desativarUsuario = async ({password}: DeactivateUserInterface): Promise<true | string | false> => {
    try {
        const response = await axios.post(
            DESATIVAR_USUARIO_URL,
            {
                password: password
            },
            {
                withCredentials: true
            }
        )

        if (response.status === 200) {
            return true;
        } else {
            return response.data["Falha"];
        }
    } catch {
        return false;
    }
}

const alterarSetor = async (codigoChaveAtual: string, codigoChaveAlvo: string) => {
    try {
        const response = await axios.post(
            ALTERAR_SETOR_URL,
            {
                codigoChaveAtual: codigoChaveAtual,
                codigoChaveAlvo: codigoChaveAlvo
            },
            {
                withCredentials: true
            }
        )

        return true;
    } catch (error:any) {
        return false;
    }
}


const alterarSenha = async (password: string, nPassword: string) => {
    try {
        const response = await axios.post(
            ALTERAR_SENHA_URL,
            {
                password: password,
                nPassword: nPassword
            },
            {
                withCredentials: true
            })

        return true;
    } catch (error:any) {
        return false;
    }
}

interface alteracaoDadosUsuario {
    data: string
    type: number
}

const alterarDadosUsuario = async ({data, type}: alteracaoDadosUsuario) => {
    try {
        const response = await axios.post(
            ALTERAR_DADOS_URL,
            {
                data: data,
                type: type
            },
            {
                withCredentials: true
            }
        )

        if (response.status === 200) {
            return response.data["Sucesso"];
        }
        
        return false;
    } catch {
        return false;
    }
}

const dataSetor = async () => {
    try {
        const response = await axios.get(
            CONSULTAR_SETOR_URL,
            {withCredentials: true},
        )

        if (response.status === 200) {
            return response.data;
        }
        return false
    } catch {
        return false
    }
}

const userAutority = async () => {
    try {
        const response = await axios.get(
            CONSTULAR_AUTORIDADE_URL,
            {withCredentials: true}
        )

        if (response.status === 200) {
            return response.data;
        }

        return false;
    } catch {
        return false
    }
}

interface updateADMInterface {
    username: string
    opType: boolean
}

const updateADM = async ({username, opType}: updateADMInterface) => {
    try {
        const response = await axios.post(
            ALTERAR_AUTORIDADE_URL,
            {
                username: username,
                opType: opType
            },
            {withCredentials: true}
        )
        
        if (response.status === 200) {
            return true;
        }

        return false;
    } catch {
        return false;
    }
}

const DeactivateReactivate = async (username: string, optype: boolean) => {
    try {
        console.log(DESATIVAR_COLABORADOR_URL)
        const response = await axios.post(
            DESATIVAR_COLABORADOR_URL,
            {
                username: username,
                opType: optype
            },
            {
                withCredentials: true
            }
        )


        if (response.status === 200) {
            return true
        }
        return false
    } catch {
        return false
    }
}

interface CollaboratorChangeData {
    username: string
    name: string
    email: string
  }

const changeCollaboratorData = async({
    username,
    name,
    email
  }: CollaboratorChangeData) => {
    try {
        const response = await axios.post(
            ALTERAR_DADOS_COLABORADOR,
            {
                username: username,
                name: name,
                email: email
            },
            {
                withCredentials: true
            }
        )

        if (response.status === 200) {
            return response.data
        }

        return false
    } catch {
        return false
    }
}

const create_codigo_chave = async () => {
    try {
        const response = await axios.post(
            CRIAR_CODIGO_CHAVE,
            {},
            {withCredentials: true}
        )

        return response
    } catch {
        return false
    }
}

export { 
    login, 
    logout, 
    call_refresh_token, 
    verificar_token, 
    verificar_dados_usuario, 
    registrar, 
    esqueci_senha,
    validar_token,
    redefinirSenha,
    desativarUsuario,
    alterarSetor,
    alterarSenha,
    alterarDadosUsuario,
    dataSetor,
    userAutority,
    updateADM,
    DeactivateReactivate,
    changeCollaboratorData,
    create_codigo_chave
 };
