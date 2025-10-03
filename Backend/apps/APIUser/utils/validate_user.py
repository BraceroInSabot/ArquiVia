from typing import List, Union, Optional, Callable, Dict
from django.contrib.auth import get_user_model

User = get_user_model()

class ValidateAuth:
    """
    A class to encapsulate the data validation logic for a new user.
    """
    def __init__(self, username: Optional[str] = None, name: Optional[str] = None, email: Optional[str] = None, password: Optional[str] = None, c_password: Optional[str] = None):
        """
        Initializes the validator with the user's data.

        Args:
            username (Optional[str]): The username to be validated.
            name (Optional[str]): The full name to be validated.
            email (Optional[str]): The email to be validated.
            password (Optional[str]): The password to be validated.
            c_password (Optional[str]): The password confirmation.
        """
        self.username: Optional[str] = username
        self.name: Optional[str] = name
        self.email: Optional[str] = email
        self.password: Optional[str] = password
        self.c_password: Optional[str] = c_password

    def validate_username(self) -> Union[bool, List[str]]:
        """
        Validates the username field.

        Returns:
            Union[bool, List[str]]: Returns True if valid, or a list of errors if invalid.
        """
        if not self.username:
            return ["Usuário não pode estar vazio"]
        if len(self.username) < 4:
            return ["Usuário deve ter pelo menos 4 caracteres"]
        if len(self.username) > 50:
            return ["Usuário não pode ter mais de 50 caracteres"]
        if User.objects.filter(username=self.username).exists():
            return ["Usuário já está em uso"]
        return True

    def validate_name(self) -> Union[bool, List[str]]:
        """
        Validates the name field.

        Returns:
            Union[bool, List[str]]: Returns True if valid, or a list of errors if invalid.
        """
        if not self.name:
            return ["Nome não pode estar vazio"]
        if len(self.name) < 3:
            return ["Nome deve ter pelo menos 3 caracteres"]
        if len(self.name) > 100:
            return ["Nome não pode ter mais de 100 caracteres"]
        return True

    def validate_email(self) -> Union[bool, List[str]]:
        """
        Validates the email field.

        Returns:
            Union[bool, List[str]]: Returns True if valid, or a list of errors if invalid.
        """
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

    def validate_password(self) -> Union[bool, List[str]]:
        """
        Validates the password field and its confirmation.

        Returns:
            Union[bool, List[str]]: Returns True if valid, or a list of errors if invalid.
        """
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

    def validate(self) -> List[str]:
        """
        Executes all validations and accumulates the errors.

        Returns:
            List[str]: A list containing all error messages found.
                       Returns an empty list if all data is valid.
        """
        validations: Dict[str, Callable[[], Union[bool, List[str]]]] = {
            "Usuário": self.validate_username,
            "Nome": self.validate_name,
            "Email": self.validate_email,
            "Senha": self.validate_password
        }

        ret: List[str] = list()
        
        for attribute, function in validations.items():
            if function() is True and type(function()) is bool:
                continue

            response: List[str] = function() #type: ignore
            
            for error in response:
                ret.append(error)

        return ret