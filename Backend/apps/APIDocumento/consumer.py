# apps/APIDocumento/consumer.py
from channels.generic.websocket import AsyncWebsocketConsumer
from django_redis import get_redis_connection
from asgiref.sync import sync_to_async
from apps.core.tasks import persist_document_task
from .models import Document

class DocumentConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.doc_id = self.scope['url_route']['kwargs']['pk'] #type: ignore
        self.room_group_name = f'doc_{self.doc_id}'
        self.redis_queue_key = f'yjs_queue:{self.doc_id}'
        
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        # Envia estado inicial se existir (Opcional no modo Relay, mas bom para UX)
        # Usamos sync_to_async para ler do banco sem travar
        try:
            doc = await Document.objects.aget(pk=self.doc_id)
            if doc.yjs_state:
                # Envia como um Update inicial
                # Protocolo: [MsgSync=0] [Update=2] [Blob]
                await self.send(bytes_data=b'\x00\x02' + doc.yjs_state)
        except Document.DoesNotExist:
            pass

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        persist_document_task.delay(self.doc_id)

    async def receive(self, text_data=None, bytes_data=None):
        if not bytes_data: return
        
        # --- LÓGICA BLIND RELAY (CORRIGIDA) ---
        
        # 1. Salva na Fila do Redis (Append Only)
        # Usamos sync_to_async porque a lib do Redis é síncrona
        await self.push_to_redis(bytes_data)

        # 2. Broadcast Imediato
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'broadcast_raw',
                'bytes_data': bytes_data,
                'sender_channel_name': self.channel_name
            }
        )
        
        # 3. Trigger de Persistência (Debounce manual no Redis)
        # Verifica se já existe uma flag de "espera"
        if not await self.check_debounce():
            persist_document_task.delay(self.doc_id)
            await self.set_debounce()

    async def broadcast_raw(self, event):
        if self.channel_name != event['sender_channel_name']:
            await self.send(bytes_data=event['bytes_data'])

    # --- Métodos Auxiliares para Redis ---
    
    @sync_to_async
    def push_to_redis(self, data):
        con = get_redis_connection("default")
        con.rpush(self.redis_queue_key, data)
        con.expire(self.redis_queue_key, 3600) # Expira em 1h

    @sync_to_async
    def check_debounce(self):
        con = get_redis_connection("default")
        return con.exists(f"deb_persist_{self.doc_id}")

    @sync_to_async
    def set_debounce(self):
        con = get_redis_connection("default")
        con.set(f"deb_persist_{self.doc_id}", 1, ex=10) # 10 segundos