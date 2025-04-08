import { ApiProperty } from "@nestjs/swagger";
import { iPageDTO } from './general.dto';

export class createReviewDTOCustomer {
    @ApiProperty({ default: '', required: false })
    review?: string;
    @ApiProperty({ default: 0, enum: [0, 1, 2, 3, 4, 5] })
    star: number;
    @ApiProperty()
    date_create_review?: string;
    @ApiProperty()
    short_review?: string[];
    @ApiProperty()
    is_hide?: boolean;
}

export class iPageReviewCollaboratorDTOCustomer extends iPageDTO {
    @ApiProperty()
    star?: number;
}

export class iPageReviewCollaboratorDTOCollaborator extends iPageDTO {
  @ApiProperty()
  star?: number;
}