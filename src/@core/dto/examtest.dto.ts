import { ApiProperty } from "@nestjs/swagger";
import { iPageDTO } from "./general.dto";

export class ExamTestDto {
  @ApiProperty()
  question: number;
  @ApiProperty()
  title: string;
  @ApiProperty()
  description: string;
  @ApiProperty()
  choose?: object[];
  type_exam?: string;
  // @ApiProperty()
  // correct_answer?: string;
}

export class createExamTestDTOAdmin {
  @ApiProperty()
  question: number;
  @ApiProperty()
  title: string;
  @ApiProperty()
  description: string;
  @ApiProperty()
  choose?: object[];
  @ApiProperty()
  type_exam?: string[];
  @ApiProperty()
  id_training_lesson: string;
}

export class deleteExamTestDTOAdmin {
  @ApiProperty()
  is_delete?: boolean;
}

export class actiExamTestDTOAdmin {
  @ApiProperty()
  is_active: boolean;

}

export class editExamTestDTOAdmin extends createExamTestDTOAdmin {

}

export class markQuestionExamTestDTOAdmin extends createExamTestDTOAdmin {
  @ApiProperty()
  mark_selected?: boolean;
}

export class iPageExamTestDTOAdmin extends iPageDTO {
  type?: string;
  type_exam?: string;
}

