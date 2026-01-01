from django.urls import re_path
from .consumer import DocumentConsumer

websocket_urlpatterns = [
    re_path(r'ws/editor/(?P<pk>\d+)/$', DocumentConsumer.as_asgi()), # type: ignore
]