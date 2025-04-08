import { ApiProperty } from "@nestjs/swagger"


export class date_work_schedule {
    date: string;
    status: boolean;
}

// export class createGroupOrderDTOAdmin {
//     date: string;
//     status: boolean;
// }

export class createGroupOrderDTOCustomer {
    @ApiProperty({ required: false })
    id_address?: string;
    @ApiProperty({ required: false })
    token?: string;
    @ApiProperty()
    date_work_schedule: string[];
    @ApiProperty({ required: false })
    is_auto_order?: boolean;
    @ApiProperty({ required: false })
    time_schedule?: number;
    @ApiProperty({ required: false })
    code_promotion?: string;
    @ApiProperty()
    extend_optional: {
        _id: string;
        count: number;
    }[];
    @ApiProperty()
    note: string;
    @ApiProperty()
    payment_method: string;
    @ApiProperty({ required: false })
    convert_time?: boolean;
    @ApiProperty({ required: false })
    type_address_work?: string;
    // @ApiProperty({ required: false }) //for test
    // address?: string;
    // @ApiProperty({ required: false })
    // lng?: number;
    // @ApiProperty({ required: false })
    tip_collaborator?: number;
    day_loop?: number[];
    time_zone?: string;
    timestamp?: string;
    id_customer?: string;
    type?: string;
}

export class createGroupOrderDTOAdmin extends createGroupOrderDTOCustomer {
    id_collaborator?: string;
}

export class createGroupOrderDTO {
    @ApiProperty({ required: false })
    id_address?: string;
    @ApiProperty({ required: false })
    token?: string;
    @ApiProperty()
    date_work_schedule: string[];
    @ApiProperty({ required: false })
    is_auto_order?: boolean;
    @ApiProperty({ required: false })
    time_schedule?: number;
    @ApiProperty({ required: false })
    code_promotion?: string;
    @ApiProperty()
    extend_optional: {
        _id: string;
        count: number;
    }[];
    @ApiProperty()
    note: string;
    @ApiProperty()
    payment_method: string;
    @ApiProperty({ required: false })
    convert_time?: boolean;
    @ApiProperty({ required: false })
    type_address_work?: string;
    // @ApiProperty({ required: false }) //for test
    // address?: string;
    // @ApiProperty({ required: false })
    // lng?: number;
    // @ApiProperty({ required: false })
    tip_collaborator?: number;
    day_loop?: number[];
    time_zone?: string;
    timestamp?: string;
    id_customer?: string;
    id_collaborator?: string;
    check_time?: boolean;
}

export class dateWorkScheduleDTOGroupOrder {
    date: string;
    status: string;
    initial_fee: number;
    // final_fee: number;
    net_income_collaborator: number;
    platform_fee: number;
}

export class cancelGroupOrderDTOAdmin {
    id_reason_cancel: string;
}