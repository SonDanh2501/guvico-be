import { Controller, UseGuards, Get, Query, HttpException, HttpStatus, Post, Body, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { DEFAULT_LANG, GetUserByToken, LANGUAGE, ValidateLangPipe, iPageDTO } from 'src/@core';
import { TrainingLessonManagerService } from './training-lesson-manager.service';
import { actiTrainingDTOAdmin, createTrainingDTOAdmin, editTrainingDTOAdmin, iPageTrainingLessonDTOAdmin } from 'src/@core/dto/trainingLesson.dto';

@Controller('training_lesson_manager')
export class TrainingLessonManagerController {
    constructor(
        private trainingLessonManagerService: TrainingLessonManagerService
    ) { }
    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('get_list')
    async getList(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageTrainingLessonDTOAdmin,
        @GetUserByToken() user
    ) {
        try {
            iPage.length = Number(iPage.length) || 10;
            iPage.search = decodeURI(iPage.search || "");
            iPage.start = Number(iPage.start) || 0;
            iPage.type_training_lesson = (iPage.type_training_lesson) ? iPage.type_training_lesson : 'all';
            const result = await this.trainingLessonManagerService.getList(lang, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('get_list_training_lesson_by_collaborator/:idCollaborator')
    async getListTraniningLessonByCollaborator(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageTrainingLessonDTOAdmin,
        @GetUserByToken() user,
        @Param('idCollaborator') idCollaborator: string
    ) {
        try {
            iPage.length = Number(iPage.length) || 10;
            iPage.search = decodeURI(iPage.search || "");
            iPage.start = Number(iPage.start) || 0;
            iPage.type_training_lesson = (iPage.type_training_lesson) ? iPage.type_training_lesson : 'all';
            const result = await this.trainingLessonManagerService.getListTraniningLessonByCollaborator(lang, iPage, idCollaborator);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Post('/create_trainging_lesson')
    @UseGuards(AuthGuard('jwt_admin'))
    async createTrainingLesson(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() req: createTrainingDTOAdmin,
        @GetUserByToken() user,
    ) {
        try {
            const result = await this.trainingLessonManagerService.createTrainingLesson(lang, req, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Post('/edit_trainging_lesson/:idTrainingLesson')
    @UseGuards(AuthGuard('jwt_admin'))
    async editTrainingLesson(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() req: editTrainingDTOAdmin,
        @GetUserByToken() user,
        @Param('idTrainingLesson') idTrainingLesson: string
    ) {
        try {
            const result = await this.trainingLessonManagerService.editTrainingLesson(lang, idTrainingLesson, req, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Post('/active_trainging_lesson/:idTrainingLesson')
    @UseGuards(AuthGuard('jwt_admin'))
    async activeTrainingLesson(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() req: actiTrainingDTOAdmin,
        @GetUserByToken() user,
        @Param('idTrainingLesson') idTrainingLesson: string
    ) {
        try {
            const result = await this.trainingLessonManagerService.activeTrainingLesson(lang, req, idTrainingLesson, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Post('/delete_trainging_lesson/:idTrainingLesson')
    @UseGuards(AuthGuard('jwt_admin'))
    async deleteTrainingLesson(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Param('idTrainingLesson') idTrainingLesson: string
    ) {
        try {
            const result = await this.trainingLessonManagerService.deleteTrainingLesson(lang, idTrainingLesson, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Get('/get_detail_trainging_lesson/:idTrainingLesson')
    @UseGuards(AuthGuard('jwt_admin'))
    async getDetailTrainingLesson(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Param('idTrainingLesson') idTrainingLesson: string
    ) {
        try {
            const result = await this.trainingLessonManagerService.getDetailTrainingLesson(lang, idTrainingLesson, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
