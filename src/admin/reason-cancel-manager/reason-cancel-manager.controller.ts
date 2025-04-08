import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { DEFAULT_LANG, GetUserByToken, iPageDTO, LANGUAGE, ValidateLangPipe } from 'src/@core';
import { activeReasonCancelDTOAdmin, createReasonCancelDTOAdmin, deleteReasonCancelDTOAdmin, editReasonCancelDTOAdmin } from 'src/@core/dto/reasonCancel.dto';
import { ReasonCancelManagerService } from './reason-cancel-manager.service';

@Controller('reason_cancel_manager')
export class ReasonCancelManagerController {
    constructor(private reasonCancelManagerService: ReasonCancelManagerService) { }


    @ApiTags('admin')
    @Get('get_list')
    @UseGuards(AuthGuard('jwt'))
    async getListItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageDTO,
    ) {
        try {
            iPage.length = Number(iPage.length) || 10;
            iPage.search = decodeURI(iPage.search || "");
            iPage.start = Number(iPage.start) || 0;
            const result = await this.reasonCancelManagerService.getListItem(lang, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Get('get_list_reason_admin')
    @UseGuards(AuthGuard('jwt'))
    async getListReasonAdmin(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageDTO,
    ) {
        try {
            iPage.length = Number(iPage.length) || 10;
            iPage.start = Number(iPage.start) || 0;
            const result = await this.reasonCancelManagerService.getListReasonAdmin(lang, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Get('detail_item/:id')
    @UseGuards(AuthGuard('jwt'))
    async getDetailItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param("id") id: string,
        @GetUserByToken() user,
    ) {
        try {
            const result = await this.reasonCancelManagerService.getDetailItem(lang, id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Post('/create_item')
    @UseGuards(AuthGuard('jwt'))
    async createItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() req: createReasonCancelDTOAdmin,
        @GetUserByToken() user,
    ) {
        try {
            const result = await this.reasonCancelManagerService.createItem(lang, req, user._id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Post('edit_item/:id')
    @UseGuards(AuthGuard('jwt'))
    async editItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') id: string,
        @Body() req: editReasonCancelDTOAdmin,
        @GetUserByToken() user,
    ) {
        try {
            const result = await this.reasonCancelManagerService.editItem(lang, req, id, user._id);
            // console.log('check result', result);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Post('active_item/:id')
    @UseGuards(AuthGuard('jwt'))
    async activeReasonCancel(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') id: string,
        @Body() req: activeReasonCancelDTOAdmin,
        @GetUserByToken() user,
    ) {
        try {
            const result = await this.reasonCancelManagerService.activeReasonCancel(lang, req, id, user._id);
            // console.log('check result', result);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Post('delete_item/:id')
    @UseGuards(AuthGuard('jwt'))
    async deleteReasonCancel(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') id: string,
        @Body() req: deleteReasonCancelDTOAdmin,
        @GetUserByToken() user,
    ) {
        try {
            const result = await this.reasonCancelManagerService.deleteReasonCancel(lang, req, id, user._id);
            // console.log('check result', result);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
