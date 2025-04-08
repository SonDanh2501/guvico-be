import { Body, Controller, Get, Headers, HttpException, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiTags } from '@nestjs/swagger'
import { addDays, endOfMonth, startOfMonth } from 'date-fns'
import { DEFAULT_LANG, GetSubjectAction, GetUserByToken, GlobalService, iPageDTO, iPageHistoryOrderDTOCollaborator, iPageOrderNearDTOCollaborator, iPageOrderScheduleWorkDTOCollaborator, LANGUAGE, ValidateLangPipe } from 'src/@core'
<<<<<<< HEAD
import { PAYMENT_METHOD } from 'src/@repositories/module/mongodb/@database/enum'
=======
import { OrderSystemService2 } from 'src/core-system/@core-system/order-system/order-system.service'
>>>>>>> son
import { HistoryOrderSystemService } from 'src/core-system/history-order-system/history-order-system.service'
import { JobService } from './job.service'

@Controller('job')
export class JobController {
    constructor(
        private jobService: JobService,
        private globalService: GlobalService,
        private historyOrderSystemService: HistoryOrderSystemService,
        private orderSystemService: OrderSystemService2,

    ) { }

    @ApiTags('collaborator')
    @UseGuards(AuthGuard('jwt_collaborator'))
    @Get('/get_order_favourite')
    async getOrderFavourite(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageDTO,
        // @GetUserByToken() user,
        @GetSubjectAction() subjectAction
    ) {
        try {
            iPage.length = Number(iPage.length) || 10;
            iPage.search = iPage.search || '';
            iPage.start = Number(iPage.start) || 0;
            const result = await this.orderSystemService.getOrderFavourite(lang, subjectAction, iPage);
            // const result = await this.jobService.getOrderFavouriteV3(lang, iPage, user._id);
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
        // @GetUserByToken() user,
        @GetSubjectAction() subjectAction
    ) {
        try {
            iPage.length = Number(iPage.length) || 10;
            iPage.search = decodeURI(iPage.search || '');
            iPage.start = Number(iPage.start) || 0;
<<<<<<< HEAD
            const result = await this.jobService.getOrderCityV2(lang, iPage, user._id);
            // Fix tam thoi, ben mobile fix xong se xoa
            for(let i = 0; i < result.data.length; i++) {
                if (result.data[i].payment_method !== PAYMENT_METHOD.cash && result.data[i].payment_method !== PAYMENT_METHOD.point) {
                    result.data[i].payment_method = PAYMENT_METHOD.point
                }
            }
=======
            const result = await this.orderSystemService.getOrderCity(lang, subjectAction, iPage);
            // const result = await this.jobService.getOrderCityV2(lang, iPage, user._id);
>>>>>>> son
            return result;
        } catch (err) {
            console.log(err, 'err')
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    @ApiTags('collaborator')
    @UseGuards(AuthGuard('jwt_collaborator'))
    @Get('/get_order_near_me')
    async getOrderNearMe(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageOrderNearDTOCollaborator,
        // @GetUserByToken() user,
        @GetSubjectAction() subjectAction
    ) {
        try {
<<<<<<< HEAD
            // iPage.length = Number(iPage.length) || 10;
            // iPage.search = iPage.search || '';
            // iPage.start = Number(iPage.start) || 0;
            // const temp = iPage.location.toString().split(",");
            // iPage.location = [Number(temp[1]) || 0, Number(temp[0]) || 0]
            // const result = await this.jobService.getOrderNearMeV2(lang, iPage, user._id);
            // // Fix tam thoi, ben mobile fix xong se xoa
            // for(let i = 0; i < result.data.length; i++) {
            //     if (result.data[i].payment_method === PAYMENT_METHOD.momo) {
            //         result.data[i].payment_method = PAYMENT_METHOD.point
            //     }
            // }
            // return result;
            return {
                start: iPage.start,
                length: iPage.length,
                totalItem: 0,
                data: []
            }
=======
            iPage.length = Number(iPage.length) || 10;
            iPage.search = iPage.search || '';
            iPage.start = Number(iPage.start) || 0;
            const temp = iPage.location.toString().split(",");
            iPage.location = [Number(temp[1]) || 0, Number(temp[0]) || 0]
            const result = await this.orderSystemService.getOrderNearMe(lang, subjectAction, iPage);
            // const result = await this.jobService.getOrderNearMeV2(lang, iPage, user._id);
            return result;
>>>>>>> son
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('collaborator')
    @UseGuards(AuthGuard('jwt_collaborator'))
    @Get('/history_job')
    async historyJob(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageHistoryOrderDTOCollaborator,
        @GetUserByToken() user,
    ) {
        try {
            iPage.length = Number(iPage.length) || 10;
            iPage.search = iPage.search || '';
            iPage.start = Number(iPage.start) || 0;
            const result = await this.jobService.historyJob(lang, iPage, user._id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('collaborator')
    @UseGuards(AuthGuard('jwt_collaborator'))
    @Get('/history_job_done')
    async historyJobDone(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageHistoryOrderDTOCollaborator,
        @GetUserByToken() user,
    ) {
        try {
            iPage.length = Number(iPage.length) || 10;
            iPage.search = iPage.search || '';
            iPage.start = Number(iPage.start) || 0;
            const result = await this.jobService.historyJobDone(lang, iPage, user._id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('collaborator')
    @UseGuards(AuthGuard('jwt_collaborator'))
    @Get('/get_confirm_order')
    async getConfirmOrder(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageDTO,
        @GetUserByToken() user,
    ) {
        try {
            iPage.length = Number(iPage.length) || 10;
            iPage.search = iPage.search || '';
            iPage.start = Number(iPage.start) || 0;
            const result = await this.jobService.getConfirmOrder(lang, iPage, user._id);
            // Fix tam thoi, ben mobile fix xong se xoa
            for(let i = 0; i < result.data.length; i++) {
                if (result.data[i].payment_method === PAYMENT_METHOD.momo) {
                    result.data[i].payment_method = PAYMENT_METHOD.point
                }
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('collaborator')
    @UseGuards(AuthGuard('jwt_collaborator'))
    @Get('/schedule_work')
    async scheduleWork(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageOrderScheduleWorkDTOCollaborator,
        @GetUserByToken() user,
    ) {
        try {
            iPage.length = Number(iPage.length) || 10;
            iPage.search = iPage.search || '';
            iPage.start = Number(iPage.start) || 0;
            iPage.start_date = (!iPage.start_date) ? new Date(Date.now()).toISOString() : iPage.start_date;
            iPage.end_date = (!iPage.end_date) ? new Date(Date.now()).toISOString() : iPage.end_date;

            const result = await this.jobService.scheduleWork(lang, iPage, user._id);
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
        @Param("id") id: string,
        @GetUserByToken() user,
    ) {
        try {
            const result = await this.jobService.orderDetail(lang, user, id);
            // Fix tam thoi, ben mobile fix xong se xoa
            if (result?.payment_method === PAYMENT_METHOD.momo) {
                result.payment_method = PAYMENT_METHOD.point
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    @ApiTags('collaborator')
    @UseGuards(AuthGuard('jwt_collaborator'))
    @Post('/pending_to_confirm/:id')
    async collaboratorEditPedingConfirm(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param("id") id: string,
        // @Body("lat") lat: number,
        // @Body("lng") lng: number,
        @GetUserByToken() user,
        @Headers() headers,
        @GetSubjectAction() subjectAction
    ) {
        try {
            const result = await this.jobService.collaboratorEditPedingConfirm(lang, user, id, subjectAction, headers.version);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('collaborator')
    @UseGuards(AuthGuard('jwt_collaborator'))
    @Post('/confirm_to_doing/:id')
    async collaboratorEditConfirmDoing(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param("id") id: string,
        @GetUserByToken() user,
        @Headers() headers,
        @GetSubjectAction() subjectAction
    ) {
        try {
            const result = await this.jobService.collaboratorEditConfirmDoing(lang, user, id, subjectAction, headers.version);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('collaborator')
    @UseGuards(AuthGuard('jwt_collaborator'))
    @Post('/doing_to_done/:id')
    async collaboratorEditDoingDone(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param("id") id: string,
        @GetUserByToken() user,
        @Headers() headers,
        @GetSubjectAction() subjectAction
    ) {
        try {
            const result = await this.jobService.collaboratorEditDoingDone(lang, user, id, subjectAction, headers.version);
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
    ) {
        try {
            // const result = await this.jobService.cancelJob(lang, user, idOrder, idCancel);
            const result = await this.jobService.cancelOrder(lang, user, idOrder, idCancel);

            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    @ApiTags('collaborator')
    @UseGuards(AuthGuard('jwt_collaborator'))
    @Get('/reason_cancel')
    async reasonCancel(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageDTO,
        @GetUserByToken() user,
    ) {
        try {
            iPage.length = Number(iPage.length) || 10;
            iPage.search = iPage.search || '';
            iPage.start = Number(iPage.start) || 0;
            const result = await this.jobService.reasonCancel(lang, user, iPage);
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
        @GetUserByToken() user,
    ) {
        try {
            iPage.length = Number(iPage.length) || 10;
            iPage.search = iPage.search || '';
            iPage.start = Number(iPage.start) || 0;
            iPage.start_date = (!iPage.start_date) ? new Date(Date.now()).toISOString() : iPage.start_date;
            iPage.end_date = (!iPage.end_date) ? addDays(new Date(Date.now()), 14).toISOString() : iPage.end_date;
            const result = await this.jobService.listMyJobs(lang, iPage, user._id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);

        }
    }

    @ApiTags('collaborator')
    @UseGuards(AuthGuard('jwt_collaborator'))
    @Get('/get_total_jobs_hours')
    async getTotalJobsHours(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageOrderScheduleWorkDTOCollaborator,
        @GetUserByToken() user,
    ) {
        try {
            iPage.length = Number(iPage.length) || 10;
            iPage.search = iPage.search || '';
            iPage.start = Number(iPage.start) || 0;
            iPage.start_date = (!iPage.start_date) ? startOfMonth(new Date(Date.now())).toISOString() : iPage.start_date;
            iPage.end_date = (!iPage.end_date) ? endOfMonth(new Date(Date.now())).toISOString() : iPage.end_date;
            const result = await this.jobService.getTotalJobsHours(lang, iPage, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}

