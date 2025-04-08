import { Controller, Get, HttpException, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { ValidateLangPipe, LANGUAGE, DEFAULT_LANG, GetUserByToken, IPageDecorator } from 'src/@core';
import { iPageTransactionDTOAdmin } from 'src/@core/dto/transaction.dto';
import { PunishTicketSystemService } from 'src/core-system/@core-system/punish-ticket-system/punish-ticket-system.service';

@Controller('punish_ticket_manager')
export class PunishTicketManagerApiController {
    constructor(
        private punishTicketSystemService: PunishTicketSystemService
    ) {}

    @ApiTags('admin')
    @Get('/get_list')
    @UseGuards(AuthGuard('jwt_admin'))
    async getListItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @IPageDecorator() iPage: iPageTransactionDTOAdmin,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.punishTicketSystemService.getListItem(lang, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('/get_total_punish_ticket')
    async getTotalPunishTicket(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @IPageDecorator() iPage: iPageTransactionDTOAdmin,
    ) {
        try {
            const result = await this.punishTicketSystemService.getTotalPunishTicket(lang, iPage);
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
            const subjectAction = {
                type: "admin",
                _id: admin._id
            }
            const result = await this.punishTicketSystemService.revokePunishTicket(lang, subjectAction, idPunishTicket);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
