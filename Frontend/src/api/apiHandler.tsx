import axios from "axios";

import { AxiosError, AxiosResponse } from "axios";
import RedefinirSenha from "../routes/RedefinirSenha";

const versao: string = 'v1';

const BASE_URL: string = 'http://127.0.0.1:8000/api/' + versao + '/';

// Tipos de URL
const AUTH_URL: string = BASE_URL + 'auth/token/';
const USUARIO_URL: string = BASE_URL + 'usuario/';

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

const login = async (usuario: string, senha: string) => {
    let response = await axios.post(LOGIN_URL, {
        username: usuario,
        password: senha
    }, {
        withCredentials: true,
    });


    return response.data.sucesso;
};

const logout = async () => {
    const response = await axios.post(LOGOUT_URL, {}, {
        withCredentials: true,
    });

    return response.data.sucesso;
};


const registrar = async ({usuario, nome, email, senha, cSenha, cChave}: RegistroDados): Promise<string | false> => {
    try {
        const response: AxiosResponse<RegistroResposta> = await axios.post(
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

        return response.data.sucesso || false;
    } catch (error: any) {
        const errosElement = document.getElementById("erros");
        if (errosElement && error.response?.data?.erros) {
            errosElement.innerHTML = `<p class="text-danger">${error.response.data.erros}</p>`;
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

        console.log(response.data);
        
        return Array.isArray(response.data) ? response.data[0] : response.data;
    } catch (error: any) {
        call_refresh_token({
            error,
            func: () => axios.get(USUARIO_DADOS_URL, { withCredentials: true })
        });
        return window.location.reload();
    }
};

const esqueci_senha = async ({emailUsuario, emailGestor}: Email) => {
    try {
        const response = await axios.post(
            ESQUECI_SENHA_URL, 
            {
                emailUsuario: emailUsuario,
                emailGestor: emailGestor
            },
            { withCredentials: true }
        );

        return response.data.sucesso
    } catch (error: any) {
        return false
    }
}

const validar_token = async (token: string): Promise<true|false> => {
    try {
        console.log(VALIDAR_TOKEN_URL + token)
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
    ): Promise<boolean> => 
    {
    
    try {
        const response = await axios.post(
            REDEFINIR_SENHA_URL + token,
            { 
                token: token,
                password: password
            },
            { withCredentials: true }
        );
        return response.data.sucesso || false;
    } catch (error: any) {
        console.error(error);
        return false;
    }
};

export { 
    login, 
    logout, 
    call_refresh_token, 
    verificar_token, 
    verificar_dados_usuario, 
    registrar, 
    esqueci_senha,
    validar_token,
    redefinirSenha
 };
