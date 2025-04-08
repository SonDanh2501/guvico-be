import { ApiProperty } from '@nestjs/swagger'
import { ObjectId } from 'mongoose'
import { iPageDTO, languageDTO } from './general.dto'

export class createPromotionDTOAdmin {
    @ApiProperty()
    code: string;
    @ApiProperty()
    title: languageDTO;
    @ApiProperty()
    short_description: languageDTO;
    @ApiProperty()
    description: languageDTO;
    @ApiProperty()
    thumbnail: string;
    @ApiProperty()
    image_background: string;
    @ApiProperty()
    is_limit_date: boolean;
    @ApiProperty()
    limit_start_date: string;
    @ApiProperty()
    limit_end_date: string;
    @ApiProperty()
    is_limit_count: boolean;
    @ApiProperty()
    limit_count: number;
    @ApiProperty()
    service_apply: string[];
    @ApiProperty()
    id_group_customer: string[];
    @ApiProperty()
    id_customer: string[];
    @ApiProperty()
    is_id_customer: boolean;
    @ApiProperty()
    is_id_group_customer: boolean;
    @ApiProperty()
    is_show_in_app: boolean;
    @ApiProperty()
    exp_date_exchange: number;
    @ApiProperty()
    is_limited_use: boolean;
    @ApiProperty()
    limited_use: number;
    @ApiProperty()
    type_discount: string;
    @ApiProperty()
    type_promotion: string;
    @ApiProperty()
    price_min_order: number;
    @ApiProperty()
    discount_unit: string;
    @ApiProperty()
    discount_value: number;
    @ApiProperty()
    discount_max_price: number;
    @ApiProperty()
    exchange_point: number;
    @ApiProperty()
    is_exchange_point: boolean;
    @ApiProperty()
    brand: string;
    @ApiProperty({ required: false })
    send_notification: boolean;
    @ApiProperty()
    position: number;
    @ApiProperty()
    is_payment_method: boolean;
    @ApiProperty()
    payment_method: string[];
    @ApiProperty({ required: false })
    is_loop?: boolean;
    @ApiProperty({ required: false })
    day_loop?: object[];
    @ApiProperty({ required: false })
    start_time_loop?: number;
    @ApiProperty({ required: false })
    end_time_loop?: number;

    @ApiProperty({ required: false })
    position_view_payment?: number;
    is_parent_promotion?: boolean;
    total_child_promotion?: number;
    is_turn_on_loop?: boolean;

    @ApiProperty({ required: false })
    is_apply_area: boolean;
    @ApiProperty({ required: false })
    city: number[];
    @ApiProperty({ required: false })
    district: number[];
    id_group_promotion?: string[];
    timezone?: string;
    type_date_apply?: string;
    day_apply: [];
    is_affiliate?: boolean;
    type_action?: string;
}

export class editPromotionDTOAdmin extends createPromotionDTOAdmin {
    @ApiProperty()
    is_delete?: boolean;
}

export class activePromotionDTOAdmin {
    @ApiProperty()
    is_active: boolean;
}

export class iPagePromotionDTOAdmin extends iPageDTO {
    @ApiProperty()
    brand: string;
    @ApiProperty()
    exchange: string;
    @ApiProperty()
    fieldSort: string;
    @ApiProperty()
    id_group_promotion: string;
    @ApiProperty()
    id_service: string;
    @ApiProperty()
    status: string;
}

export class iPageUsedPromotionDTOAdmin extends iPageDTO {
    status: string
}

export class updatePositionPromotion {
    @ApiProperty()
    arr_promotion: [{
        _id: string | ObjectId;
        position: number;
    }]
}

export class querySetupPositionPromotion {
    group_customer?: string;
    customer?: string;
}

export class newQuerySetupPositionPromotion {
    id_group_customer?: string;
    id_customer?: string;
}

// export class notificationPromotion {
//     @ApiProperty()
//     title: boolean;
//     @ApiProperty()
//     is_active: boolean;
//     @ApiProperty()
//     is_active: boolean;
//     @ApiProperty()x``
//     is_active: boolean;
//     @ApiProperty()
//     is_active: boolean;
//     @ApiProperty()
//     is_active: boolean;

// }