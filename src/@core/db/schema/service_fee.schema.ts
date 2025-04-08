import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { languageDTO } from 'src/@core';

export type ServiceFeeDocument = ServiceFee & Document;

@Schema()
export class ServiceFee {

    @Prop({ type: { vi: String, en: String }, required: true, default: {vi: "", en: ""} })
    title: languageDTO;

    @Prop({ type: { vi: String, en: String }, required: true, default: {vi: "", en: ""} })
    description: languageDTO;


    @Prop({default: 0})
    fee: number;

    @Prop({default: false})
    is_service_apply: boolean;
    
    @Prop({type: [mongoose.Schema.Types.ObjectId], ref: 'GroupOrder', default: []})
    service_apply: any[];

    @Prop({default: "system", enum: ["system", "collaborator"]})
    fee_for: string;

    @Prop({default: true })
    is_active: boolean;

    @Prop({default: false })
    is_delete: boolean;
}

export const serviceFeeSchema = SchemaFactory.createForClass(ServiceFee);