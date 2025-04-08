import { Logger } from "@nestjs/common";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Socket, Server, ServerOptions} from "socket.io";
import { ChatService } from "./chat.service";


@WebSocketGateway({cors: '*:*'})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
 @WebSocketServer() wss: Server;
  private logger: Logger = new Logger("AppGateWay");
  constructor(private chatService: ChatService) {}

  afterInit(server: Server) {
    this.logger.log('ChatGateway');
  }

  handleConnection (client: Socket, ...args: any[]) {
    // console.log(client, 'client');
    console.log(client.handshake.query.idUser, 'client');
    this.logger.log(`Client connection: ${client.id}`)
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnection: ${client.id}`)
  }


  @SubscribeMessage('msgToServer')
  handleMessage(@MessageBody() data: any): void {
    console.log(data, 'message');
    this.chatService.saveMessage(data)
    this.wss.to(data.idRoom).emit('msgToClient', {data})
    // this.wss.emit('msgToClient', {data})
  }

  @SubscribeMessage('joinRoom')
  handleRoomJoin(client: Socket, room: string ) {
    client.join(room);
    client.emit('joinedRoom', room);
  }

  @SubscribeMessage('leaveRoom')
  handleRoomLeave(client: Socket, room: string ) {
    client.leave(room);
    client.emit('leftRoom', room);
  }
}
