import { Body, Controller, Get, Headers, HttpException, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { ExamTestService } from './examtest.service';
import { ValidateLangPipe, LANGUAGE, DEFAULT_LANG, iPageDTO, GetUserByToken } from 'src/@core';
import { InfoTestCollaboratorDto } from 'src/@core/dto/info_test_collaborator.dto';
import { iPageExamTestDTOAdmin } from 'src/@core/dto/examtest.dto';
import { iPageTrainingLessonDTOCollaborator } from 'src/@core/dto/trainingLesson.dto';

@Controller('exam_test')
export class ExamTestController {
    constructor(
        private examTestService: ExamTestService
    ) { }

    @ApiTags('collaborator')
    @Get('/get_list')
    async getListItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageExamTestDTOAdmin,
    ) {
        try {
            iPage.length = Number(iPage.length) || 20;
            iPage.search = decodeURI(iPage.search || "");
            iPage.start = Number(iPage.start) || 0;
            iPage.type_exam = (iPage.type_exam) ? iPage.type_exam : 'input';
            const result = await this.examTestService.getListQuestion(lang, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);;
        }
    }

    @ApiTags('collaborator')
    @Get('/detail_question/:idQuestion')
    async getDetailQuestion(
        @Param('idQuestion') idQuestion: string
    ) {
        try {
            const result = (await this.examTestService.getDetailQuestion(idQuestion));
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);;
        }
    }

    @ApiTags('collaborator')
    @UseGuards(AuthGuard('jwt_collaborator'))
    @Post('/submit')
    async submitTest(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() req: InfoTestCollaboratorDto,
        @GetUserByToken() user,
    ) {
        try {
            const result = await this.examTestService.submitTest(lang, req, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);;
        }
    }

    @ApiTags('collaborator')
    @UseGuards(AuthGuard('jwt_collaborator'))
    @Get('/check_info_test')
    async checkInfoTest(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Headers() headers
    ) {
        try {
            const result = await this.examTestService.checkInfoTest(lang, user, headers)
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('collaborator')
    @UseGuards(AuthGuard('jwt_collaborator'))
    @Get('/get_list_training_lesson')
    async getListTrainingLesson(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageTrainingLessonDTOCollaborator,
        @GetUserByToken() user: any
    ) {

        try {
            iPage.length = Number(iPage.length) || 20;
            iPage.search = decodeURI(iPage.search || "");
            iPage.start = Number(iPage.start) || 0;
            iPage.type_training_lesson = (iPage.type_training_lesson) ? iPage.type_training_lesson : 'input';
            const result = await this.examTestService.getListTrainingLesson(lang, iPage, user);
            console.log('result', result)
            return result.data
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);;
        }
    }

    @ApiTags('collaborator')
    @UseGuards(AuthGuard('jwt_collaborator'))
    @Get('/get_list_exam_by_training_lesson/:idTrainingLesson')
    async getListExamByTrainingLesson(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageTrainingLessonDTOCollaborator,
        @Param('idTrainingLesson') idTrainingLesson: string,
        @GetUserByToken() user: any
    ) {
        try {
            iPage.length = Number(iPage.length) || 20;
            iPage.search = decodeURI(iPage.search || "");
            iPage.start = Number(iPage.start) || 0;
            const result = await this.examTestService.getListExamByTrainingLesson(lang, idTrainingLesson, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);;
        }
    }

    @ApiTags('collaborator')
    @UseGuards(AuthGuard('jwt_collaborator'))
    @Get('/check_training_lesson/:idTrainingLesson')
    async checkTrainingLesson(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('idTrainingLesson') idTrainingLesson: string,
        @GetUserByToken() user: any
    ) {
        try {
            const result = await this.examTestService.checkTrainingLesson(lang, idTrainingLesson, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);;
        }
    }

    @ApiTags('collaborator')
    @UseGuards(AuthGuard('jwt_collaborator'))
    @Get('/get_detail_training_lesson/:idTrainingLesson')
    async getDetailTrainingLesson(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('idTrainingLesson') idTrainingLesson: string,
        @GetUserByToken() user: any
    ) {
        try {
            const result = await this.examTestService.getDetailTrainingLesson(lang, idTrainingLesson, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);;
        }
    }
}



