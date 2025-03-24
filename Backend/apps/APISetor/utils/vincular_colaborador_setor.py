from ..models import Setor, Colaborador_Setor

def vincular(User, codigo):
    try:
        print('comecou')
        setor_chave = Setor.objects.get(codigoChave=codigo)  # Busca um setor único
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
