import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { DEFAULT_LANG, GetUserByToken, iPageDTO, LANGUAGE, ValidateLangPipe } from 'src/@core';
import { createFeedbackDTOCustomer } from 'src/@core/dto/feedback.dto';
import { FeedbackService } from './feedback.service';

@Controller('feedback')
export class FeedbackController {
    constructor(
        private feedbackService: FeedbackService,
    ) { }
    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
    @Get('/get_list_type_feedback')
    async getListTypeFeedback(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param() iPage: iPageDTO,
        @GetUserByToken() user
    ) {
        const result = await this.feedbackService.getListTypeFeedback(lang, iPage, user);
        return result;
    }


    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
    @Post('/create_item')
    async createItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() req: createFeedbackDTOCustomer,
        @GetUserByToken() user
    ) {
        const result = await this.feedbackService.createItem(lang, req, user);
        return result;
    }

    // @Get('/get_last_item')
    // async getLastItem(
    //     @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
    // ) {
    //     const result = await this.groupOrderService.getLastItem(lang);
    //     return result;
    // }

}
