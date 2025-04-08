import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { languageDTO } from 'src/@core/dto';

export type PriceOptionDocument = PriceOption & Document;


@Schema()
export class PriceOption {
    @Prop({ type: String, default: "" })
    title: string;

    @Prop({ type: String, default: ""})
    description: string;

    @Prop({ default: true })
    is_active: boolean;

    @Prop({ default: false })
    is_delete: boolean;

    @Prop({
        type: [{
            district: [Number],
            city: Number,
            level_0: {type: String, default: null},
            level_1: {type: String, default: null},
            level_2: {type: [String], default: null},
            value: {type: Number, default: 0},
            type_increase: { type: String, enum: ["amount", "amount_by_root", "percent_by_root"], default: "amount" },
            is_price_option_rush_day: {type: Boolean, default: false},
            price_option_rush_day: [{
                title: {type: String, default: ""},
                day_local: {type: [Number], default: []},
                start_time_local: {type: String, default: null},
                end_time_local: {type: String, default: null},
                timezone: { type: String },
                type_increase: { type: String, enum: ["amount_accumulate", "percent_accumulate"], default: "percent_accumulate" },
                value: {type: Number, default: 0},
            }],
            is_price_option_holiday: {type: Boolean, default: false},
            price_option_holiday: [{
                title: {type: String, default: ""},
                time_start: String,
                time_end: String,
                type_increase: { type: String, enum: ["amount_accumulate", "percent_accumulate"], default: "percent_accumulate" },
                value: {type: Number, default: 0},
            }]
        }], default: {}
    })
    price_option_area: any[];


    @Prop({
        type: [{
            title: {type: String, default: ""},
            day_local: {type: [Number], default: []},
            start_time_local: {type: String, default: null},
            end_time_local: {type: String, default: null},
            timezone: { type: String },
            type_increase: { type: String, enum: ["amount_accumulate", "percent_accumulate"], default: "percent_accumulate" },
            value: Number
        }], default: []
    })
    price_option_rush_day: any[];

    @Prop({
        type: [{
            title: {type: String, default: ""},
            time_start: String,
            time_end: String,
            type_increase: { type: String, enum: ["amount_accumulate", "percent_accumulate"], default: "percent_accumulate" },
            value: Number
        }], default: []
    })
    price_option_holiday: any[];
}

export const priceOptionSchema = SchemaFactory.createForClass(PriceOption);