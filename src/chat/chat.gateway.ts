import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import { UUID } from 'crypto';
import { Server } from 'http';
import { ChatService } from './chat.service';
import { AuthService } from 'src/auth/auth.service';
import { Socket } from 'socket.io';

@WebSocketGateway({})
export class ChatGateway {
  constructor(private readonly chatService: ChatService, private readonly authService: AuthService) { }

  @WebSocketServer() server: Server;

  async handleConnection(client: Socket, ...args: any[]) {
    const authHeader = client?.handshake?.headers.authorization.split(" ")[1];
    console.log(authHeader);
    try {
      const candidat = await this.authService.findToken(authHeader);
      if (!candidat.isAuth) {
        client.disconnect();
      }
      client.handshake.auth.id = candidat.userData.id;
    } catch(e) {
      console.log(e);
      client.disconnect();
    }
  }

  @SubscribeMessage('chat_messages')
  async handleMessage(client: Socket, payload: {
    id: UUID,
    message: string,
  }) {
    await this.chatService.createMessage(payload.id, client.handshake.auth.id, payload.message);
  }
}
