import { ApiProperty } from "@nestjs/swagger"
import { iPageDTO, languageDTO } from "./general.dto"

export class CreatePunishPolicyDTO {
    @ApiProperty()
    title: languageDTO;
    @ApiProperty()
    description: languageDTO;
    @ApiProperty()
    user_apply: string
    @ApiProperty()
    total_time_process: number;
    @ApiProperty()
    total_order_process: number;
    @ApiProperty()
    punish_money_type: string;
    @ApiProperty()
    punish_money: number;
    @ApiProperty()
    action_lock: string;
    @ApiProperty()
    punish_lock_time: number
    @ApiProperty()
    punish_lock_time_type: string
    @ApiProperty()
    severity_level: number
    @ApiProperty({ required: false })
    id_view?: string
}

export class CreateRewardPolicyDTO {
    @ApiProperty()
    title: languageDTO;
    @ApiProperty()
    description: languageDTO;
    @ApiProperty()
    user_apply: string
    @ApiProperty()
    total_time_process: number;
    @ApiProperty()
    total_order_process: number;
    @ApiProperty()
    reward_money_type: string;
    @ApiProperty()
    reward_money: number;
    @ApiProperty()
    is_count_limit: boolean
    @ApiProperty()
    count_limit: number
    @ApiProperty()
    is_count_per_user_limit: boolean
    @ApiProperty()
    count_per_user_limit: number
}

export class EditRewardPolicyDTO extends CreateRewardPolicyDTO { };

export class IPagePunishPolicyDTO extends iPageDTO {
    @ApiProperty({ required: false })
    title?: languageDTO
    @ApiProperty({ required: false })
    description?: languageDTO;
    @ApiProperty({ required: false })
    punish_money?: number;
}

export class IPageRewardPolicyDTO extends iPageDTO {
    @ApiProperty({ required: false })
    title?: languageDTO
    @ApiProperty({ required: false })
    description?: languageDTO;
    @ApiProperty({ required: false })
    reward_money?: number;
}


export class EditPunishPolicyDTO extends CreatePunishPolicyDTO { }