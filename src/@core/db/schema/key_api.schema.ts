import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type KeyApiDocument = KeyApi & Document;

@Schema()
export class KeyApi {
  @Prop({ default: "" })
  name_api: string;

  @Prop({ default: [] })
  url_access: string[];

  @Prop({ default: "" })
  description: string;

  @Prop({ default: new Date(Date.now()).toISOString() })
  date_create: string;

  @Prop({ default: false })
  is_delete: boolean;

  @Prop({ default: true })
  is_active: boolean;

  @Prop({ default: "other" })
  key_group_api: string;

  @Prop({ default: "other" })
  name_group_api: string;

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'KeyApi', default: [] })
  key_api_parent: KeyApi[] | any

  @Prop({ default: null })
  id_side_bar: string

  @Prop({ default: [] })
  id_element: string[]
}

export const keyApiSchema = SchemaFactory.createForClass(KeyApi);