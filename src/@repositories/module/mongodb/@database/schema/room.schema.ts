import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type RoomDocument = Room & Document;

@Schema()
export class Room {
    @Prop({ default: "" }) // id_view ca làm
    name: string

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null })
    id_customer: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Collaborator', default: null })
    id_collaborator: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null })
    id_order: string;

    @Prop({ default: new Date(Date.now()).toISOString() })
    date_create: string;

    @Prop({ default: "open", enum: ["open", "close"] })
    status: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null })
    id_message: string;
}

export const roomSchema = SchemaFactory.createForClass(Room);