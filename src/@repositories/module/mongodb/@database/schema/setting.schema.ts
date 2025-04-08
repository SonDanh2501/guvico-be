import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Collaborator, Customer, ServiceDTO } from 'src/@core';


export type SettingDocument = Setting & Document;

@Schema()
export class Setting {
    @Prop({ default: false })
    close_server: boolean;
}
export const settingSchema = SchemaFactory.createForClass(Setting);