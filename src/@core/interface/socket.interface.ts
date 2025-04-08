import { Socket } from 'socket.io'

export interface AuthenticatedSocket extends Socket {
  payload?: any;
  iscronjob?: boolean;
}
