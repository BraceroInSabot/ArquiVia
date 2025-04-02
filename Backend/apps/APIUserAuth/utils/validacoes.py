from rest_framework import status, serializers

class ValidacaoAutenticacao:
    def __init__(self, usuario=None, nome=None, email=None, senha=None, c_senha=None):
        self.usuario = usuario
        self.nome = nome
        self.email = email
        self.senha = senha
        self.c_senha = c_senha
    
    def validar_usuario(self):
        if not self.usuario:
            return {"Falha": "Usuário não pode estar vazio"}
        if len(self.usuario) < 4:
            return {"Falha": "Usuário deve ter pelo menos 4 caracteres"}
        if len(self.usuario) > 50:
            return {"Falha": "Usuário não pode ter mais de 50 caracteres"}
        return {"Sucesso": "Usuário válido"}
    
    def validar_nome(self):
        if not self.nome:
            return {"Falha": "Nome não pode estar vazio"}
        if len(self.nome) < 3:
            return {"Falha": "Nome deve ter pelo menos 3 caracteres"}
        if len(self.nome) > 100:
            return {"Falha": "Nome não pode ter mais de 100 caracteres"}
        return {"Sucesso": "Nome válido"}
    
    def validar_email(self):
        if not self.email:
            return {"Falha": "E-mail não pode estar vazio"}
        if len(self.email) < 5:
            return {"Falha": "E-mail deve ter pelo menos 5 caracteres"}
        if len(self.email) > 100:
            return {"Falha": "E-mail não pode ter mais de 100 caracteres"}
        if "@" not in self.email or "." not in self.email:
            return {"Falha": "E-mail deve conter '@' e '.'"}
        return {"Sucesso": "E-mail válido"}
    
    def validar_senha(self):
        if not self.senha:
            return {"Falha": "Senha não pode estar vazia"}
        if len(self.senha) < 6:
            return {"Falha": "Senha deve ter pelo menos 6 caracteres"}
        if len(self.senha) > 50:
            return {"Falha": "Senha não pode ter mais de 50 caracteres"}
        if self.senha != self.c_senha:
            return {"Falha": "Senhas não coincidem"}
        if not any(x.isupper() for x in self.senha):
            return {"Falha": "Senha deve conter pelo menos uma letra maiúscula"}
        return {"Sucesso": "Senha válida"}
    
    def validar_tudo(self):
        erros = {}
        for campo, metodo in {
            "usuario": self.validar_usuario,
            "nome": self.validar_nome,
            "email": self.validar_email,
            "senha": self.validar_senha
        }.items():
            resultado = metodo()
            if "Falha" in resultado:
                erros[campo] = resultado["Falha"]
        
        print(True if not erros else serializers.ValidationError({"Erros": erros}, code=status.HTTP_400_BAD_REQUEST))
        return [True, 'Sucesso'] if not erros else [False, serializers.ValidationError({"Erros": erros}, code=status.HTTP_400_BAD_REQUEST)]


# s = ValidacaoAutenticacao('usuario.aaaa', 'nomeaaaaaaaaaa', 'email@gmail.com', 'senhA-123', 'senhA-123')

# print(s.validar_tudo())