import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { BaseEntity } from '../entity'


export type SystemSettingDocument = SystemSetting & Document;

@Schema()
export class SystemSetting extends BaseEntity {
  @Prop({ default: null })
  access_token_zns: string;

  @Prop({ default: null })
  refresh_token_zns: string;

  @Prop({ default: null })
  updated_at: string;

  @Prop({ default: [] })
  template_list: []
}
export const systemSettingSchema = SchemaFactory.createForClass(SystemSetting);