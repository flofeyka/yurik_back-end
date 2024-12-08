import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException
} from '@nestjs/websockets';
import { UUID } from 'crypto';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { ChatService } from './chat.service';

@WebSocketGateway({
  origin: true
})
export class ChatGateway {
  constructor(private readonly chatService: ChatService, private readonly authService: AuthService) { }

  @WebSocketServer() server: Server;
  public clients: { id: number, clientId: string }[] = [];

  async handleConnection(client: Socket, ...args: any[]) {
    try {
      const authHeader = client?.handshake?.headers.authorization.split(" ")[1];
      const candidat = await this.authService.findToken(authHeader);
      if (!candidat.isAuth) {
        throw new WsException("Пользователь неавторизован");
      }
      client.handshake.auth.id = candidat.userData.id;
      this.clients.push({
        id: candidat.userData.id,
        clientId: client.id
      });
    } catch (e) {
      console.log(e);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    this.clients = this.clients.filter((Client: { id: number; clientId: string }) => Client.clientId !== client.id);
  }

  @SubscribeMessage('chat_messages')
  async handleMessage(client: Socket, payload: {
    id: UUID,
    message: string,
  }) {

    const newMessage = await this.chatService.createMessage(payload.id, client.handshake.auth.id, payload.message);
    for (let i of newMessage.chat.members) {
      this.server.to(this.clients.find(client => client.id === i.id)?.clientId).emit('new_message', newMessage);
    }
  }
}
