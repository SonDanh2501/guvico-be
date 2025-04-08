import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type BalanceDocument = Balance & Document

@Schema()
export class Balance {
    @Prop({ default: 0 })
    total_customer_punish_fee: number // tổng phạt khách hàng

    @Prop({ default: 0 })
    total_collaborator_punish_fee: number// tổng phạt ctv

    @Prop({ default: 0 })
    total_top_up_customer: number // tổng nạp khách hàng

    @Prop({ default: 0 })
    total_withdraw_customer: number // tổng rút khách hàng

    @Prop({ default: 0 })
    total_order_fee: number // tổng phí đặt đơn của khách hàng (tạm giữ)

    @Prop({ default: 0 })
    total_pay_point_order_fee: number // tổng phí đặt đơn của khách hàng bằng pay point (tạm giữ)

    @Prop({ default: 0 })
    total_cash_order_fee: number // tổng phí đặt đơn của khách hàng bằng tiền mặt (tạm giữ)

    @Prop({ default: 0 })
    total_refurn_pay_point_order_fee: number  // tổng tiền hoàn lại cho khách hủy đơn đặt bằng pay point

    @Prop({ default: 0 })
    total_order_cancel_fee: number // tổng tiền các đơn hàng do khách hủy ca làm

    @Prop({ default: 0 })
    total_promotion_fee: number // chỉ tính trên những đơn hoàn thành

    @Prop({ default: 0 })
    total_event_fee: number// chỉ tính trên những đơn hoàn thành

    @Prop({ default: 0 })
    total_opening_remainder: number // tổng tiền trong ví chính ctv đầu ngày

    @Prop({ default: 0 })
    total_ending_remainder: number// tổng tiền trong ví chính ctv cuối ngày

    @Prop({ default: 0 })
    total_opening_gift_remainder: number// tổng tiền trong ví thưởng ctv đầu ngày

    @Prop({ default: 0 })
    total_ending_gift_remainder: number// tổng tiền trong ví thưởng ctv cuối ngày

    @Prop({ default: 0 })
    total_opending_paypoint: number// tổng tiền trong ví pay point của kh đầu ngày

    @Prop({ default: 0 })
    total_ending_paypoint: number// tổng tiền trong ví pay point của kh cuối ngày

    @Prop({ default: 0 })
    total_given_gift_remainder: number// tổng tiền tặng ví thưởng ctv

    @Prop({ default: 0 })
    total_given_remainder: number// tổng tiền trong ví chính ctv

    @Prop({ default: 0 })
    total_given_pay_point: number // tổng tiền tặng cho khách hàng

    @Prop({ default: 0 })
    total_top_up_collaborator: number // tổng nạp ctv

    @Prop({ default: 0 })
    total_withdraw_collaborator: number // tổng rút ctv

    @Prop({ default: 0 })
    total_collaborator_fee: number // thu nhập thực của ctv trong ngày

    @Prop({ default: 0 })
    total_bussiness_income_from_order: number

    @Prop({ default: 0 })
    total_bussiness_net_income: number

    @Prop({ default: new Date(Date.now()).toISOString() })
    date_create: string;

    @Prop({ default: null })
    date_update: string;

}

export const balanceSchema = SchemaFactory.createForClass(Balance)
