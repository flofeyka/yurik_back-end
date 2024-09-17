import { Injectable } from '@nestjs/common';
import { MessageBody, OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Message } from './entities/chat.message.entity';
import { Socket, Server } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway(
    {
        cors: {
            origin: "*"
        }
    }
)
@Injectable()
export class ChatGateway implements OnGatewayConnection {
    constructor(private readonly chatService: ChatService) {}

    @WebSocketServer() server: Server

    handleConnection(client: any, ...args: any[]) {
    }

    @SubscribeMessage('sendMessage')
    handleMessage(client: Socket, message: any) {
        // this.chatService.createMessage()
        this.server.emit('reply', 'broadcasting...')
    }
}
