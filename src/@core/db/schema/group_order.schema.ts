import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { Document } from 'mongoose'
import { Collaborator, Customer } from 'src/@core'
import { dateWorkScheduleDTOGroupOrder } from 'src/@core/dto/groupOrder.dto'
import { BaseEntity } from 'src/@repositories/module/mongodb/@database'
import { PAYMENT_METHOD, STATUS_ORDER } from 'src/@repositories/module/mongodb/@database/enum'


export type GroupOrderDocument = GroupOrder & Document;

@Schema()
export class GroupOrder extends BaseEntity {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null })
    id_customer: Customer | null;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Collaborator', default: null })
    id_collaborator: Collaborator | null;

    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }], required: true })
    id_order: string[];

    @Prop({ required: true })
    lat: string;

    @Prop({ required: true })
    lng: string;

    @Prop({ required: true, default: null })
    address: string;

    @Prop({ default: new Date().toISOString() })
    date_create: string;
    
    @Prop({ default: new Date().toISOString() })
    transaction_execution_date: string; // Thời gian thực hiện giao dịch

    // status: pending, doing, done, cancel
    @Prop({
        type: [{
            date: String,
            status: String,
            initial_fee: Number,
            // final_fee: Number,
            // net_income_collaborator: Number,
            platform_fee: Number,
        }], default: []
    })
    date_work_schedule: dateWorkScheduleDTOGroupOrder[];

    @Prop({ type: Number, enum: [1, 2, 3, 6, 0] })
    time_schedule: number;

    @Prop({ default: null })
    next_time: string;

    @Prop({ enum: ["single", "loop", "schedule"], default: "single" })
    type: string;

    // @Prop({ enum: ["collaborator", "group_collaborator", "partner" ], default: "collaborator" })
    // type_partner: string;

    // @Prop({ enum: ["doing", "done", "cancel"], default: "doing" })
    // status: string;

    @Prop({ enum: STATUS_ORDER, default: STATUS_ORDER.pending })
    status: string;

    @Prop({ default: false })
    is_auto_order: boolean;

    @Prop({ default: [] })
    day_loop: number[];

    @Prop({ default: 'Asia/Ho_Chi_Minh' })
    time_zone: string;

    @Prop({
        type: {
            _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
            type_partner: { type: String, enum: ["collaborator", "group_collaborator", "partner"], default: "collaborator" },
            time_schedule: { type: Number, enum: [1, 2, 3, 6, 0], default: null },
            optional_service: [{
                _id: { type: mongoose.Schema.Types.ObjectId, ref: "OptionalService" },
                type: { type: String },
                title: {
                    vi: String,
                    en: String,
                },
                description: {
                    vi: String,
                    en: String,
                },
                extend_optional: {
                    type: [{
                        _id: { type: mongoose.Schema.Types.ObjectId, ref: 'ExtendOptional' },
                        title: {
                            vi: String,
                            en: String,
                        },
                        description: {
                            vi: String,
                            en: String,
                        },
                        price: Number,
                        count: Number,
                        estimate: Number,
                        platform_fee: Number,
                        personal: Number,
                        id_extend_optional: {type: [Object], default: []},
                        thumbnail: String,
                        is_hide_collaborator: Boolean
                    }]
                }
            }]
        }, default: null
    })
    service: Object | any;

    // @Prop({ required: true, default: 0 })
    // final_fee: number;

    // @Prop({ required: true, default: 0 })
    // initial_fee: number;

    @Prop({ default: 0 })
    net_income_collaborator: number;

    @Prop({default: 0})
    total_estimate: number;

    @Prop({ default: "" })
    note: string;

    @Prop({ type: [{ _id: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceFee" }, fee: Number }], default: [] })
    service_fee: object[];

    @Prop({ type: Number, default: 1 })
    max_collaborator: number;

    @Prop({
        type: [{
            gross_income_collaborator: Number,
            net_income_collaborator: Number,
            pending_money: Number,
            refund_money: Number,
            _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Collaborator' }
        }], default: []
    })
    group_id_collaborator_second: object[]

    // @Prop({type: [{
    //     platform_fee: Number,
    //     net_income_collaborator: Number,
    //     gross_income_collaborator: Number
    // }], required: true })
    // group_fee_second: object[]

    // @Prop({type: [{
    //     platform_fee: Number,
    //     net_income_collaborator: Number,
    //     gross_income_collaborator: Number
    // }], required: true })
    // group_temp_fee_second: object[]

    @Prop({ default: false })
    is_delete: boolean;

    @Prop({ type: { _id: { type: mongoose.Schema.Types.ObjectId, ref: "Promotion" }, code: String, discount: Number }, default: null })
    code_promotion: object;

    @Prop({ type: [{ _id: { type: mongoose.Schema.Types.ObjectId, ref: "Promotion" }, discount: Number }], default: [] })
    event_promotion: object[];

    @Prop({ default: "house", enum: ["house", "apartment", "office"] })
    type_address_work: string;

    @Prop({ default: "" })
    note_address: string;

    @Prop({ enum: PAYMENT_METHOD, default: PAYMENT_METHOD.cash })
    payment_method: string;

    @Prop({
        type: {
            id_reason_cancel: { type: mongoose.Schema.Types.ObjectId, ref: "ReasonCancel" },
            date_create: { type: String, default: new Date(Date.now()).toISOString() }
        }, default: null
    })
    id_cancel_customer: object;

    @Prop({
        type: [{
            id_reason_cancel: { type: mongoose.Schema.Types.ObjectId, ref: "ReasonCancel" },
            id_collaborator: { type: mongoose.Schema.Types.ObjectId, ref: "Collaborator" },
            date_create: { type: String, default: new Date(Date.now()).toISOString() }
        }], default: []
    })
    id_cancel_collaborator: object[];

    @Prop({
        type: {
            id_reason_cancel: { type: mongoose.Schema.Types.ObjectId, ref: "ReasonCancel" },
            date_create: { type: String, default: new Date(Date.now()).toISOString() }
        }, default: null
    })
    id_cancel_system: object;

    @Prop({
        type: {
            id_reason_cancel: { type: mongoose.Schema.Types.ObjectId, ref: "ReasonCancel" },
            id_user_system: { type: mongoose.Schema.Types.ObjectId, ref: "UserSystem" },
            date_create: { type: String, default: new Date(Date.now()).toISOString() }
        }, default: null
    })
    id_cancel_user_system: object;

    // @Prop({ required: false, default: 0 })
    // platform_fee: number;

    @Prop({ default: 0 })
    temp_pending_money: number;

    @Prop({ default: 0 })
    temp_refund_money: number;

    @Prop({ required: false, default: 0 })
    temp_initial_fee: number;

    @Prop({ required: false, default: 0 })
    temp_final_fee: number;

    @Prop({ default: 0 })
    temp_net_income_collaborator: number;

    @Prop({ default: 0 })
    temp_platform_fee: number;

    @Prop({ default: null })
    id_view: string;

    @Prop({ default: 0 })
    ordinal_number: number;

    @Prop({ default: -1 })
    city: number;

    @Prop({ default: -1 })
    district: number;

    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Collaborator' }], default: [] })
    id_block_collaborator: string[];

    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Collaborator' }], default: [] })
    id_favourite_collaborator: string[];

    @Prop()
    name_customer: string | null;

    @Prop()
    phone_customer: string | null;

    @Prop()
    name_collaborator: string | null;

    @Prop()
    phone_collaborator: string | null;

    @Prop()
    customer_version: string;

    @Prop()
    collaborator_version: string;

    @Prop({
        type: {
            bonus_order_hot: { type: Number, default: 0 },
            bonus_holiday: { type: Number, default: 0 },
            bonus_rush_day: { type: Number, default: 0 },
            bonus_area: { type: Number, default: 0 }
        }, default: null
    })
    bonus_collaborator: object;

    @Prop({ default: 0 })
    tip_collaborator: number;

    @Prop({ default: null })
    date_tip_collaborator: string;

    @Prop({ default: 1 })
    personal: number;

    @Prop({ default: null })
    timestamp: number;

    @Prop({ default: [] })
    index_search_customer: string[]

    @Prop({ default: [] })
    index_search_collaborator: string[]

    @Prop({ default: null })
    deep_link: string;

    // tat ca chi phi cua 1 dich vu se nam o day

    @Prop({ default: 0 })
    initial_fee: number // tong so tien tam tinh cho KH

    @Prop({ default: 0 })
    final_fee: number // so tien cuoi cung KH can phai thanh toan

    // @Prop({ default: 0 })
    // promotion_value_fee: number // gia tri ap dung khuyen mai

    @Prop({ default: 0 })
    subtotal_fee: number // giá trị đơn hàng (chưa tính thuế), dùng để tính % hoa hồng cho đối tác

    @Prop({ default: 0 })
    platform_fee: number // % phi dich vu thu tu doi tac

    @Prop({ default: 0 })
    total_punish_money: number // tong tien dich vu cua don hang

    @Prop({ default: 0 })
    net_income: number; // thu nhap thuc te

    @Prop({ default: 0 })
    shift_income: number; // thu nhap ca lam

    @Prop({ type: [{
        id_collaborator: { type: mongoose.Schema.Types.ObjectId, ref: 'Collaborator', default: null },
        status: { type: String, enum: STATUS_ORDER, default: STATUS_ORDER.confirm },
        // total_punish_money: { type: Number, default: 0 },
        // net_income: { type: Number, default: 0 }
    }] , default: [] })
    info_linked_collaborator: object[]

    @Prop({ default: 0 })
    value_added_tax: number;

    @Prop({ default: false })
    is_check_duplicate: boolean;
}

export const groupOrderSchema = SchemaFactory.createForClass(GroupOrder);