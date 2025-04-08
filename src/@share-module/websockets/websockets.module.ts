import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatController } from './chat/chat.controller';
import { RoomController } from './room/room.controller';
import { ChatGateway } from './chat/chat.gateway';
import { ChatService } from './chat/chat.service';
import { RoomService } from './room/room.service';
import { BASEPOINT_DB, Collaborator, Customer, GlobalService, JwtStrategy, JwtStrategyChat, JwtStrategySocket, Order, UserSystem, collaboratorSchema, customerSchema, orderSchema, userSystemSchema } from 'src/@core';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { CustomExceptionService } from '../custom-exception/custom-exception.service';
import { MessageService } from './message/message.service';
import { MessageController } from './message/message.controller';
import { GeneralHandleModule } from '../general-handle/general-handle.module';
import { Room, roomSchema } from '../../@core/db/schema/room.schema';
import { Message, messageSchema } from '../../@core/db/schema/message.schema';

@Module({
  imports: [
    MongooseModule.forRoot(BASEPOINT_DB),
    MongooseModule.forFeature([
      { name: Message.name, schema: messageSchema },
      { name: Room.name, schema: roomSchema },
      { name: Customer.name, schema: customerSchema },
      { name: Collaborator.name, schema: collaboratorSchema },
      { name: Order.name, schema: orderSchema },
      { name: UserSystem.name, schema: userSystemSchema },
    ]),
    PassportModule,
    JwtModule.register({
      secret: 'sondanh2501#',
      signOptions: {
        expiresIn: '365d',
      },
    }),
    GeneralHandleModule
  ],
  controllers: [ChatController, RoomController, MessageController],
  providers: [ChatService, ChatGateway, RoomService, JwtStrategy, JwtStrategySocket, CustomExceptionService, MessageService, JwtStrategyChat, GlobalService]
})
export class WebsocketsModule { }
