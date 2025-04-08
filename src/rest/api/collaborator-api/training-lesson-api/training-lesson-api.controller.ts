import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { iPageTrainingLessonDTOCollaborator } from 'src/@core/dto/trainingLesson.dto';
import { ValidateLangPipe, LANGUAGE, DEFAULT_LANG, iPageDTO, GetUserByToken } from 'src/@core';
import { InforCollaboratorSystemService } from 'src/core-system/@core-system/infor-collaborator-system/infor-collaborator-system.service';
import { TraininglessonsSystemService } from 'src/core-system/@core-system/traininglessons-system/traininglessons-system.service';
import { AuthGuard } from '@nestjs/passport'
@Controller('training_lesson_api')
export class TrainingLessonApiController {
    constructor(
        private traininglessonsSystemService: TraininglessonsSystemService
    ) { }
    @ApiTags('collaborator')
    @UseGuards(AuthGuard('jwt_collaborator'))
    @Get('get_training_lesson')
    async getTraniningLesson(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageTrainingLessonDTOCollaborator,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.traininglessonsSystemService.getListTrainingLesson(lang, iPage, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN)
        }
    }
}
