import { ApiProperty } from "@nestjs/swagger";
import { AnyARecord } from "dns";
import { iPageDTO } from './general.dto';



export class createFileDTOAadmin {
    @ApiProperty()
    link_url: string;
    @ApiProperty()
    body: string;
}


export class editFeedbackDTOAdmin extends createFileDTOAadmin{
}

export class changeStatusDTOAdmin {
    @ApiProperty()
    status: string;
}

export class iPageFileDTOAdmin extends iPageDTO{
}