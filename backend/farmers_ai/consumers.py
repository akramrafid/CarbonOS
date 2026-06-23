import json
from channels.generic.websocket import AsyncWebsocketConsumer

class InferenceConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.group_name = 'inference_updates'
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def send_status(self, event):
        status_msg = event['status']
        await self.send(text_data=json.dumps({'status': status_msg}))
