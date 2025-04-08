import { ApiProperty } from "@nestjs/swagger";
import { iPageDTO, languageDTO } from "./general.dto";




export class createPunishTicketDTO {
    @ApiProperty({ required: false })
    title?: languageDTO;
    @ApiProperty({ required: false })
    user_apply?: string;
    @ApiProperty({ required: false })
    id_collaborator?: string;
    @ApiProperty({ required: false })
    id_customer?: string;
    @ApiProperty({ required: false })
    date_create?: string;
    @ApiProperty({ required: false })
    current_total_time_process?: number;
    @ApiProperty({ required: false })
    current_total_order_process?: number;
    @ApiProperty({ required: false })
    status?: string;
    @ApiProperty({ required: false })
    id_punish_policy?: string;
    @ApiProperty({ required: false })
    id_transaction?: string;
    @ApiProperty({ required: false })
    punish_lock_time?: number;
    @ApiProperty({ required: false })
    date_start_lock_time?: string;
    @ApiProperty({ required: false })
    date_end_lock_time?: string;
    @ApiProperty({ required: false })
    punish_money?: number;
    @ApiProperty({ required: false })
    id_order?: string;
    @ApiProperty({ required: false })
    date_done?: string;
    @ApiProperty({ required: false })
    is_delete?: boolean;
    @ApiProperty({ required: false })
    id_view?: string;
    @ApiProperty({ required: false })
    time_end?: string
    @ApiProperty({ required: false })
    time_start?: string
    @ApiProperty({ required: false })
    id_admin_action?: string
    // @ApiProperty({ required: false })
    // type_wallet?: string
    @ApiProperty({ required: false })
    payment_in?: string
    @ApiProperty({ required: false })
    payment_out?: string
}

export class createPunishTicketFromPolicyDTO {
    @ApiProperty({ required: true })
    id_punish_policy: string
    @ApiProperty({ required: false })
    id_collaborator?: string
    @ApiProperty({ required: false })
    id_order?: string
    @ApiProperty({ required: false })
    id_customer?: string
    @ApiProperty({ required: false })
    date_start_lock_time?: string
    @ApiProperty({ required: false })
    status?: string
    @ApiProperty({ required: false })
    is_verify_now?: boolean
    @ApiProperty({ required: false })
    id_view?: string
    @ApiProperty({ required: false })
    id_admin_action?: string
    @ApiProperty({ required: false })
    time_start?: string
    @ApiProperty({ required: false })
    payment_in?: string
    @ApiProperty({ required: false })
    payment_out?: string
    @ApiProperty({ required: false })
    note_admin?: string
    date_create?: string;
    @ApiProperty({ required: false })
    punish_money?: string
}

export class iPagePunishTicketDTOAdmin extends iPageDTO {

    @ApiProperty({ required: false })
    status?: string;
    @ApiProperty({ required: false })
    subject?: string;
    @ApiProperty({ required: false })
    start_date?: string;
    @ApiProperty({ required: false })
    end_date?: string;
    @ApiProperty({ required: false })
    payment_out?: string;
}
export class editPunishTickerDTO extends createPunishTicketDTO { }