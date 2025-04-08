import { ApiProperty } from "@nestjs/swagger";
import { OptionalService } from "../db/schema/optional_service.schema";
import { ExtendOptional } from "..";


export class createCollaboratorBonusDTOAdmin {
    @ApiProperty()
    title: string;

    @ApiProperty()
    description: string;

    @ApiProperty()
    id_optional_service: OptionalService;

    @ApiProperty()
    id_extend_optional: ExtendOptional;
    
    @ApiProperty()
    is_bonus_area: boolean

    @ApiProperty()
    bonus_area: Object[]

    @ApiProperty()
    is_bonus_rush_day: boolean

    @ApiProperty()
    bonus_rush_day: Object[]

    @ApiProperty()
    is_bonus_holiday: boolean

    @ApiProperty()
    bonus_holiday: Object[]

    @ApiProperty()
    is_bonus_order_hot: boolean

    @ApiProperty()
    bonus_order_hot: Object[]
}

export class deleteCollaboratorBonusDTOAdmin {
    @ApiProperty()
    is_delete?: boolean;
  }
  
  export class actiCollaboratorBonusDTOAdmin {
    @ApiProperty()
    is_active?: boolean;
  
  }
  
  export class editCollaboratorBonusDTOAdmin extends createCollaboratorBonusDTOAdmin {
  }