import { Prop, Schema, SchemaFactory, } from "@nestjs/mongoose";
import mongoose, { Document } from 'mongoose';
export type InfoRewardCollaboratorDocument = InfoRewardCollaborator & Document
@Schema()
export class InfoRewardCollaborator {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Collaborator', required: true })
    id_collaborator: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'RewardCollaborator', default: null })
    id_reward_collaborator: string;

    @Prop({ default: 0 })
    total_order: number;

    @Prop({ default: 0 })
    total_job_hour: number;

    @Prop({ default: 0 })
    total_late_start: number;

    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }] })
    id_order: string[];

    @Prop({ default: null, type: mongoose.Schema.Types.ObjectId, ref: 'UserSystem' })
    id_admin_action: string;

    @Prop({ default: null, type: mongoose.Schema.Types.ObjectId, ref: 'UserSystem' })
    id_admin_verify: string;

    @Prop({ default: 'pending', enum: ['pending', 'done', 'cancel'] })
    status: string;

    @Prop({ default: false })
    is_verify: boolean;

    @Prop({ default: false })
    is_delete: boolean;

    @Prop({ default: null })
    date_verify: string;

    @Prop({ default: new Date(Date.now()).toISOString() })
    date_create: string;

    @Prop({ default: 0 })
    money: number;

    @Prop({ default: '' })
    note_admin: string;
}

export const infoRewardCollaboratorSchema = SchemaFactory.createForClass(InfoRewardCollaborator)
