import { ApiProperty } from "@nestjs/swagger"
import { iPageDTO, phoneDTO } from "./general.dto"

export class LoginDTOCollaborator extends phoneDTO {
    @ApiProperty()
    password: string;
    @ApiProperty({ required: false })
    device_token: string;
}

export class ChangePasswordDTOCollaborator {
    @ApiProperty()
    password: string;
    @ApiProperty()
    old_password?: string;
}

export class RegisterDTOCollaborator {
    @ApiProperty()
    token: string;
    @ApiProperty()
    full_name: string;
    @ApiProperty()
    email: string;
    @ApiProperty()
    identity_number: string;
    @ApiProperty()
    password: string;
    @ApiProperty()
    city: number;
    @ApiProperty({ required: false })
    district: number[];
    @ApiProperty({ required: false })
    device_token: string;
    @ApiProperty({ required: false })
    code_inviter?: string;
    date_create: string;
    salt?: string;
}

export class RegisterV2DTOCollaborator {
    @ApiProperty()
    token: string;
    @ApiProperty()
    full_name: string;
    @ApiProperty()
    email: string;
    @ApiProperty()
    identity_number: string;
    @ApiProperty()
    city: number;
    @ApiProperty({ required: false })
    district: number[];
    @ApiProperty({ required: false })
    device_token: string;
    @ApiProperty({ required: false })
    code_inviter?: string;
    type?: string[];
    @ApiProperty({ required: true })
    password: string;
    desire_service?: string;
    birthday?: string;
}

export class OTPCheckDTOCollaborator extends phoneDTO {
    @ApiProperty()
    code: string;
    @ApiProperty()
    token: string;
}

export class newPasswordDTOCollaborator {
    @ApiProperty()
    password: string;
    @ApiProperty()
    token: string;
}


export class createCollaboratorDTOAdmin extends phoneDTO {
    @ApiProperty()
    email: string;
    @ApiProperty()
    name: string;
    @ApiProperty()
    full_name: string;
    @ApiProperty()
    identity_number: string;
    date_create: string;
    @ApiProperty({ required: true })
    city: number;
    @ApiProperty({ required: false })

    district?: number[];
    salt: string;
    @ApiProperty({ required: false })
    id_inviter: string;
    type?: string
    service_apply: string[];
    id_business?: string;
}

export class editCollaboratorDTOAdmin extends phoneDTO {
    @ApiProperty()
    email: string;
    @ApiProperty()
    full_name: string;
    @ApiProperty()
    avatar: string;
    @ApiProperty()
    remainder: number;
    @ApiProperty({ required: false })
    id_inviter: string;
}


export class actiCollaboratorDTOAdmin {
    @ApiProperty()
    is_active?: boolean;
}

export class lockCollaboratorDTOAdmin {
    @ApiProperty()
    is_lock_time?: boolean;
    lock_time?: string;
}




export class deleteCollaboratorDTOAdmin {
    @ApiProperty()
    is_delete?: boolean;
}

export class iPageOrderNearDTOCollaborator extends iPageDTO {
    location: [number, number]
}

export class iPageOrderScheduleWorkDTOCollaborator extends iPageDTO {
    @ApiProperty()
    start_date: string;
    @ApiProperty()
    end_date: string;
}

export class iPageHistoryOrderDTOCollaborator extends iPageDTO {
    @ApiProperty()
    start_date: string;
    @ApiProperty()
    end_date: string;
    city?: any;
    type?: string;
    district?: any;
    type_date?: string;
    status?: string;
}

export class iPageHistoryRemainderDTOCollaborator extends iPageDTO {
    @ApiProperty()
    start_date: string;
    @ApiProperty()
    end_date: string;
    city?: number;
    type?: string;
}

export class iPageHistoryTransferDTOCollaborator extends iPageHistoryOrderDTOCollaborator { }
export class editAministrativeDTOCollaborator {
    @ApiProperty({ required: false })
    city: number;
    @ApiProperty({ required: false })
    district: number[];
}
export class topupCollaboratorDTOAdmin {
    @ApiProperty({ required: true })
    account_number: string;
    @ApiProperty()
    account_name: string;
    @ApiProperty()
    bank_name: string;
}

export class topupCollaboratorDTOCollaborator {
    @ApiProperty({ required: true })
    money: number;
    @ApiProperty({ required: false })
    time_zone?: number;
}

export class withdrawCollaboratorDTOCollaborator extends topupCollaboratorDTOCollaborator { }

// export class TranferMoneyCollaboratorDTOAdmin {

//     @ApiProperty()
//     money: number;

//     @ApiProperty()
//     transfer_note: string;

// }

