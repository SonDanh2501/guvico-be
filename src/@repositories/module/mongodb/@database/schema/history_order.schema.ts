import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { languageDTO } from 'src/@core';

export type HistoryOrderDocument = HistoryOrder & Document;

@Schema()
export class HistoryOrder {
  @Prop({ required: true })
  id_customer: string;

  @Prop({default: null})
  id_collaborator: string;

  @Prop({ required: true })
  id_order: string;

  @Prop({ required: true })
  id_creator: string;

  @Prop({ required: true, enum: ["customer", "collaborator", "admin"] })
  creator: string;

  @Prop({ enum: ["pending", "confirm", "doing", "done", "cancel"], default: "" })
  status: string;

  @Prop({ default: Date.now() })
  date_create: string;
}

export const historyOrderSchema = SchemaFactory.createForClass(HistoryOrder);