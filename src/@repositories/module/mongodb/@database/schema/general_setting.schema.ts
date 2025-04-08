import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Collaborator, Customer, ServiceDTO } from 'src/@core';


export type GeneralSettingDocument = GeneralSetting & Document;

@Schema()
export class GeneralSetting {
    @Prop({default: "1.0.0" })
    version_collaborator: string;

    @Prop({default: "1.0.0" })
    version_customer: string;
}
export const generalSettingSchema = SchemaFactory.createForClass(GeneralSetting);