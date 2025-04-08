import { ApiProperty } from '@nestjs/swagger';
import { extendOptionalDTO } from './extendOptional.dto';
import { languageDTO } from './general.dto';


export class getOptionalServiceCustomerDTO {
    @ApiProperty()
    search: string;
    @ApiProperty()
    length: number;
    @ApiProperty()
    start: number;
    @ApiProperty()
    typeSort?: string;
    @ApiProperty()
    valueSort?: string;
}

export class getOptionalServiceDTOAdmin {
    @ApiProperty()
    search: string;
    @ApiProperty()
    length: number;
    @ApiProperty()
    start: number;
    @ApiProperty()
    typeSort?: string;
    @ApiProperty()
    valueSort?: string;
}

export class createOptionalServiceDTOAdmin {
    @ApiProperty()
    title: languageDTO
    @ApiProperty()
    description: languageDTO
    @ApiProperty()
    thumbnail: string;
    @ApiProperty()
    type: string;
    @ApiProperty()
    id_service: string;
    @ApiProperty()
    position: number;
    @ApiProperty()
    screen: number;
    @ApiProperty()
    platform_fee: number;
    @ApiProperty()
    price_option_holiday: any[];
    @ApiProperty()
    price_option_rush_hour: any[];
    @ApiProperty()
    price_option_rush_day: any[];
    // @ApiProperty()
    // view_confirm: string;
}

export class editOptionalServiceDTOAdmin extends createOptionalServiceDTOAdmin {
}

export class activeOptionalServiceDTOAdmin{
    @ApiProperty()
    is_active: boolean;
}

export class optionalServiceDTO {
    title: languageDTO
    description: languageDTO
    thumbnail: string;
    is_active: boolean;
    type: string;
    id_service: string;
    position: number;
    extend_optional: extendOptionalDTO[]
}