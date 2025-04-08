import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiTags } from '@nestjs/swagger'
import { CreatePunishPolicyDTO, DEFAULT_LANG, EditPunishPolicyDTO, GetSubjectAction, IPageDecorator, iPageDTO, LANGUAGE, ValidateLangPipe } from 'src/@core'
import { PunishPolicySystemService } from 'src/core-system/@core-system/punish-policy-system/punish-policy-system.service'

@Controller('punish_policy_manager')
export class PunishPolicyManagerApiController {
    constructor(
        private punishPolicySystemService: PunishPolicySystemService
    ) {}

    @ApiTags('admin')
    @Get('/get_list')
    @UseGuards(AuthGuard('jwt_admin'))
    async getListItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @IPageDecorator() iPage: iPageDTO,
    ) {
        try {
            iPage.start = iPage.start ? iPage.start : 0;
            iPage.length = iPage.length ? iPage.length : 10;
            const result = await this.punishPolicySystemService.getListItem(lang, iPage);
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
        @Body() body: CreatePunishPolicyDTO,
        @GetSubjectAction() subjectAction
    ) {
        try {
            const result = await this.punishPolicySystemService.createNewItem(lang, subjectAction, body);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @ApiTags('admin')
    @Get('/get_detail_item/:idItem')
    @UseGuards(AuthGuard('jwt_admin'))
    async getDetailItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('idItem') idItem: string
    ) {
        try {
            const result = await this.punishPolicySystemService.getDetailItem(lang, idItem);
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
        @Body() body: EditPunishPolicyDTO,
        @GetSubjectAction() subjectAction
    ) {
        try {
            const result = await this.punishPolicySystemService.updateItem(lang, subjectAction, idItem, body);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
