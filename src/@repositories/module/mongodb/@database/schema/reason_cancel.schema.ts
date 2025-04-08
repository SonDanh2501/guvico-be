import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { languageDTO } from 'src/@core';

export type ReasonCancelDocument = ReasonCancel & Document;

@Schema()
export class ReasonCancel {
    @Prop({ type: { vi: String, en: String }, required: true })
    title: languageDTO;

    @Prop({ type: { vi: String, en: String }, required: true })
    description: languageDTO;

    @Prop({ default: 'cash', enum: ["cash", "lock_time"] })
    punish_type: string;

    //neu la lock_time thi tinh theo miliseconds
    @Prop({ default: 0 })
    punish: number;

    @Prop({
        type: [{
            is_active: Boolean,
            max_time: Number,
            min_time: Number,
            value: Number
        }], default: []
    })
    punish_time: object[];

    @Prop({
        type: [{
            is_active: Boolean,
            max_time: Number,
            min_time: Number,
            value: Number
        }], default: []
    })
    punish_cash: object[];

    @Prop({ default: "customer", enum: ["collaborator", "customer", "admin", "system", "system_out_confirm", "system_out_date", "user_system"] })
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

export const reasonCancelSchema = SchemaFactory.createForClass(ReasonCancel);