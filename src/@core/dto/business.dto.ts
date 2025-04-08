import { ApiProperty } from "@nestjs/swagger";

export class createBusinessDTOAdmin {
    @ApiProperty()
    type_permisstion: string;
    @ApiProperty()
    full_name: string;
    @ApiProperty()
    avatar: string;
    @ApiProperty()
    tax_code: string;
    area_manager_lv_0?: string;
    area_manager_lv_1?: number[];
    area_manager_lv_2?: number[];
    id_service_manager?: string[];
}

export class editBusinessDTOAdmin extends createBusinessDTOAdmin { }

export class actiBusinessDTOAdmin {
    is_active: boolean;
}