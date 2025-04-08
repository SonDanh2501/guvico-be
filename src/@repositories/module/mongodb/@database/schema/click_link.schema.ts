import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ClickLinkDocument = ClickLink & Document;

@Schema()
export class ClickLink {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  image: string;

  @Prop({ required: true, enum: ["url", "promotion", "service"] })
  type_link: string;

  @Prop({ default: null })
  link_id: string;

  @Prop({ default: false })
  is_delete: boolean;

  @Prop({ default: true })
  is_active: boolean;

  @Prop({ default: false })
  is_limit_date: boolean;

  @Prop({ default: null })
  limit_start_date: string;

  @Prop({ default: null })
  limit_end_date: string;

  @Prop({ default: 0 })
  position: number;

  @Prop({ default: new Date(Date.now()).toISOString() })
  date_create: string;


}

export const clickLinkSchema = SchemaFactory.createForClass(ClickLink);