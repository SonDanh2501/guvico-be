import { ApiProperty } from '@nestjs/swagger';
import { iPageDTO } from './general.dto';
export class LoginAdminDto {
    @ApiProperty()
    email: string;
    @ApiProperty()
    password: string;
}

export class CreateDTOAdmin {
    @ApiProperty()
    name: string;
    @ApiProperty()
    full_name: string;
    @ApiProperty()
    email: string;
    @ApiProperty()
    role: string;
    @ApiProperty()
    password?: string;
    date_create?: string;
    salt?: string;
    @ApiProperty()
    id_role_admin?: string;
    area_manager_lv_0?: string;
    area_manager_lv_1?: number[];
    area_manager_lv_2?: number[];
    id_service_manager?: string[];
    id_business?: string;
}

export class createCollaboratorAdminDTO {
    email: string;
    name: string;
    password: string;
    role: string[];
    date_create: string;
}

export class createCustomerAdminDTO {
    email: string;
    name: string;
    password: string;
    role: string[];
    date_create: string;
}

export class editUserSystemDTO extends CreateDTOAdmin {
}

export class actiUserSystemDTO {
    @ApiProperty()
    is_active: boolean;
}

export class iPageGetUserSysstemDTOAdmin extends iPageDTO {
    user_system_type: string;
}

export class createRoleAdminDTOAdmin {
    type_role?: string;
    name_role?: string;
    id_key_api?: string[];
    is_permission?: boolean;
    is_area_manager?: boolean;
    area_manager_level_0?: string;
    area_manager_level_1?: number[];
    area_manager_level_2?: number[];
    is_service_manager?: boolean;
    id_service_manager?: string[];

}

export class updateRoleAdminDTOAdmin extends createRoleAdminDTOAdmin {

}

export class iPagePriceServiceDTOAdmin {
    id_extend?: string;
    timezone?: number;
    city?: number;
    district?: number;
    start_date?: string;
    end_date?: string;
    step?: number;
    start_time?: number;
    end_time?: number;
    start_minute?: number;
    end_minute?: number;
}


export class ChangePasswordAdminDto {
    @ApiProperty()
    old_password: string;
    @ApiProperty()
    new_password: string;
}