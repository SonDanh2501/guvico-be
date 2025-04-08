import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { Document } from 'mongoose'
import { Order, languageDTO } from 'src/@core'
import { GroupOrder } from 'src/@core/db/schema/group_order.schema'
import { KIND_TRANSFER, PAYMENT_ENUM, STATUS_TRANSACTION, SUBJECT_ENUM, TYPE_BANK, TYPE_TRANSFER, TYPE_WALLET } from '../enum'
import { CashBook } from './cash_book.schema'
import { Collaborator } from './collaborator.schema'
import { Customer } from './customer.schema'
import { PunishTicket } from './punish_ticket.schema'
import { ReasonPunish } from './reason_punish.schema'
import { UserSystem } from './user_system.schema'

export type TransactionDocument = Transaction & Document;

@Schema({
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
})
export class Transaction {

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null })
    id_customer: Customer | null;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Collaborator', default: null })
    id_collaborator: Collaborator | null;

    @Prop({ type: String, enum: SUBJECT_ENUM, default: SUBJECT_ENUM.other })
    subject: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'UserSystem', default: null })
    id_admin_action: UserSystem | null;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'UserSystem', default: null })
    id_admin_verify: UserSystem | null;

    @Prop({ default: false })
    is_delete: boolean;

    @Prop({ type: { vi: String, en: String } })
    title: languageDTO;

    @Prop({ type: Number, default: 0 })
    money: number;

    @Prop({ type: String, default: "" })
    transfer_note: string;

    @Prop({ type: String, enum: KIND_TRANSFER, default: KIND_TRANSFER.income })
    kind_transfer: string;

    @Prop({ type: String, enum: TYPE_TRANSFER, default: TYPE_TRANSFER.other })
    type_transfer: string;

    @Prop({ type: String, enum: TYPE_BANK, default: TYPE_BANK.bank })
    type_bank: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'CashBook', default: null })
    id_cash_book: CashBook | null;

    @Prop({ type: String, enum: STATUS_TRANSACTION, default: STATUS_TRANSACTION.pending })
    status: string;

    @Prop({ type: String, default: null })
    id_view: string;

    @Prop({ type: Object, default: null })
    vnpay_transfer: object | null;

    @Prop({ type: Object, default: null })
    momo_transfer: object | null;

    @Prop({ type: Object, default: null })
    viettel_money_transfer: object | null;

    @Prop({ type: Object, default: null })
    bank_transfer: object | null;

    // xem xét loại bỏ
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'ReasonPunish', default: null })
    id_reason_punish: ReasonPunish | null;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'PunishTicket', default: null })
    id_punish_ticket: PunishTicket | null;

    @Prop({ default: new Date(Date.now()).toISOString() })
    date_create: string;

    @Prop({ default: "" })
    date_verify: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null })
    id_order: Order | null;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'GroupOrder', default: null })
    id_group_order: GroupOrder | null;

    @Prop({ type: String, enum: PAYMENT_ENUM, required: true, default: PAYMENT_ENUM.bank })
    payment_out: string;

    @Prop({ type: String, enum: PAYMENT_ENUM, required: true, default: PAYMENT_ENUM.bank })
    payment_in: string;

    // @Prop({ type: String, enum: PAYMENT_ENUM, required: true })
    // payment_method: string;

    @Prop({ type: String, enum: TYPE_WALLET, required: true, default: TYPE_WALLET.other })
    type_wallet: string;
}



export const transactionSchema = SchemaFactory.createForClass(Transaction);