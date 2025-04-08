import { ApiProperty } from "@nestjs/swagger";
import { iPageDTO, phoneDTO } from "./general.dto";



export class iPageJobListsDTOAdmin extends iPageDTO {
    @ApiProperty()
    start_date: string;
    @ApiProperty()
    end_date: string;
    @ApiProperty()
    status: string;
    @ApiProperty()
    date: string;
    @ApiProperty()
    kind: string;
    @ApiProperty()
    is_duplicate: string;
    @ApiProperty()
    id_service: string;
    type_sort: string;
    city?: any;
    district?: any;
    payment_method?: any;
}

export class iPageStatisticDTO extends iPageDTO {
    @ApiProperty()
    start_date: string;
    @ApiProperty()
    end_date: string;
}