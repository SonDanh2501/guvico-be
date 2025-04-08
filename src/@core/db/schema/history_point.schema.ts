import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { languageDTO } from 'src/@core';

export type HistoryPointDocument = HistoryPoint & Document;

@Schema()
export class HistoryPoint {
    @Prop({ required: true, enum: ["customer", "collaborator", "admin"] })
    creator_object: string;

    @Prop({ required: true })
    id_creator: string;

    @Prop({ required: true, enum: ["customer", "collaborator", "admin"] })
    owner_object: string;

    @Prop({ required: true })
    owner_id: string;

    @Prop({ required: true, enum: ["order", "exchange_point"] })
    related: string;
    
    @Prop({ default: null })
    related_id: string;

    @Prop({ default: Date.now() })
    date_create: string;

    @Prop({ default: 0 })
    value: number;
}

export const historyPointSchema = SchemaFactory.createForClass(HistoryPoint);