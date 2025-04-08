import { ApiProperty } from "@nestjs/swagger";
import { iPageDTO, languageDTO } from "./general.dto";

export class createRewardTicketDTO {
    @ApiProperty({required:false})
    title?:languageDTO
    @ApiProperty({required:false})
    user_apply?:string
    @ApiProperty({required:false})
    id_collaborator?:string
    @ApiProperty({required:false})
    id_customer?:string
    @ApiProperty({required:false})
    current_total_time_process?:number
    @ApiProperty({required:false})
    current_total_order_process?:number
    @ApiProperty({required:false})
    status?:string
    @ApiProperty({required:false})
    id_reward_policy?:string
    @ApiProperty({required:false})
    id_transaction?:string
    @ApiProperty({required:false})
    reward_money?:number
    @ApiProperty({required:false})
    id_order?:string
    @ApiProperty({required:false})
    date_done?:string
    @ApiProperty({required:false})
    is_delete?:boolean
}

export class createRewardTicketFromPolicyDTO{
    @ApiProperty({ required: true })
    id_reward_policy: string
    @ApiProperty({ required: false })
    id_collaborator?: string
    @ApiProperty({ required: false })
    id_order?: string
    @ApiProperty({ required: false })
    id_customer?: string
}

export class editRewardTicketDTO extends createRewardTicketDTO{};

