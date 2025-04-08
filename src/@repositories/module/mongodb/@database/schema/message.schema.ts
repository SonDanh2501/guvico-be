import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema()
export class Message {
  @Prop({ default: "" })
  message: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Usersystem', default: null })
  id_admin_action: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null })
  id_customer: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Collaborator', default: null })
  id_collaborator: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true })
  id_room: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null })
  id_replly_message: string;

  @Prop({ default: "received", enum: [, "readed", "received"] })
  status_reader_collaborator: string;

  @Prop({ default: "sending", enum: ["sending", "sended", "recall"] })
  status: string;

  @Prop({ default: [] })
  images: string[];

  @Prop({ default: new Date(Date.now()).toISOString() })
  date_create: string;

  @Prop({ default: null })
  recall_date_create: string;
}

export const messageSchema = SchemaFactory.createForClass(Message);