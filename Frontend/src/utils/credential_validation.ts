const Validate = {
    username(username: string) {
        if ((username.length < 4) || (username.length > 50)) {
            return [false, "Usuário deve ter entre 4 e 50 caracteres"]
        } 
        return [true, "OK"]
    },
    name(name: string) {
        if (name === "") {
            return [false, "Nome não pode estar vazio"]
        }
        if ((name.length < 3) || (name.length > 100)) {
            return [false, "Nome deve ter entre 3 e 100 caracteres"]
        }
        return [true, "OK"]
    },
    email(email: string) {
        if (email === "") {
            return [false, "E-mail não pode estar vazio"]
        }
        if ((email.length < 5) || (email.length > 100)) {
            return [false, "E-mail deve ter entre 5 e 100 caracteres"]
        }
        if (!email.includes("@") || !email.includes(".")) {
            return [false, "E-mail deve conter '@' e '.'"]
        }
        return [true, "OK"]
    },
    password(password: string, c_password: string) {
        if (password === "") {
            return [false, "Senha não pode estar vazia"]
        }
        if ((password.length < 6) || (password.length > 50)) {
            return [false, "Senha deve ter pelo menos 6 caracteres"]
        }
        if (password !== c_password) {
            return [false, "Senhas não coincidem"]
        }
        if (!/[A-Z]/.test(password)) {
            return [false, "Senha deve conter pelo menos uma letra maiúscula"]
        }
        if (!/[!@#$%^&*()\-__+=]/.test(password)) {
            return [false, "Senha deve conter pelo menos um caractere especial. (!@#$%^&*()-_+=)"]
        }
        if (!/\d/.test(password)) {
            return [false, "Senha deve conter pelo menos um número de 0 a 9."]
        }
        return [true, "OK"]
    }

}

export default Validate;