from typing import List, Union
from django.contrib.auth import get_user_model

User = get_user_model()

class ValidateAuth:
    def __init__(self, username=None, name=None, email=None, password=None, c_password=None):
        self.username = username
        self.name = name
        self.email = email
        self.password = password
        self.c_password = c_password

    def validate_username(self) -> bool | List[str]:
        if not self.username:
            return ["Usuário não pode estar vazio"]
        if len(self.username) < 4:
            return ["Usuário deve ter pelo menos 4 caracteres"]
        if len(self.username) > 50:
            return ["Usuário não pode ter mais de 50 caracteres"]
        if User.objects.filter(username=self.username).exists():
            return ["Usuário já está em uso"]
        return True

    def validate_name(self) -> bool | List[str]:
        if not self.name:
            return ["Nome não pode estar vazio"]
        if len(self.name) < 3:
            return ["Nome deve ter pelo menos 3 caracteres"]
        if len(self.name) > 100:
            return ["Nome não pode ter mais de 100 caracteres"]
        return True

    def validate_email(self) -> bool | List[str]:
        if not self.email:
            return ["E-mail não pode estar vazio"]
        if len(self.email) < 5:
            return ["E-mail deve ter pelo menos 5 caracteres"]
        if len(self.email) > 100:
            return ["E-mail não pode ter mais de 100 caracteres"]
        if User.objects.filter(email=self.email).exists():
            return ["E-mail já está em uso"]
        if "@" not in self.email or "." not in self.email:
            return ["E-mail deve conter '@' e '.'"]
        return True

    def validate_password(self) -> bool | List[str]:
        if not self.password:
            return ["Senha não pode estar vazia"]
        if len(self.password) < 6:
            return ["Senha deve ter pelo menos 6 caracteres"]
        if len(self.password) > 50:
            return ["Senha não pode ter mais de 50 caracteres"]
        if self.password != self.c_password:
            return ["Senhas não coincidem"]
        if not any(x.isupper() for x in self.password):
            return ["Senha deve conter pelo menos uma letra maiúscula"]
        if not any(char in "!@#$%^&*()-_+=" for char in self.password):
            return ["Senha deve conter pelo menos um caractere especial. (!@#$%^&*()-_+=)"]
        if not any(char.isdigit() for char in self.password):
            return ["Senha deve conter pelo menos um número de 0 a 9."]
        return True

    def validate(self) -> Union[bool, List[Union[bool, List[str]]]]:
        validations = {
            "Usuário": self.validate_username,
            "Nome": self.validate_name,
            "Email": self.validate_email,
            "Senha": self.validate_password
        }

        ret: list = list()
        
        for attribute, function in validations.items():
            if function() is True and type(function()) is bool:
                continue

            response: List[str] = function() #type: ignore
            
            for error in response:
                ret.append(error)

        return ret
