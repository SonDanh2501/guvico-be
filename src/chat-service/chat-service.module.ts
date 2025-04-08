import { Module } from '@nestjs/common';
import { ChatController } from './chat/chat.controller';
import { ChatGateway } from './chat/chat.gateway';
import { ChatService } from './chat/chat.service';
import { MongooseModule } from '@nestjs/mongoose';
import { RoomController } from './room/room.controller';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { RoomService } from './room/room.service';
import { Message, messageSchema } from './@schemas/message.schema';
import { Room, roomSchema } from './@schemas/room.schema';
import { UserModule } from './user/user.module';



@Module({
  imports: [
    // MongooseModule.forRoot('mongodb://localhost:27017/chat-guvi'),
    MongooseModule.forRoot('mongodb+srv://patitek:vitinh123@cluster0.l78do.mongodb.net/guvi-chat'),
    MongooseModule.forFeature([
      { name: Message.name, schema: messageSchema },
      { name: Room.name, schema: roomSchema }
    ]),
    UserModule
  ],
  controllers: [ChatController, RoomController, UserController],
  providers: [ChatService, ChatGateway, UserService, RoomService]
})
export class ChatServiceModule {}
