import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Collaborator, CollaboratorDocument, Customer, CustomerDocument, ERROR, Message, MessageDocument, Order, OrderDocument, Room, RoomDocument, iPageDTO } from 'src/@core';
import { messageDTO } from 'src/@core/dto/chat.dto';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';
import { GeneralHandleService } from 'src/@share-module/general-handle/general-handle.service';

@Injectable()
export class MessageService {
    constructor(
        private generalHandleService: GeneralHandleService,
        private customExceptionService: CustomExceptionService,
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        @InjectModel(Room.name) private roomModel: Model<RoomDocument>,
        @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
        @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
        @InjectModel(Collaborator.name) private collaboratorModel: Model<CollaboratorDocument>,

    ) { }

    async getMessage(lang, iPage: iPageDTO, idRoom, user) {
        try {
            const query = {
                $and: [
                    { is_delete: false },
                    // {
                    //     $or: [
                    //         { id_customer: user._id },
                    //         { id_collaborator: user._id },
                    //     ]
                    // },
                    { id_room: idRoom }
                ]
            }
            const getMessage = await this.messageModel.find(query)
                .populate({ path: 'id_collaborator', select: { full_name: 1, avatar: 1 } })
                .populate({ path: 'id_customer', select: { full_name: 1, avatar: 1 } })
                .sort({ date_create: -1, _id: -1 })
                .skip(iPage.start)
                .limit(iPage.length)
            const count = await this.messageModel.count(query);
            const result = {
                start: iPage.start,
                length: iPage.length,
                count: count,
                data: getMessage
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async saveMessage(lang, payload: messageDTO) {
        try {

            const newMessage = new this.messageModel({
                message: payload.message,
                id_room: payload.id_room,
                images: payload.images,
                id_customer: payload.type_user === 'customer' ? payload.id_sender : null,
                id_collaborator: payload.type_user === 'collaborator' ? payload.id_sender : null,
                id_admin_action: payload.type_user === 'admin' ? payload.id_sender : null,
                date_create: new Date(Date.now()).toISOString(),
            })
            await newMessage.save();
            const getRoom = await this.roomModel.findById(payload.id_room, { id_message: 1 });
            getRoom.id_message = newMessage._id;
            await getRoom.save();
            var populateQuery = [{ path: 'id_collaborator', select: { _id: 1, avatar: 1, full_name: 1, client_id: 1 } }, { path: 'id_customer', select: { _id: 1, avatar: 1, full_name: 1, client_id: 1 } }];
            return newMessage.populate(populateQuery);
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
