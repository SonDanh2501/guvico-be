import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { Document } from 'mongoose'
import { NOTIFICATION_SOUND } from '../enum/notification.enum'

export type NotificationScheduleDocument = NotificationSchedule & Document;

@Schema()
export class NotificationSchedule {

    @Prop({ default: "" })
    title: string;

    @Prop({ default: "" })
    body: string;

    @Prop({ default: "" })
    image_url: string;

    @Prop({ default: new Date(Date.now()).toISOString() })
    date_create: string;

    @Prop({ default: null })
    date_schedule: string;

    @Prop({ default: false })
    is_id_customer: boolean;

    @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: "Customer", default: [] })
    id_customer: string[];

    @Prop({ default: false })
    is_id_group_customer: boolean;

    @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: "GroupCustomer", default: [] })
    id_group_customer: string[];

    @Prop({ default: false })
    is_id_collaborator: boolean;

    @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: "Collaborator", default: [] })
    id_collaborator: string[];

    @Prop({ default: false })
    is_delete: boolean;

    @Prop({ default: false })
    is_created: boolean;

    @Prop({ default: NOTIFICATION_SOUND.default, enum: NOTIFICATION_SOUND })
    sound_guvi: string;
}

export const notificationScheduleSchema = SchemaFactory.createForClass(NotificationSchedule);