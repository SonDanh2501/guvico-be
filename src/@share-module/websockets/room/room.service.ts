import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { createRoomDTOSystem } from 'src/@core/dto/chat.dto';
import { Collaborator, CollaboratorDocument, Customer, CustomerDocument, ERROR, Order, OrderDocument, Room, RoomDocument, iPageDTO } from 'src/@core';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';

@Injectable()
export class RoomService {
    constructor(
        private customExceptionService: CustomExceptionService,
        @InjectModel(Room.name) private roomModel: Model<RoomDocument>,
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        @InjectModel(Collaborator.name) private collaboratorModel: Model<CollaboratorDocument>,
        @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    ) { }

    async create(lang, payload: createRoomDTOSystem) {
        try {
            const getOrder = await this.orderModel.findById(payload.id_order);
            if (!getOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND)
            const result = new this.roomModel({
                id_order: getOrder._id,
                id_customer: getOrder.id_customer,
                id_collaborator: getOrder.id_collaborator,
                name: getOrder.id_view,
                date_create: new Date(Date.now()).toISOString(),
            })
            await result.save();
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getList(lang, iPage: iPageDTO, user, admin?) {
        try {
            console.log(user._id);

            const query = {
                $and: [

                    {
                        is_delete: false,
                    },
                    {
                        is_active: true,
                    },
                    {
                        $or: [
                            { id_customer: user._id },
                            { id_collaborator: user._id },
                        ]
                    }
                ]
            }
            const getRoom = await this.roomModel.find(query)
                .populate({ path: 'id_message', select: { message: 1 } })
                .populate({ path: 'id_customer', select: { _id: 1, avatar: 1, full_name: 1, date_create: 1 } })
                .populate({ path: 'id_collaborator', select: { _id: 1, avatar: 1, full_name: 1, date_create: 1 } })
                .sort({ date_create: -1, name: 1 })
                .skip(iPage.start)
                .limit(iPage.length)
            const count = await this.roomModel.count(query)
            const result = {
                start: iPage.start,
                length: iPage.length,
                totalItem: count,
                data: getRoom
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getRoomById(lang, idRoom) {
        try {
            const getRoom = await this.roomModel.findById(idRoom)
                .populate({ path: 'id_message', select: { message: 1 } })
                .populate({ path: 'id_customer', select: { _id: 1, avatar: 1, full_name: 1, client_id: 1 } })
                .populate({ path: 'id_collaborator', select: { _id: 1, avatar: 1, full_name: 1, client_id: 1 } })
            if (!getRoom) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.FORBIDDEN)
            return getRoom;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
