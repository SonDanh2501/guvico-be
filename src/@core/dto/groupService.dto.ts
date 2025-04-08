import { ApiProperty } from '@nestjs/swagger';
import { languageDTO } from './general.dto';
import { ServiceDTO } from './service.dto';


export class getGroupServiceCustomerDTO {
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

export class getGroupServiceAdminDTO {
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

export class createGroupServiceDTOAdmin {
    @ApiProperty()
    title: languageDTO
    @ApiProperty()
    description: languageDTO
    @ApiProperty()
    thumbnail: string;
    @ApiProperty()
    type: string;
    @ApiProperty()
    kind?: string;
    @ApiProperty()
    position?: number;
}

export class editGroupServiceDTOAdmin extends createGroupServiceDTOAdmin {
    point_popular: number;
    is_active: boolean;
}

export class groupServiceDTO {
    title: languageDTO
    description: languageDTO
    is_active: boolean;
    thumbnail: string;
    point_popular: number;
    service: ServiceDTO[];
}


export class activeGroupServiceDTOAdmin{
    @ApiProperty()
    is_active: boolean;
}