from typing import List, Union


class ValidateAuth:
    def __init__(self, username=None, name=None, email=None, password=None, c_password=None):
        self.username = username
        self.name = name
        self.email = email
        self.password = password
        self.c_password = c_password

    def validate_username(self) -> List[Union[bool, str]]:
        if not self.username:
            return [False, "Usuário não pode estar vazio"]
        if len(self.username) < 4:
            return [False, "Usuário deve ter pelo menos 4 caracteres"]
        if len(self.username) > 50:
            return [False, "Usuário não pode ter mais de 50 caracteres"]
        return [True, "Usuário válido"]

    def validate_name(self) -> List[Union[bool, str]]:
        if not self.name:
            return [False, "Nome não pode estar vazio"]
        if len(self.name) < 3:
            return [False, "Nome deve ter pelo menos 3 caracteres"]
        if len(self.name) > 100:
            return [False, "Nome não pode ter mais de 100 caracteres"]
        return [True, "Nome válido"]

    def validate_email(self) -> List[Union[bool, str]]:
        if not self.email:
            return [False, "E-mail não pode estar vazio"]
        if len(self.email) < 5:
            return [False, "E-mail deve ter pelo menos 5 caracteres"]
        if len(self.email) > 100:
            return [False, "E-mail não pode ter mais de 100 caracteres"]
        if "@" not in self.email or "." not in self.email:
            return [False, "E-mail deve conter '@' e '.'"]
        return [True, "E-mail válido"]

    def validate_password(self) -> List[Union[bool, str]]:
        if not self.password:
            return [False, "Senha não pode estar vazia"]
        if len(self.password) < 6:
            return [False, "Senha deve ter pelo menos 6 caracteres"]
        if len(self.password) > 50:
            return [False, "Senha não pode ter mais de 50 caracteres"]
        if self.password != self.c_password:
            return [False, "Senhas não coincidem"]
        if not any(x.isupper() for x in self.password):
            return [False, "Senha deve conter pelo menos uma letra maiúscula"]
        if not any(char in "!@#$%^&*()-_+=" for char in self.password):
            return [False, "Senha deve conter pelo menos um caractere especial. (!@#$%^&*()-_+=)"]
        if not any(char.isdigit() for char in self.password):
            return [False, "Senha deve conter pelo menos um número de 0 a 9."]
        return [True, "Senha válida"]

    def validate(self) -> Union[bool, List[Union[bool, List[str]]]]:
        validations = {
            "Usuário": self.validate_username,
            "Nome": self.validate_name,
            "Email": self.validate_email,
            "Senha": self.validate_password
        }

        for attribute, function in validations.items():
            response = function()
            if not response[0]:
                return [False, [attribute, response[1]]]

        return True
