import { ApiProperty } from '@nestjs/swagger';
import { iPageDTO, languageDTO } from './general.dto';
import { TYEP_SCHEDULE } from '../constant/constant';


export class iPageNotificationDTOAdmin extends iPageDTO {

}

export class iPageNotificationDTOCustomer extends iPageDTO {
    @ApiProperty({ required: false })
    type_notification: string;

}

export class createNotificationDTOAdmin {
    title: languageDTO;
    description: languageDTO
    id_customer?: string;
    id_collaborator?: string;
    type_notification: string;
    id_order?: string;
    id_group_order?: string;
    id_promotion?: string;
    id_transistion_collaborator?: string;
    id_transistion_customer?: string;
    @ApiProperty({ required: true, enum: ["single", "loop", "schedule"] })
    type_schedule?: string;
    id_transaction?: string;
    user_object?: string;
}


export class editNotificationDTOAdmin extends createNotificationDTOAdmin {

}

export class activeNotificationDTOAdmin {
    @ApiProperty()
    is_active?: boolean;

}
export class deleteNotificationDTOAdmin {
    @ApiProperty()
    is_delete?: boolean;
}

export class iPageNotificationDTO extends iPageDTO {
    @ApiProperty({ required: false })
    type_notification: string;
}
