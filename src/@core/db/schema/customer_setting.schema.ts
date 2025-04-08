import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { Document } from 'mongoose'
import { BaseEntity } from 'src/@repositories/module/mongodb/@database'
import { TYPE_LINK_ADVERTISEMENT } from 'src/@repositories/module/mongodb/@database/enum/base.enum'


export type CustomerSettingDocument = CustomerSetting & Document;

@Schema()
export class CustomerSetting extends BaseEntity {

    @Prop({ default: 10000 })
    point_to_price: number;

    @Prop({ default: 1 })
    ratio_of_price_to_point_member: number;
    @Prop({ default: 1 })
    ratio_of_price_to_point_silver: number;
    @Prop({ default: 2 })
    ratio_of_price_to_point_gold: number;
    @Prop({ default: 3 })
    ratio_of_price_to_point_platium: number;

    @Prop({ default: 0 })
    rank_member_minium_point: number;
    @Prop({ default: 0 })
    rank_member_max_point: number;
    @Prop({ default: 0 })
    rank_silver_minium_point: number;
    @Prop({ default: 0 })
    rank_silver_max_point: number;
    @Prop({ default: 0 })
    rank_gold_minium_point: number;
    @Prop({ default: 0 })
    rank_gold_max_point: number;
    @Prop({ default: 0 })
    rank_platinum_minium_point: number;
    @Prop({ default: 0 })
    rank_platinum_max_point: number;

    @Prop({ default: "1.0.0" })
    support_version_app: string;
    @Prop({ default: "https://res.cloudinary.com/dbxnp5vc0/image/upload/v1672740228/guvi/z4010054597277_9777775fafbb4addadb8f10ee3969c4a_uest8p.jpg" })
    background_header: string;

    @Prop({ default: false })
    lock_payment: boolean;

    @Prop({
        type: [{
            min_money: { type: Number, default: 0 },
            is_max_money: { type: Boolean },
            max_money: { type: Number, default: 0 },
            method: { type: [String], enum: ["momo", "vnpay"], default: "vnpay" },
            type: { type: String, enum: ["amount", "percent"], default: "percent" },
            value: { type: Number, default: 0 },
        }], default: []
    })
    discount_change: object[];
    @Prop({ default: 2000 })
    money_invite: number;
    @Prop({ default: "https://server-test.guvico.com/image/upload/42d85d3b9c766916257f4f85100f36361.jpeg" })
    background_promotion: string;

    @Prop({ default: 5 })
    otp_setting: number
    
    @Prop({ default: 20 })
    otp_setting_in_30days: number
    @Prop({ default: 5000 })
    count_down_loading_create_order: number
    @Prop({ default: 12 })
    limit_address: number
    @Prop({ default: 10000 })
    min_money: number

    @Prop({ default: true })
    is_cash_payment: boolean

    @Prop({ default: true })
    is_g_pay_payment: boolean

    @Prop({ default: true })
    is_momo_payment: boolean

    @Prop({ default: 5 })
    affiliate_discount_percentage: number // Phan tram chiet khau affiliate

    @Prop({ 
        type: [{ 
            title: { type: { vi: String, en: String }, default: null },
            icon: { type: String, default: null },
            titleIcon: { type: String, default: null },
            method: { type: String, default: null },
            img: { type: String, default: null },
            description: { type: { vi: String, en: String }, default: null },
            id_service_apply: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service', default: null }],
            allow_adding_card: { type: Boolean, default: false },
            is_activated: { type: Boolean, default: true },
            advertisement: {
                type: {
                    title: { type: { vi: String, en: String }, default: null },
                    link: String,
                    type_link: { type: String, enum: TYPE_LINK_ADVERTISEMENT, default: TYPE_LINK_ADVERTISEMENT.in_app },
                    id_promotion: { type: mongoose.Schema.Types.ObjectId, ref: 'Promotion', default: null },
                }, default: null
            }
        }], 
        default: null 
    })
    payment_method: object[];

    @Prop({ default: false })
    is_update_ota: boolean;

    @Prop({ default: null })
    url_ota_android: string;

    @Prop({ default: null })
    url_ota_ios: string;
}
export const customerSettingSchema = SchemaFactory.createForClass(CustomerSetting);