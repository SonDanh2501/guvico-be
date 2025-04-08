import { ApiProperty } from "@nestjs/swagger";
import { iPageDTO, languageDTO } from "./general.dto";

export class iPagePunishDTOAdmin extends iPageDTO {
    @ApiProperty()
    apply_user?: string;
}

export class createReasonPunishDTOAdmin {
    @ApiProperty()
    title: languageDTO
    @ApiProperty()
    description: languageDTO
    @ApiProperty({ required: false })
    punish_type?: string;
    @ApiProperty({ required: false })
    punish?: number;
    @ApiProperty({ required: false })
    punish_cash?: object[];
    @ApiProperty({ required: false })
    punish_time?: object[];
    @ApiProperty()
    apply_user: string;
    @ApiProperty({ required: false })
    note: string;
}