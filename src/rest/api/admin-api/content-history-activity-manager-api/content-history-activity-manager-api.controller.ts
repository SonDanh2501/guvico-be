import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { DEFAULT_LANG, GetSubjectAction, IPageDecorator, iPageDTO, LANGUAGE, ValidateLangPipe } from 'src/@core';
import { ContentHistoryActivitySystemService } from 'src/core-system/@core-system/content-history-activity-system/content-history-activity-system.service';

@Controller('content_history_activity_manager')
export class ContentHistoryActivityManagerApiController {
    constructor(
      private contentHistoryActivitySystemService: ContentHistoryActivitySystemService
    ) {}

    @ApiTags('admin')
    @Get('/get_detail_item/:idItem')
    @UseGuards(AuthGuard('jwt_admin'))
    async getDetailItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('idItem') idItem: string
    ) {
        try {
            const result = await this.contentHistoryActivitySystemService.getDetailItem(lang, idItem);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @ApiTags('admin')
    @Get('/get_list')
    @UseGuards(AuthGuard('jwt_admin'))
    async getListItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @IPageDecorator() iPage: iPageDTO,
    ) {
        try {
            const result = await this.contentHistoryActivitySystemService.getListItem(lang, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @ApiTags('admin')
    @Post('/create_item')
    @UseGuards(AuthGuard('jwt_admin'))
    async createItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() body : iPageDTO,
        @GetSubjectAction() subjectAction
    ) {
        try {
            const result = await this.contentHistoryActivitySystemService.createNewItem(lang, subjectAction, body);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @ApiTags('admin')
    @Post('/update_item/:idItem')
    @UseGuards(AuthGuard('jwt_admin'))
    async updateItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('idItem') idItem: string,
        @Body() body: iPageDTO,
        @GetSubjectAction() subjectAction
    ) {
        try {
            const result = await this.contentHistoryActivitySystemService.updateItem(lang, subjectAction, idItem, body);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
