import { ApiProperty } from '@nestjs/swagger'

export class phoneDTO {
    @ApiProperty()
    code_phone_area: string;
    @ApiProperty()
    phone: string;
}

export class iPageDTO {
    @ApiProperty({ required: false })
    search?: string;
    @ApiProperty({ required: false })
    length?: number;
    @ApiProperty({ required: false })
    start?: number;
    @ApiProperty({
        required: false
    })
    typeSort?: string;
    @ApiProperty({
        required: false
    })
    valueSort?: string | number;
}

export class languageDTO {
    @ApiProperty()
    vi: string;
    @ApiProperty()
    en?: string;
    @ApiProperty()
    jp?: string;
    @ApiProperty()
    kr?: string;
    @ApiProperty()
    th?: string;
}

export class populateArrDTO {
    @ApiProperty({required: false})
    path: string; // VD : {path: "collaborator"}
    @ApiProperty({required: false})
    select: Object; // VD : {full_name: 1, _id: 1}
}