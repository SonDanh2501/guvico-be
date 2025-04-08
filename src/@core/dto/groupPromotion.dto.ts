import { ApiProperty } from "@nestjs/swagger";
import { AnyARecord } from "dns";
import { languageDTO } from "./general.dto";



export class createGroupPromotionDTOAdmin {
    @ApiProperty()
    name: languageDTO;
    @ApiProperty()
    description: languageDTO;
    @ApiProperty()
    thumbnail: string;
    @ApiProperty()
    position: number;
    @ApiProperty()
    type_render_view?: string;

}

export class editGroupPromotionDTOAdmin extends createGroupPromotionDTOAdmin {

}

export class actiGroupPromotionDTOAdmin {
    is_active: boolean;
}