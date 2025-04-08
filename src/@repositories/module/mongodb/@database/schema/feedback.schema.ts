import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, mongo } from 'mongoose';
import { coditionDTOGroupCustomer } from 'src/@core/dto/groupCustomer.dto';
import { UserSystem } from './user_system.schema';

export type FeedBackDocument = FeedBack & Document;

@Schema()
export class FeedBack {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'TypeFeedBack', default: null })
  type: string;

  @Prop({ default: "" })
  body: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null })
  id_customer: string;

  @Prop({ required: true })
  code_phone_area: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ default: "unknow" })
  name: string;

  @Prop({ default: "unknow" })
  full_name: string;

  @Prop({ default: new Date(Date.now()).toISOString() })
  date_create: string;

  @Prop({ default: false })
  is_delete: boolean;

  // khong xai nua
  // @Prop({ default: false })
  // is_processed: boolean;

  // khong xai nua
  // @Prop({ default: null })
  // date_processed: string;

  // khong xai nua
  // @Prop({ default: 'pending', enum: ["pending", "doing", "done", "cancel"] }) 
  // status: string;

  // khong xai nua
  // @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'UserSystem', default: null})
  // id_admin_action: string;

  @Prop({ type: String, enum: ["pending", "processing", "not_contact", "done"], default: "pending" })
  status_handle: string;

  @Prop({ default: '' })
  note_handle_admin: string;

  @Prop({type: mongoose.Schema.Types.ObjectId, ref: "UserSystem", default: null})
  id_user_system_handle: UserSystem;

  @Prop({ type: [{
      id_user_system_handle: {type: mongoose.Schema.Types.ObjectId, ref: "UserSystem", default: null},
      status_handle: { type: String, default: null },
      note_handle_admin: {type: String, default: ""},
      date_create: { type: String, default: new Date(Date.now()).toISOString() }
  }], default: [] })
  history_user_system_handle: any[];
}

export const feedBackSchema = SchemaFactory.createForClass(FeedBack);