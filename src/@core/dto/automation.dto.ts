import { ApiProperty } from "@nestjs/swagger";

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