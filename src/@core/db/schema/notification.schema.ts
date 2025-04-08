import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { Document } from 'mongoose'
import { languageDTO } from 'src/@core'
import { BaseEntity } from 'src/@repositories/module/mongodb/@database'
import { NOTIFICATION_SOUND, STATUS_SEND_FIREBASE, STATUS_SEND_SOCKET } from 'src/@repositories/module/mongodb/@database/enum/notification.enum'

export type NotificationDocument = Notification & Document;

@Schema()
export class Notification extends BaseEntity {

    @Prop({ type: { vi: String, en: String }, required: true, default: { en: "", vi: "" } })
    title: languageDTO;

    @Prop({ type: { vi: String, en: String }, default: { en: "", vi: "" } })
    body: languageDTO;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null })
    id_customer: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Collaborator', default: null })
    id_collaborator: string;

    @Prop({ default: [] })
    tokens: string[];

    @Prop({ default: "activity", enum: ["promotion", "system", "activity"] })
    type_notification: string;

    @Prop({ default: new Date(Date.now()).toISOString() })
    date_create: string;

    @Prop({ default: null })
    date_sended: string;

    @Prop({ default: null })
    date_readed: string;

    @Prop({ default: false })
    is_push_notification: boolean;

    @Prop({ default: false })
    is_notification: boolean;

    @Prop({ default: null })
    push_time: string;

    @Prop({ default: null })
    date_schedule: string;

    @Prop({ default: null })
    image_url: string;

    @Prop({ default: STATUS_SEND_SOCKET.create, enum: STATUS_SEND_SOCKET })
    status_send_socket: string;

    @Prop({ default: STATUS_SEND_FIREBASE.none, enum: STATUS_SEND_FIREBASE })
    status_send_firebase: string;

    @Prop({ default: NOTIFICATION_SOUND.default, enum: NOTIFICATION_SOUND })
    sound_guvi: string;

    // @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Promotion', default: null })
    // id_promotion: string;

    // @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null })
    // id_order: string;

    // @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'GroupOrder', default: null })
    // id_group_order: string;

    // @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'NotificationSchedule', default: null })
    // id_notification_schedule: string;





    // loai bo trong phien ban sap toi
    @Prop({ default: false })
    is_readed: boolean;

    // loai bo trong phien ban sap toi
    @Prop({ default: "customer", enum: ["customer", "collaborator"] })
    user_object: string;

    // loai bo trong phien ban sap toi
    @Prop({ type: { vi: String, en: String }, default: { en: "", vi: "" } })
    description: languageDTO;

    // loai bo trong phien ban sap toi
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'TransitionCollaborator', default: null })
    id_transistion_collaborator: string;

    // loai bo trong phien ban sap toi
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'TransitionCustomer', default: null })
    id_transistion_customer: string;

    // loai bo trong phien ban sap toi
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Address', default: null })
    id_address: string;

    // loai bo trong phien ban sap toi
    @Prop({default: null, enum:["single", "loop","schedule", null]})
    type_schedule: string;
}

export const notificationSchema = SchemaFactory.createForClass(Notification);