import { Controller, Post, Query, Body, HttpException, HttpStatus, Get, UseGuards } from '@nestjs/common';
import { RoomService } from './room.service';
import { DEFAULT_LANG, GetUserByToken, LANGUAGE, RoomDocument, ValidateLangPipe, iPageDTO } from 'src/@core';
import { createRoomDTOSystem } from 'src/@core/dto/chat.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('room')
export class RoomController {
    constructor(
        private roomService: RoomService
    ) { }
    @Post('/create_item')
    @UseGuards(AuthGuard('jwt_chat'))
    async create(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() req: createRoomDTOSystem,
    ) {
        try {

            return await this.roomService.create(lang, req);
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @UseGuards(AuthGuard('jwt_chat'))
    @Get('/get_list')
    async getList(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageDTO,
        @GetUserByToken() user
    ) {
        try {
            iPage.start = iPage.start ? iPage.start : 0;
            iPage.length = iPage.length ? iPage.length : 10;
            return await this.roomService.getList(lang, iPage, user);
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
