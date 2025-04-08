import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { BaseEntity } from 'src/@repositories/module/mongodb/@database'


export type CollaboratorSettingDocument = CollaboratorSetting & Document;

@Schema()
export class CollaboratorSetting extends BaseEntity {
    @Prop({ default: 10000 })
    max_distance_order: number;

    @Prop({ default: "1.0.0" })
    support_version_app: string;

    @Prop({ default: false })
    is_update_ota: boolean;

    @Prop({ default: "https://res.cloudinary.com/dbxnp5vc0/image/upload/v1672740228/guvi/z4010054597277_9777775fafbb4addadb8f10ee3969c4a_uest8p.jpg" })
    background_header: string;

    @Prop({ type: [Object], default: [] })
    time_cancel: object[]

    @Prop({ type: Number, default: 15 })
    time_push_collaborator_most_rated: number

    // @Prop({type: Number, default: 15 })
    // time: number

    @Prop({ type: Number, default: 15 })
    time_push_noti_collaborator: number

    @Prop({
        type: {
            favourite_collaborator: Number, // thời gian bắn cho CTV yêu thích
            near_collaborator: Number, // thời gian bắn cho CTV gần nhất
            place_favourite_collaborator: Number, // thời gian bắn cho CTV khu vực yêu thích
            city_collaborator: Number // thời gian bắn cho CTV cả thành phố
        }, default: null
    })
    time_collaborator_job: object // set up thời gian để CTV nhận thông báo và nhận công việc

    @Prop({ default: 'remainder' })
    bonus_wallet: string;


    @Prop({ default: 5 })
    otp_setting: number

    @Prop({ default: 20 })
    otp_setting_in_30days: number
    
    @Prop({ default: 100000 })
    min_money_momo: number
    @Prop({ default: 300000 })
    min_money_bank: number

    @Prop({ default: 200000 })
    minimum_work_wallet: number

    @Prop({ default: 100000 })
    minimum_collaborator_wallet: number

    @Prop({ default: 500000 })
    minimum_withdrawal_money: number

    @Prop({ default: null })
    url_ota_android: string;

    @Prop({ default: null })
    url_ota_ios: string;
}
export const collaboratorSettingSchema = SchemaFactory.createForClass(CollaboratorSetting);