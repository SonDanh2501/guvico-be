import { ApiProperty } from "@nestjs/swagger";
import { iPageDTO } from "./general.dto";

export class createPopupDTOAdmin {
    @ApiProperty({ required: true })
    image: string;
    @ApiProperty({ default: true })
    is_active: boolean;
    @ApiProperty({ default: false })
    is_date_schedule: boolean;
    @ApiProperty()
    status: string;
    @ApiProperty()
    start_date: string;
    @ApiProperty()
    end_date: string;
    @ApiProperty()
    screen: string;
    @ApiProperty()
    is_counted: boolean;
    @ApiProperty()
    key_event_count: string;
    @ApiProperty()
    deep_link: string;


}

export class editPopupDTOAdmin {
    @ApiProperty()
    image: string;
    @ApiProperty()
    is_active: boolean;
    @ApiProperty()
    is_date_schedule: boolean;
    @ApiProperty()
    status: string;
    @ApiProperty()
    start_date: string;
    @ApiProperty()
    end_date: string;
    @ApiProperty()
    screen: string;
    @ApiProperty()
    is_counted: boolean;
    @ApiProperty()
    key_event_count: string;
    @ApiProperty()
    deep_link: string;
}

export class iPagePopupDTOAdmin extends iPageDTO {
    @ApiProperty({ required: false })
    status?: string;
    @ApiProperty({ required: false })
    start_date?: string;
    @ApiProperty({ required: false })
    end_date?: string;
    @ApiProperty({ required: false })
    screen?: string;
    @ApiProperty({ required: false })
    id_counted?: string;

}