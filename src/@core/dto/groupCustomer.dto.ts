import { ApiProperty } from "@nestjs/swagger";
import { AnyARecord } from "dns";



export class coditionDTOGroupCustomer {
    @ApiProperty()
    type_condition: string;
    @ApiProperty()
    condition_level_1: [{
        type_condition: string;
        condition: detailCondition[];
    }]
}

export class detailCondition {
    @ApiProperty()
    kind: string;
    @ApiProperty()
    value: string;
    @ApiProperty()
    operator: string;
}

export class createGroupCustomerDTOAdmin {
    @ApiProperty()
    name: string;
    @ApiProperty()
    description: string;
    @ApiProperty()
    condition_in: coditionDTOGroupCustomer;
    @ApiProperty()
    condition_out: coditionDTOGroupCustomer;
}

export class editGroupCustomerDTOAdmin extends createGroupCustomerDTOAdmin {

}

export class actiGroupCustomerDTOAdmin {
    is_active: boolean;
}