from rest_framework.response import Response

def dumpTokens():
    res = Response()
    
    try:
        res.data = {'Alerta': 'A operação foi um sucesso!'}
        res.delete_cookie('access_token', path='/', samesite='None')
        res.delete_cookie('refresh_token', path='/', samesite='None')
    except:
        res.data = {'Alerta': 'Não foi possível deslogar o usuário.'}
        res.status_code = 400
        return res

    return res