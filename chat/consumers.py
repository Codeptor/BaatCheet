import json
from channels.generic.websocket import AsyncWebsocketConsumer

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')

        if message_type == 'join-room':
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'user_connected',
                    'username': data.get('username')
                }
            )
        elif message_type == 'offer':
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'webrtc_offer',
                    'offer': data.get('offer')
                }
            )
        elif message_type == 'answer':
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'webrtc_answer',
                    'answer': data.get('answer')
                }
            )
        elif message_type == 'ice-candidate':
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'webrtc_ice',
                    'candidate': data.get('candidate')
                }
            )
        elif message_type == 'chat-message':
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': data.get('message')
                }
            )

    async def user_connected(self, event):
        await self.send(text_data=json.dumps({
            'type': 'user-connected',
            'username': event['username']
        }))

    async def webrtc_offer(self, event):
        await self.send(text_data=json.dumps({
            'type': 'offer',
            'offer': event['offer']
        }))

    async def webrtc_answer(self, event):
        await self.send(text_data=json.dumps({
            'type': 'answer',
            'answer': event['answer']
        }))

    async def webrtc_ice(self, event):
        await self.send(text_data=json.dumps({
            'type': 'ice-candidate',
            'candidate': event['candidate']
        }))

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'chat-message',
            'message': event['message']
        }))
