import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { Document } from 'mongoose'
import { languageDTO } from 'src/@core'
import { ACTION_LOCK, PUNISH_LOCK_TIME_TYPE, PUNISH_MONEY_TYPE, STATUS, USER_APPLY } from '../enum'
import { CYCLE_TIME_TYPE, DEPENDENCY_ORDER_VALUE, PUNISH_FUNCTION_TYPE, PUNISH_POLICY_TYPE, PUNISH_TYPE, PUNISH_VALUE_TYPE } from './../enum/policy.enum'

export type PunishPolicyDocument = PunishPolicy & Document;

@Schema()
export class PunishPolicy {
    @Prop({ default: new Date(Date.now()).toISOString() })
    created_at: string;
    
    @Prop({ type: { vi: String, en: String }, default: { vi: '', en: "" } })
    title: languageDTO;

    @Prop({ type: { vi: String, en: String }, default: { vi: '', en: "" } })
    description: languageDTO;

    @Prop({ enum: USER_APPLY, default: null, type: String })
    user_apply: string | null;

    @Prop({ type: Number, default: 1 })
    total_time_process: number | 1;

    @Prop({ type: Number, default: 1 })
    total_order_process: number | 1;

    @Prop({ type: String, enum: PUNISH_MONEY_TYPE, default: null })
    punish_money_type: string | null;

    @Prop({ type: Number, default: 0 })
    punish_money: number;

    @Prop({ type: String, enum: ACTION_LOCK, default: null })
    action_lock: string | null;

    @Prop({ type: Number, default: 1 })
    punish_lock_time: number;

    @Prop({ type: String, enum: PUNISH_LOCK_TIME_TYPE, default: null })
    punish_lock_time_type: string | null;

    @Prop({ type: Boolean, default: false })
    is_delete: boolean;

    @Prop({ type: String, enum: STATUS, default: STATUS.doing })
    status: string;

    @Prop({ type: String, default: "" })
    id_view: boolean;

    
    @Prop({ type: String, enum: ["collaborator_wallet", "work_wallet", "pay_point", "none"], default: "none" })
    payment_out: string
    
    @Prop({ type: String, enum: PUNISH_POLICY_TYPE, default: PUNISH_POLICY_TYPE.punish })
    punish_policy_type: string // Loại chính sách phạt: phạt hoặc là mốc phạt
    
    @Prop({ type: String, enum: [1, 2, 3], default: 1 })
    severity_level: string // Cấp độ nghiêm trọng

    // @Prop({ type: String, enum: ["collaborator_wallet", "work_wallet", "pay_point"], default: null })
    // type_wallet: string

    @Prop({ type: [{
        punish_type: { type: String, enum: PUNISH_TYPE, default: PUNISH_TYPE.punish }, // Hình thức phạt
        nth_time: { type: Number, default: 0 }, // Lần vi phạm thứ bao nhiêu
        punish_value_type: { type: String, enum: PUNISH_VALUE_TYPE, default: PUNISH_VALUE_TYPE.none }, // Loại giá trị phạt khi vi phạm
        dependency_order_value: { type: String, enum: DEPENDENCY_ORDER_VALUE, default: DEPENDENCY_ORDER_VALUE.none }, // Giá trị phụ thuộc vào đơn hàng (Dùng cho phần trăm)
        punish_value: { type: Number, default: 0 }, // Giá trị phạt (số tiền hoặc phần trăm)
        punish_function: { type: String, enum: PUNISH_FUNCTION_TYPE, default: PUNISH_FUNCTION_TYPE.none }, // Tính năng phạt
        punish_lock_time: { type: Number, default: 0 },
        punish_lock_time_type: { type: String, enum: PUNISH_LOCK_TIME_TYPE, default: PUNISH_LOCK_TIME_TYPE.unset },
        id_content_notification: { type: mongoose.Schema.Types.ObjectId, ref: "ContentNotification", default: null },
        id_content_history_activity: { type: mongoose.Schema.Types.ObjectId, ref: "ContentHistoryActivity", default: null },
    }], default: [] })
    punish_rule: object[] // Quy tắc phạt

    @Prop({ type: String, enum: CYCLE_TIME_TYPE })
    cycle_time_type: string; // Loại chu kỳ thời gian
    
    @Prop({ type: String, default: null })
    start_time_cycle: string; // Thời gian bắt đầu chu kỳ
}

export const punishPolicySchema = SchemaFactory.createForClass(PunishPolicy);
