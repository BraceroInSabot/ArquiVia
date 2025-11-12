from django.urls import path

from .views import ( 
    AttachFileToDocumentView,
    CreateDocumentView,
    ListAttachedFilesToDocumentView,
    ListDocumentsView,
    RetrieveDocumentView,
    UpdateDocumentView,
    ActivateOrDeactivateDocumentView,
    DeleteDocumentView,
    DetachFileToDocumentView
    )

from .classificationUtils.urls import classification_urlpatterns
from .categoryUtils.urls import category_urlpatterns

urlpatterns = [
    path("criar/", CreateDocumentView.as_view(), name="criar-documento"),
    path("consultar/<int:pk>/", RetrieveDocumentView.as_view(), name="consultar-documento"),
    path("visualizar/", ListDocumentsView.as_view(), name="visualizar-documentos"),
    path("alterar/<int:pk>/", UpdateDocumentView.as_view(), name="alterar-documento"),
    path("ativar-desativar/<int:pk>/", ActivateOrDeactivateDocumentView.as_view(), name="ativar-ou-desativar-documento"),
    path("excluir/<int:pk>/", DeleteDocumentView.as_view(), name="excluir-documento"),
    
    # Attach Documents
    
    path("<int:pk>/anexar-arquivo/", AttachFileToDocumentView.as_view(), name='anexar-arquivo'),
    path("<int:pk>/desanexar-arquivo/", DetachFileToDocumentView.as_view(), name='desanexar-arquivo'),
    path("<int:pk>/arquivos-anexados/", ListAttachedFilesToDocumentView.as_view(), name='listar-arquivos-anexados')
] + classification_urlpatterns + category_urlpatterns