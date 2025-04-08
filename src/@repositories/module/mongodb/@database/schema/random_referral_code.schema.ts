import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { BaseEntity } from '../entity'

export type RandomReferralCodeDocument = RandomReferralCode & Document;

@Schema()
export class RandomReferralCode extends BaseEntity {

  @Prop({ default: "" })
  referral_code: string;

  @Prop({ default: false })
  is_used: boolean;
}

export const randomReferralCodeSchema = SchemaFactory.createForClass(RandomReferralCode);