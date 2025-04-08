import { forwardRef, Logger } from '@nestjs/common'
import { Inject, UseGuards } from '@nestjs/common/decorators'
import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { Server } from 'socket.io'
import { AuthenticatedSocket } from 'src/@core/interface'
import { STATUS_SEND_SOCKET } from 'src/@repositories/module/mongodb/@database/enum/notification.enum'
import { CollaboratorSystemService } from 'src/core-system/@core-system/collaborator-system/collaborator-system.service'
import { NotificationSystemService } from 'src/core-system/@core-system/notification-system/notification-system.service'
import { SocketAuthMiddleware } from '../socket.middleware'
import { WsJwtGuard } from '../ws-jwt.guard'

@WebSocketGateway( 
    { 
      cors: { origin: '*' }, 
      namespace: 'gateway/collaborator', 
      transports: ['websocket'],
      pingInterval: 15000,
      pingTimeout: 10000 
    }
  )
@UseGuards(WsJwtGuard)
export class CollaboratorGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  constructor(
    @Inject(forwardRef(() => CollaboratorSystemService))
    private collaboratorSystemService: CollaboratorSystemService,
    @Inject(forwardRef(() => NotificationSystemService))
    private notificationSystemService: NotificationSystemService
  ) {}

  // Lưu trữ client với userId làm key và socket làm value
  private clients: Map<string, AuthenticatedSocket> = new Map();

  afterInit(client: AuthenticatedSocket) {
    client.use(SocketAuthMiddleware() as any)
    Logger.log('afterInit')
  }

  async handleConnection(client: AuthenticatedSocket,...args: any[]) {
    const handshake = client.handshake;
    const handshakeSize = Buffer.byteLength(JSON.stringify(handshake), 'utf8');
    console.log(`Handshake size: ${handshakeSize} bytes`);
    
    const collaborator = await this.collaboratorSystemService.updateSessionSocketCollaborator(client, false)

    if(!collaborator) {
      client.disconnect();
      return
    }

    this.clients.set(collaborator._id.toString(), client);    
    
    console.log('Client connected:', collaborator._id.toString());
  }

  async handleDisconnect(client: any) {
    const collaborator = await this.collaboratorSystemService.updateSessionSocketCollaborator(client, true)
    if(collaborator) {
      this.clients.delete(collaborator._id.toString());
      console.log('Client disconnected:', collaborator._id.toString());
    }
    client.disconnect();
  }

  @SubscribeMessage('respondNotificationToServer')
  async respondNotificationToServer(@MessageBody() data:any) {
    return await this.notificationSystemService.updateStatusSendSocket('vi', data.id, STATUS_SEND_SOCKET.done)
  }
}
