import { ApiProperty } from "@nestjs/swagger";
import { iPageDTO, phoneDTO } from './general.dto';
import { Collaborator, Customer } from "../db";



export class TranferMoneyCollaboratorDTOAdmin {

     @ApiProperty()
     money: number;

     @ApiProperty()
     transfer_note: string;
     @ApiProperty()
     type_wallet?: string;
}

export class WithdrawMoneyCollaboratorDTOAdmin extends TranferMoneyCollaboratorDTOAdmin { }

export class deleteCollaboratorTransDTOAdmin {
     @ApiProperty()
     is_delete?: boolean;
}
export class verifyCollaboratorTransDTOAdmin {
     @ApiProperty()
     is_verify_money?: boolean;
}


export class TranferMoneyCollaboratorDTOCollaborator {

     @ApiProperty()
     money: number;

}
export class editCollaboratorTransDTOAdmin extends TranferMoneyCollaboratorDTOAdmin { }


export class createPersonalInforCollaboratorDTOAdmin {

     @ApiProperty()
     gender: string;

     @ApiProperty()
     full_name: string;

     @ApiProperty()
     birthday: string;

     // địa chỉ thường trú
     @ApiProperty()
     permanent_address: string;

     // địa chỉ tạm trú
     @ApiProperty()
     temporary_address: string;

     // dân tộc
     @ApiProperty()
     folk: string;

     // ton giao
     @ApiProperty()
     religion: string;

     // trình độ văn hoá
     @ApiProperty()
     edu_level: string;

     @ApiProperty()
     identity_number: string;

     @ApiProperty()
     identity_place: string;


     @ApiProperty()
     identity_date: string;




}

export class iPageTransferCollaboratorDTOAdmin extends iPageDTO {
     transfer_note: string;
     type_transition: string;
}

export class iPageTransitionCollaboratorDTOAdmin extends iPageDTO {
     start_date: string;
     end_date: string;
}

export class iPageListCollaboratorDTOAdmin extends iPageDTO {
     status?: string;
     transfer_note: string;
     type_transition: string;
}

export class PunishCollaboratorDTOAdmin {
     money: number;
     punish_note: string;
     id_punish: string;
     id_order?: string;
     id_collaborator?: Collaborator;
     id_info_test_collaborator?: string;
}

export class createPunishCollaboratorDTOAdmin {
     money: number;
     punish_note?: string;
     id_punish: string;
     id_order?: string;
}

export class changeMoneyCollaborator {
     money: number;
}