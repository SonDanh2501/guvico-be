import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { languageDTO, Customer, HistoryActivity } from 'src/@core';

export type TransitionCustomerPointDocument = TransitionCustomerPoint & Document;

@Schema()
export class TransitionCustomerPoint {

     @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null })
     id_customer: Customer | null;

     @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'HistoryActivity', default: null })
     id_activity_history: HistoryActivity | null;

     @Prop({ default: 0 })
     point: number;

     @Prop({ default: new Date(Date.now()).toISOString() })
     date_create: string;

     @Prop({ default: null })
     date_verify_create: string;

     @Prop({ default: false })
     is_verify: boolean;

     @Prop({ default: false })
     is_delete: boolean;

     @Prop({ default: "" })
     transfer_note: string;

     @Prop({ default: "g-point", enum : ["g-point", "rank_point"] })
     type_transfer: string;

     @Prop({ required: false, default: "pending", enum: ["pending", "done", "cancel"] })
     status: string;
}



export const transitionCustomerPointSchema = SchemaFactory.createForClass(TransitionCustomerPoint);