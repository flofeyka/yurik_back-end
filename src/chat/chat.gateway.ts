import { Injectable } from '@nestjs/common';
import {
    OnGatewayConnection,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@Injectable()
export class ChatGateway implements OnGatewayConnection {
  constructor(private readonly chatService: ChatService) {}

  @WebSocketServer() server: Server;

  handleConnection(client: any, ...args: any[]) {}

  @SubscribeMessage('sendMessage')
  handleMessage(client: Socket, message: any) {
    // this.chatService.createMessage()
    this.server.emit('reply', 'broadcasting...');
  }
}
