import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { languageDTO } from 'src/@core';

export type PushNotificationDocument = PushNotification & Document;

@Schema()
export class PushNotification {

    @Prop({ default: "" })
    title: string;

    @Prop({ default: "" })
    body: string;

    @Prop({ default: "" })
    image_url: string;

    @Prop({ default: new Date(Date.now()).toISOString() })
    date_create: string;

    // @Prop({ default: false })
    // is_schedule: boolean;

    @Prop({ default: null })
    date_schedule: string;

    @Prop({ default: false })
    is_date_schedule: boolean;

    // CN = 0, T7 = 6
    // @Prop({ type: Number, enum: ["1", "2", "3", "4", "5", "6", "0"], default: [] })
    // day_week_schedule: number;

    @Prop({ enum: ["loop_week", "loop_month", "none"], default: "none" })
    schedule_loop: string;

    @Prop({ default: false })
    is_id_collaborator: boolean;

    @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: "Collaborator", default: [] })
    id_collaborator: string[];

    @Prop({ default: false })
    is_id_customer: boolean;

    @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: "Customer", default: [] })
    id_customer: string[];

    @Prop({ default: false })
    is_id_group_customer: boolean;

    @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: "GroupCustomer", default: [] })
    id_group_customer: string[];

    @Prop({
        type: [
            {
                status: { type: String, enum: ["todo", "doing", "done", "cancel"], default: "todo" },
                date_create: { type: String, default: new Date(Date.now()).toISOString() },
                date_schedule: String,
                times: Number,
                id_customer: [String]
            }]
        , default: []
    })
    campaign_schedule: Object[]

    @Prop({ default: false })
    is_delete: boolean;

    @Prop({ default: true })
    is_active: boolean;
}

export const pushNotificationSchema = SchemaFactory.createForClass(PushNotification);