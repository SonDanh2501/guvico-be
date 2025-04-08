import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Transaction } from './transaction.schema';
import { PunishTicket } from './punish_ticket.schema';

export type PunishDocument = Punish & Document;

@Schema()
export class Punish {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'UserSystem', default: null })
    id_admin_action: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'UserSystem', default: null })
    id_admin_refund: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Collaborator', default: null })
    id_collaborator: string;

    @Prop({ default: 0 })
    money: number;

    @Prop({ default: '' })
    note_admin: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'ReasonPunish', required: true })
    id_punish: string;

    @Prop({ default: new Date(Date.now()).toISOString() })
    date_create: string;

    @Prop({ default: null })
    date_verify_create: string;

    @Prop({ default: "pending", enum: ["pending", "done", "cancel", "refund"] })
    status: string;

    @Prop({ default: false })
    is_delete: boolean;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'UserSystem', default: null })
    id_admin_verify: string;

    @Prop({ default: false })
    is_punish_system: boolean;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null })
    id_order: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'InfoTestCollaborator', default: null })
    id_info_test_collaborator: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction', default: null })
    id_transaction: Transaction | null;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'PunishTicket', default: null })
    id_punish_ticket: PunishTicket | null;
}

export const punishSchema = SchemaFactory.createForClass(Punish);