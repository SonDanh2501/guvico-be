import { ApiProperty } from "@nestjs/swagger"
import { iPageDTO } from "./general.dto"

export class reportCashBookDTOAdmin extends iPageDTO {
    @ApiProperty()
    start_date: string;
    @ApiProperty()
    end_date: string;
    @ApiProperty()
    city: string;
    @ApiProperty()
    type: string;
    @ApiProperty()
    district: string;
    @ApiProperty()
    type_date: string;
    @ApiProperty()
    status: string;
}

export class getListMessagesEtelecomDTOAdmin extends iPageDTO {
    @ApiProperty()
    start_date: string;
    @ApiProperty()
    end_date: string;
    @ApiProperty({ required: false })
    phone?: string;
    @ApiProperty({ required: false })
    status?: string;
    @ApiProperty({ required: false })
    template_id?: string
    @ApiProperty({ required: false })
    is_charged?: boolean;
    @ApiProperty({ required: false })
    after?: string;
    @ApiProperty({ required: false })
    before?: string;
}