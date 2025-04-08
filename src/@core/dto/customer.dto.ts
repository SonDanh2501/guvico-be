import { ApiProperty } from '@nestjs/swagger';
import { iPageDTO, phoneDTO } from './general.dto';


export class LoginDTOCustomer extends phoneDTO {
    @ApiProperty()
    password: string;
    @ApiProperty({ required: false })
    device_token?: string;
}

export class RegisterDTOCustomer {
    @ApiProperty()
    token: string;
    @ApiProperty()
    email: string;
    @ApiProperty()
    name: string;
    @ApiProperty()
    full_name: string;
    @ApiProperty()
    device_token: string;
    @ApiProperty({ required: false })
    code_inviter?: string;
    @ApiProperty({ required: false })
    birthday?: string;
    @ApiProperty({ required: false })
    gender?: string;
    @ApiProperty({ required: false })
    identity_number?: string;
    @ApiProperty({ required: false })
    tax_code?: string;
    @ApiProperty({ required: false })
    city?: number;
    @ApiProperty({ required: false })
    district?: number;
    @ApiProperty()
    password: string;
    date_create: string;
    salt: string;
}

export class OTPCheckDTOCustomer extends phoneDTO {
    @ApiProperty()
    code: string;
    @ApiProperty()
    token: string;
}

export class newPasswordDTOCustomer {
    @ApiProperty()
    password: string;
    @ApiProperty()
    token: string;
}

export class createCustomerDTOAdmin extends phoneDTO {
    @ApiProperty()
    email: string;
    @ApiProperty()
    name: string;
    @ApiProperty()
    full_name: string;
    @ApiProperty()
    password: string;
    date_create: string;
    // salt: string;
    code_inviter?: string;
}


export class editCustomerDTOAdmin extends phoneDTO {
    @ApiProperty()
    email: string;
    @ApiProperty()
    full_name: string;
    @ApiProperty()
    avatar: string;
    @ApiProperty()
    gender: string;
    @ApiProperty()
    birthday: string;
    @ApiProperty()
    bank_name: string;
    @ApiProperty()
    account_number: string;
    @ApiProperty()
    account_holder: string;
}


export class getAllCustomerDTOAdmin extends phoneDTO {
    @ApiProperty()
    email: string;
    @ApiProperty()
    name: string;
    date_create: string;
}

export class actiCustomerDTOAdmin {
    @ApiProperty()
    is_active?: boolean;
}

export class lockCustomerDTOAdmin {
    @ApiProperty()
    is_lock_time?: boolean;
    is_active?: boolean;
    lock_time?: string;
}
export class deleteCustomerDTOAdmin {

    @ApiProperty()
    is_delete?: boolean;
}



export class editInforDTOCustomer extends phoneDTO {
    @ApiProperty()
    name: string;
    @ApiProperty()
    full_name: string;
    @ApiProperty()
    email: string;
    @ApiProperty()
    birthday: string;
    @ApiProperty()
    gender: string;
    @ApiProperty()
    avatar: string;
}

export class changePasswordDTOCustomer {
    @ApiProperty()
    old_password: string;
    @ApiProperty()
    new_password: string;
}

export class iPageHistoryOrderDTOCustomer extends iPageDTO {
    @ApiProperty()
    start_date: string;
    @ApiProperty()
    end_date: string;
}

export class iPageGetCustomerByTypeDTOAdmin extends iPageDTO {
    @ApiProperty({ required: false })
    customer_type: string;
    id_group_customer?: string;
    @ApiProperty()
    start_date: string;
    @ApiProperty()
    end_date: string;
}

export class iPageHistoryTransferDTOCustomer extends iPageHistoryOrderDTOCustomer { }

export class editPointAndRankPointCustomerDTOAdmin {
    @ApiProperty()
    point: number;
    rank_point: number;
}
export class setIsStaffDTOAdmin {
    is_staff: boolean;
}
export class iPageGetTotalCustomerDTOAdmin extends iPageHistoryOrderDTOCustomer {

}

export class iPageTopCustomerInviterDTOAdmin extends iPageDTO {
    @ApiProperty()
    start_date: string;
    @ApiProperty()
    end_date: string;
}

export class iPageHistoryGroupOrderDTOCustomer extends iPageDTO {
    @ApiProperty()
    type: string;
}

export class iPageReportGroupOrderDTOAdmin extends iPageDTO {
    @ApiProperty()
    start_date: string;
    @ApiProperty()
    end_date: string;
    @ApiProperty()
    district: any;
    @ApiProperty()
    city: any;
    @ApiProperty()
    type_group_order: string;
    @ApiProperty()
    type_date?: string;
    @ApiProperty()
    status: string;
}

export class iPageGetHistoryPointCustomerDTOAdmin extends iPageDTO {
    start_date: string;
    end_date: string;
}

export class iPageReportCustomerDTOAdmin extends iPageGetHistoryPointCustomerDTOAdmin {
    type?: string;
    type_date?: string;
}

export class iPageReportTypeServiceDTOAdmin extends iPageDTO {
    start_date: string;
    end_date: string;
    city?: any;
    district?: any;
    type_date?: string;
}
export class createTopUpPointCustomerDTOAdmin {
    type_point: string;
    value: number;
    note?: string;
}

export class iPageCustomerPointDTOAdmin extends iPageDTO {
    status: string; // enum ["pending", "done", "cancel"]
    verify?: string; // enum ["verify", "not_verify", "all"]
    start_date: string;
    end_date: string;
    type_point: string;
}

export class iPageReportConnecting extends iPageDTO {
    start_date: string;
    end_date: string;
    city?: number;
    district?: number[];
}

export class iPageCustomerScoreDTOAdmin extends iPageDTO {
    status?: string;
    start_date?: string;
    end_date?: string;
    start_point?: number;
    end_point?: number;
}

export class tipCollaboratorDTOCustomer {
    money: number
}

export class iPageReportOrderByCustomerDTOAdmin extends iPageGetHistoryPointCustomerDTOAdmin {
    type_customer?: string;
    type_date?: string;
    type_status?: string;
}

export class createAddressCustomerDTOAdmin {
    token: string;
    type_address_work?: string;
    note_address?: string;
}

export class OTPCheckAffiliateDTOCustomer extends phoneDTO {
    @ApiProperty()
    code: string;
}

export class createBankAccountDTOCustomer {
    @ApiProperty()
    bank_name: string;
    @ApiProperty()
    account_number: string;
    @ApiProperty()
    account_holder: string;
}

export class updateBankAccountDTOAdmin {
    @ApiProperty()
    id_customer: string;
    @ApiProperty({ required:false })
    bank_name?: string;
    @ApiProperty({ required:false })
    account_number?: string;
    @ApiProperty({ required:false })
    account_holder?: string;
}



export class iPageListCustomerDTOAdmin extends iPageDTO {
  status?: string;
}