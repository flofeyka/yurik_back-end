import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import { UUID } from 'crypto';
import { Socket } from 'dgram';
import { Server } from 'http';
import { ChatService } from './chat.service';

@WebSocketGateway({})
export class ChatGateway {
  constructor(private readonly chatService: ChatService) {}

  @WebSocketServer() server: Server;

  // handleConnection(client: any, ...args: any[]) {}

  @SubscribeMessage('chat_messages')
  async handleMessage(client: Socket, payload: {
    id: UUID,
    message: string,

  }) {
    await this.chatService.createMessage(payload.id, payload.message);
  }

  @SubscribeMessage('chats_messages')
  handleChatsMessage(client: Socket, message: any) {

  }
}
