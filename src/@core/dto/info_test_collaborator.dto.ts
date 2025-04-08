import { ApiProperty } from "@nestjs/swagger";
import { iPageDTO } from "./general.dto";

export class InfoTestCollaboratorDto {

  @ApiProperty()
  id_collaborator: string
  @ApiProperty()
  answers: [
    {
      id_question: string;
      selected_andswer: string;
      isCorrect: boolean
    }
  ];
  time_start: string;
  type_exam?: string;
  id_training_lesson?: string;
}

export class deleteInfoTestDTOCollaborator {
  @ApiProperty()
  is_delete?: boolean;
}

export class iPageInfoTestCollaboratorDTOAdmin extends iPageDTO {
  type_exam?: string;
}

