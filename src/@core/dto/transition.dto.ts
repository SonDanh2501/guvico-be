import { ApiProperty } from "@nestjs/swagger";
import { iPageDTO, languageDTO } from "./general.dto";


export class iPageTransitionDTOAdmin extends iPageDTO {
    @ApiProperty({ required: false })
    status?: string;
    @ApiProperty({ required: false })
    subject?: string;
    @ApiProperty({ required: false })
    type_transfer?: string;
    @ApiProperty({ required: false })
    payment_out?: string;
    @ApiProperty({ required: false })
    payment_in?: string;
}


export class createTransitionDTO {
    @ApiProperty({ required: false })
    id_collaborator?: string;
    @ApiProperty({ required: false })
    id_customer?: string;
    @ApiProperty({ required: false })
    subject?: string;
    @ApiProperty({ required: false })
    date_create?: string;
    @ApiProperty({ required: false })
    is_delete?: boolean;
    @ApiProperty({ required: false })
    id_admin_action?: string;
    @ApiProperty({ required: false })
    id_admin_verify?: string;
    @ApiProperty({ required: false })
    title?: languageDTO;
    @ApiProperty({ required: false })
    value?: number;
    @ApiProperty({ required: false })
    transfer_note?: string;
    @ApiProperty({ required: false })
    kind_transfer?: string;
    @ApiProperty({ required: false })
    type_transfer?: string;
    @ApiProperty({ required: false })
    method_transfer?: string;
    @ApiProperty({ required: false })
    id_cash_book?: string;
    @ApiProperty({ required: false })
    status?: string;
    @ApiProperty({ required: false })
    vnpay_transfer?: string;
    @ApiProperty({ required: false })
    momo_transfer?: string;
    @ApiProperty({ required: false })
    viettel_money_transfer?: string;
    @ApiProperty({ required: false })
    bank_transfer?: string;
    @ApiProperty({ required: false })
    id_view?: string;
    @ApiProperty({ required: false })
    id_reason_punish?: string;
}

export class editTransitionDTO extends createTransitionDTO {}