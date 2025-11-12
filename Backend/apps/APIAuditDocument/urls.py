from django.urls import path
from .views import DocumentHistoryListView, DocumentRevertView

urlpatterns = [
    path("<int:pk>/historico/", DocumentHistoryListView.as_view(), name="historico-documento"),
    path("<int:pk>/reverter/<int:history_id>/", DocumentRevertView.as_view(), name="reverter-documento"),
]
