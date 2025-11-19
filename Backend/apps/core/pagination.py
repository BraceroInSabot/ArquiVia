from rest_framework.pagination import PageNumberPagination

class DocumentPagination(PageNumberPagination):
    """
    Paginação personalizada para documentos.
    Padrão: 21 itens por página.
    """
    page_size = 21
    page_size_query_param = 'page_size'
    max_page_size = 100
    page_query_param = 'page'