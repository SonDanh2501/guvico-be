import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { createGroupCustomerDTOAdmin, DEFAULT_LANG, editGroupCustomerDTOAdmin, GetUserByToken, iPageDTO, LANGUAGE, ValidateLangPipe } from 'src/@core';
import { changeProcessHandleDTOAdmin, createFeedbackDTOAdmin, editFeedbackDTOAdmin, iPageFeedbackDTOAdmin } from 'src/@core/dto/feedback.dto';
import { FeedbackManagerService } from './feedback-manager.service';
import { changeStatusDTOAdmin } from '../../@core/dto/feedback.dto';

@Controller('feedback_manager')
export class FeedbackManagerController {
    constructor(
        private feedbackManagerService: FeedbackManagerService,
    ) { }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('get_list')
    async getListItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageFeedbackDTOAdmin,
        @GetUserByToken() user
    ) {
        try {
            iPage.length = Number(iPage.length) || 10;
            iPage.search = decodeURI(iPage.search || "");
            iPage.start = Number(iPage.start) || 0;
            iPage.type = iPage.type ? iPage.type : "all";
            iPage.type_status = iPage.type_status ? iPage.type_status : "all"
            const result = await this.feedbackManagerService.getListItem(lang, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }

    }

    @ApiTags('admin')
    @Get('get_detail/:id')
    @UseGuards(AuthGuard('jwt_admin'))
    async getDetailItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') id: string,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.feedbackManagerService.getDetailItem(lang, id, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }

    }

    @ApiTags('admin')
    @Post('create_item')
    @UseGuards(AuthGuard('jwt_admin'))
    async createItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() req: createFeedbackDTOAdmin,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.feedbackManagerService.createItem(lang, req, user._id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Post('edit_item/:id')
    @UseGuards(AuthGuard('jwt_admin'))
    async editItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') id: string,
        @Body() req: editFeedbackDTOAdmin,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.feedbackManagerService.editItem(lang, req, id, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Post('delete_feedback/:id')
    @UseGuards(AuthGuard('jwt_admin'))
    async deleteSoftItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') id: string,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.feedbackManagerService.deleteFeedback(lang, id, user._id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);

        }
    }


    // khong xai nua
    // @ApiTags('admin')
    // @Post('processed/:id')
    // @UseGuards(AuthGuard('jwt_admin'))
    // async processedItem(
    //     @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
    //     @Param('id') id: string,
    //     @GetUserByToken() user
    // ) {
    //     try {
    //         const result = await this.feedbackManagerService.processedItem(lang, id, user);
    //         return result;
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], HttpStatus.FORBIDDEN)
    //     }

    // }


    // khong xai nua
    // @ApiTags('admin')
    // @Post('change_status/:id')
    // @UseGuards(AuthGuard('jwt_admin'))
    // async changeStatus(
    //     @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
    //     @Param('id') id: string,
    //     @Body() req: changeStatusDTOAdmin,
    //     @GetUserByToken() user
    // ) {
    //     try {
    //         const result = await this.feedbackManagerService.changeStatus(lang, id, req, user._id);
    //         return result;
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);

    //     }
    // }



    @ApiTags('admin')
    @Post('/update_process_handle_feedback/:id_feedback')
    @UseGuards(AuthGuard('jwt_admin'))
    async updateHandleFeedback(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id_feedback') id: string,
        @Body() req: changeProcessHandleDTOAdmin,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.feedbackManagerService.updateHandleFeedback(lang, id, req, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
