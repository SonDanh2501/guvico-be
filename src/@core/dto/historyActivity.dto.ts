import { ApiProperty } from "@nestjs/swagger";
import { iPageDTO, languageDTO } from "./general.dto";





export class createHistoryActivityDTO {
    @ApiProperty({ required: false })
    id_admin_action?: string;
    @ApiProperty({ required: false })
    id_user_system?: string;
    @ApiProperty({ required: false })
    id_customer?: string;
    @ApiProperty({ required: false })
    id_examtest?: string;
    @ApiProperty({ required: false })
    id_collaborator?: string;
    @ApiProperty({ required: false })
    id_punish?: string;
    @ApiProperty({ required: false })
    id_collaborator_bonus?: string;
    @ApiProperty({ required: false })
    id_reward?: string;
    @ApiProperty({ required: false })
    id_punish_ticket?: string;
    @ApiProperty({ required: false })
    id_question?: string;
    @ApiProperty({ required: false })
    id_info?: string;
    @ApiProperty({ required: false })
    id_info_reward_collaborator?: string;
    @ApiProperty({ required: false })
    title_admin?: string;
    @ApiProperty({ required: false })
    title?: languageDTO;
    @ApiProperty({ required: false })
    body?: languageDTO;
    @ApiProperty({ required: false })
    type?: string;
    @ApiProperty({ required: false })
    date_create?: string;
    @ApiProperty({ required: false })
    id_order?: string;
    @ApiProperty({ required: false })
    id_group_order?: string;
    @ApiProperty({ required: false })
    id_promotion?: string;
    @ApiProperty({ required: false })
    id_feedback?: string;
    @ApiProperty({ required: false })
    id_transaction?: string;
    @ApiProperty({ required: false })
    id_code?: string;
    @ApiProperty({ required: false })
    id_inviter?: string;
    @ApiProperty({ required: false })
    id_banner?: string;
    @ApiProperty({ required: false })
    id_address?: string;
    @ApiProperty({ required: false })
    id_extend_optional?: string;
    @ApiProperty({ required: false })
    id_feed_back?: string;
    @ApiProperty({ required: false })
    id_group_customer?: string;
    @ApiProperty({ required: false })
    id_group_promotion?: string;
    @ApiProperty({ required: false })
    id_group_service?: string;
    @ApiProperty({ required: false })
    id_news?: string;
    @ApiProperty({ required: false })
    id_optional_service?: string;
    @ApiProperty({ required: false })
    id_push_notification?: string;
    @ApiProperty({ required: false })
    id_reason_cancel?: string;
    @ApiProperty({ required: false })
    id_reason_punish?: string;
    @ApiProperty({ required: false })
    id_service?: string;
    @ApiProperty({ required: false })
    id_customer_request?: string;
    @ApiProperty({ required: false })
    value?: number;
    @ApiProperty({ required: false })
    value_string?: string;
    @ApiProperty({ required: false })
    value_select?: string;
    @ApiProperty({ required: false })
    id_transistion_point?: string;
    @ApiProperty({ required: false })
    id_training_lesson?: string;
    @ApiProperty({ required: false })
    id_business?: string;
    @ApiProperty({ required: false })
    current_remainder?: number;
    @ApiProperty({ required: false })
    status_current_remainder?: string;
    @ApiProperty({ required: false })
    current_gift_remainder?: number;
    @ApiProperty({ required: false })
    status_current_gift_remainder?: string;
    @ApiProperty({ required: false })
    current_pay_point?: number;
    @ApiProperty({ required: false })
    status_current_pay_point?: string;
    @ApiProperty({ required: false })
    current_reputation_score?: number;
    @ApiProperty({ required: false })
    current_work_wallet?: number;
    @ApiProperty({ required: false })
    status_current_work_wallet?: string;
    @ApiProperty({ required: false })
    current_collaborator_wallet?: number;
    @ApiProperty({ required: false })
    status_current_collaborator_wallet?: string;
    @ApiProperty({ required: false })
    status_current_point?: string;
    @ApiProperty({ required: false })
    current_point?: number;
}

export class editHistoryActivityDTO extends createHistoryActivityDTO { }