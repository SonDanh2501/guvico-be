import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { languageDTO } from 'src/@core';

export type ReasonPunishDocument = ReasonPunish & Document;

@Schema()
export class ReasonPunish {
    @Prop({ type: { vi: String, en: String }, required: true })
    title: languageDTO;

    @Prop({ type: { vi: String, en: String }, required: true })
    description: languageDTO;

    @Prop({ default: "collaborator", enum: ["collaborator", "customer"] })
    apply_user: string;

    @Prop({ default: "" })
    note: string;

    @Prop({ default: new Date(Date.now()).toISOString() })
    date_create: string;

    @Prop({ default: false })
    is_delete: boolean;

    @Prop({ default: true })
    is_active: boolean;

}

export const reasonPunishSchema = SchemaFactory.createForClass(ReasonPunish);