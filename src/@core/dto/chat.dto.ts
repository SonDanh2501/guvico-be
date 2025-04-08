export class createRoomDTOSystem {
    id_order: string;
}

export class messageDTO {
    id_room?: string;
    id_sender: string;
    type_user: string;
    message: string;
    images: string[];
    name_sender?: string;
    name_room?: string;
}

export class messageDTO2 {
    id_room?: string;
    id_collaborator: string;
    id_customer: string;
    type_user: string;
    message: string;
    images: string[];
    date_create: string;

}