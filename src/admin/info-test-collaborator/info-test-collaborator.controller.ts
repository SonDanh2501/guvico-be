import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { ValidateLangPipe, LANGUAGE, DEFAULT_LANG, GetUserByToken, iPageDTO } from 'src/@core';
import { InfoTestCollaboratorService } from './info-test-collaborator.service';
import { InfoTestCollaboratorDto, deleteInfoTestDTOCollaborator, iPageInfoTestCollaboratorDTOAdmin } from 'src/@core/dto/info_test_collaborator.dto';

@Controller('info_test_collaborator')
export class InfoTestCollaboratorController {
    constructor(private infoTestCollaboratorService: InfoTestCollaboratorService) { }

    @ApiTags('admin')
    @Get('get_list')
    @UseGuards(AuthGuard('jwt_admin'))
    async getListInforTest(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageInfoTestCollaboratorDTOAdmin,
        @GetUserByToken() user
    ) {
        try {
            iPage.length = Number(iPage.length) || 20;
            iPage.search = decodeURI(iPage.search || "");
            iPage.start = Number(iPage.start) || 0;
            iPage.type_exam = iPage.type_exam ? iPage.type_exam : 'all'
            const result = await this.infoTestCollaboratorService.getListInforTest(lang, iPage, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);;
        }
    }

    @ApiTags('admin')
    @Get('get_list_by_collaborator/:idCollaborator')
    @UseGuards(AuthGuard('jwt_admin'))
    async getListInforTestByCollaborator(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageInfoTestCollaboratorDTOAdmin,
        @GetUserByToken() user,
        @Param('idCollaborator') idCollaborator: string,

    ) {
        try {
            iPage.length = Number(iPage.length) || 20;
            iPage.search = decodeURI(iPage.search || "");
            iPage.start = Number(iPage.start) || 0;
            iPage.type_exam = iPage.type_exam ? iPage.type_exam : 'all'
            const result = await this.infoTestCollaboratorService.getListInforTestByCollaborator(lang, iPage, idCollaborator);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);;
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('/detail_info_test/:idInfo')
    async getDetailQuestion(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('idInfo') idInfo: string
    ) {
        try {
            const result = await this.infoTestCollaboratorService.getDetailInfoTest(lang, idInfo);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);;
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('delete_info_test/:id')
    async adminDeleteInfoTest(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') id: string,
        @Body() req: deleteInfoTestDTOCollaborator,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.infoTestCollaboratorService.deleteInfoTest(lang, req, id, user._id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);;
        }
    }
    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('get_list_info_test_by_training_lesson/:idTrainingLesson/:idCollaborator')
    async getListInfoTestByTrainingLesson(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageInfoTestCollaboratorDTOAdmin,
        @Param('idTrainingLesson') idTrainingLesson: string,
        @Param('idCollaborator') idCollaborator: string,
    ) {
        try {
            iPage.length = Number(iPage.length) || 10;
            iPage.search = decodeURI(iPage.search || "");
            iPage.start = Number(iPage.start) || 0;
            const result = await this.infoTestCollaboratorService.getListInfoTestByTrainingLesson(lang, iPage, idTrainingLesson, idCollaborator);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('create_info_exam')
    async createInfoExam(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() req: InfoTestCollaboratorDto,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.infoTestCollaboratorService.createInfoExam(lang, req, user._id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);;
        }
    }
}
