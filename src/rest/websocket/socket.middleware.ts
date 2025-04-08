import { AuthenticatedSocket } from 'src/@core/interface'
import { WsJwtGuard } from './ws-jwt.guard'

type SocketIOMiddleWare = {
  (client: AuthenticatedSocket, next: (err?: Error) => void)
}

export const SocketAuthMiddleware = (): SocketIOMiddleWare => {
  return async (client, next) => {
    try {
      const payload = await WsJwtGuard.validateToken(client) as any
      
      if(payload?.iscronjob) {
        client.iscronjob = true
      } else {
        client.payload = payload
      }

      next()
    } catch (error) {
      next(error)
    }
  }
}


