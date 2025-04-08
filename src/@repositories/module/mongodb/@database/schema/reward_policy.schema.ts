import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { Document } from 'mongoose'
import { languageDTO } from 'src/@core'
import { BaseEntity } from '../entity'
import { CYCLE_TIME_TYPE, DEPENDENCY_ORDER_VALUE, REWARD_POLICY_TYPE, REWARD_VALUE_TYPE, REWARD_WALLET_TYPE, STATUS, USER_APPLY } from '../enum'

export type RewardPolicyDocument = RewardPolicy & Document

@Schema()
export class RewardPolicy extends BaseEntity{
    @Prop({ default: new Date(Date.now()).toISOString() })
    created_at: string;

    @Prop({ type:{vi:String, en:String}, default:{vi:'', en:""} })
    title:languageDTO;

    @Prop({ type:{vi:String, en:String},default:{vi:'', en:""} })
    description:languageDTO;

    @Prop({ type:String, enum:USER_APPLY, default:null })
    user_apply:string | null;

    @Prop({ type:Number, default:1 })
    total_time_process:number;

    @Prop({ type:String, default:1 })
    total_order_process:string;

    @Prop({ type:String, default:STATUS.doing, enum:STATUS })
    status:string;

    @Prop({ type:Boolean, default:false })
    is_count_limit:boolean;

    @Prop({ type:Number, default:0 })
    count_limit:number;

    @Prop({ type:Boolean, default:false })
    is_count_per_user_limit: boolean;

    @Prop({ type:Number, default:0 })
    count_per_user_limit: number;

    @Prop({ type:String, default:"" })
    id_view:string

    @Prop({ type: String, enum: REWARD_POLICY_TYPE, default: REWARD_POLICY_TYPE.reward })
    reward_policy_type:string // Loại chính sách thưởng: thưởng hoặc là mốc thưởng

    @Prop({ type: String, enum: REWARD_WALLET_TYPE, default: REWARD_WALLET_TYPE.none })
    reward_wallet_type: string
    
    @Prop({ type:Number, default:0 })
    score: number;
    
    @Prop({ type: {
        reward_value_type: { type: String, enum: REWARD_VALUE_TYPE, default: REWARD_VALUE_TYPE.none }, // Loại giá trị thưởng
        dependency_order_value: { type: String, enum: DEPENDENCY_ORDER_VALUE, default: DEPENDENCY_ORDER_VALUE.none }, // Giá trị phụ thuộc vào đơn hàng (Dùng cho phần trăm)
        reward_value: { type: Number, default: 0 }, // Giá trị thưởng (số tiền hoặc phần trăm)
        id_content_notification: { type: mongoose.Schema.Types.ObjectId, ref: "ContentNotification", default: null },
        id_content_history_activity: { type: mongoose.Schema.Types.ObjectId, ref: "ContentHistoryActivity", default: null },
    }, default: {} })
    reward_rule: object // Quy tắc thưởng

    @Prop({ type: String, enum: CYCLE_TIME_TYPE })
    cycle_time_type: string; // Loại chu kỳ thời gian
    
    @Prop({ type: String, default: null })
    start_time_cycle: string; // Thời gian bắt đầu chu kỳ
}

export const rewardPolicySchema = SchemaFactory.createForClass(RewardPolicy);
