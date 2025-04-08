import { ApiProperty } from "@nestjs/swagger";
import { iPageDTO, phoneDTO } from "./general.dto";


export class TranferMoneyCustomerDTOCustomer {
     @ApiProperty()
     money: number;
     @ApiProperty()
     transfer_note: string;

}
export class TranferMoneyCustomerDTOAdmin extends TranferMoneyCustomerDTOCustomer {

}

export class WithDrawMoneyCustomerDTOAdmin extends TranferMoneyCustomerDTOAdmin { }
export class deleteCustomerTransDTOAdmin {
     @ApiProperty()
     is_delete?: boolean;
}
export class verifyCustomerTransDTOAdmin {
     @ApiProperty()
     is_verify_money?: boolean;
}

export class editCustomerTransDTOAdmin extends TranferMoneyCustomerDTOAdmin { }