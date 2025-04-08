import { ApiProperty } from "@nestjs/swagger";
import { iPageDTO } from './general.dto';

export class createCustomerRequestDTOCustomer {
    @ApiProperty()
    address: string;
    @ApiProperty()
    token: string;
    @ApiProperty()
    description?: string;
    @ApiProperty()
    id_service: string;
}

export class iPageCustomerRequestDTOAdmin extends iPageDTO {
    status?: string;
    contacted?: string;
    id_service?: string;
}

export class iPageCustomerRequestDTOAdminV2 extends iPageDTO {
    status?: string;
    contacted?: string;
    id_service?: string;
    start_date?: string;
    end_date?: string;
    city?: any;
    district?: any;
}