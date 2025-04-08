import { ApiProperty } from '@nestjs/swagger';
import { languageDTO } from './general.dto';


export class getExtendOptionalAdminDTO {
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

export class createExtendOptionalDTOAdmin {
    @ApiProperty()
    title: languageDTO
    @ApiProperty()
    description?: languageDTO
    @ApiProperty({
        required: false
    })
    is_active?: boolean;
    @ApiProperty({
        required: false
    })
    is_delete?: boolean;
    @ApiProperty()
    thumbnail: string;
    @ApiProperty({
        required: false
    })
    price: number;
    @ApiProperty({
        required: false
    })
    count?: number;
    @ApiProperty({
        required: false
    })
    estimate?: number;
    @ApiProperty({
        required: false
    })
    note?: string;
    @ApiProperty()
    id_optional_service: string;
    @ApiProperty()
    position: number;
    @ApiProperty()
    thumbnail_active?: string;
    @ApiProperty({ required: false })
    status_default?: boolean
    @ApiProperty({ required: false })
    checked?: boolean;
    is_show_in_app?: boolean;
    is_platform_fee?: boolean;
    platform_fee?: number;
    persional: number;
    is_price_option_area: boolean;
    price_option_area: object[];
    is_price_option_rush_hour: boolean;
    price_option_rush_hour: object[];
    is_price_option_rush_day: boolean;
    price_option_rush_day: object[];
    is_price_option_holiday: boolean;
    price_option_holiday: object[];
    kind?: string;
    area_fee?: any[];
}

export class editExtendOptionalDTOAdmin {
    @ApiProperty()
    title: languageDTO
    @ApiProperty()
    description?: languageDTO
    // @ApiProperty({
    //     required: false
    // })
    // is_active?: boolean;
    // @ApiProperty({
    //     required: false
    // })
    // is_delete?: boolean;
    @ApiProperty()
    thumbnail: string;
    @ApiProperty({
        required: false
    })
    price: number;
    @ApiProperty({
        required: false
    })
    count?: number;
    @ApiProperty({
        required: false
    })
    estimate?: number;
    @ApiProperty({
        required: false
    })
    note?: string;
    @ApiProperty()
    id_optional_service: string;
    @ApiProperty()
    position: number;
    @ApiProperty()
    thumbnail_active?: string;
    @ApiProperty({ required: false })
    status_default?: boolean
    @ApiProperty({ required: false })
    checked?: boolean;
    is_show_in_app?: boolean;
    is_price_option_area: boolean;
    price_option_area: object[];
    is_price_option_rush_hour: boolean;
    price_option_rush_hour: object[];
    is_price_option_rush_day: boolean;
    price_option_rush_day: object[];
    is_price_option_holiday: boolean;
    price_option_holiday: object[];
    kind?: string;
    area_fee?: any[];
}

export class extendOptionalDTO {
    title: languageDTO
    description?: languageDTO
    is_active?: boolean;
    thumbnail: string;
    price: number;
    count?: number;
    estimate?: number;
    note?: string;
    id_optional_service: string;
    position: number;
}

export class activeExtendOptionalServiceDTOAdmin {
    @ApiProperty()
    is_active: boolean;
}