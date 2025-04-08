import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { languageDTO } from 'src/@core/dto';

export type GroupPromotionDocument = GroupPromotion & Document;

@Schema()
export class GroupPromotion {
  // @Prop({ default: "", enum: ["beautify", "other"] })
  // type: string;

  @Prop({ type: { vi: String, en: String }, required: true })
  name: languageDTO;

  @Prop({ type: { vi: String, en: String }, required: true })
  description: languageDTO;

  @Prop({ default: new Date(Date.now()).toISOString() })
  date_create: string;

  @Prop({ default: "" })
  thumbnail: string;

  @Prop({ default: false })
  is_delete: boolean;

  @Prop({ default: true })
  is_active: boolean;

  @Prop({ default: 0 })
  position: number;

  @Prop({ default: "" })
  type_render_view: string;
}

export const groupPromotionSchema = SchemaFactory.createForClass(GroupPromotion);