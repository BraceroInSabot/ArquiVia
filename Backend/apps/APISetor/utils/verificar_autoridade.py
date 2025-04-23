from apps.APISetor.models import Setor, Colaborador_Setor

def is_Gestor(user):
    infoADM: dict = {}

    setor = Setor.objects.filter(colaborador_setor__codigoColaborador=user).first()
    cSetor = Colaborador_Setor.objects.filter(
        codigoColaborador=user, 
        codigoSetor=setor).first()
    
    if (setor.codigoColaboradorGestor == user):
        infoADM['Gestor'] = True
    else:
        infoADM['Gestor'] = False

    if (cSetor.administradorColaboradorSetor == True):
        infoADM['ADM'] = True
    else:
        infoADM['ADM'] = False

    return infoADM