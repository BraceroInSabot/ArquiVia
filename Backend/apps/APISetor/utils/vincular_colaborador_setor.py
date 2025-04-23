from ..models import Setor, Colaborador_Setor, Codigo_Chave_Setor

def vincular(User, codigo):
    """
    Vincula um colaborador a um setor com base no código da chave do setor.

    Precisa alterar a maneira como ele retorna o erro.

    Args:
        User (_type_): _description_
        codigo (_type_): _description_

    Returns:
        _type_: _description_
    """
    try:
        print('comecou')
        codigo_chave = Codigo_Chave_Setor.objects.filter(chave=codigo).first()
        setor_chave = Setor.objects.get(codigoChave=codigo_chave.codigoChave)
        
        print(f'Código Chave: {codigo_chave}')
        print(f'Setor Chave: {setor_chave}')

        if not setor_chave.DoesNotExist:
            return False
        
        print(f'Setor encontrado: {setor_chave}')
        print(f'Usuário: {User.username}')
        
        col_setor = Colaborador_Setor(
            codigoSetor=setor_chave,  # Usa o ID correto do Setor
            codigoColaborador=User,  # Usa o ID correto do Usuário
            administradorColaboradorSetor=False
        )

        col_setor.save()
        print('Salvou!')
        return True  # Indica que deu certo

    except setor_chave.DoesNotExist:
        print('Setor não encontrado.')
        return False
    
    except Exception as e:
        print(f'Erro inesperado: {e}')
        return False
