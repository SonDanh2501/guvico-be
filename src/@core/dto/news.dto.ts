import { ApiProperty } from '@nestjs/swagger';
import { iPageDTO, languageDTO } from './general.dto';


export class iPageNewsDTOAdmin extends iPageDTO {
    @ApiProperty()
    type: string;
}

export class createNewsDTOAdmin {
    @ApiProperty()
    title: string;
    @ApiProperty()
    short_description: string
    @ApiProperty()
    thumbnail: string;
    @ApiProperty()
    url: string;
    @ApiProperty()
    type: string;
    @ApiProperty({default: 0})
    position: number
}

export class editNewsDTOAdmin extends createNewsDTOAdmin {

}

export class activeNewsDTOAdmin{
    @ApiProperty()
    is_active: boolean;
}

export class iPageNewsDTOCustomer extends iPageDTO {
    @ApiProperty()
    type: string;
}