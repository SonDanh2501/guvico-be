import { ApiProperty } from "@nestjs/swagger";
import { iPageDTO, languageDTO } from "./general.dto";


export class createTrainingDTOAdmin {
  @ApiProperty()
  lesson: number;
  @ApiProperty()
  title: languageDTO;
  @ApiProperty()
  description: languageDTO;
  @ApiProperty()
  link_video?: string;
  @ApiProperty()
  type_training_lesson: string;
  @ApiProperty()
  is_show_in_app?: boolean;
  @ApiProperty()
  times_submit?: number;
  @ApiProperty()
  theory: string;
  @ApiProperty()
  total_exam: number; // tổng số câu hỏi
  @ApiProperty()
  total_correct_exam_pass: number; // tổng số câu để pass
  @ApiProperty()
  type_service_exam: Array<string>;
}

export class deleteTrainingDTOAdmin {
  @ApiProperty()
  is_delete?: boolean;
}

export class actiTrainingDTOAdmin {
  @ApiProperty()
  is_active: boolean;
}
export class editTrainingDTOAdmin extends createTrainingDTOAdmin {

}

export class iPageTrainingLessonDTOAdmin extends iPageDTO {
  type_training_lesson?: string;
}

export class iPageTrainingLessonDTOCollaborator extends iPageDTO {
  type_training_lesson?: string
}


