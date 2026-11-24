import json
from channels.generic.websocket import AsyncWebsocketConsumer


class InferenceConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope.get("user")
        if not user or not getattr(user, "is_authenticated", False):
            await self.close(code=4401)
            return
        # Scope updates per authenticated user instead of broadcasting across all tenants
        self.group_name = f"inference_updates_user_{user.id}"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def send_status(self, event):
        status_msg = event['status']
        await self.send(text_data=json.dumps({'status': status_msg}))
