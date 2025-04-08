import { HttpException, HttpStatus, Logger, Req, UnauthorizedException, UseGuards } from "@nestjs/common";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Socket, Server, ServerOptions } from "socket.io";
import { ChatService } from "./chat.service";
import { AuthGuard } from "@nestjs/passport";
import { Collaborator, CollaboratorDocument, Customer, CustomerDocument, GetUserByToken, GetUserByTokenSocket, UserSystem, UserSystemDocument } from "src/@core";
import { WsGuard } from "src/@core/interceptor/wsguard";
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { MessageService } from '../message/message.service';
import { messageDTO } from "src/@core/dto/chat.dto";
import { RoomService } from '../room/room.service';
import { UserSystemRepositoryService } from "src/@repositories/repository-service/user-system-repository/user-system-repository.service";

// @UseGuards(AuthGuard('jwt_customer'))
// @WebSocketGateway(5001, { cors: '*:*', path: '/websockets', serveClient: true, namespace: '/' })
@WebSocketGateway({ cors: '*:*', serveClient: true, namespace: '/' })
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() wss: Server;
  private logger: Logger = new Logger("AppGateWay");
  constructor(
    private chatService: ChatService,
    private jwtService: JwtService,
    private messageService: MessageService,
    private roomService: RoomService,
    private userSystemRepositoryService: UserSystemRepositoryService,
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    @InjectModel(Collaborator.name) private collaboratorModel: Model<CollaboratorDocument>,
  ) { }

  afterInit(server: Server) {
    this.logger.log(server, 'ChatGateway');
  }

  @UseGuards(WsGuard)
  async handleConnection(
    client: Socket,
  ) {
    this.logger.log(`Client connection: ${client.id}`);
    if (!await this.auth(client)) {
      client.disconnect()
      // client.emit('leftRoom', room);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnection: ${client.id}`)
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('msgToServer')
  async handleMessage(
    @MessageBody() data: any,
    @GetUserByTokenSocket() user: any
  ) {
    let typeUser = user.pay_point ? 'customer' : (user.id_role_admin ? 'admin' : 'collaborator');
    const newPayload: messageDTO = {
      id_sender: user._id,
      message: data.message,
      id_room: data.idRoom,
      images: [],
      type_user: typeUser,
    }
    const message = await this.messageService.saveMessage('vi', newPayload)
    this.wss.to(data.idRoom).emit('msgToClient', message)
    const getRoom = await this.roomService.getRoomById('vi', data.idRoom);
    this.wss.to(`${getRoom.id_customer["client_id"]}`).emit('pushRoom', getRoom)
    this.wss.to(`${getRoom.id_collaborator["client_id"]}`).emit('pushRoom', getRoom)
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('joinRoom')
  handleRoomJoin(
    // @GetUserByTokenSocket() user: any,
    client: Socket,
    room: string,
  ) {
    console.log('join room ', room);
    client.join(room);
    client.emit('joinedRoom', room);
  }

  @SubscribeMessage('leaveRoom')
  handleRoomLeave(client: Socket, room: string) {
    console.log('leave room ', room);
    client.leave(room);
    client.emit('leftRoom', room);
  }


  async auth(client) {
    try {
      if (client.handshake.headers.authorization && client.handshake.headers.authorization.split(' ')[1]) {
        const bearerToken = client.handshake.headers.authorization.split(' ')[1];
        const decoded = await this.jwtService.verify(bearerToken) as any;
        const findCustomer = await this.customerModel.findById(decoded._id);
        const findCollaborator = await this.collaboratorModel.findById(decoded._id);
        if (findCustomer) {
          findCustomer.client_id = client.id;
          await findCustomer.save();
        }
        if (findCollaborator) {
          findCollaborator.client_id = client.id;
          await findCollaborator.save();
        }
        return findCustomer || findCollaborator;
      } return false;
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    }
  }
}
