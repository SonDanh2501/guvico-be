import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { languageDTO } from 'src/@core'

export type ServiceDocument = Service & Document;

@Schema()
export class Service {
    @Prop({ type: { vi: String, en: String }, required: true, default: { en: "", vi: "" } })
    title: languageDTO;

    @Prop({ required: true, default: "" })
    thumbnail: string;

    @Prop({ type: { vi: String, en: String }, default: { en: "", vi: "" } })
    description: languageDTO;

    @Prop({default: true })
    is_show_in_app: boolean

    // bo, khong dung trong bản sap toi
    @Prop({default: true })
    is_active: boolean;

    @Prop({ required: true, default: "" })
    id_group_service: string;

    @Prop({default: 0 })
    position: number;

    @Prop({default: false })
    is_delete: boolean;

    @Prop({ enum: ["single", "loop", "schedule"], default: "single" })
    type: string;

    // @Prop({ enum: ["giup_viec_theo_gio", "giup_viec_co_dinh", "tong_ve_sinh", "phuc_vu_nha_hang"]})
    @Prop({ default: '' })
    kind: string;

    // bo, khong dung nua
    @Prop({ enum: ["week", "month", "none"], default: "none" })
    type_loop_or_schedule: string;

    @Prop({ default: false })
    is_auto_order: boolean;

    // bo, khong dung nua
    @Prop({ default: 1 })
    time_repeat: number;

    // bo, khong dung nua
    @Prop({ type: [Number], default: [], enum: [1, 2, 3, 6] })
    time_schedule: number[];

    // bo, khong dung nua
    @Prop({ enum: ["one_page", "two_page"], default: "two_page" })
    type_page: string;

    @Prop({ default: "" })
    note: string;

    @Prop({ default: 4 })
    max_estimate: number;

    @Prop({ default: 2 })
    minimum_time_order: number

    @Prop({ default: "viet_nam" })
    area_lv_0: String;

    // @Prop({ type: [{
    //     area_lv_1: [Number],
    //     area_lv_2: [Number],
    //     value: Number
    // }], default: [] })
    // minimum_time_order: Object[]

    // @Prop({ default: 30 })
    // platform_fee: number;

    @Prop({ enum: ["collaborator", "group_collaborator", "partner" ], default: "collaborator" })
    type_partner: string;

    // @Prop({ type: [{district: [Number], city: Number, value: Number, type_increase: String}], default: []})
    // price_option_area: any[];

    // @Prop({ type: [{time_start: String, time_end: String, value: Number, type_increase: String}], default: []})
    // price_option_holiday: any[];

    // @Prop({ type: [{rush_day: [Number], time_start: String, time_end: String, value: Number, type_increase: String}], default: []})
    // price_option_rush_hour: any[];

    @Prop({ type: [{
        is_active: Boolean,
        area_lv_1: Number,
        platform_fee: Number,
    }], default: [] })
    area_fee: any[];
}

export const serviceSchema = SchemaFactory.createForClass(Service);