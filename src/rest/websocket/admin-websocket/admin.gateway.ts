import { forwardRef, Logger } from '@nestjs/common'
import { Inject, UseGuards } from '@nestjs/common/decorators'
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { Server } from 'socket.io'
import { AuthenticatedSocket } from 'src/@core/interface'
import { NotificationSystemService } from 'src/core-system/@core-system/notification-system/notification-system.service'
import { UserSystemSystemService } from 'src/core-system/@core-system/user-system-system/user-system-system.service'
import { SocketAuthMiddleware } from '../socket.middleware'
import { WsJwtGuard } from '../ws-jwt.guard'

@WebSocketGateway( 
    { 
      cors: { origin: '*' }, 
      namespace: 'gateway/admin', 
      transports: ['websocket'], 
    }
  )
@UseGuards(WsJwtGuard)
export class AdminGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  constructor(
    @Inject(forwardRef(() => UserSystemSystemService))
    private userSystemSystemService: UserSystemSystemService,
    @Inject(forwardRef(() => NotificationSystemService))
    private notificationSystemService: NotificationSystemService,
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
    
    if(!handshake.headers?.iscronjob) {
      const admin = await this.userSystemSystemService.updateSessionSocketAdmin(client, false)

      if(!admin) {
        client.disconnect();
        return
      }

      this.clients.set(admin._id.toString(), client);    
      
      console.log('Client connected:', admin._id.toString());
    } else {
      console.log('Client connected:', 'Cronjob');
    }
  }

  async handleDisconnect(client: any) {
    const admin = await this.userSystemSystemService.updateSessionSocketAdmin(client, true)
    if(admin) {
      this.clients.delete(admin._id.toString());
      console.log('Client disconnected:', admin._id.toString());
    }

    client.disconnect();
  }

  @SubscribeMessage('cronjobForCustomerToServer')
  async cronjobForCustomerToServer() {
    return await this.notificationSystemService.sendNotificationScheduleForCustomer()
  }

  @SubscribeMessage('cronjobForCollaboratorToServer')
  async cronjobForCollaboratorToServer() {
    return await this.notificationSystemService.sendNotificationScheduleForCollaborator()
  }
}
