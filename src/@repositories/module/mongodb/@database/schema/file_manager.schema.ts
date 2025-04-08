import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Collaborator, Customer, ServiceDTO } from 'src/@core';


export type FileManagerDocument = FileManager & Document;

@Schema()
export class FileManager {

    @Prop({default: "" })
    title: string;

    @Prop({default: new Date().toISOString() })
    date_create: string;

    @Prop({default: "" })
    link_url: string;
}
export const fileManagerSchema = SchemaFactory.createForClass(FileManager);