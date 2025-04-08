import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type RoomDocument = Room & Document;

@Schema()
export class Room {
    @Prop({default: ""})
    name: string

    @Prop({ type: [String] })
    members: string[]
}

export const roomSchema = SchemaFactory.createForClass(Room);