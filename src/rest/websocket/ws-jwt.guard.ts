import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common"
import { verify } from "jsonwebtoken"
import * as ping from 'ping'
import { Observable } from "rxjs"
import { Socket } from "socket.io"
import { NUMBERIC_HOST } from "src/@core"
import { AuthenticatedSocket } from "src/@core/interface"

@Injectable()
export class WsJwtGuard implements CanActivate {
    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean | any | Promise<boolean | any> | Observable<boolean | any>> {
      if (context.getType() !== 'ws') {
        return true
      }

      const client: Socket = context.switchToWs().getClient()
      WsJwtGuard.validateToken(client)

      return true
    }

  static async validateToken(client: AuthenticatedSocket) {
    if(client.handshake.headers?.authorization) {
      const token = client.handshake.headers.authorization.split(' ')[1]
      const payload = verify(token, 'sondanh2501#');

      if (!payload) {
        throw new UnauthorizedException();
      }
      return payload
    }

    if (client.handshake.headers?.iscronjob) {
      const host = new URL(`http://${client.handshake.headers.host}`).hostname;
      const res = await ping.promise.probe(host);

      if (!res) {
        throw new UnauthorizedException();
      }
      
      if (res.numeric_host.toString().slice(0, -1) === NUMBERIC_HOST.toString()) {
        return { iscronjob: true }
      } else {
        throw new UnauthorizedException();
      }
    }
  }
}


