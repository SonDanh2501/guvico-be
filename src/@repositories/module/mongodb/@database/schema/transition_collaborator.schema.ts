import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, ObjectId } from 'mongoose';
import { languageDTO, Collaborator, HistoryActivity } from 'src/@core';
import { Transaction } from './transaction.schema';

export type TransitionCollaboratorDocument = TransitionCollaborator & Document;

@Schema()
export class TransitionCollaborator {

     @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Collaborator', default: null })
     id_collaborator: Collaborator | null;

     @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'HistoryActivity', default: null })
     id_activity_history: HistoryActivity | null;

     @Prop({ default: 0 })
     money: number;

     @Prop({ default: new Date(Date.now()).toISOString() })
     date_created: string;

     @Prop({ default: new Date(Date.now()).toISOString() })
     date_create: string;

     @Prop()
     date_verify_created: string;

     @Prop({ default: false })
     is_verify_money: boolean;

     @Prop({ default: false })
     is_delete: boolean;

     @Prop({ default: "" })
     transfer_note: string;

     @Prop(
          {
               account_number: { type: String },
               account_name: { type: String },
               bank_name: { type: String },
               image: { type: String },
          }
     )
     guvi_bank_infor: Object[];


     @Prop({ required: true, enum: ["top_up", "withdraw"] })
     type_transfer: string;

     @Prop({ required: false, default: "pending", enum: ["pending", "done", "cancel", "transfered"] })
     status: string;

     @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'UserSystem', default: null })
     id_admin_verify: string;

     @Prop({ default: "wallet", enum: ["wallet", "gift_wallet", "collaborator_wallet", "work_wallet"] })
     type_wallet: string;

     @Prop({ enum: ["vnpay", "momo", "admin_action"], default: "admin_action" })
     method_transfer: string;

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



export const transitionCollaboratorSchema = SchemaFactory.createForClass(TransitionCollaborator);