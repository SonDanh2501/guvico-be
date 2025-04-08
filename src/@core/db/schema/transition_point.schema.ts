import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type TransitionPointDocument = TransitionPoint & Document;

@Schema()
export class TransitionPoint {
  @Prop({ default: "unknow" })
  name_customer: string;

  @Prop({ default: null })
  phone_customer: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null })
  id_customer: string;

  @Prop({ default: null })
  id_admin_action: string;

  @Prop({ default: null })
  id_admin_verify: string;

  @Prop({ default: "pending", enum: ["pending", "done", "cancel"] })
  status: string;

  @Prop({ default: "point", enum: ["point", "rank_point"] })
  type_point: string;

  @Prop({ default: 0 })
  value: number;

  @Prop({ default: new Date(Date.now()).toISOString() })
  date_create: string;

  @Prop({ default: null })
  date_verify: string;

  @Prop({ default: "" })
  note: string;

  @Prop({ default: false })
  is_delete: boolean;

  @Prop({ default: false })
  is_verify: boolean;

  @Prop({ default: 0 })
  current_point: number;

  @Prop({ default: 0 })
  current_rank_point: number;
}

export const transitionPointSchema = SchemaFactory.createForClass(TransitionPoint);