export class editPersonalInforCollaboratorDTOAdmin extends phoneDTO {

    @ApiProperty()
    full_name: string;

    @ApiProperty()
    email: string;

    @ApiProperty()
    identity_number: string;

    @ApiProperty()
    birthday: string;

    @ApiProperty()
    identity_place: string;

    @ApiProperty()
    identity_date: string;

    @ApiProperty()
    gender: string;

    @ApiProperty()
    country: string;

    @ApiProperty()
    home_town: string;

    @ApiProperty()
    province_live: number;

    @ApiProperty()
    district_live: number;

    @ApiProperty()
    address_live: string;

    @ApiProperty()
    province_temp: number;

    @ApiProperty()
    district_temp: number;

    @ApiProperty()
    address_temp: string;

    @ApiProperty()
    folk: string;

    @ApiProperty()
    religion: string;

    @ApiProperty()
    edu_level: string;

    @ApiProperty()
    service_apply: string[];

    @ApiProperty()
    skills_list: number[];

    @ApiProperty()
    languages_list: number[];
        
    @ApiProperty()
    province_work: number;

    @ApiProperty()
    district_work: number[];

    @ApiProperty()
    contact_persons: string[];
    
    @ApiProperty()
    avatar: string;

    // địa chỉ thường trú
    @ApiProperty()
    permanent_address: string;

    // địa chỉ tạm trú
    @ApiProperty()
    temporary_address: string;

    @ApiProperty({ required: false })
    id_inviter?: string;

    @ApiProperty()
    type?: string[];

    @ApiProperty()
    city?: number;

    @ApiProperty()
    district: number[]
    
    @ApiProperty()
    id_business?: string;
}

export class editDocumentCollaboratorDTOAdmin {

    @ApiProperty()
    is_identity: boolean;

    @ApiProperty()
    identity_frontside: string;

    @ApiProperty()
    identity_backside: string;

    @ApiProperty()
    is_personal_infor: boolean;

    @ApiProperty()
    personal_infor_image: string[];

    @ApiProperty()
    is_household_book: boolean;

    @ApiProperty()
    household_book_image: string[];

    @ApiProperty()
    is_behaviour: boolean;

    @ApiProperty()
    behaviour_image: string[];

    @ApiProperty()
    document_code: string;

    @ApiProperty()
    is_document_code: boolean;
}

export class editInforDTOCollaborator extends phoneDTO {
    @ApiProperty()
    name: string;
    @ApiProperty()
    full_name: string;
    @ApiProperty()
    birthday: string;
    @ApiProperty()
    email: string;
    @ApiProperty()
    birth_date: string;
    @ApiProperty()
    gender: string;
    @ApiProperty()
    avatar: string;
    @ApiProperty({ required: false })
    city: number;
    @ApiProperty({ required: false })
    district: number[];
}

export class iPageGetCollaboratorByTypeDTOAdmin extends iPageDTO {
    collaborator_type: string;
    city?: any;
    district?: any;
}

export class iPageGetCollaboratorDTOAdmin extends iPageDTO {
    city?: any;
    district?: any;
    status?: any;
}

export class iPageGetCollaboratorCanConfirmJobDTOAdmin extends iPageDTO {
    @ApiProperty({ required: true })
    start_time: string;
    @ApiProperty({ required: true })
    end_time: string;
}

export class editAcounntBankCollaboratorDTOAdmin {
    @ApiProperty({ required: true })
    account_number: string;
    @ApiProperty({ required: true })
    bank_name: string;
    @ApiProperty({ required: true })
    account_name: string
    @ApiProperty({ required: true })
    bank_brand: string;
}

export class lockCollaboratorV2DTOAdmin {
    is_locked?: boolean;
    date_lock?: string;
}

export class previousBalanceCollaboratorDTO {
    remainder?: number;
    gift_remainder?: number;
    work_wallet: number;
    collaborator_wallet: number;
}

export class autoChangeMoneyCollaboratorDTO {
    is_auto_change_money: boolean;
}

export class iPageCollaboratorDTO extends iPageDTO {
    @ApiProperty()
    start_date: string;
    @ApiProperty()
    end_date: string;
}

export class changeHandleProfileDTOAdmin {
    status?: string;
    note_handle_admin?: string;
}

export class dashBoardCollaboratorDTOAdmin {
    @ApiProperty()
    start_date?: string;
    @ApiProperty()
    end_date?: string;
}

export class iPageHistoryActivityCollaboratorDTOAdmin extends iPageDTO {
    @ApiProperty({
        required: false
    })
    type_filter?: string[]
}

export class iPageHistoryActivityAccumulationDTOCollaborator extends iPageDTO {
    date_type?: string;
}