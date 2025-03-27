import axios from "axios";

const BASE_URL: string = 'http://127.0.0.1:8000/api/';
const AUTH_URL: string = BASE_URL + 'auth/';
const LOGIN_URL: string = AUTH_URL + 'token/entrar';
const LOGOUT_URL: string = AUTH_URL + 'token/sair';

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
    let response = await axios.post(LOGOUT_URL, {}, {
        withCredentials: true,
    });

    return response.data.sucesso;
};

export { login, logout };
