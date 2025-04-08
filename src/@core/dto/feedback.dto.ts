import { ApiProperty } from "@nestjs/swagger";
import { AnyARecord } from "dns";
import { iPageDTO } from './general.dto';



export class createFeedbackDTOCustomer {
    @ApiProperty()
    type: string;
    @ApiProperty()
    body: string;
}

export class createFeedbackDTOAdmin {
    @ApiProperty()
    type: string;
    @ApiProperty()
    body: string;
    @ApiProperty()
    id_customer: string;
}

export class editFeedbackDTOAdmin extends createFeedbackDTOAdmin{

}

export class changeStatusDTOAdmin {
    @ApiProperty()
    status: string;
}

export class iPageFeedbackDTOAdmin extends iPageDTO{
    // @ApiProperty()
    // date_processed: string;
    @ApiProperty()
    type_status: string;
    @ApiProperty()
    type: string;
}


export class changeProcessHandleDTOAdmin {
    status_handle?: string;
    note_handle_admin?: string;
}