import { ApiProperty } from "@nestjs/swagger";
import { phoneDTO } from "./general.dto";

export class createAddressDTOCustomer {
    @ApiProperty({ required: false })
    name?: string;
    @ApiProperty({ required: false })
    address?: string;
    @ApiProperty({ required: false })
    lat?: number;
    @ApiProperty({ required: false })
    lng?: number;
    @ApiProperty({ required: false })
    token: string;
    @ApiProperty({ default: '' })
    type_address_work?: string;
    @ApiProperty({ required: false, default: '' })
    note_address?: string;
}

export class createAddressDTOCollaborator {
    @ApiProperty()
    token: string;
}

export class editAddressDTOCollaborator extends createAddressDTOCollaborator {
    is_default_address?: string;
}

export class editAddressDTOAdmin extends createAddressDTOCustomer {
    is_default_address?: string;
}


export class actiAddressDTOAdmin {
    @ApiProperty()
    is_active?: boolean;

}
export class deleteAddressDTOAdmin {

    @ApiProperty()
    is_delete?: boolean;
}

export class addressDTO extends phoneDTO {
    @ApiProperty()
    id_user: string;
}