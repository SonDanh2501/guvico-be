import { ApiProperty } from "@nestjs/swagger"
import { languageDTO } from "./general.dto"

export class createRewardCollaboratorDTOAdmin {
  @ApiProperty()
  title: languageDTO;

  @ApiProperty()
  description: languageDTO;

  @ApiProperty()
  is_limit_date: boolean;

  @ApiProperty()
  start_date: string;

  @ApiProperty()
  end_date: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  is_type_collaborator: boolean;

  @ApiProperty()
  type_collaborator: string;

  @ApiProperty()
  is_city: boolean;

  @ApiProperty()
  city: number[];

  @ApiProperty()
  timezone: string;

  // @ApiProperty()
  // condition: [{
  //   type_condition: string;
  //   money: number;
  //   condition: detailCondition[];
  // }]
  @ApiProperty()
  condition: object;

  @ApiProperty()
  total_received: number;

  @ApiProperty()
  is_limit_total_received: boolean;

  @ApiProperty()
  limit_total_received: number;

  @ApiProperty()
  is_service_apply: boolean;

  @ApiProperty()
  service_apply: string[];

  @ApiProperty()
  type_wallet: string;

  @ApiProperty()
  is_auto_verify: boolean;
}

export class editRewardCollaboratorDTOAdmin extends createRewardCollaboratorDTOAdmin {

}

export class detailCondition {
  @ApiProperty()
  kind: string;
  @ApiProperty()
  value: string;
  @ApiProperty()
  operator: string;
}
export class deleteRewardCollaboratorAdmin {
  @ApiProperty()
  is_delete?: boolean;
}

export class actiRewardCollaboratorAdmin {
  @ApiProperty()
  is_active?: boolean;

}

export class createRewardTicketDTOCollaborator {
  id_reward_policy: string;
  id_collaborator: string
}