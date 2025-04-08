import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { languageDTO } from 'src/@core/dto';

export type RoleAdminDocument = RoleAdmin & Document;

@Schema()
export class RoleAdmin {
  @Prop({ default: "" })
  type_role: string;

  @Prop({ default: "unknow" })
  name_role: string;

  @Prop({ default: new Date(Date.now()).toISOString() })
  date_create: string;

  @Prop({ default: false })
  is_delete: boolean;

  @Prop({ default: true })
  is_active: boolean;

  @Prop({ default: true })
  is_permission: boolean;

  @Prop({ default: false })
  is_area_manager: boolean;

  @Prop({ default: "vietnam" })
  area_manager_level_0: string;

  @Prop({ default: [] })
  area_manager_level_1: number[];

  @Prop({ default: [] })
  area_manager_level_2: number[];

  @Prop({ default: [] })
  id_key_api: string[];

  @Prop({ default: false })
  is_service_manager: boolean;

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Service', default: [] })
  id_service_manager: string[];
}

export const roleAdminSchema = SchemaFactory.createForClass(RoleAdmin);