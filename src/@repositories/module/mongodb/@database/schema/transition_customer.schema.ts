import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { languageDTO, Customer, HistoryActivity, UserSystem } from 'src/@core';
import { Transaction } from './transaction.schema';

export type TransitionCustomerDocument = TransitionCustomer & Document;

@Schema()
export class TransitionCustomer {

     @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null })
     id_customer: Customer | null;

     @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'UserSystem', default: null })
     id_admin_action: UserSystem | null;

     @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'UserSystem', default: null })
     id_admin_verify: UserSystem | null;

     @Prop({ default: 0 })
     id_view: string;

     @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'HistoryActivity', default: null })
     id_activity_history: HistoryActivity | null;

     @Prop({ default: 0 })
     money: number;

     @Prop({ default: new Date(Date.now()).toISOString() })
     date_created: string;

     @Prop({ default: new Date(Date.now()).toISOString() })
     date_create: string;

     @Prop({ default: null })
     date_verify_created: string;

     @Prop({ default: null })
     date_verify_create: string;

     @Prop({ default: false })
     is_verify_money: boolean;

     @Prop({ default: false })
     is_delete: boolean;

     @Prop({ default: "" })
     transfer_note: string;

     @Prop({ required: true, enum: ["top_up", "withdraw", "payment_service", "refund"] })
     type_transfer: string;

     @Prop({ enum: ["vnpay", "momo", "pay_point", "admin_action"], default: "admin_action" })
     method_transfer: string;

     @Prop({ default: "" })
     vnp_TxnRef: string;

     @Prop({ default: "" })
     vnp_SecureHash: string

     @Prop({ required: false, default: "pending", enum: ["pending", "done", "cancel", "fail"] })
     status: string;

     @Prop({ default: "" })
     ip_vnpay: string;

     @Prop({ type: [Object], default: [] })
     rsp_query_vnpay: object[];

     @Prop({ type: Object, default: null })
     vnp_payload: object;

     @Prop({ default: 0 })
     service_fee: number;

     @Prop({ default: 0 })
     pay_point_current: number;

     @Prop({ type: String, enum: ["up", "down", "none"], default: "none" })
     status_pay_point_current: string;

     @Prop({ default: 0 })
     payment_discount: number; // tiền chiết khấu cho khách hàng 

     @Prop({
          type: {
               result_code: Number,
               amount: Number,
               responseTime: Number,
               orderId: String,
               message: String
          }, default: null
     })
     momo_payment_method: object;

     @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction', default: null })
     id_transaction: string;
}



export const transitionCustomerSchema = SchemaFactory.createForClass(TransitionCustomer);