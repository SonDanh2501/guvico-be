import { ApiProperty } from "@nestjs/swagger";
import { languageDTO } from "./general.dto";

export class createRewardCollaboratorDTOAdmin {
    @ApiProperty()
    title: languageDTO;
    @ApiProperty()
    description: languageDTO;
    @ApiProperty()
    type_day_condition: string;
    @ApiProperty()
    type_bonus: string
    @ApiProperty()
    money: number       // sẽ hoạt động khi type_bonus= money
    @ApiProperty()
    artifacts: string   // hoạt động khi type_bonus=artifacts
    @ApiProperty()
    type_date_bonus: string
    @ApiProperty()
    total_invite_collaborator: number
    @ApiProperty()
    limit_total_received: number
    @ApiProperty()
    city: number[]
    @ApiProperty()
    timezone: string;

}

export class editRewardCollaboratorDTOAdmin extends createRewardCollaboratorDTOAdmin {
    question: any;
    choose: any;

}

export class deleteRewardCollaboratorAdmin {
    @ApiProperty()
    is_delete?: boolean;
  }
  
  export class actiRewardCollaboratorAdmin {
    @ApiProperty()
    is_active?: boolean;
  
  }

