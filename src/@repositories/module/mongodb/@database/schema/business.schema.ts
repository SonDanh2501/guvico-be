import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { languageDTO } from 'src/@core/dto';
import { coditionDTOGroupCustomer } from 'src/@core/dto/groupCustomer.dto';

export type BusinessDocument = Business & Document;

@Schema()
export class Business {

  @Prop({ default: '' })
  type_permisstion: string;

  @Prop({ default: '' })
  full_name: string;

  @Prop({ default: '' })
  avatar: string;

  @Prop({ default: 'viet_nam' })
  area_manager_lv_0: string;

  @Prop({ default: [] })
  area_manager_lv_1: number[];

  @Prop({ default: [] })
  area_manager_lv_2: number[];

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Service', default: [] })
  id_service_manager: string[];

  @Prop({ default: new Date(Date.now()).toISOString() })
  date_create: string;

  @Prop({ default: false })
  is_delete: boolean;

  @Prop({ default: true })
  is_active: boolean;

  @Prop({ default: '' })
  tax_code: string;
}

export const businessSchema = SchemaFactory.createForClass(Business);