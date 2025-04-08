import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { languageDTO } from 'src/@core/dto';
import { coditionDTOGroupCustomer } from 'src/@core/dto/groupCustomer.dto';

export type TypePromotionDocument = TypePromotion & Document;

@Schema()
export class TypePromotion {
  @Prop({ default: "", enum: ["beautify", "other"] })
  type: string;

  @Prop({ type: { vi: String, en: String }, required: true })
  name: languageDTO;

  @Prop({ default: "" })
  thumbnail: string;

  @Prop({ default: false })
  is_delete: boolean;

  @Prop({ default: true })
  is_active: boolean;
}

export const typeTypePromotionSchema = SchemaFactory.createForClass(TypePromotion);