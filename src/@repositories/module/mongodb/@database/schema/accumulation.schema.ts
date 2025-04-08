import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { Document } from 'mongoose'

export type AccumulationDocument = Accumulation & Document;

@Schema()
export class Accumulation {
  @Prop({ default: new Date(Date.now()).toISOString() })
  created_at: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Collaborator", default: null })
  id_collaborator: string | null;

  @Prop({ default: null })
  start_time: string;
  
  @Prop({ default: null })
  end_time: string;

  @Prop({ type: Boolean, default: false })
  is_delete: boolean;

  @Prop({ default: 0 })
  year: number;
  
  @Prop({ default: 0 })
  month: number;
  
  @Prop({ default: 0 })
  day: number;
  
  @Prop({ default: 0 })
  reward_point: number; // Số tiền tích lũy theo ngày
  
  @Prop({ default: 0 })
  number_of_violation: number; // Số lần phạt theo ngày
  
  @Prop({ type: [{
    id_push_policy: { type: mongoose.Schema.Types.ObjectId, ref: "PunishPolicy", default: null },
    amount: { type: Number, default: 0 }
  }], default: [] })
  list_of_violation: object[]; // Danh sách phạt theo ngày
}

export const accumulationSchema = SchemaFactory.createForClass(Accumulation);
