function verificarusuario(usuario: string) {
    if (usuario === '') {
        return true
    }
    if (usuario.length > 3) {
        return true
    }

    return false
}

function verificaremail(email: string) {
    if (email === '') {
        return true
    }
    if (email.includes("@") && email.includes(".")) {
        return true;
    }

    return false
}

function verificarsenha(senha: string) {
    const validacoes = [];

    if (senha.length < 6) {
        validacoes.push("A senha deve conter no mínimo 6 caracteres.");
    } 
    if (!senha.match(/[A-Z]/)) {
        validacoes.push("A senha deve conter no mínimo uma letra maiúscula."); 
    } 
    if (!senha.match(/[!@#$%^&*(),.?":{}|<>]/)) {
        validacoes.push("A senha deve conter no mínimo um caractere especial.");
    } 

    return validacoes;
}

export { verificarusuario, verificaremail, verificarsenha }