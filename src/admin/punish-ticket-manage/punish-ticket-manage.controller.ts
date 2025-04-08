import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common';
import { PunishTicketManageService } from './punish-ticket-manage.service';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { DEFAULT_LANG, GetUserByToken, IPageDecorator, IPageTransitionDecorator, LANGUAGE, ValidateLangPipe, iPageDTO } from 'src/@core';
import { iPageTransactionDTOAdmin } from 'src/@core/dto/transaction.dto';
import { createPunishTicketDTO, createPunishTicketFromPolicyDTO, editPunishTickerDTO } from 'src/@core/dto/punishTicket.dto';

@Controller('punish_ticket_manage')
export class PunishTicketManageController {
    constructor(
        private punishTicketManageService: PunishTicketManageService,
    ) { }
    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('get_list')
    async getListItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @IPageDecorator() iPage: iPageTransactionDTOAdmin,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.punishTicketManageService.getListItem(lang, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('get_item_by_id/:id')
    async getItemById(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param("id") idTicket: string,
    ) {
        try {
            const result = await this.punishTicketManageService.getItemById(lang, idTicket);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @ApiTags('admin')
    @Post('/create_item_from_policy')
    @UseGuards(AuthGuard('jwt_admin'))
    async createItemFromPolicy(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() payload: createPunishTicketFromPolicyDTO,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.punishTicketManageService.createPunishTicketFromPolicy(lang, payload, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @ApiTags('admin')
    @Post('/verify_item/:id')
    @UseGuards(AuthGuard('jwt_admin'))
    async verifyItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') idPunishTicket: string,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.punishTicketManageService.verifyItem(lang, user, idPunishTicket);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @ApiTags('admin')
    @Post('/delete_item/:id')
    @UseGuards(AuthGuard('jwt_admin'))
    async deleteItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') idPunishTicket: string,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.punishTicketManageService.delteItem(lang, user, idPunishTicket);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @ApiTags('admin')
    @Post('/cancel_item/:id')
    @UseGuards(AuthGuard('jwt_admin'))
    async editItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') idPunishTicket: string,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.punishTicketManageService.cancelItem(lang, user, idPunishTicket);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @ApiTags('admin')
    @Post('/revoke_item/:id')
    @UseGuards(AuthGuard('jwt_admin'))
    async revokeItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') idPunishTicket: string,
        @GetUserByToken() admin
    ) {
        try {
            const result = await this.punishTicketManageService.revokeItem(lang, idPunishTicket, admin);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('get_activity_history_punish_ticket/:id')
    async getActivityHistoryPunishTicket(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @IPageDecorator() iPage: iPageDTO,
        @Param("id") idPushTicket: string
    ) {
        try {
            const result = await this.punishTicketManageService.getActivityHistoryPunishTicket(lang, idPushTicket, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('get_total_punish_ticket')
    async getTotalPunishTicket(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @IPageDecorator() iPage: iPageDTO,
    ) {
        try {

            const result = await this.punishTicketManageService.getTotalPunishTicket(lang, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
