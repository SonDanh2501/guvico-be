import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { Document } from 'mongoose'
import { Collaborator, Customer, UserSystem } from 'src/@core'
import { BaseEntity, PunishTicket } from 'src/@repositories/module/mongodb/@database'
import { SERVICE_DEFAULT } from 'src/@repositories/module/mongodb/@database/entity/order.entity'
import { PAYMENT_METHOD, STATUS_ORDER } from 'src/@repositories/module/mongodb/@database/enum'


export type OrderDocument = Order & Document;

@Schema()
export class Order extends BaseEntity {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null })
    id_customer: Customer | null;

    @Prop()
    name_customer: string | null;

    @Prop()
    phone_customer: string | null;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Collaborator', default: null })
    id_collaborator: Collaborator | null;

    @Prop()
    name_collaborator: string | null;

    @Prop()
    phone_collaborator: string | null;

    @Prop({ required: true, default: null })
    lat: string;

    @Prop({ required: true, default: null })
    lng: string;

    @Prop(
        {
            type: { type: String, default: "Point" },
            coordinates: { type: [Number], default: [] }
        }
    )
    location: Object;

    @Prop({ required: true, default: null })
    address: string;

    @Prop({ default: -1 })
    city: number;

    @Prop({ default: -1 })
    district: number;

    @Prop({default: new Date().toISOString()})
    date_create: string;

    @Prop({ required: true, default: null })
    date_work: string;

    @Prop({ required: true, default: null })
    end_date_work: string;

    @Prop({ default: null })
    collaborator_start_date_work: string;

    @Prop({ default: null })
    collaborator_end_date_work: string;

    @Prop({ type: [String], default: [] })
    id_promotion: string[];

    @Prop({ enum: STATUS_ORDER, default: STATUS_ORDER.pending })
    status: string;

    @Prop({
        type: {
            _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
            id_service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
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
        }, default: SERVICE_DEFAULT
    })
    service: Object;

    // @Prop({ required: true, default: 0 })
    // final_fee: number;

    // @Prop({ required: false, default: 0 }) // loai bo
    // collaborator_fee: number;

    // @Prop({ required: true, default: 0 })
    // initial_fee: number;

    @Prop({ required: false, default: 0 }) // loai bo
    net_income_collaborator: number;

    @Prop({ required: false, default: 0 }) // loai bo
    gross_income_collaborator: number;

    // @Prop({ required: false, default: 0 }) // tong phi nen tang
    // platform_fee: number;

    @Prop({ required: false, default: 0 }) // tien tam giu tu CTV 
    pending_money: number;

    @Prop({ required: false, default: 0 }) // tien hoan lai cho CTV neu ca lam thanh toan bang tien mat va co khuyen mai
    refund_money: number;

    // @Prop({ default: 0 }) // loai bo
    // change_money: number;

    @Prop({
        type: [{
            gross_income_collaborator: Number,
            net_income_collaborator: Number,
            pending_money: Number,
            refund_money: Number,
            _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Collaborator' }
        }], default: []
    })
    group_id_collaborator_second: object[] | []

    // @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Collaborator', default: [] })
    // group_id_collaborator_second: Collaborator | []

    // @Prop({type: [{
    //     platform_fee: Number,
    //     net_income_collaborator: Number,
    //     gross_income_collaborator: Number
    // }], required: true })
    // group_fee_second: object[]

    @Prop({ required: true, default: 0 })
    total_estimate: number;

    @Prop({ type: [{ _id: String, fee: Number }], default: [] })
    service_fee: object[];

    @Prop({ type: { _id: { type: mongoose.Schema.Types.ObjectId, ref: "Promotion" }, code: String, discount: Number }, default: null })
    code_promotion: object;

    @Prop({ type: [{ _id: { type: mongoose.Schema.Types.ObjectId, ref: "Promotion" }, discount: Number }], default: [] })
    event_promotion: object[];

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'GroupOrder', required: true, default: null })
    id_group_order: string;

    @Prop({ required: true, default: false })
    is_delete: boolean;

    @Prop({ default: "" })
    note: string;

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
            id_user_system: { type: mongoose.Schema.Types.ObjectId, ref: "UserSystem" },
            date_create: { type: String, default: new Date(Date.now()).toISOString() }
        }, default: null
    })
    id_cancel_user_system: object;

    @Prop({
        type: {
            id_reason_cancel: { type: mongoose.Schema.Types.ObjectId, ref: "ReasonCancel" },
            date_create: { type: String, default: new Date(Date.now()).toISOString() }
        }, default: null
    })
    id_cancel_system: object;

    @Prop({ default: "house", enum: ["house", "apartment", "office"] })
    type_address_work: string;

    @Prop({ default: "" })
    note_address: string;

    @Prop({ default: false })
    is_duplicate: boolean;

    @Prop({ required: false })
    convert_time: boolean;

    @Prop({ default: null })
    id_view: string;

    @Prop({ default: 0 })
    ordinal_number: number;

    @Prop({ default: '' })
    review: string;

    @Prop({ default: null })
    date_create_review: string;

    @Prop({ default: 0, enum: [0, 1, 2, 3, 4, 5] })
    star: number;

    @Prop({ default: [] })
    short_review: string[];

    @Prop({ default: false })
    is_hide: boolean;

    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Collaborator' }], default: [] })
    id_block_collaborator: string[];

    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Collaborator' }], default: [] })
    id_favourite_collaborator: string[];

    @Prop({ default: false })
    active_quick_review: boolean;

    @Prop({ type: String, enum: ["pending", "processing", "not_contact", "done"], default: "pending" })
    status_handle_review: string;

    @Prop({ default: '' })
    note_admin: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "UserSystem", default: null })
    id_user_system_handle_review: UserSystem;

    @Prop({
        type: [{
            id_user_system_handle_review: { type: mongoose.Schema.Types.ObjectId, ref: "UserSystem", default: null },
            status_handle_review: { type: String, default: null },
            note_admin: { type: String, default: "" },
            date_create: { type: String, default: new Date(Date.now()).toISOString() }
        }], default: []
    })
    history_user_system_handle_review: any[];

    // bo
    // @Prop({
    //     type: {
    //         id_user_system: { type: mongoose.Schema.Types.ObjectId, ref: "UserSystem" },
    //         date_create: { type: String, default: new Date(Date.now()).toISOString() }
    //     }
    // })
    // temp: object;

    @Prop({ default: false })
    is_system_review: boolean;

    @Prop({
        type: {
            bonus_order_hot: { type: Number, default: 0 },
            bonus_holiday: { type: Number, default: 0 },
            bonus_rush_day: { type: Number, default: 0 },
            bonus_area: { type: Number, default: 0 }
        }, default: null
    })
    bonus_collaborator: Object;

    @Prop({ default: false })
    is_check_admin: boolean;

    @Prop({ default: null })
    date_check_admin: string;

    @Prop({ default: 0 })
    tip_collaborator: number;

    @Prop({ default: null })
    date_tip_collaborator: string;


    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Business', default: null })
    id_business: string;

    // Phần cho nhiều CTV trong ca làm
    @Prop({ default: false })
    is_captain: boolean;

    @Prop({ default: 1 })
    personal: number;

    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PunishTicket' }], default: [] })
    id_punish_ticket: PunishTicket[];

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
        call_to_customer: {type: Boolean, default: false}
        // total_punish_money: { type: Number, default: 0 },
        // net_income: { type: Number, default: 0 }
    }] , default: [] })
    info_linked_collaborator: object[]

    @Prop({ default: 0 })
    value_added_tax: number;

    @Prop({ default: 0 })
    work_shift_deposit: number; // Số tiền đặt cọc ca làm việc 

    @Prop({ default: 0 })
    remaining_shift_deposit: number; // Số tiền đặt cọc ca làm việc còn lại

    @Prop({ default: 0 })
    total_fee: number; // Tổng tiền trước khuyến mãi (bằng initial_fee + service_fee[0].fee)

    @Prop({ default: null })
    cancellation_date: string; // Ngày hủy đơn hàng

    @Prop({ default: null })
    completion_date: string; // Ngày hoàn thành đơn hàng

    @Prop({ default: null })
    work_start_date: string; // Ngày bắt đầu thực hiện đơn hàng

    @Prop({ type: [{ 
        date_create: { type: String, default: null },
        fee: { type: Number, default: 0}
    }], default: [] })
    incurrence_time: object[] // Thời gian phát sinh các phí khác

    @Prop({ default: 0 })
    total_punish: number; // Tổng tiền phạt

    @Prop({ default: 0 })
    total_refund_fee: number; // Tổng tiền hoàn

    @Prop({ default: 0 })
    total_discount: number; // Tổng tiền hoàn

    @Prop({ type: [{ 
        id_punish_ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'PunishTicket' },
        date_create: { type: String, default: null }, // Ngày tạo phiếu
        execution_date: { type: String, default: null }, // Ngày hiệu lực của phiếu
        revocation_date: { type: String, default: null }, // Ngày thu hồi phiếu
    }], default: [] })
    list_of_punish_ticket: object[]; // Danh sách các vé phạt
    
    @Prop({ default: false })
    is_rush_time: boolean; // Xem đơn hàng có tăng giá không 
}
export const orderSchema = SchemaFactory.createForClass(Order);
orderSchema.index({ location: "2dsphere" });