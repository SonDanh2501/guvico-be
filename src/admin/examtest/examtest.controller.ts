import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { ValidateLangPipe, LANGUAGE, DEFAULT_LANG, GetUserByToken, iPageDTO } from 'src/@core';
import { ExamTestService } from './examtest.service';
import { createGroupOrderDTOCustomer } from 'src/@core/dto/groupOrder.dto';
import { ExamTestDto, actiExamTestDTOAdmin, createExamTestDTOAdmin, deleteExamTestDTOAdmin, editExamTestDTOAdmin, iPageExamTestDTOAdmin, markQuestionExamTestDTOAdmin } from 'src/@core/dto/examtest.dto';

@Controller('exam_test')
export class ExamTestController {
    constructor(private examTestService: ExamTestService) { }

    @ApiTags('admin')
    @Get('get_list')
    @UseGuards(AuthGuard('jwt_admin'))
    async getListItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageExamTestDTOAdmin,
        @GetUserByToken() user
    ) {
        try {
            iPage.length = Number(iPage.length) || 20;
            iPage.search = decodeURI(iPage.search || "");
            iPage.start = Number(iPage.start) || 0;
            iPage.type = (iPage.type) ? iPage.type : 'all'
            iPage.type_exam = (iPage.type_exam) ? iPage.type_exam : 'all'
            const result = await this.examTestService.getListQuestion(lang, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);;
        }
    }

    @ApiTags('admin')
    @Get('get_exam_by_training_lesson/:idTrainingLesson')
    @UseGuards(AuthGuard('jwt_admin'))
    async getExamByTrainingLesson(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageExamTestDTOAdmin,
        @GetUserByToken() user,
        @Param('idTrainingLesson') idTrainingLesson: string
    ) {
        try {
            iPage.length = Number(iPage.length) || 20;
            iPage.search = decodeURI(iPage.search || "");
            iPage.start = Number(iPage.start) || 0;
            const result = await this.examTestService.getExamByTrainingLesson(lang, iPage, idTrainingLesson);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);;
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
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

    @ApiTags('admin')
    @Post('/create_question')
    @UseGuards(AuthGuard('jwt_admin'))
    async createItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() req: createExamTestDTOAdmin,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.examTestService.createQuestion(lang, req, user._id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('edit_question/:id')
    async editItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') id: string,
        @Body() req: editExamTestDTOAdmin,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.examTestService.editQuestion(lang, req, id, user._id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);;
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('acti_question/:id')
    async adminActiExamtest(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') id: string,
        @Body() req: actiExamTestDTOAdmin,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.examTestService.actiQuestion(lang, req, id, user._id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);;
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('delete_question/:id')
    async adminDeleteQuestion(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') id: string,
        @Body() req: deleteExamTestDTOAdmin,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.examTestService.deleteQuestion(lang, req, id, user._id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);;
        }
    }
}

