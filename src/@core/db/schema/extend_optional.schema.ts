import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { Document } from 'mongoose'
import { languageDTO } from 'src/@core/dto'
import { BaseEntity } from 'src/@repositories/module/mongodb/@database'
import { SELECTION_TYPE, TYPE_OF_KIND_V2 } from 'src/@repositories/module/mongodb/@database/enum/extend_optional.enum'

export type ExtendOptionalDocument = ExtendOptional & Document;


@Schema()
export class ExtendOptional extends BaseEntity {
    @Prop({ type: { vi: String, en: String }, required: true, default: { en: "", vi: "" }  })
    title: languageDTO;

    @Prop({ default: "" })
    thumbnail: string;

    @Prop({ default: "" })
    thumbnail_active: string;

    @Prop({ required: true, default: { en: "", vi: "" } })
    description: languageDTO;

    @Prop({ default: true })
    is_active: boolean;

    // @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'OptionalService', default: null })
    // id_optional_service: OptionalService | null;
    @Prop({ required: true, default: null })
    id_optional_service: string;


    @Prop({ required: true, default: 0 })
    position: number;

    @Prop({ default: 0 })
    price: number;

    ///// tuong lai khong su dung //////
    @Prop({ default: false })
    is_price_option_area: boolean

    @Prop({
        type: [{
            district: [Number],
            city: Number,
            // level_1: Number, 
            // level_2: [Number], 
            value: Number,
            type_increase: { type: String, enum: ["amount", "amount_by_root", "percent_by_root"], default: "amount" },
            price_option_rush_day: {
                type: [{
                    rush_days: [Number],
                    start_time: String,
                    end_time: String,
                    time_zone_apply: { type: Number, default: 7 },
                    type_increase: { type: String, enum: ["amount_accumulate", "percent_accumulate",], default: "percent_accumulate" },
                    value: Number,
                    // amount_accumulate tang gia cong don theo gia co dinh
                    // percent_accumulate tang gia cong don theo gia %
                }],
                default: []
            },
            price_option_holiday: {
                type: [{
                    time_start: String,
                    time_end: String,
                    type_increase: { type: String, enum: ["amount_accumulate", "percent_accumulate"], default: "percent_accumulate" },
                    value: Number
                }],
                default: []
            }
        }], default: []
    })
    price_option_area: any[];
    ///// tuong lai khong su dung //////

    @Prop({
        type: [{
            district: [Number],
            city: Number,
            platform_fee: Number,
        }], default: []
    })
    platform_fee_price_option_area: any[];

    ///// tuong lai khong su dung //////
    @Prop({ default: false })
    is_price_option_holiday: boolean

    @Prop({
        type: [{
            time_start: String,
            time_end: String,
            type_increase: { type: String, enum: ["amount_accumulate", "percent_accumulate"], default: "percent_accumulate" },
            value: Number
        }], default: []
    })
    price_option_holiday: any[];
    ///// tuong lai khong su dung //////

    @Prop({
        type: [{
            time_start: String,
            time_end: String,
            platform_fee: Number
        }], default: []
    })
    platform_fee_price_option_holiday: any[];


    ///// tuong lai khong su dung //////
    @Prop({ default: false })
    is_price_option_rush_hour: boolean

    @Prop({
        type: [{
            time_start: String,
            time_end: String,
            time_zone_apply: Number,
            type_increase: { type: String, enum: ["amount_accumulate", "percent_accumulate"], default: "percent_accumulate" },
            value: Number
        }], default: []
    })
    price_option_rush_hour: any[];
    ///// tuong lai khong su dung //////

    @Prop({
        type: [{
            time_start: String,
            time_end: String,
            time_zone_apply: Number,
            platform_fee: Number
        }], default: []
    })
    platform_fee_price_option_rush_hour: any[];


    ///// tuong lai khong su dung //////
    @Prop({ default: false })
    is_price_option_rush_day: boolean

    @Prop({
        type: [{
            rush_day: [Number],
            time_zone_apply: Number,
            type_increase: { type: String, enum: ["amount_accumulate", "percent_accumulate"], default: "percent_accumulate" },
            value: Number
        }], default: []
    })
    price_option_rush_day: any[];
    ///// tuong lai khong su dung //////

    @Prop({
        type: [{
            rush_day: [Number],
            time_zone_apply: Number,
            platform_fee: Number
        }], default: []
    })
    platform_fee_price_option_rush_day: any[];

    @Prop({ default: 1 })
    count: number;

    @Prop({ default: 0 })
    estimate: number;

    @Prop({ default: "" })
    note: string;

    // @Prop({ default: false })
    // is_delete: boolean;

    @Prop({ default: false })
    status_default: boolean;

    @Prop({ default: false })
    checked: boolean;

    @Prop({ default: 1 })
    personal: number;

    @Prop({ default: 0 })
    position_view: number;

    @Prop({ default: true })
    is_show_in_app: boolean

    @Prop({ default: false })
    is_platform_fee: boolean;

    @Prop({ default: 0 })
    platform_fee: number;

    // @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'PriceOption', default: null })
    // id_price_option: Object;



