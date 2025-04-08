import { ApiProperty } from '@nestjs/swagger'
import { iPageDTO } from './general.dto'





export class createOrderDTO {
    @ApiProperty()
    id_customer: string;
    @ApiProperty()
    id_collaborator: string;
    @ApiProperty()
    lat: string;
    @ApiProperty()
    lng: string;
    @ApiProperty()
    address: string;
    @ApiProperty()
    date_create: string;
    @ApiProperty()
    date_work: string;
    @ApiProperty()
    initial_fee: number;
    @ApiProperty()
    platform_fee: number;
    @ApiProperty()
    final_fee: number;
    @ApiProperty()
    change_money: number;
    @ApiProperty()
    service: Object;
    @ApiProperty()
    status: string;
    @ApiProperty()
    code_promotion: any;
    @ApiProperty()
    event_promotion: any;
    @ApiProperty()
    service_fee: any;
    @ApiProperty()
    total_estimate: number;
    @ApiProperty()
    id_group_order: string;
    @ApiProperty()
    note: string;
    @ApiProperty()
    type_address_work: string;
    @ApiProperty({ required: false })
    note_address: string;
    @ApiProperty()
    payment_method: string;
    @ApiProperty({ required: false })
    is_duplicate: boolean;
    @ApiProperty()
    collaborator_fee: number;
    @ApiProperty()
    net_income_collaborator: number;
    @ApiProperty()
    refund_money: number;
    @ApiProperty()
    pending_money: number;
    @ApiProperty({ required: false })
    convert_time?: boolean;
    ordinal_number?: number;
    id_view?: string;
    id_block_collaborator?: [];
    id_favourite_collaborator?: [];
    tip_collaborator?: number;
    date_tip_collaborator?: string;
    is_captain?: boolean;
    personal?: number;
}

export class createOrderDTOCustomer extends createOrderDTO {
}

export class editOrderDTOAdmin extends createOrderDTO {
}

export class changeStatusOrderDTOCollaborator {
    @ApiProperty()
    status: string;
}

export class iPageOrderDTOAdmin extends iPageDTO {
    @ApiProperty({ required: false })
    id_service: string;

}

export class changeStatusOrderDTOAdmin {
    @ApiProperty({ required: true, enum: ['cancel', 'next'] })
    status: string;
    id_collaborator?: string;
    id_reason_cancel?: string;
}

export class addCollaboratorDTOAdmin {
    @ApiProperty({ required: true })
    id_collaborator: string;
    check_time?: boolean;
}

export class iPageReportReviewDTOAdmin extends iPageDTO {
    @ApiProperty()
    start_date: string;
    @ApiProperty()
    end_date: string;
    @ApiProperty()
    star: number;// 0 là lấy tất cả,
    type: string;
    city?: any;
    district?: any;
}

export class iPageReportCancelOrderDTOAdmin extends iPageDTO {
    @ApiProperty()
    start_date: string;
    @ApiProperty()
    end_date: string;
    @ApiProperty()
    city?: any;
    @ApiProperty()
    district?: any;
    type?: string;
}

export class iPageReportOrderByDayDTOAdmin extends iPageReportCancelOrderDTOAdmin { }

export class editOrderV2DTOAdmin {
    date_work: string;
    end_date_work: string;
    is_check_date_work?: boolean;
    is_change_price?: boolean;
    note?: string;
    code_promotion?: string;
    token?: string
}

export class adminCheckReviewDTOAdmin {
    note_admin: string;
}

export class iPageSearchOrderForCollaborator extends iPageDTO {
    id_collaborator: string;
}


export class changeStatusHandleReviewOrder {
    id_order: string;
    status_handle_review?: string;
    note_admin?: string;
}

export class iPageTotalOrderDTOAdmin extends iPageDTO {
    start_date?: string;
    end_date?: string;
    @ApiProperty()
    id_service: string;
    @ApiProperty()
    city: any;
    @ApiProperty()
    district: any;
    @ApiProperty()
    payment_method: any;
}


export class iPageOrderDTO extends iPageDTO {
    status?: string[]
}

export class iPageSearchOrderDTO extends iPageDTO {
    collaborator?: string;
}