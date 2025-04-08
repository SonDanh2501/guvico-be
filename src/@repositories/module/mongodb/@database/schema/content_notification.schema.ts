import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { languageDTO } from 'src/@core';
import { BaseEntity } from '../entity';

export type ContentNotificationDocument = ContentNotification & Document;

@Schema({
    timestamps: {
		createdAt: 'created_at',
		updatedAt: 'updated_at',
	}
})
export class ContentNotification extends BaseEntity {

    @Prop({ type: { vi: String, en: String }, required: true, default: { en: "", vi: "" } })
    title: languageDTO;

    @Prop({ type: { vi: String, en: String }, default: { en: "", vi: "" } })
    description: languageDTO;

    @Prop({ default: new Date(Date.now()).toISOString() })
    date_create: string;

    @Prop({ default: null })
    type_notification: string

    @Prop({ enum: ['customer', 'collaborator'], default: 'customer' })
    user_apply: string
    
}

export const contentNotificationSchema = SchemaFactory.createForClass(ContentNotification);