    // @Prop({
    //     type: [{
    //         district: [Number],
    //         city: Number,
    //         level_0: {type: String, default: null},
    //         level_1: {type: String, default: null},
    //         level_2: {type: [String], default: null},
    //         value: {type: Number, default: 0},
    //         type_increase: { type: String, enum: ["amount", "amount_by_root", "percent_by_root"], default: "amount" },
    //         is_price_option_rush_day: {type: Boolean, default: false},
    //         price_option_rush_day: [{
    //             title: {type: String, default: ""},
    //             day_local: {type: [Number], default: []},
    //             start_time_local: {type: String, default: null},
    //             end_time_local: {type: String, default: null},
    //             timezone: { type: String },
    //             type_increase: { type: String, enum: ["amount_accumulate", "percent_accumulate"], default: "percent_accumulate" },
    //             value: {type: Number, default: 0},
    //         }],
    //         is_price_option_holiday: {type: Boolean, default: false},
    //         price_option_holiday: [{
    //             title: {type: String, default: ""},
    //             time_start: String,
    //             time_end: String,
    //             type_increase: { type: String, enum: ["amount_accumulate", "percent_accumulate"], default: "percent_accumulate" },
    //             value: {type: Number, default: 0},
    //         }]
    //     }], default: {}
    // })
    // price_option_area: any[];


    // @Prop({
    //     type: [{
    //         title: {type: String, default: ""},
    //         day_local: {type: [Number], default: []},
    //         start_time_local: {type: String, default: null},
    //         end_time_local: {type: String, default: null},
    //         timezone: { type: String },
    //         type_increase: { type: String, enum: ["amount_accumulate", "percent_accumulate"], default: "percent_accumulate" },
    //         value: Number
    //     }], default: []
    // })
    // price_option_rush_day: any[];

    // @Prop({
    //     type: [{
    //         title: {type: String, default: ""},
    //         time_start: String,
    //         time_end: String,
    //         type_increase: { type: String, enum: ["amount_accumulate", "percent_accumulate"], default: "percent_accumulate" },
    //         value: Number
    //     }], default: []
    // })
    // price_option_holiday: any[];

    @Prop({ default: '' })
    kind: string;

    @Prop({ type: [{
        is_active: Boolean,
        area_lv_1: Number,
        platform_fee: Number,
        price_type_increase: { type: String, enum: ["amount", "amount_by_root", "percent_by_root"], default: "amount" },
        price: Number,
        price_option_rush_day: {
            type: [{
                rush_days: [Number],
                start_time: String,
                end_time: String,
                time_zone_apply: { type: Number, default: 7 },
                price_type_increase: { type: String, enum: ["amount_accumulate", "percent_accumulate",], default: "percent_accumulate" },
                price: Number,
                is_platform_fee: Boolean,
                platform_fee: Number
                // amount_accumulate tang gia cong don theo gia co dinh
                // percent_accumulate tang gia cong don theo gia %
            }],
            default: []
        },
        price_option_holiday: {
            type: [{
                time_start: String,
                time_end: String,
                price_type_increase: { type: String, enum: ["amount_accumulate", "percent_accumulate"], default: "percent_accumulate" },
                price: Number, 
                is_platform_fee: Boolean,
                platform_fee: Number
            }],
            default: []
        },
        area_lv_2: {
            type: [{
                is_active: Boolean,
                area_lv_2: [Number],
                price: Number,
                is_platform_fee: Boolean,
                platform_fee: Number
            }],
            default: []
        }
    }], default: [] })
    area_fee: any[];

    @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'ExtendOptional', default: [] })
    id_extend_optional: string[];

    @Prop({default: false})
    is_hide_collaborator: boolean;
    
    /** Loại lựa chọn */
    @Prop({ type: {
        kind: { type: String, enum: SELECTION_TYPE, default: null },
        title: { type: { vi: String, en: String }, default: null }, // Tiêu đề dành cho kind = SELECTION_TYPE.input
        description: { type: {  vi: String, en: String }, default: null}, // Mô tả dành cho kind = SELECTION_TYPE.input
        value: { type: mongoose.Schema.Types.Mixed, default: null }
    }, default: null })
    selection_type: object ;

    @Prop({ type: { 
        title: { type: { vi: String, en: String }, default: null }, // Tiêu đề dùng để phân biệt extend optional là của optional service nào
        kind: { type: String, enum: TYPE_OF_KIND_V2, default: null }, // Dùng để biết extend optional được chọn nhiều hay chọn một
    }, default: null })
    kind_v2: object;

    /** Giới hạn */
    @Prop({ type: { 
        name: { type: { vi: String, en: String }, default: null },
        unit: { type: String, default: null },
        min_value: { type: Number, default: 0 },
        max_value: { type: Number, default: 1 },
    }, default: null })
    limit: object;

    /** Cho biết dịch vụ đó có được chọn hay không */
    @Prop({ default:false })
    select_value: boolean 

    /** Khóa dịch vụ không chọn trực tiếp */
    @Prop({ default:false })
    is_locked: boolean
}

export const extendOptionalSchema = SchemaFactory.createForClass(ExtendOptional);