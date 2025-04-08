import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { Document } from 'mongoose'
import { BaseEntity } from '../entity/base.entity'
import { LEADER_BOARD_TYPE } from '../enum/base.enum'

export type LeaderBoardDocument = LeaderBoard & Document;

@Schema()
export class LeaderBoard extends BaseEntity {
  @Prop({ default: new Date(Date.now()).toISOString() })
  created_at: string;

  @Prop({ default: 0 })
  year: number;
  
  @Prop({ default: 0 })
  month: number;

  @Prop({ required: true, default: null })
  start_time: string;

  @Prop({ required: true, default: null })
  end_time: string;
  
  @Prop({ type: [{
    id_collaborator: { type: mongoose.Schema.Types.ObjectId, ref: "Collaborator", default: null },
    reward_point: { type: Number, default: 0 },
    rank: { type: Number, default: 0 },
  }] })
  rankings: object[]; // Danh sách bảng xếp hạng

  @Prop({ default: false })
  is_reward_paid: boolean;
  
  @Prop({ default: LEADER_BOARD_TYPE.week, enum: LEADER_BOARD_TYPE })
  type: String;
}

export const leaderBoardSchema = SchemaFactory.createForClass(LeaderBoard);