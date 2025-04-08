import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { ValidateLangPipe, LANGUAGE, DEFAULT_LANG, GetUserByToken, GetSubjectAction } from 'src/@core';

import { actiTrainingDTOAdmin, createTrainingDTOAdmin, editTrainingDTOAdmin, iPageTrainingLessonDTOAdmin } from 'src/@core/dto/trainingLesson.dto';
import { TraininglessonsSystemService } from 'src/core-system/@core-system/traininglessons-system/traininglessons-system.service';
@Controller('training_lesson_manager')
export class TrainingLessonManagerApiController {
    constructor(
        private traininglessonsSystemService: TraininglessonsSystemService
    ) { }
    @ApiTags('admin')
    @Post('/create_training_lesson')
    @UseGuards(AuthGuard('jwt_admin'))
    async createTrainingLesson(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() req: createTrainingDTOAdmin,
        @GetUserByToken() user,
    ) {
        try {

            const result = await this.traininglessonsSystemService.createTrainingLesson(req, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

}
