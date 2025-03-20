function verificarusuario() {
    var username = document.getElementById("usuario").value;
    if (username.length < 3) {
        document.getElementById("usuario").style.border = "1px solid red";
        return false;
    } else {
        document.getElementById("usuario").style.border = "1px solid #ced4da";
    }
    return true;
}

function verificaremail() {
    var email = document.getElementById("email").value;
    console.log(!email.includes("@") || !email.includes("."));

    if (!email.includes("@") || !email.includes(".")) {
        document.getElementById("email").style.border = "1px solid red";
        return false;
    } else {
        document.getElementById("email").style.border = "1px solid #ced4da";
        return true;
    }
}

function verificarsenha() {
    var senha = document.getElementById("senha").value;
    
    const erros = document.getElementById("erros");

    const validacoes = [];

    if (senha.length < 6) {
        document.getElementById("senha").style.border = "1px solid red";
        validacoes.push("A senha deve conter no mínimo 6 caracteres.");
    } 
    if (!senha.match(/[A-Z]/)) {
        document.getElementById("senha").style.border = "1px solid red";
        validacoes.push("A senha deve conter no mínimo uma letra maiúscula."); 
    } 
    if (!senha.match(/[!@#$%^&*(),.?":{}|<>]/)) {
        document.getElementById("senha").style.border = "1px solid red";
        validacoes.push("A senha deve conter no mínimo um caractere especial.");
    } 
    if (validacoes.length === 0) {
        document.getElementById("senha").style.border = "1px solid #ced4da";
    }

    erros.innerHTML = validacoes.join("<br>");

    return validacoes.length === 0;
}

function verificarconfirmarsenha() {
    const senha = document.getElementById("senha").value;
    const confirmarSenha = document.getElementById("confirmar-senha").value;

    if (senha !== confirmarSenha) {
        document.getElementById("confirmar-senha").style.border = "1px solid red";
        return false;
    } else {
        document.getElementById("confirmar-senha").style.border = "1px solid #ced4da";
    }
}

export { verificarusuario, verificaremail, verificarsenha, verificarconfirmarsenha }