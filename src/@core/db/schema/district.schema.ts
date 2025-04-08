import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DistrictDocument = District & Document;

@Schema()
export class District {

  @Prop({required: true})
  name: string;

  @Prop({required: true})
  code: number;

  @Prop({required: true})
  code_province: number;

  @Prop({required: true})
  division_type: string;

  @Prop({ default: false })
  is_delete: boolean;
}

export const districtSchema = SchemaFactory.createForClass(District);