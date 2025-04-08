import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Room, RoomDocument } from '../@schemas/room.schema';

@Injectable()
export class RoomService {
    constructor (
        @InjectModel(Room.name) private roomModel: Model<RoomDocument>,
        ) {}

        async findItemById(id: string) {
            const room = await this.roomModel.findById(id);
            // if(!room) {}
            return room;
        }

        async findItemByArrUser(arrUser: string[]) {
            console.log(arrUser, 'arrUser');
            
            const room = await this.roomModel.findOne({members: arrUser});
            if(room) {
                return {room, status: "old"};
            } else {
                const createRoom =  new this.roomModel({
                    name: "",
                    members: arrUser.sort()
                })
                const room = await createRoom.save();
                return {room, status: "new"};
            }
        }

        

        async createIDRoom(name: string, members: string[]) {
            const createRoom = new this.roomModel({
                name: name || '',
                members: members.sort((a, b) => b.localeCompare(a))
            })
            return await createRoom.save();
        }

        // async createIDRoomNew(name: string, members: string[]) {
        //     const checkRoom



        //     const createRoom = new this.roomModel({
        //         name: name || '',
        //         members: members.sort((a, b) => b.localeCompare(a))
        //     })
        //     return await createRoom.save();
        // }

        getListByIdUser(idUser: string) {
            return idUser;
        }


}
