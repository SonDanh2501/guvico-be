import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiTags } from '@nestjs/swagger'
import { addDays } from 'date-fns'
import { DEFAULT_LANG, GetSubjectAction, GetUserByToken, IPageDecorator, iPageDTO, IPageIntervalDecorator, iPageOrderNearDTOCollaborator, iPageOrderScheduleWorkDTOCollaborator, LANGUAGE, ValidateLangPipe } from 'src/@core'
import { iPageReviewCollaboratorDTOCollaborator } from 'src/@core/dto/reivew.dto'
import { FinanceSystemService } from 'src/core-system/@core-system/finance-system/finance-system.service'
import { JobSystemService } from 'src/core-system/@core-system/job-system/job-system.service'
import { OrderSystemService2 } from 'src/core-system/@core-system/order-system/order-system.service'

@Controller('order')
export class OrderApiController {
    constructor(
        private orderSystemService: OrderSystemService2,
        private jobSystemService: JobSystemService,
        private financeSystemService: FinanceSystemService
    ){}

    @ApiTags('collaborator')
    @UseGuards(AuthGuard('jwt_collaborator'))
    @Get('/get_order_history_by_collaborator')
    async getOrderHistoryByCollaborator(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @IPageIntervalDecorator() iPage: iPageDTO,
        @GetUserByToken() user,
    ) {
        try {
            const result = await this.orderSystemService.getHistoryOrder(lang, iPage, user)
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('collaborator')
    @UseGuards(AuthGuard('jwt_collaborator'))
    @Get('/get_total_income_by_collaborator')
    async getTotalIncomeByCollaborator(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @IPageIntervalDecorator() iPage: iPageDTO,
        @GetUserByToken() user,
    ) {
        try {
            const result = await this.orderSystemService.getTotalIncomeByCollaborator(lang, iPage, user)
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('collaborator')
    @UseGuards(AuthGuard('jwt_collaborator'))
    @Post('/pending_to_confirm/:idOrder')
    async pendingToConfirmByCollaborator(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('idOrder') idOrder:string,
        @GetSubjectAction() subjectAction
    ) {
        try {
            const idCollaborator = subjectAction._id.toString()
            const result = await this.jobSystemService.pendingToConfirm(lang, subjectAction, idOrder, idCollaborator, true)
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @ApiTags('collaborator')
    @UseGuards(AuthGuard('jwt_collaborator'))
    @Post('/confirm_to_doing/:idOrder')
    async confirmToDoingByCollaborator(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('idOrder') idOrder:string,
        @GetSubjectAction() subjectAction,
    ) {
        try {
            const idCollaborator = subjectAction._id.toString()
            const result = await this.jobSystemService.confirmToDoing(lang, idOrder, idCollaborator, subjectAction)
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('collaborator')
    @UseGuards(AuthGuard('jwt_collaborator'))
    @Post('/doing_to_done/:idOrder')
    async doingToDoneByCollaborator(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('idOrder') idOrder:string,
        @GetSubjectAction() subjectAction,
    ) {
        try {
            const idCollaborator = subjectAction._id.toString()
            const result = await this.jobSystemService.doingToDone(lang, idOrder, idCollaborator, subjectAction)
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    @ApiTags('collaborator')
    @UseGuards(AuthGuard('jwt_collaborator'))
    @Get('/order_detail/:id')
    async orderDetail(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param("id") idOrder: string,
        @GetSubjectAction() subjectAction,
    ) {
        try {
            const result = await this.orderSystemService.getDetailItem(lang, subjectAction, idOrder);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }



    @ApiTags('collaborator')
    @UseGuards(AuthGuard('jwt_collaborator'))
    @Post('/cancel_job/:id')
    async cancelJob(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param("id") idOrder: string,
        @Body("id_cancel") idCancel: string,
        @GetUserByToken() user,
        @GetSubjectAction() subjectAction
    ) {
        try {
            // const result = await this.jobService.cancelJob(lang, user, idOrder, idCancel);
            const stepCancel = {
                isCancel: false,
                isRefundCustomer: false,
                isRefundCollaborator: true,
                isPunishCollaborator: true,
                isPunishCustomer: false,
                isUnassignCollaborator: true,
                isMinusNextOrderCollaborator: false
            }
            const result = await this.orderSystemService.cancelOrder(lang, subjectAction, idOrder, idCancel, stepCancel);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    @ApiTags('collaborator')
    @UseGuards(AuthGuard('jwt_collaborator'))
    @Get('/history_order')
    async getHistoryOrder(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @IPageDecorator() iPage: iPageDTO,
        @GetSubjectAction() subjectAction,
    ) {
        try {
            const result = await this.orderSystemService.getListOrderHistoryByCollaborator(lang, subjectAction, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    @ApiTags('collaborator')
    @UseGuards(AuthGuard('jwt_collaborator'))
    @Get('/get_list_my_jobs')
    async listMyJobs(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageOrderScheduleWorkDTOCollaborator,
        @GetSubjectAction() subjectAction
    ) {
        try {
            iPage.length = Number(iPage.length) || 10;
            iPage.search = iPage.search || '';
            iPage.start = Number(iPage.start) || 0;
            iPage.start_date = (!iPage.start_date) ? new Date(Date.now()).toISOString() : iPage.start_date;
            iPage.end_date = (!iPage.end_date) ? addDays(new Date(Date.now()), 14).toISOString() : iPage.end_date;
            const result = await this.orderSystemService.getListOrderByCollaborator(lang, subjectAction, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);

        }
    }


    @ApiTags('collaborator')
    @UseGuards(AuthGuard('jwt_collaborator'))
    @Get('/get_order_by_group_date')
    async getOrderByGroupDate(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageOrderScheduleWorkDTOCollaborator,
        @Query("group") group: string,
        @GetSubjectAction() subjectAction
    ) {
        try {
            iPage.length = Number(iPage.length) || 10;
            iPage.search = iPage.search || '';
            iPage.start = Number(iPage.start) || 0;
            iPage.start_date = (!iPage.start_date) ? new Date(Date.now()).toISOString() : iPage.start_date;
            iPage.end_date = (!iPage.end_date) ? addDays(new Date(Date.now()), 14).toISOString() : iPage.end_date;
            const result = await this.financeSystemService.getOrderByGroupDate(lang, subjectAction, iPage, group)
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);

        }
    }

    @ApiTags('collaborator')
    @UseGuards(AuthGuard('jwt_collaborator'))
    @Get('/get_order_near_me')
    async getOrderNearMe(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageOrderNearDTOCollaborator,
        @GetSubjectAction() subjectAction
    ) {
        try {
            iPage.length = Number(iPage.length) || 10;
            iPage.search = iPage.search || '';
            iPage.start = Number(iPage.start) || 0;
            const temp = iPage.location.toString().split(",");
            iPage.location = [Number(temp[1]) || 0, Number(temp[0]) || 0]
            const result = await this.orderSystemService.getOrderNearMe(lang, subjectAction, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('collaborator')
    @UseGuards(AuthGuard('jwt_collaborator'))
    @Get('/get_order_favourite')
    async getOrderFavourite(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageDTO,
        @GetSubjectAction() subjectAction
    ) {
        try {
            iPage.length = Number(iPage.length) || 10;
            iPage.search = iPage.search || '';
            iPage.start = Number(iPage.start) || 0;
            const result = await this.orderSystemService.getOrderFavourite(lang, subjectAction, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('collaborator')
    @UseGuards(AuthGuard('jwt_collaborator'))
    @Get('/get_order_city')
    async getOrderCity(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageDTO,
        @GetSubjectAction() subjectAction
    ) {
        try {
            iPage.length = Number(iPage.length) || 10;
            iPage.search = iPage.search || '';
            iPage.start = Number(iPage.start) || 0;
            const result = await this.orderSystemService.getOrderCity(lang, subjectAction, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('collaborator')
    @UseGuards(AuthGuard('jwt_collaborator'))
    @Get('/mark_collaborator_call_to_customer/:idOrder')
    async markCollaboratorCallToCustomer(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('idOrder') idOrder:string,
        @GetSubjectAction() subjectAction,
    ) {
        try {
            const idCollaborator = subjectAction._id.toString()
            const result = await this.orderSystemService.markCollaboratorCallToCustomer(lang, idOrder, idCollaborator)
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('collaborator')
    @UseGuards(AuthGuard('jwt_collaborator'))
    @Get('get_list_reviews_by_collaborator')
    async getListReviewsByCollaborator(
        @GetSubjectAction() subjectAction,
        @Query() iPage: iPageReviewCollaboratorDTOCollaborator,
    ) {
        try {
            iPage.start = Number(iPage.start) || 0;
            iPage.length = Number(iPage.length) || 30;
            const idCollaborator = subjectAction._id.toString()
            return await this.orderSystemService.getListReviewsByCollaborator(idCollaborator, iPage);
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}

