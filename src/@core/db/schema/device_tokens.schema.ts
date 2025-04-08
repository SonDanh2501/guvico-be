import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { BaseEntity } from 'src/@repositories/module/mongodb/@database'

export type DeviceTokenDocument = DeviceToken & Document;

@Schema()
export class DeviceToken extends BaseEntity {


    @Prop({ required: true, default: null })
    token: string;

    @Prop({ default: new Date(Date.now()).toISOString() })
    date_create: string;

    @Prop({ required: true, enum: ["customer", "collaborator"] })
    user_object: string;

    @Prop({type: String, default: null})
    user_id: string;

    @Prop({ default: new Date(Date.now()).toISOString() })
    date_update: string;
}

export const deviceTokenSchema = SchemaFactory.createForClass(DeviceToken);