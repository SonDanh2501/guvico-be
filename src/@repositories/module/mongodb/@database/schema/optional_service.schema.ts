import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { title } from 'process';
import { TYPE_COMPONENT } from 'src/@core';
import { languageDTO } from 'src/@core/dto';

export type OptionalServiceDocument = OptionalService & Document;

@Schema()
export class OptionalService {

    @Prop({ type: { vi: String, en: String }, required: true })
    title: languageDTO;

    @Prop({ required: true, default: null })
    thumbnail: string;

    @Prop({ required: true, enum: TYPE_COMPONENT, default: "select_horizontal_no_thumbnail" })
    type: string;

    @Prop({ type: { vi: String, en: String }, default: { en: "", vi: "" } })
    description: languageDTO;

    @Prop({ required: true, default: "" })
    id_service: string;

    @Prop({ default: true })
    is_active: boolean;

    @Prop({ default: false })
    is_delete: boolean;

    @Prop({ default: 1 })
    screen: number;

    @Prop({ default: 0 })
    position: number;

    // @Prop({ default: "", enum: ["detail_work", "note", "note_customer", "note_collaborator", "note_admin"] })
    // view_confirm: string;

    @Prop({ default: 0 })
    platform_fee: number;

    // @Prop({ type: [{
    //     // district: [Number], 
    //     // city: Number, 
    //     level_1: Number, 
    //     level_2: [Number], 
    //     value: Number, 
    //     type_discount: {type: String, enum: ["amount", "amount_by_root", "percent_by_root"], default: "amount"}, 
    // }], default: []})
    // price_option_area: any[];

    @Prop({
        type: [{
            time_start: String,
            time_end: String,
            type_increase: { type: String, enum: ["amount_accumulate", "percent_accumulate"], default: "percent_accumulate" },
            value: Number
        }], default: []
    })
    price_option_holiday: any[];

    @Prop({
        type: [{
            time_start: String,
            time_end: String,
            platform_fee: Number
        }], default: []
    })
    platform_fee_price_option_holiday: any[];

    @Prop({
        type: [{
            time_start: String,
            time_end: String,
            time_zone_apply: String,
            type_increase: { type: String, enum: ["amount_accumulate", "percent_accumulate"], default: "percent_accumulate" },
            value: Number
        }], default: []
    })
    price_option_rush_hour: any[];

    @Prop({
        type: [{
            time_start: String,
            time_end: String,
            time_zone_apply: String,
            platform_fee: Number
        }], default: []
    })
    platform_fee_price_option_rush_hour: any[];

    @Prop({
        type: [{
            rush_day: [Number],
            time_zone_apply: String,
            type_increase: { type: String, enum: ["amount_accumulate", "percent_accumulate"], default: "percent_accumulate" },
            value: Number
        }], default: []
    })
    price_option_rush_day: any[];

    @Prop({
        type: [{
            rush_day: [Number],
            time_zone_apply: String,
            platform_fee: Number
        }], default: []
    })
    platform_fee_price_option_rush_day: any[];

    @Prop({ default: false })
    is_main_optional: boolean;
}

export const optionalServiceSchema = SchemaFactory.createForClass(OptionalService);