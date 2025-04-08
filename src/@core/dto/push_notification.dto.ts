import { ApiProperty } from '@nestjs/swagger';
import { iPageDTO, languageDTO } from './general.dto';


export class iPagePushNotificationDTOAdmin extends iPageDTO {
    status: string;
}

export class createPushNotificationDTOAdmin {
    @ApiProperty()
    title: string;
    @ApiProperty()
    body: string
    @ApiProperty({ required: false })
    image_url: string;
    @ApiProperty({ required: false })
    is_date_schedule: boolean;
    @ApiProperty({ required: false })
    date_schedule: string;
    @ApiProperty({ required: false })
    schedule_loop: string;
    @ApiProperty({ required: false })
    is_id_collaborator: boolean;
    @ApiProperty({ required: false })
    id_collaborator: string[];
    @ApiProperty({ required: false })
    is_id_customer: boolean;
    @ApiProperty({ required: false })
    id_customer: string[];
    @ApiProperty({ required: false })
    is_id_group_customer: boolean;
    @ApiProperty({ required: false })
    id_group_customer: string[];
}


export class editPushNotificationDTOAdmin extends createPushNotificationDTOAdmin {
    status?: boolean;
}

export class activePushNotificationDTOAdmin {
    @ApiProperty()
    is_active?: boolean;

}
export class deletePushNotificationDTOAdmin {
    @ApiProperty()
    is_delete?: boolean;
}

export class pushNotiDTO {
    title: string;
    body: string;
    data: string;
    user_id: string;
    user_object?: string;
}

export class pushNotiMultipleUserDTO {
    title: string;
    body: string;
    data: string;
    user_id: string[];
    user_object?: string;
}