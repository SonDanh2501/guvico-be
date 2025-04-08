import { ApiProperty } from "@nestjs/swagger";
import { iPageDTO, languageDTO } from "./general.dto";


export class iPageTransactionDTOAdmin extends iPageDTO {
    @ApiProperty({ required: false })
    type_bank?: string;
    @ApiProperty({ required: false })
    status?: string;
    @ApiProperty({ required: false })
    kind_transfer?: string;
    @ApiProperty({ required: false })
    type_transfer?: string;
    @ApiProperty({ required: false })
    subject?: string;
    @ApiProperty({ required: false })
    start_date?: string;
    @ApiProperty({ required: false })
    end_date?: string;
    @ApiProperty({ required: false })
    payment_out?: string;
    @ApiProperty({ required: false })
    payment_in?: string;
    @ApiProperty({ required: false })
    type_date?: string;
}


export class createTransactionDTO {
    @ApiProperty({ required: false })
    id_collaborator?: string;
    @ApiProperty({ required: false })
    id_customer?: string;
    @ApiProperty({ required: true })
    subject: string;
    @ApiProperty({ required: false })
    date_create?: string;
    @ApiProperty({ required: false })
    date_verify?: string;
    @ApiProperty({ required: false })
    is_delete?: boolean;
    @ApiProperty({ required: false })
    id_admin_action?: string;
    @ApiProperty({ required: false })
    id_admin_verify?: string;
    @ApiProperty({ required: false })
    title?: languageDTO;
    @ApiProperty({ required: true })
    money: number;
    @ApiProperty({ required: false })
    transfer_note?: string;
    @ApiProperty({ required: false })
    kind_transfer?: string;
    @ApiProperty({ required: true })
    type_transfer: string;
    @ApiProperty({ required: false })
    id_cash_book?: string;
    @ApiProperty({ required: false })
    status?: string;
    @ApiProperty({ required: false })
    vnpay_transfer?: object;
    @ApiProperty({ required: false })
    momo_transfer?: object;
    @ApiProperty({ required: false })
    viettel_money_transfer?: object;
    @ApiProperty({ required: false })
    bank_transfer?: string;
    @ApiProperty({ required: false })
    id_order?: string;
    @ApiProperty({ required: false })
    id_group_order?: string;
    @ApiProperty({ required: false })
    id_reason_punish?: string;
    @ApiProperty({ required: false })
    type_bank?: string;
    @ApiProperty({ required: true })
    payment_out?: string;
    @ApiProperty({ required: false })
    payment_in?: string;
    @ApiProperty({ required: false })
    id_view?: string;
    // Hiện tại không sử dụng 2 trường dưới đây
    @ApiProperty({ required: false })
    type_wallet?: string;
    @ApiProperty({ required: false })
    payment_method?: string;
    // Hiện tại không sử dụng 2 trường trên đây
    @ApiProperty({ required: false })
    id_punish_ticket?: string;
}

export class editTransactionDTO extends createTransactionDTO { }