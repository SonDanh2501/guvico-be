import { ApiProperty } from "@nestjs/swagger";

export class createBannerDTOAdmin {
    @ApiProperty()
    title: string;
    @ApiProperty()
    image: string;
    @ApiProperty()
    type_link: string;
    @ApiProperty({
        required: false
    })
    link_id?: string;
    @ApiProperty()
    position: number;
    @ApiProperty({ default: null, enum: ["giup_viec_theo_gio", "giup_viec_co_dinh", "tong_ve_sinh"] })
    kind: string;
}
export class createBannerImgDTOAdmin {
    @ApiProperty()
    image: string;
}
export class editBannerDTOAdmin extends createBannerDTOAdmin {

}


export class actiBannerDTOAdmin {
    @ApiProperty()
    is_active?: boolean;

}

export class deleteBannerDTOAdmin {

    @ApiProperty()
    is_delete?: boolean;
}