import { Catch, WsExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

@Catch(WsException)
export class WebSocketException implements WsExceptionFilter {
  catch(exception: WsException, host: ArgumentsHost) {
    const client = host.switchToWs().getClient();
    const data = host.switchToWs().getData();
    console.log(client, 'client error');
    console.log(data, 'data error');

    
    client.emit('error', {
      status: 'error',
      message: exception.message,
    });
  }
}