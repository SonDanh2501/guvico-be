import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { Document } from 'mongoose'
import { languageDTO } from 'src/@core'
import { BaseEntity } from '../entity'
import { REWARD_VALUE_TYPE, TICKET_STATUS, USER_APPLY } from '../enum'

export type RewardTicketDocument = RewardTicket & Document;

@Schema()
export class RewardTicket extends BaseEntity {
    @Prop({ default: new Date().toISOString() })
    created_at: string;
    
    @Prop({ type: { vi: String, en: String }, default: { vi: '', en: '' } })
    title: languageDTO

    @Prop({ type: String, enum: USER_APPLY, default: null })
    user_apply: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Collaborator", default: null })
    id_collaborator: string | null;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Customer", default: null })
    id_customer: string | null;

    @Prop({ type: Number, default: 0 })
    current_total_time_process: number;

    @Prop({ type: Number, default: 0 })
    current_total_order_process: number;

    @Prop({ type: String, enum: TICKET_STATUS, default: TICKET_STATUS.processing })
    status: string

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "RewardPolicy", default: null })
    id_reward_policy: string;

    @Prop({ type:String, default: REWARD_VALUE_TYPE.none, enum: REWARD_VALUE_TYPE })
    reward_value_type: string;

    @Prop({ type: Number, default: 0 })
    reward_value: number;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null })
    id_order: string;

    @Prop({ type: String, default: "" })
    id_view: boolean;

    @Prop({ type: String, enum: ["collaborator_wallet", "work_wallet", "reward_point", "none"], default: "none" })
    type_wallet: string

    @Prop({ default: null })
    updated_time_of_previous_ticket: string

    @Prop({ default: null })
    execution_date: string; // Ngày thực thi phiếu
    
    @Prop({ default: null })
    revocation_date: string; // Ngày thu hồi phiếu
}

export const rewardTicketSchema = SchemaFactory.createForClass(RewardTicket);
