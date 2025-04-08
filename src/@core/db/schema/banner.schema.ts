import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type BannerDocument = Banner & Document;

@Schema()
export class Banner {
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

  @Prop({default: null , enum: ["giup_viec_theo_gio", "giup_viec_co_dinh", "tong_ve_sinh", "rem_tham_sofa", "ve_sinh_may_lanh", null] })
  kind: string;

  @Prop({ default: false })
  is_counted: boolean

  @Prop({ default: null })
  key_event_count: string
}

export const bannerSchema = SchemaFactory.createForClass(Banner);