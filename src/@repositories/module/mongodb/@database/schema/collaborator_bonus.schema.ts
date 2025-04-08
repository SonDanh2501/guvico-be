import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Collaborator, Customer, ExtendOptional, OptionalService, ServiceDTO } from 'src/@core';


export type CollaboratorBonusDocument = CollaboratorBonus & Document;

@Schema()
export class CollaboratorBonus {
    @Prop({ default: "" })
    title: string;

    @Prop({ default: "" })
    description: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'OptionalService', default: null })
    id_optional_service: OptionalService;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'ExtendOptional', default: null })
    id_extend_optional: ExtendOptional;

    @Prop({ default: false })
    is_bonus_area: boolean
    @Prop({
        type: [{
            level_0: { type: String },
            level_1: { type: Number },
            level_2: [Number],
            type_calculate: { type: String, enum: ["accumulate", "replace"], default: "accumulate" }, // accumulate = cong don len
            value: { type: Number },
            type_bonus: { type: String, enum: ["percent", "amount", "amount_per_hour",], default: "percent" },
        }], default: []
    })
    bonus_area: Object[]

    @Prop({ default: false })
    is_bonus_rush_day: boolean
    @Prop({
        type: [{
            day_loop: { type: [Number], enum: [1, 2, 3, 4, 5, 6, 0], default: [] },
            type_calculate: { type: String, enum: ["accumulate", "replace"], default: "accumulate" }, // accumulate = cong don len
            time_loop: { type: String, default: null },
            type_bonus: { type: String, enum: ["percent", "amount", "amount_per_hour",], default: "percent" },
            value: { type: Number },
            timezone: { type: String }
        }]
        , default: []
    })
    bonus_rush_day: Object[]

    @Prop({ default: false })
    is_bonus_holiday: boolean
    @Prop({
        type: [{
            time_start: { type: String, default: new Date().toISOString() },
            time_end: { type: String, default: new Date().toISOString() },
            type_calculate: { type: String, enum: ["accumulate", "replace"], default: "accumulate" },
            type_bonus: { type: String, enum: ["percent", "amount", "amount_per_hour",], default: "percent" },
            value: { type: Number }
        }]
        , default: []
    })
    bonus_holiday: Object[]

    @Prop({ default: false })
    is_bonus_order_hot: boolean
    @Prop({
        type: [{
            time_before_date_work: { type: Number },
            type_calculate: { type: String, enum: ["accumulate", "replace"], default: "accumulate" },
            type_bonus: { type: String, enum: ["percent", "amount", "amount_per_hour",], default: "percent" },
            value: { type: Number }
        }], default: []
    })
    bonus_order_hot: Object[]

    @Prop({ default: new Date(Date.now()).toISOString() })
    date_create: string;

    @Prop({ default: false })
    is_delete: boolean;

    @Prop({ default: true })
    is_active: boolean;
}
export const collaboratorBonusSchema = SchemaFactory.createForClass(CollaboratorBonus);