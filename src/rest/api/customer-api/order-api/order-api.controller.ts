import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiTags } from '@nestjs/swagger'
import { DEFAULT_LANG, GetSubjectAction, GetUserByToken, IPageDecorator, iPageDTO, LANGUAGE, ValidateLangPipe } from 'src/@core'
import { createReviewDTOCustomer, iPageReviewCollaboratorDTOCustomer } from 'src/@core/dto/reivew.dto'
import { OrderSystemService2 } from 'src/core-system/@core-system/order-system/order-system.service'

@Controller('order')
export class OrderApiController {
    constructor(
        private orderSystemService2: OrderSystemService2
    ) { }

    @Get('detail/:idOrder')
    async getDetailItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('idOrder') idOrder: string,
        @GetSubjectAction() subjectAction
    ) {
        try {
            const result = await this.orderSystemService2.getDetailItem(lang, subjectAction, idOrder);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
    @Get('get_order_near_active_by_customer')
    async getOrderNearActiveByCustomer(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @IPageDecorator() iPage: iPageDTO,
        @GetSubjectAction() subjectAction
    ) {
        try {
            const result = await this.orderSystemService2.getOrderNearActiveByCustomer(lang, iPage, subjectAction, user._id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
    @Post('cancel_order/:idOrder')
    async cancelOrder(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Param("idOrder") idOrder: string,
        @GetSubjectAction() subjectAction,
        @Body("id_cancel") idCancel: string,
    ) {
        try {
            const stepCancel = {
                isCancel: true,
                isRefundCustomer: true,
                isRefundCollaborator: true,
                isPunishCollaborator: false,
                isPunishCustomer: false,
                isUnassignCollaborator: false,
                isMinusNextOrderCollaborator: true
            }
            const result = await this.orderSystemService2.cancelOrder(lang, subjectAction, idOrder, idCancel, stepCancel)
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
    @Get('get_infor_order/:idOrder')
    async getInforOrder(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param("idOrder") idOrder: string,
        @GetSubjectAction() subjectAction,
    ) {
        try {
            return await this.orderSystemService2.getInforOrder(lang, subjectAction, idOrder)
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
    @Get('get_list_reviews/:idCollaborator')
    async getListReviewsByCollaborator(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('idCollaborator') idCollaborator: string,
        @Query() iPage: iPageReviewCollaboratorDTOCustomer,
    ) {
        try {
            iPage.start = Number(iPage.start) || 0;
            iPage.length = Number(iPage.length) || 30;
            return await this.orderSystemService2.getListReviewsByCollaborator(idCollaborator, iPage);
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
    @Post('create_review/:idOrder')
    async createReview(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('idOrder') idOrder: string,
        @Body() body: createReviewDTOCustomer,
        @GetSubjectAction() subjectAction,
    ) {
        try {
            return await this.orderSystemService2.createReview(lang, subjectAction, idOrder, body);
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
