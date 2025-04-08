import { Controller, UseGuards, Get, Query, HttpStatus, HttpException, Param } from '@nestjs/common';
import { MessageService } from './message.service';
import { AuthGuard } from '@nestjs/passport';
import { DEFAULT_LANG, GetUserByToken, LANGUAGE, ValidateLangPipe, iPageDTO } from 'src/@core';

@Controller('message')
export class MessageController {
    constructor(
        private messageService: MessageService

    ) { }
    @UseGuards(AuthGuard('jwt_chat'))
    @Get('get_message/:idRoom')
    async getMessage(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Query() iPage: iPageDTO,
        @Param('idRoom') idRoom: string,
    ) {
        try {
            iPage.start = iPage.start ? iPage.start : 0;
            iPage.length = iPage.length ? iPage.length : 10;
            const result = await this.messageService.getMessage(lang, iPage, idRoom, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
