import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { languageDTO, TYPE_PROMOTION } from 'src/@core';

export type ProvinceDocument = Province & Document;

@Schema()
export class Province {

  @Prop({ required: true, default: "" })
  name: string;

  @Prop({ required: true, default: "" })
  code: string;

  @Prop({ required: true, default: "" })
  division_type: string;

  @Prop({ default: false })
  is_delete: boolean;
}

export const provinceSchema = SchemaFactory.createForClass(Province);