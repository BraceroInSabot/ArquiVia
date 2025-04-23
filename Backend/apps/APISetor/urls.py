from .views import ( 
    SetorADM, 
    SetorView, 
    UpdateADMSetorView, 
    DeactivateReactivateSetorView, 
    updateCollaboratorSetorView,
    createCodigoChave,
)

from django.urls import path

urlpatterns = [
    path("setor/admin", SetorADM.as_view()),
    path("setor/info", SetorView.as_view()),
    path("setor/alterar-adm", UpdateADMSetorView.as_view()), 
    path("setor/desativar-reativar-colaborador", DeactivateReactivateSetorView.as_view()),
    path("setor/alterar-dados-colaborador", updateCollaboratorSetorView.as_view()),
    path("setor/criar-codigo-chave", createCodigoChave.as_view())
]
