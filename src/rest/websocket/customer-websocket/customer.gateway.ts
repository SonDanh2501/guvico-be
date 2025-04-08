import { forwardRef, Logger } from '@nestjs/common'
import { Inject, UseGuards } from '@nestjs/common/decorators'
import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets'
import { Server } from 'socket.io'
import { AuthenticatedSocket } from 'src/@core/interface'
import { STATUS_SEND_SOCKET } from 'src/@repositories/module/mongodb/@database/enum/notification.enum'
import { CustomerSystemService } from 'src/core-system/@core-system/customer-system/customer-system.service'
import { NotificationSystemService } from 'src/core-system/@core-system/notification-system/notification-system.service'
import { SocketAuthMiddleware } from '../socket.middleware'
import { WsJwtGuard } from '../ws-jwt.guard'
// import { WebSocketException } from 'src/@core/exception/web-socket-exception'

// @UseFilters(new WebSocketException())
@WebSocketGateway( 
      { 
        cors: { origin: '*' }, 
        namespace: 'gateway/customer', 
        transports: ['websocket'],
        pingInterval: 15000,
        pingTimeout: 10000 
      }
    )
@UseGuards(WsJwtGuard)
export class CustomerGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{

  @WebSocketServer() server: Server;
  
  constructor(
    @Inject(forwardRef(() => CustomerSystemService))
    private customerSystemService: CustomerSystemService,
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
    
    const customer = await this.customerSystemService.updateSessionSocketCustomer(client, false)

    if(!customer) {
      client.disconnect();
      return
    }

    this.clients.set(customer._id.toString(), client);    

    console.log('Client connected:', customer._id.toString());
  }

  async handleDisconnect(client: any) {
    const customer = await this.customerSystemService.updateSessionSocketCustomer(client, true)

    if(customer) {
      this.clients.delete(customer._id.toString());
      console.log('Client disconnected:', customer._id.toString());
    }
    client.disconnect();
  }

  @SubscribeMessage('respondNotificationToServer')
  async respondNotificationToServer(@MessageBody() data:any) {
    return await this.notificationSystemService.updateStatusSendSocket('vi', data.id, STATUS_SEND_SOCKET.done)
  }
  
  @SubscribeMessage('respondMarketingNotificationToServer')
  async respondMarketingNotificationToServer(@MessageBody() data:any) {
    return await this.notificationSystemService.updateStatusSendSocket('vi', data.id, STATUS_SEND_SOCKET.done)
  }
  
  @SubscribeMessage('checkConnectToServer')
  async checkConnectToServer() {
    console.log('Có kết nối với server!')
  }
}
