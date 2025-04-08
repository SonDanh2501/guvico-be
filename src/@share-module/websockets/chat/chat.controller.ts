import { Controller, Get, Param, Query } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller()
export class ChatController {

  constructor(private chatService: ChatService) { }

  @Get("/getConversations")
  async getConversations(@Query() query) {

    // if(!query.idRoom && !query.arrUser ) return false;

    // const iPage = {
    //   search: query.search || "",
    //   start: query.start || 0,
    //   limit: query.limit || 10,
    // }


    // const payload = (query.idRoom) ? {idRoom: query.idRoom} : {arrUser: query.arrUser.split(',').sort()}

    // const result = await this.chatService.getConversations( iPage, payload );
    // return result;
  }
}
