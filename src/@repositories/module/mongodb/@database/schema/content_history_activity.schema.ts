import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { languageDTO } from 'src/@core'
import { BaseEntity } from '../entity'

export type ContentHistoryActivityDocument = ContentHistoryActivity & Document;

@Schema()
export class ContentHistoryActivity extends BaseEntity {
  @Prop({ type: { vi: String, en: String }, required: true, default: { en: "", vi: "" } })
  title: languageDTO;

  @Prop({ type: { vi: String, en: String }, default: { en: "", vi: "" } })
  description: languageDTO;
  
  @Prop({ default: null })
  title_admin: string

  @Prop({ default: new Date().toISOString() })
  created_at: string;
}

export const contentHistoryActivitySchema = SchemaFactory.createForClass(ContentHistoryActivity);