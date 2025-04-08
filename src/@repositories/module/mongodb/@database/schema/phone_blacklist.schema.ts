import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { BaseEntity } from '../entity/base.entity'
import { USER_TYPE } from '../enum/base.enum'

export type PhoneBlacklistDocument = PhoneBlacklist & Document;

@Schema()
export class PhoneBlacklist extends BaseEntity {
  @Prop({ required: true })
  phone: string;

  @Prop({ required: true , enum: USER_TYPE})
  user_type: string;

  @Prop({ default: new Date(Date.now()).toISOString() })
  date_create: string;

  @Prop({ default: false })
  is_skipped: boolean;
}

export const phoneBlacklistSchema = SchemaFactory.createForClass(PhoneBlacklist);