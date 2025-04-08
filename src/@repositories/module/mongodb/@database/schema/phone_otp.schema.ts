import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { BaseEntity } from '../entity/base.entity'
import { PHONE_OTP_TYPE } from '../enum/base.enum'

export type PhoneOTPDocument = PhoneOTP & Document;

@Schema()
export class PhoneOTP extends BaseEntity {


    @Prop({ required: true })
    token: string;

    @Prop({ default: new Date(Date.now()).toISOString() })
    date_create: string;

    @Prop({ default: new Date(Date.now()).toISOString() })
    date_update: string;

    @Prop({ required: true })
    code_phone_area: string;

    @Prop({ required: true })
    phone: string;

    @Prop({ required: true , enum: ['customer', 'collaborator']})
    user_type: string;

    @Prop({ required: true , enum: PHONE_OTP_TYPE})
    type: string;

    @Prop({type: Object, default: {}})
    headers_request: object;

    @Prop({ default: null })
    tracking_id: string;
}

export const phoneOTPSchema = SchemaFactory.createForClass(PhoneOTP);