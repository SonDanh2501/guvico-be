import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { Document } from 'mongoose'

export type UserSystemDocument = UserSystem & Document;

@Schema()
export class UserSystem {
  @Prop({ default: null, required: true })
  email: string;

  @Prop({ default: "unknow" })
  name: string;

  @Prop({ default: "unknow" })
  full_name: string;

  @Prop({ required: true, default: null })
  password: string;

  @Prop({ required: true, default: null })
  salt: string;

  @Prop({ default: 'admin', enum: ['admin', 'support_customer', 'marketing', 'marketing_manager', 'accountant', "support"] })
  role: string;

  // @Prop({type: Date, required: true, default: Date.now()})
  // date_create: Date;

  @Prop({ default: new Date(Date.now()).toISOString() })
  date_create: string;

  @Prop({ default: false })
  is_delete: boolean;

  @Prop({ default: true })
  is_active: boolean;

  @Prop({ default: false })
  is_permission: boolean

  @Prop({ default: [] })
  permission: string[]

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'RoleAdmin', default: null })
  id_role_admin: string

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Business', default: null })
  id_business: string

  @Prop({ default: 'viet_nam' })
  area_manager_lv_0: string;

  @Prop({ default: [] })
  area_manager_lv_1: number[];

  @Prop({ default: [] })
  area_manager_lv_2: number[];

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Service', default: [] })
  id_service_manager: string[];

  @Prop({
    type: [{
      date_login: String,
      token: String
    }], default: []
  })
  session_login: any[]

  @Prop({ default: null })
  session_socket: string;

  @Prop({ default: false })
  is_online: boolean;
}

export const userSystemSchema = SchemaFactory.createForClass(UserSystem);