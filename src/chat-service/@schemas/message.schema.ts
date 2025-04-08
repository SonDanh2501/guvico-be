import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, SchemaTypes, Types } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema()
export class Message {
  @Prop({default: ""})
  message: string;

  @Prop({required: true})
  sender: string;

  @Prop({default: "sending", enum: ["sending", "sended"]})
  status: string;

  @Prop({default: "text", enum: ["text", "image", "video", "link"]})
  type: string;

  @Prop({type: [String], default: []})
  readers: string[];  

  // @Prop({ type: { type: mongoose.Schema.Types.ObjectId, ref: 'rooms' } })
  // idRoom: Room | any;

  @Prop({ type: String })
  idRoom: string;

  @Prop({type: Date, default: Date.now()})
  date: Date

}

export const messageSchema = SchemaFactory.createForClass(Message);