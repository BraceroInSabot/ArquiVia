import axios from "axios";

import { AxiosError, AxiosResponse } from "axios";

const versao: string = 'v1';

const BASE_URL: string = 'http://127.0.0.1:8000/api/' + versao + '/';
const AUTH_URL: string = BASE_URL + 'auth/';
const LOGIN_URL: string = AUTH_URL + 'token/entrar';
const LOGOUT_URL: string = AUTH_URL + 'token/sair';
const REFRESH_URL: string = AUTH_URL + 'token/refresh';
const VERIFICAR_URL: string = AUTH_URL + 'token/verificar';

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

export { login, logout, call_refresh_token, verificar_token };
