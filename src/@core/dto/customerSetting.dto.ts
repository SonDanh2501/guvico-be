import { ApiProperty } from '@nestjs/swagger'
export class editCustomerSettingDTOAdmin {
    point_to_price: number;
    ratio_of_price_to_point_member: number;
    ratio_of_price_to_point_silver: number;
    ratio_of_price_to_point_gold: number;
    ratio_of_price_to_point_platium: number;
    rank_member_minium_point: number;
    rank_member_max_point: number;
    rank_silver_minium_point: number;
    rank_silver_max_point: number;
    rank_gold_minium_point: number;
    rank_gold_max_point: number;
    rank_platinum_minium_point: number;
    rank_platinum_max_point: number;
    support_version_app: string;
    background_header: string;
    lock_payment: boolean;
    is_cash_payment: boolean;
    is_g_pay_payment: boolean;
    is_momo_payment: boolean;
    affiliate_discount_percentage: number;

    @ApiProperty({
        type: [{
            min_money: { type: Number, default: 0 },
            is_max_money: { type: Boolean },
            max_money: { type: Number, default: 0 },
            method: { type: [String], enum: ["momo", "vnpay"], default: "vnpay" },
            type: { type: String, enum: ["amount", "percent"], default: "percent" },
            value: { type: Number, default: 0 },
        }], default: []
    })
    discount_change: object[];
}