import { Body, Controller, Get, HttpException, HttpStatus, Inject, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ReviewService } from './review.service';
import { ValidateLangPipe } from '../../@core/pipe/validate-lang.pipe';
import { DEFAULT_LANG, LANGUAGE } from '../../@core/constant/constant';
import { GetUserByToken } from 'src/@core';
import { createReviewDTOCustomer, iPageReviewCollaboratorDTOCustomer } from '../../@core/dto/reivew.dto';
import { iPageDTO } from '../../@core/dto/general.dto';

@Controller('review')
export class ReviewController {
    constructor(
        private reviewService: ReviewService,
    ) { }

    @ApiTags()
    @UseGuards(AuthGuard('jwt_customer'))
    @Post('/create_review/:idOrder')
    async createReview(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() req: createReviewDTOCustomer,
        @Param('idOrder') idOrder: string,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.reviewService.createReview(lang, idOrder, req, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);

        }
    }

    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
    @Get('get_review_collaborator/:idCollaborator')
    async getReviewCollaborator(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('idCollaborator') idCollaborator: string,
        @Query() iPage: iPageReviewCollaboratorDTOCustomer,
    ) {
        try {
            const result = await this.reviewService.getReviewCollaborator(lang, idCollaborator, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags()
    @UseGuards(AuthGuard('jwt_customer'))
    @Get('/test')
    async test() {
        try {
            const result = await this.reviewService.test();
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);

        }
    }

    @ApiTags()
    @UseGuards(AuthGuard('jwt_customer'))
    @Get('/get_last_order_done')
    async getLastOrderDone(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.reviewService.getLastOrderDone(lang, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags()
    @UseGuards(AuthGuard('jwt_customer'))
    @Post('/done_show_quick_review/:idOrder')
    async doneShowQuickReview(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('idOrder') idOrder: string,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.reviewService.doneShowQuickReview(lang, user, idOrder);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
