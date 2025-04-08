
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type CustomerRequestDocument = CustomerRequest & Document;

@Schema()
export class CustomerRequest {
  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  lat: number;

  @Prop({ required: true })
  lng: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null })
  id_customer: string;

  @Prop({ default: "" })
  description: string;

  @Prop({ default: new Date(Date.now()).toISOString() })
  date_create: string;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Service', default: null })
  id_service: string;

  @Prop({ default: false })
  is_delete: boolean;

  @Prop({ default: "pending", enum: ["pending", "done", "cancel"] })
  status: string;

  @Prop({ default: false })
  is_contacted: Boolean;

  @Prop({ default: null })
  date_admin_contact_create: string;

  @Prop({ default: "" })
  note_admin: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User_system', default: null })
  id_admin: string;

  @Prop({ default: "" })
  full_name_admin: string

  @Prop({ default: "" })
  phone_customer: string;

  @Prop({ default: "" })
  name_customer: string;

  @Prop({ default: -1 })
  district: number;

  @Prop({ default: -1 })
  city: number;
}

export const customerRequestSchema = SchemaFactory.createForClass(CustomerRequest);