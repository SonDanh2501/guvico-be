import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { Document } from 'mongoose'
import { UserEntity } from '../entity'

export type CustomerDocument = Customer & Document;

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class Customer extends UserEntity {
  @Prop({ default: null, required: true })
  phone: string;

  @Prop({ default: [] })
  index_search: string[]

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Address', default: null })
  default_address: string;

  @Prop({ required: true, default: '+84' })
  code_phone_area: string;

  @Prop({ default: "" })
  email: string;

  // loai bo phien ban sap toi
  // @Prop({ default: "unknow" })
  // name: string;

  // @Prop({ 
  //   default: "unknow",
  //   set: (full_name: string) => {
  //   return full_name.trim();
  //   } 
  // })
  // full_name: string;

  // @Prop({ required: true })
  // password: string;

  // @Prop({ required: true })
  // salt: string;

  @Prop({ default: new Date(Date.now()).toISOString() })
  date_create: string;

  @Prop({ default: true })
  is_active: boolean;

  // @Prop({ default: false })
  // is_delete: boolean;

  @Prop({ required: false, default: new Date(Date.now()).toISOString() })
  birth_date: string;

  @Prop({ default: new Date(Date.now()).toISOString() })
  birthday: string;

  // @Prop({ required: false, enum: ["male", "female", "other"], default: "other" })
  // gender: string;

  @Prop({ required: true, default: 0 })
  point: number;

  @Prop({ required: true, default: 0 })
  rank_point: number;

  @Prop({ default: "member", enum: ["member", "silver", "gold", "platinum"] })
  rank: string;

  @Prop({ default: 0 })
  cash: number;

  @Prop({ default: 0 })
  pay_point: number;

  // @Prop({ default: 0 })
  // gift_remainder: number;

  @Prop({ default: '' })
  avatar: string;


  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'GroupCustomer', default: [] })
  id_group_customer: string[];

  // @Prop({
  //   type: [{
  //     id_promotion: String,
  //     status: {
  //       type: String,
  //       enum: ['used', 'exchanged'],
  //     },
  //     date_created: { type: String, default: new Date(Date.now()).toISOString() },
  //     exp_date: { type: String, default: null },
  //     limit_count: { type: Number, default: 0 },
  //     limit_used: { type: Number, default: 0 }
  //   }], default: []
  // })
  // my_promotion: object[];

  @Prop({
    type: [{
      id_promotion: String,
      status: {
        type: String,
        enum: ['used', 'exchanged'],
      },
      date_created: { type: String, default: new Date(Date.now()).toISOString() },
      exp_date: { type: String, default: null },
      limit_used: { type: Number, default: 0 },
      used: { type: Number, default: 0 }
    }], default: []
  })
  my_promotion: object[];

  // object : statys, id_promotion, date_create
  // @Prop({ type: [{ _id: String, discount: Number }], default: [] }), 

  @Prop({ default: 0 })
  total_price: number;

  @Prop()
  invite_code: string;

  @Prop({ default: null }) // id nguoi gioi thieu, truong du lieu cu
  id_inviter: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null })
  id_customer_inviter: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Collaborator', default: null })
  id_collaborator_inviter: string;

  @Prop({ default: false })
  is_lock_time: boolean;

  @Prop({ default: null })
  lock_time: string;

  @Prop({ default: null })
  month_birthday: string;

  @Prop({ default: 0 })
  invalid_password: number;

  // @Prop({ default: null })
  // id_view: string;

  @Prop({ default: 0 })
  ordinal_number: number;

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Collaborator', default: [] })
  id_block_collaborator: string[];

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Collaborator', default: [] })
  id_favourite_collaborator: string[];

  @Prop({ default: -1 })
  city: number

  @Prop({ default: -1 })
  district: number

  @Prop({ default: 100 })
  reputation_score: number;

  @Prop({ default: null })
  client_id: string;

  @Prop({ default: false })
  is_staff: boolean;

  @Prop({ default: new Date(Date.now()).toISOString() })
  date_accept_policy: string;

  @Prop({ default: null })
  session_socket: string;

  @Prop({ default: false })
  is_online: boolean;

  @Prop({ default: null })
  token_payment_momo: string;

  @Prop({ default: false })
  is_link_momo: boolean;

 @Prop({ type: {
    title: { type: { vi: String, en: String }, default: null },
    icon: { type: String, default: null },
    titleIcon: { type: String, default: null },
    method: { type: String, default: null },
    img: { type: String, default: null },
    id_service_apply: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service', default: null }],
    allow_adding_card: { type: Boolean, default: false },
    is_activated: { type: Boolean, default: true }
  }, default: null })
  payment_method_default: object;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null })
  id_customer_referrer: string;

  @Prop({ default: 0 })
  a_pay: number;
  
  @Prop({ default: false })
  get_voucher: boolean;
  
  @Prop({ default: null })
  referral_code: string; // Mã giới thiệu nhận % chiết khấu ngay từ đơn hàng đầu tiên
  
  @Prop({ default: null })
  promotional_referral_code: string; // Mã giới thiệu người được giới thiệu nhận được voucher

  @Prop({
    type: [{
      method: { type: String, default: null },
      information: { type: [{ 
        bank_name: { type: String, default: null },
        account_number: { type: String, default: null },
        account_holder: { type: String, default: null },
        phone_number: { type: String, default: null },
        token: { type: String, default: null },
      }],
      default: []
      }
    }], 
    default: null
  })
  payment_information: object[]

  @Prop({
    type: {
      bank_name: { type: String, default: null },
      account_number: { type: String, default: null },
      account_holder: { type: String, default: null },
    }, default: null
  })
  bank_account: object

  @Prop({ default: null })
  identity_number: string; // CCCD/CMND của khách hàng
  
  @Prop({ default: null })
  tax_code: string; // Mã thuế cá nhân
}

export const customerSchema = SchemaFactory.createForClass(Customer);