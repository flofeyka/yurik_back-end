import { Injectable } from '@nestjs/common';
import { OnGatewayConnection, WebSocketGateway } from '@nestjs/websockets';

@WebSocketGateway(
    {
        cors: {
            origin: "*"
        }
    }
)
@Injectable()
export class ChatService implements OnGatewayConnection {
    handleConnection(client: any, ...args: any[]) {
        
    }
}
