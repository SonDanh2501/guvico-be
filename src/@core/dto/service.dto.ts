import { ApiProperty } from '@nestjs/swagger';
import { languageDTO } from './general.dto';
import { optionalServiceDTO } from './optionalService.dto';


export class getServiceCustomerDTO {
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

export class getServiceAdminDTO {
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

export class createServiceDTOAdmin {
    @ApiProperty()
    title: languageDTO
    @ApiProperty()
    description: languageDTO
    @ApiProperty()
    is_active: boolean;
    @ApiProperty()
    is_delete: boolean;
    @ApiProperty()
    thumbnail: string;
    @ApiProperty()
    id_group_service: string;
    @ApiProperty()
    position: number;
    @ApiProperty()
    type?: string;
    @ApiProperty()
    kind: string;
    @ApiProperty({ required: false })
    minimum_time_order: any;
    type_loop_or_schedule?: string;
    time_repeat?: number;
    time_schedule?: number[];
    type_page?: string;
    max_estimate: number;
    is_auto_order: boolean;
    type_partner?: string;
    platform_fee?: number;
    note?: string;
}

export class editServiceDTOAdmin {
    @ApiProperty()
    title: languageDTO
    @ApiProperty()
    description: languageDTO
    @ApiProperty()
    thumbnail: string;
    @ApiProperty()
    id_group_service: string;
    @ApiProperty()
    position: number;
    @ApiProperty()
    type?: string;
    @ApiProperty()
    kind: string;
    @ApiProperty({ required: false })
    minimum_time_order: any;
    @ApiProperty()
    type_loop_or_schedule?: string;
    @ApiProperty()
    time_repeat?: number;
    @ApiProperty()
    time_schedule?: number[];
    @ApiProperty()
    type_page?: string;
    @ApiProperty()
    platform_fee: number;
    @ApiProperty()
    max_estimate: number;
    @ApiProperty()
    price_option_area: priceOptionAreaServiceDTOAdmin[];
    @ApiProperty()
    price_option_holiday: priceOptionHolidayServiceDTOAdmin[];
    @ApiProperty()
    price_option_rush_hour: priceOptionRushHourServiceDTOAdmin[];
    @ApiProperty()
    is_auto_order: boolean;
    note: string;
    type_partner: string;
}

export class ServiceDTO {
    _id: string;
    title: languageDTO;
    description: languageDTO;
    is_active: boolean;
    thumbnail: string;
    id_group_service: string;
    position: number;
    optional_service: optionalServiceDTO[]
    type_partner: string;
}

export class activeServiceDTOAdmin {
    @ApiProperty()
    is_active: boolean;
}

export class priceOptionHolidayServiceDTOAdmin {
    @ApiProperty()
    time_start: string;
    @ApiProperty()
    time_end: string;
    @ApiProperty()
    value: number;
}

export class priceOptionAreaServiceDTOAdmin {
    @ApiProperty()
    district: number;
    @ApiProperty()
    city: number;
    @ApiProperty()
    value: number;
}

export class priceOptionRushHourServiceDTOAdmin {
    @ApiProperty()
    rush_day: number;
    @ApiProperty()
    time_start: string;
    @ApiProperty()
    time_end: string;
    @ApiProperty()
    value: number;
}

export class getFieldsServiceCustomerDTO {
    @ApiProperty()
    address?: string;
    @ApiProperty()
    id_customer?: string;
}