import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { Document } from 'mongoose'
import { languageDTO } from 'src/@core'
import { PUNISH_TYPE, TICKET_STATUS, USER_APPLY } from '../enum'

export type PunishTicketDocument = PunishTicket & Document

@Schema()
export class PunishTicket {
    @Prop({ type: { vi: String, en: String }, default: { vi: '', en: "" } })
    title: languageDTO;

    @Prop({ type: String, enum: USER_APPLY, default: null })
    user_apply: string | null;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Collaborator", default: null })
    id_collaborator: string | null;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Customer", default: null })
    id_customer: string | null;

    @Prop({ default: new Date(Date.now()).toISOString() })
    date_create: string;

    @Prop({ type: Number, default: 1 })
    current_total_time_process: number;

    @Prop({ type: Number, default: 1 })
    current_total_order_process: number;

    @Prop({ type: String, enum: TICKET_STATUS, default: TICKET_STATUS.standby })
    status: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "PunishPolicy", default: null })
    id_punish_policy: string | null;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Transaction", default: null })
    id_transaction: string | null;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "UserSystem", default: null })
    id_admin_action: string | null;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "UserSystem", default: null })
    id_admin_verify: string | null;

    @Prop({ type: Number, default: 1 })
    punish_lock_time: number;

    @Prop({ type: String, default: null })
    time_start: string;

    @Prop({ type: String, default: null })
    time_end: string;

    @Prop({ type: Number, default: 0 })
    punish_money: number;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null })
    id_order: string;

    @Prop({ type: Boolean, default: false })
    is_delete: boolean;

    @Prop({ type: String, default: "" })
    id_view: string;

    @Prop({ type: String, default: "" })
    note_admin: string;
    
    @Prop({ type: String, enum: ["collaborator_wallet", "work_wallet", "pay_point", null], default: null })
    payment_out: string | null;
    
    @Prop({ type: String, enum: ["collaborator_wallet", "work_wallet", "pay_point", "cash_book", null], default: null })
    payment_in: string | null;
    
    @Prop({ default: null })
    execution_date: string; // Ngày thực thi phiếu
    
    @Prop({ default: null })
    revocation_date: string; // Ngày thu hồi phiếu
    
    @Prop( { type: String, enum: PUNISH_TYPE, default: PUNISH_TYPE.punish })
    punish_type: string; // Hình thức phạt
    
    @Prop({ type: Number, default: 1 })
    nth_time: number; // Vi phạm lần thứ n theo chính sách phạt
}

export const punishTicketSchema = SchemaFactory.createForClass(PunishTicket);
