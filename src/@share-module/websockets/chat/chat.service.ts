import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RoomService } from '../room/room.service';

@Injectable()
export class ChatService {
  constructor(
    private roomService: RoomService
  ) { }

  //   async getConversations(iPage: any, payload: any) {
  //     if(payload.idRoom) {
  //     // const findRoom = await this.roomService.findItemById(payload.idRoom);
  //     const query = {
  //       $and: [{
  //           $or: [{
  //             message: {
  //               $regex: iPage.search,
  //               $options: "i"
  //             }
  //           }, ]
  //         },
  //       ]
  //     }
  //     const countMessages = await this.messageModel.count(query);
  //     const getMessages = await this.messageModel.find(query).skip(iPage.start).limit(iPage.limit);

  //     const result = {
  //       idRoom: findRoom._id,
  //       mess: {
  //         search: iPage.search,
  //         start: iPage.start,
  //         limit: iPage.limit || 10,
  //         total: countMessages,
  //         data: getMessages
  //       }
  //     }
  //     return result;
  //     }

  //     if(payload.arrUser.length > 0) {
  //       const findRoom = await this.roomService.findItemByArrUser(payload.arrUser)


  //       let countMessages = 0
  //       let getMessages = [];

  //       if(findRoom.status = "old") {
  //         const query = {
  //           $and: [{
  //               $or: [{
  //                 message: {
  //                   $regex: iPage.search,
  //                   $options: "i"
  //                 }
  //               }, ]
  //             },
  //             {
  //               idRoom: findRoom.room._id
  //             }
  //           ]
  //         }
  //         countMessages = await this.messageModel.count(query);
  //         getMessages = await this.messageModel.find(query).skip(iPage.start).limit(iPage.limit);
  //       }

  //       const result = {
  //         idRoom: findRoom.room._id,
  //         mess: {
  //           search: iPage.search,
  //           start: iPage.start,
  //           limit: iPage.limit || 10,
  //           total: countMessages,
  //           data: getMessages
  //         }
  //       }

  //       return result;
  //     }
  //   }

  // saveMessage(payload: any) {
  //   const newMessage = new this.messageModel({
  //       message: payload.msg || "",
  //       sender: payload.sender,
  //       type: payload.type || "text",
  //       idRoom: payload.idRoom.toString() || "",
  //       date_create: new Date().toISOString()
  //   })
  //   console.log(newMessage, 'newMessage');

  //   return newMessage.save();
  // }
}
