import { Body, Controller, Get, HttpException, HttpStatus, Param, Query, UseGuards, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ValidateLangPipe, LANGUAGE, DEFAULT_LANG, iPageHistoryOrderDTOCollaborator, iPageTopCustomerInviterDTOAdmin, iPageReportGroupOrderDTOAdmin, iPageReportCustomerDTOAdmin, iPageReportReviewDTOAdmin, iPageReportTypeServiceDTOAdmin, iPageReportCancelOrderDTOAdmin, iPageReportConnecting, GetUserByToken, iPageReportOrderByDayDTOAdmin, IPageDecorator, iPageReportOrderByCustomerDTOAdmin } from 'src/@core';
import { ReportManangerService } from './report-mananger.service';
import { AuthGuard } from '@nestjs/passport';
import { sub, subDays, startOfDay, endOfDay, startOfMonth, subYears } from 'date-fns';
import { iPageDTO } from '../../@core/dto/general.dto';
@Controller('report_mananger')
export class ReportManangerController {
    constructor(private reportManangerService: ReportManangerService) { }


    @ApiTags('admin')
    @Get('get_general_total_report')
    @UseGuards(AuthGuard('jwt_admin'))
    async getTotalReport(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query("start_date") start_date: string,
        @Query("end_date") end_date: string,
        @Query("city") city: string,
        @Query("district") district: string,
    ) {
        try {
            const payload = {
                startDate: (start_date) ? start_date : new Date("2020-01-01T00:00:00.000Z").toISOString(),
                endDate: (end_date) ? end_date : new Date(Date.now()).toISOString(),
                city: city || -1,
                district: district || -1
            }
            const result = await this.reportManangerService.getTotalReport(lang, payload);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }

    }

    @ApiTags('admin')
    @Get('/total_finance_job_system')
    @UseGuards(AuthGuard('jwt_admin'))
    async historyFinanceJobSystem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageHistoryOrderDTOCollaborator,
        @GetUserByToken() user
    ) {
        try {
            iPage.length = Number(iPage.length) || 100;
            iPage.search = decodeURI(iPage.search || "");
            iPage.start = Number(iPage.start) || 0;
            iPage.start_date = (!iPage.start_date) ? new Date(Date.now()).toISOString() : iPage.start_date;
            iPage.end_date = (!iPage.end_date) ? new Date(Date.now()).toISOString() : iPage.end_date;
            iPage.typeSort = (!iPage.typeSort) ? "day" : iPage.typeSort;
            iPage.type = (iPage.type) ? iPage.type : 'date_work';
            const result = await this.reportManangerService.historyFinanceJobSystem(lang, iPage, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    // xoa bo sap toi
    @ApiTags('admin')
    @Get('/report_collaborator')
    @UseGuards(AuthGuard('jwt_admin'))
    async reportCollaborator(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageHistoryOrderDTOCollaborator,
        @GetUserByToken() user
    ) {
        try {
            iPage.length = Number(iPage.length) ? Number(iPage.length) : 100;
            iPage.search = decodeURI(iPage.search || "");
            iPage.start = Number(iPage.start) ? Number(iPage.start) : 0;
            iPage.start_date = (!iPage.start_date) ? subDays(new Date(Date.now()), 30).toISOString() : iPage.start_date;
            iPage.end_date = (!iPage.end_date) ? new Date(Date.now()).toISOString() : iPage.end_date;
            iPage.type = (iPage.type) ? iPage.type : 'date_work'
            const result = await this.reportManangerService.reportCollaboratorV2(lang, iPage, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Get('/report_customer')
    @UseGuards(AuthGuard('jwt_admin'))
    async reportCustomer(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageHistoryOrderDTOCollaborator,
        @GetUserByToken() user
    ) {
        try {
            iPage.length = Number(iPage.length) ? Number(iPage.length) : 100;
            iPage.search = decodeURI(iPage.search || "");
            iPage.start = Number(iPage.start) ? Number(iPage.start) : 0;
            iPage.start_date = (!iPage.start_date) ? subDays(new Date(Date.now()), 30).toISOString() : iPage.start_date;
            iPage.end_date = (!iPage.end_date) ? new Date(Date.now()).toISOString() : iPage.end_date;
            const result = await this.reportManangerService.reportCustomerV2(lang, iPage, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Get('/report_connecting')
    @UseGuards(AuthGuard('jwt_admin'))
    async reportConnecting(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageReportConnecting,
    ) {
        try {
            iPage.length = Number(iPage.length) ? Number(iPage.length) : 100;
            //iPage.search = decodeURI(iPage.search || "");
            iPage.start = Number(iPage.start) ? Number(iPage.start) : 0;
            iPage.city = Number(iPage.city) ? Number(iPage.city) : 0;
            // iPage.district = Number(iPage.district)? Number(iPage.district) : 0;
            iPage.district = (iPage.district) ? (iPage.district) : [];
            iPage.start_date = (iPage.start_date) ? iPage.start_date : subDays(new Date(Date.now()), 30).toISOString();
            iPage.end_date = (iPage.end_date) ? iPage.end_date : new Date(Date.now()).toISOString()
            const result = await this.reportManangerService.reportConnecting(lang, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    // khong dung nua
    @ApiTags('admin')
    @Get('/report_collaborator/get_detail/:id')
    @UseGuards(AuthGuard('jwt_admin'))
    async reportCollaboratorDetail(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') id: string,
        @Query() iPage: iPageHistoryOrderDTOCollaborator,
        @GetUserByToken() user
    ) {
        try {
            iPage.length = Number(iPage.length) || 100;
            iPage.search = decodeURI(iPage.search || "");
            iPage.start = Number(iPage.start) || 0;
            iPage.start_date = (!iPage.start_date) ? subDays(new Date(Date.now()), 30).toISOString() : iPage.start_date;
            iPage.end_date = (!iPage.end_date) ? new Date(Date.now()).toISOString() : iPage.end_date;
            const result = await this.reportManangerService.reportCollaboratorDetail(lang, id, iPage, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Get('/report_detail_customer_inviter/:idCustomer')
    @UseGuards(AuthGuard('jwt_admin'))
    async reportDetailCustomerInviter(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('idCustomer') idCustomer: string,
        @Query() iPage: iPageDTO,
        @GetUserByToken() user
    ) {
        try {
            iPage.length = Number(iPage.length) || 100;
            iPage.search = decodeURI(iPage.search || "");
            iPage.start = Number(iPage.start) || 0;
            const result = await this.reportManangerService.reportDetailCustomerInviter(lang, idCustomer, iPage, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Get('/report_customer_inviter')
    @UseGuards(AuthGuard('jwt_admin'))
    async reportCustomerInviter(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageTopCustomerInviterDTOAdmin,
    ) {
        try {
            iPage.length = Number(iPage.length) || 100;
            iPage.search = decodeURI(iPage.search || "");
            iPage.start = Number(iPage.start) || 0;
            iPage.start_date = (iPage.start_date) ? iPage.start_date : subDays(new Date(Date.now()), 30).toISOString();
            iPage.end_date = (iPage.end_date) ? iPage.end_date : new Date(Date.now()).toISOString();
            const result = await this.reportManangerService.reportCustomerInviter(lang, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Get('/top_customer_inviter')
    @UseGuards(AuthGuard('jwt_admin'))
    async topCustomerInviter(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageTopCustomerInviterDTOAdmin,
    ) {
        try {
            iPage.length = Number(iPage.length) || 100;
            iPage.search = decodeURI(iPage.search || "");
            iPage.start = Number(iPage.start) || 0;
            iPage.start_date = (iPage.start_date) ? iPage.start_date : startOfDay(new Date(Date.now())).toISOString();
            iPage.end_date = (iPage.end_date) ? iPage.end_date : endOfDay(new Date(Date.now())).toISOString();
            const result = await this.reportManangerService.topCustomerInviter(lang, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    // @ApiTags('admin')
    // @Get('/report_group_order')
    // @UseGuards(AuthGuard('jwt_admin'))
    // async reportGroupOrder(
    //     @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
    //     @Query() iPage: iPageReportGroupOrderDTOAdmin,
    // ) {
    //     try {
    //         iPage.start_date = (iPage.start_date) ? iPage.start_date : startOfDay(new Date(Date.now())).toISOString();
    //         iPage.end_date = (iPage.end_date) ? iPage.end_date : endOfDay(new Date(Date.now())).toISOString();
    //         iPage.district = (iPage.district) ? iPage.district : -1;
    //         iPage.city = (iPage.city) ? iPage.city : 79;
    //         const result = await this.reportManangerService.reportGroupOrder(lang, iPage);
    //         return result;
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    //     }
    // }

    @ApiTags('admin')
    @Get('/report_customer_inviter_for_time')
    @UseGuards(AuthGuard('jwt_admin'))
    async reportCustomerInviterForTime(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageReportCustomerDTOAdmin,
    ) {
        try {
            iPage.start_date = (iPage.start_date) ? iPage.start_date : startOfDay(new Date(Date.now())).toISOString();
            iPage.end_date = (iPage.end_date) ? iPage.end_date : endOfDay(new Date(Date.now())).toISOString();
            const result = await this.reportManangerService.reportCustomerInviterForTime(lang, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Get('/conversion_rate_new_customer')
    @UseGuards(AuthGuard('jwt_admin'))
    async conversionRateNewCustomer(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageReportCustomerDTOAdmin,
    ) {
        try {
            iPage.start_date = (iPage.start_date) ? iPage.start_date : startOfDay(new Date(Date.now())).toISOString();
            iPage.end_date = (iPage.end_date) ? iPage.end_date : endOfDay(new Date(Date.now())).toISOString();
            const result = await this.reportManangerService.conversionRateNewCustomer(lang, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    @ApiTags('admin')
    @Get('/report_review')
    @UseGuards(AuthGuard('jwt_admin'))
    async reportReview(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageReportReviewDTOAdmin,
        @GetUserByToken() user
    ) {
        try {
            iPage.start = (iPage.start) ? iPage.start : 0;
            iPage.length = (iPage.length) ? iPage.length : 10;
            iPage.start_date = (iPage.start_date) ? iPage.start_date : startOfDay(new Date(Date.now())).toISOString();
            iPage.end_date = (iPage.end_date) ? iPage.end_date : endOfDay(new Date(Date.now())).toISOString();
            iPage.star = (iPage.star) ? iPage.star : 0;
            iPage.search = decodeURI(iPage.search || '');
            iPage.type = (iPage.type) ? iPage.type : "";
            const result = await this.reportManangerService.reportReview(lang, iPage, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Get('/report_type_service')
    @UseGuards(AuthGuard('jwt_admin'))
    async reportTypeService(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageReportTypeServiceDTOAdmin,
    ) {
        try {
            iPage.city = (iPage.city) ? iPage.city : 79;
            iPage.district = (iPage.district) ? iPage.district : -1;
            iPage.start_date = (iPage.start_date) ? iPage.start_date : startOfDay(new Date(Date.now())).toISOString();
            iPage.end_date = (iPage.end_date) ? iPage.end_date : endOfDay(new Date(Date.now())).toISOString();
            const result = await this.reportManangerService.reportTypeService(lang, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Get('/report_cancel_order')
    @UseGuards(AuthGuard('jwt_admin'))
    async reportCancelOrder(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageReportCancelOrderDTOAdmin,
        @GetUserByToken() user
    ) {
        try {
            iPage.city = (iPage.city) ? iPage.city : 79;
            iPage.district = (iPage.district) ? Number(iPage.district) : -1;
            iPage.start_date = (iPage.start_date) ? iPage.start_date : startOfDay(new Date(Date.now())).toISOString();
            iPage.end_date = (iPage.end_date) ? iPage.end_date : endOfDay(new Date(Date.now())).toISOString();
            const result = await this.reportManangerService.reportCancelOrder(lang, iPage, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Get('/report_customer_cancel_order')
    @UseGuards(AuthGuard('jwt_admin'))
    async reportCustomerCancelOrder(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageReportCancelOrderDTOAdmin,
    ) {
        try {
            iPage.city = (iPage.city) ? iPage.city : 79;
            iPage.district = (iPage.district) ? Number(iPage.district) : -1;
            iPage.start_date = (iPage.start_date) ? iPage.start_date : startOfDay(new Date(Date.now())).toISOString();
            iPage.end_date = (iPage.end_date) ? iPage.end_date : endOfDay(new Date(Date.now())).toISOString();
            const result = await this.reportManangerService.reportCustomerCancelOrder(lang, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Get('/report_overview_cancel_order')
    @UseGuards(AuthGuard('jwt_admin'))
    async reportOverviewCancelOrder(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageReportCancelOrderDTOAdmin,
        @GetUserByToken() user
    ) {
        try {
            iPage.type = (iPage.type) ? iPage.type : 'all'
            iPage.start_date = (iPage.start_date) ? iPage.start_date : startOfDay(new Date(Date.now())).toISOString();
            iPage.end_date = (iPage.end_date) ? iPage.end_date : endOfDay(new Date(Date.now())).toISOString();
            iPage.start = (iPage.start) ? iPage.start : 0;
            iPage.length = (iPage.length) ? iPage.length : 20;
            iPage.search = decodeURI(iPage.search || "");
            const result = await this.reportManangerService.reportOverviewCancelOrder(lang, iPage, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Get('/report_total_collaborator_balance')
    @UseGuards(AuthGuard('jwt_admin'))
    async reportCollaboratorBalance(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageReportCancelOrderDTOAdmin,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.reportManangerService.reportTotalCollaboratorBalance(lang, iPage, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Get('/report_transition_collaborator_for_time')
    @UseGuards(AuthGuard('jwt_admin'))
    async reportTransitionCollaboratorForTime(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageReportCancelOrderDTOAdmin,
        @GetUserByToken() user
    ) {
        try {
            iPage.start_date = (iPage.start_date) ? iPage.start_date : startOfDay(new Date(Date.now())).toISOString();
            iPage.end_date = (iPage.end_date) ? iPage.end_date : endOfDay(new Date(Date.now())).toISOString();
            iPage.start = (iPage.start) ? iPage.start : 0;
            iPage.length = (iPage.length) ? iPage.length : 20;
            const result = await this.reportManangerService.reportTransitionCollaboratorForTime(lang, iPage, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Get('/report_total_customer_balance')
    @UseGuards(AuthGuard('jwt_admin'))
    async reportTotalCustomerBalance(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageReportCancelOrderDTOAdmin,
        @GetUserByToken() user
    ) {
        try {
            iPage.start_date = (iPage.start_date) ? iPage.start_date : startOfDay(new Date(Date.now())).toISOString();
            iPage.end_date = (iPage.end_date) ? iPage.end_date : endOfDay(new Date(Date.now())).toISOString();
            const result = await this.reportManangerService.reportTotalCustomerBalance(lang, iPage, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Get('/report_connection_rate_customer')
    @UseGuards(AuthGuard('jwt_admin'))
    async reportConnectionRateCustomer(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageReportCustomerDTOAdmin,
    ) {
        try {
            iPage.start_date = (iPage.start_date) ? iPage.start_date : startOfMonth(new Date(Date.now())).toISOString();
            iPage.end_date = (iPage.end_date) ? iPage.end_date : endOfDay(new Date(Date.now())).toISOString();
            iPage.start = (iPage.start) ? iPage.start : 0;
            iPage.length = (iPage.length) ? iPage.length : 20;
            const result = await this.reportManangerService.reportConnectionRateCustomer(lang, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    @ApiTags('admin')
    @Get('/report_customer_by_city')
    @UseGuards(AuthGuard('jwt_admin'))
    async reportCustomerByCity(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageReportCustomerDTOAdmin,
    ) {
        try {
            iPage.start_date = (iPage.start_date) ? iPage.start_date : startOfMonth(new Date(Date.now())).toISOString();
            iPage.end_date = (iPage.end_date) ? iPage.end_date : endOfDay(new Date(Date.now())).toISOString();
            // iPage.start = (iPage.start) ? iPage.start : 0;
            // iPage.length = (iPage.length) ? iPage.length : 20;
            const result = await this.reportManangerService.reportCustomerByCityV2(lang, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Get('/report_customer_old_new')
    @UseGuards(AuthGuard('jwt_admin'))
    async reportCustomerOldNew(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageReportCustomerDTOAdmin,
        @GetUserByToken() user
    ) {
        try {
            iPage.start_date = (iPage.start_date) ? iPage.start_date : startOfMonth(new Date(Date.now())).toISOString();
            iPage.end_date = (iPage.end_date) ? iPage.end_date : endOfDay(new Date(Date.now())).toISOString();
            iPage.start = (iPage.start) ? iPage.start : 0;
            iPage.length = (iPage.length) ? iPage.length : 20;
            iPage.type = (iPage.type) ? iPage.type : 'all';
            iPage.type_date = (iPage.type_date) ? iPage.type_date : 'all';
            const result = await this.reportManangerService.reportCustomerOldNew(lang, iPage, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Get('/report_customer_old_new_order')
    // @UseGuards(AuthGuard('jwt_admin'))
    async reportCustomerOldCustomerNewOrder(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageReportCustomerDTOAdmin,
    ) {
        try {
            iPage.start_date = (iPage.start_date) ? iPage.start_date : startOfMonth(new Date(Date.now())).toISOString();
            iPage.end_date = (iPage.end_date) ? iPage.end_date : endOfDay(new Date(Date.now())).toISOString();
            iPage.start = (iPage.start) ? iPage.start : 0;
            iPage.length = (iPage.length) ? iPage.length : 20;
            const result = await this.reportManangerService.reportCustomerOldCustomerNewOrder(lang, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Get('/report_order_daily')
    @UseGuards(AuthGuard('jwt_admin'))
    async reportOrderDayly(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageHistoryOrderDTOCollaborator,
        @GetUserByToken() user
    ) {
        try {
            iPage.length = Number(iPage.length) ? Number(iPage.length) : 10;
            iPage.search = decodeURI(iPage.search || "");
            iPage.start = Number(iPage.start) ? Number(iPage.start) : 0;
            iPage.start_date = (!iPage.start_date) ? subDays(new Date(Date.now()), 30).toISOString() : iPage.start_date;
            iPage.end_date = (!iPage.end_date) ? new Date(Date.now()).toISOString() : iPage.end_date;
            iPage.type = (iPage.type) ? iPage.type : 'date_work';
            iPage.typeSort = (iPage.typeSort) ? iPage.typeSort : 'date_work';
            iPage.valueSort = (iPage.valueSort) ? Number(iPage.valueSort) : 1;
            iPage.status = (iPage.status) ? (iPage.status) : "all"
            const result = await this.reportManangerService.reportOrderDayly(lang, iPage, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Get('/report_order_city')
    @UseGuards(AuthGuard('jwt_admin'))
    async reportOrderCity(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageHistoryOrderDTOCollaborator,
        @GetUserByToken() user
    ) {
        try {
            iPage.length = Number(iPage.length) ? Number(iPage.length) : 10;
            iPage.city = Number(iPage.city) ? Number(iPage.city) : 0;
            iPage.start = Number(iPage.start) ? Number(iPage.start) : 0;
            iPage.start_date = (!iPage.start_date) ? subDays(new Date(Date.now()), 30).toISOString() : iPage.start_date;
            iPage.end_date = (!iPage.end_date) ? new Date(Date.now()).toISOString() : iPage.end_date;
            iPage.type = (iPage.type) ? iPage.type : 'date_work';
            const result = await this.reportManangerService.reportOrderCity(lang, iPage, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Get('/report_percent_order_city')
    @UseGuards(AuthGuard('jwt_admin'))
    async reportPercentOrderCity(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageHistoryOrderDTOCollaborator,
    ) {
        try {
            iPage.city = Number(iPage.city) ? Number(iPage.city) : 0;
            iPage.start_date = (!iPage.start_date) ? subDays(new Date(Date.now()), 30).toISOString() : iPage.start_date;
            iPage.end_date = (!iPage.end_date) ? new Date(Date.now()).toISOString() : iPage.end_date;
            iPage.type = (iPage.type) ? iPage.type : 'date_work';
            const result = await this.reportManangerService.reportPercentOrderCity(lang, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Get('/report_service_by_area')
    @UseGuards(AuthGuard('jwt_admin'))
    async reportServiceByArea(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageReportTypeServiceDTOAdmin,
        @GetUserByToken() user
    ) {
        try {
            iPage.start_date = (iPage.start_date) ? iPage.start_date : startOfMonth(new Date(Date.now())).toISOString();
            iPage.end_date = (iPage.end_date) ? iPage.end_date : endOfDay(new Date(Date.now())).toISOString();
            const result = await this.reportManangerService.reportServiceByArea(lang, iPage, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Get('/report_detail_service_by_area')
    @UseGuards(AuthGuard('jwt_admin'))
    async reportDetailServiceByArea(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageReportTypeServiceDTOAdmin,
        @GetUserByToken() user
    ) {
        try {
            iPage.city = (iPage.city) ? iPage.city : 79;
            iPage.district = (iPage.district) ? iPage.district : -1;
            iPage.start_date = (iPage.start_date) ? iPage.start_date : startOfMonth(new Date(Date.now())).toISOString();
            iPage.end_date = (iPage.end_date) ? iPage.end_date : endOfDay(new Date(Date.now())).toISOString();
            const result = await this.reportManangerService.reportDetailServiceByArea(lang, iPage, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Get('/total_order_daily')
    @UseGuards(AuthGuard('jwt_admin'))
    async totalOrderDaily(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageHistoryOrderDTOCollaborator,
        @GetUserByToken() user
    ) {
        try {
            iPage.start_date = (!iPage.start_date) ? subDays(new Date(Date.now()), 30).toISOString() : iPage.start_date;
            iPage.end_date = (!iPage.end_date) ? new Date(Date.now()).toISOString() : iPage.end_date;
            iPage.type_date = (!iPage.type_date) ? "date_work" : iPage.type_date;
            iPage.status = (iPage.status) ? (iPage.status) : "all"
            const result = await this.reportManangerService.totalOrderDaily(lang, iPage, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Get('/report_user_system_cancel_order')
    @UseGuards(AuthGuard('jwt_admin'))
    async reportUserSystemCancelOrder(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageReportCancelOrderDTOAdmin,
        @GetUserByToken() user
    ) {
        try {
            iPage.city = (iPage.city) ? iPage.city : 79;
            iPage.district = (iPage.district) ? Number(iPage.district) : -1;
            iPage.start_date = (iPage.start_date) ? iPage.start_date : startOfDay(new Date(Date.now())).toISOString();
            iPage.end_date = (iPage.end_date) ? iPage.end_date : endOfDay(new Date(Date.now())).toISOString();
            const result = await this.reportManangerService.reportUserSystemCancelOrder(lang, iPage, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Get('/report_order_day_in_week')
    @UseGuards(AuthGuard('jwt_admin'))
    async reportOrderByDay(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageReportOrderByDayDTOAdmin,
        @GetUserByToken() user
    ) {
        try {
            iPage.start_date = (iPage.start_date) ? iPage.start_date : startOfDay(new Date(Date.now())).toISOString();
            iPage.end_date = (iPage.end_date) ? iPage.end_date : endOfDay(new Date(Date.now())).toISOString();
            iPage.type = (iPage.type) ? iPage.type : 'date_work';
            const result = await this.reportManangerService.reportOrderByDay(lang, iPage, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Get('/report_total_job_hour_collaborator/:idCollaborator')
    @UseGuards(AuthGuard('jwt_admin'))
    async reportTotalJobHourCollaborator(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageReportOrderByDayDTOAdmin,
        @Query('idCollaborator') idCollaborator: string,
        @GetUserByToken() user
    ) {
        try {
            iPage.start_date = (!iPage.start_date) ? subDays(new Date(Date.now()), 30).toISOString() : iPage.start_date;
            iPage.end_date = (iPage.end_date) ? iPage.end_date : endOfDay(new Date(Date.now())).toISOString();
            const result = await this.reportManangerService.reportTotalJobHourCollaborator(lang, iPage, idCollaborator);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    @ApiTags('admin')
    @Post('/report_gov')
    async reportGov(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() user: any,
    ) {
        try {
            const result = await this.reportManangerService.reportGov(lang, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('/report_balance')
    async reportBalance(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageReportOrderByDayDTOAdmin,
        @Query('idCollaborator') idCollaborator: string,
        @GetUserByToken() user
    ) {
        try {
            iPage.start_date = (!iPage.start_date) ? subDays(new Date(Date.now()), 30).toISOString() : iPage.start_date;
            iPage.end_date = (iPage.end_date) ? iPage.end_date : endOfDay(new Date(Date.now())).toISOString();
            const result = await this.reportManangerService.reportBalance(lang, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('/report_customer_by_order_from_area')
    async reportCustomerByOrderFromArea(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.reportManangerService.reportCustomerByOrderFromArea(lang);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('/report_detail_balance_customer')
    async reportDetailBalanceCustomer(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageReportOrderByDayDTOAdmin,
        @GetUserByToken() user
    ) {
        try {
            iPage.start = iPage.start ? iPage.start : 0;
            iPage.length = iPage.length ? iPage.length : 10;
            iPage.start_date = (!iPage.start_date) ? subDays(new Date(Date.now()), 30).toISOString() : iPage.start_date;
            iPage.end_date = (iPage.end_date) ? iPage.end_date : endOfDay(new Date(Date.now())).toISOString();
            const result = await this.reportManangerService.reportDetailBalanceCustomer(lang, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('/report_detail_balance_collaborator')
    async reportDetailBalanceCollaborator(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageReportOrderByDayDTOAdmin,
        @GetUserByToken() user
    ) {
        try {
            iPage.start = iPage.start ? iPage.start : 0;
            iPage.length = iPage.length ? iPage.length : 10;
            iPage.start_date = (!iPage.start_date) ? subDays(new Date(Date.now()), 30).toISOString() : iPage.start_date;
            iPage.end_date = (iPage.end_date) ? iPage.end_date : endOfDay(new Date(Date.now())).toISOString();
            const result = await this.reportManangerService.reportDetailBalanceCollaborator(lang, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('/report_customer_rate')
    async reportCustomerRate(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageReportOrderByDayDTOAdmin,
        @GetUserByToken() user
    ) {
        try {
            iPage.start = iPage.start ? iPage.start : 0;
            iPage.length = iPage.length ? iPage.length : 10;
            iPage.start_date = (!iPage.start_date) ? subDays(new Date(Date.now()), 30).toISOString() : iPage.start_date;
            iPage.end_date = (iPage.end_date) ? iPage.end_date : endOfDay(new Date(Date.now())).toISOString();
            const result = await this.reportManangerService.reportCustomerRate(lang, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('/report_group_order')
    async reportGroupOrder(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @IPageDecorator() iPage: iPageReportGroupOrderDTOAdmin,
    ) {
        try {
            iPage.start_date = iPage.start_date ? iPage.start_date : subYears(new Date(Date.now()), 3).toISOString();
            iPage.end_date = iPage.end_date ? iPage.end_date : new Date(Date.now()).toISOString();
            iPage.type_date = (iPage.type_date) ? iPage.type_date : 'date_work'
            iPage.status = (iPage.status) ? iPage.status : 'done,doing,confirm'
            const result = await this.reportManangerService.reportGroupOrderV2(lang, iPage, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    @ApiTags('admin')
    @Get('/report_order_by_customer')
    @UseGuards(AuthGuard('jwt_admin'))
    async reportOrderByCustomer(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageReportOrderByCustomerDTOAdmin,
        @GetUserByToken() user
    ) {
        try {
            iPage.start_date = (iPage.start_date) ? iPage.start_date : startOfMonth(new Date(Date.now())).toISOString();
            iPage.end_date = (iPage.end_date) ? iPage.end_date : endOfDay(new Date(Date.now())).toISOString();
            iPage.start = (iPage.start) ? iPage.start : 0;
            iPage.length = (iPage.length) ? iPage.length : 20;
            iPage.type_customer = (iPage.type_customer) ? iPage.type_customer : 'all';
            iPage.type_date = (iPage.type_date) ? iPage.type_date : 'date_work';
            const result = await this.reportManangerService.reportOrderByCustomer(lang, iPage, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Get('/report_total_order_by_customer')
    @UseGuards(AuthGuard('jwt_admin'))
    async reportTotalOrderByCustomer(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageReportOrderByCustomerDTOAdmin,
        @GetUserByToken() user
    ) {
        try {
            iPage.start_date = (iPage.start_date) ? iPage.start_date : startOfMonth(new Date(Date.now())).toISOString();
            iPage.end_date = (iPage.end_date) ? iPage.end_date : endOfDay(new Date(Date.now())).toISOString();
            iPage.type_customer = (iPage.type_customer) ? iPage.type_customer : 'all';
            iPage.type_date = (iPage.type_date) ? iPage.type_date : 'all';
            const result = await this.reportManangerService.reportTotalOrderByCustomer(lang, iPage, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }



    @ApiTags('admin')
    @Get('/report_order_by_collaborator')
    @UseGuards(AuthGuard('jwt_admin'))
    async reportOrderByCollaborator(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageHistoryOrderDTOCollaborator,
        @GetUserByToken() user
    ) {
        try {
            iPage.length = Number(iPage.length) ? Number(iPage.length) : 100;
            iPage.search = decodeURI(iPage.search || "");
            iPage.start = Number(iPage.start) ? Number(iPage.start) : 0;
            iPage.start_date = (!iPage.start_date) ? subDays(new Date(Date.now()), 30).toISOString() : iPage.start_date;
            iPage.end_date = (!iPage.end_date) ? new Date(Date.now()).toISOString() : iPage.end_date;
            iPage.status = (iPage.status) ? iPage.status : 'done,doing,confirm'
            const result = await this.reportManangerService.reportOrderByCollaborator(lang, iPage, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Get('/report_order_by_collaborator/get_detail/:id')
    @UseGuards(AuthGuard('jwt_admin'))
    async reportDetailOrderByCollaborator(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') id: string,
        @Query() iPage: iPageHistoryOrderDTOCollaborator,
        @GetUserByToken() user
    ) {
        try {
            iPage.length = Number(iPage.length) || 100;
            iPage.search = decodeURI(iPage.search || "");
            iPage.start = Number(iPage.start) || 0;
            iPage.start_date = (!iPage.start_date) ? subDays(new Date(Date.now()), 30).toISOString() : iPage.start_date;
            iPage.end_date = (!iPage.end_date) ? new Date(Date.now()).toISOString() : iPage.end_date;
            iPage.status = (iPage.status) ? iPage.status : 'done,doing,confirm'
            const result = await this.reportManangerService.reportDetailOrderByCollaborator(lang, id, iPage, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }



    @ApiTags('admin')
    @Get('/report_violation_collaborator')
    @UseGuards(AuthGuard('jwt_admin'))
    async reportViolationCollaborator(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') id: string,
        @Query() iPage: iPageHistoryOrderDTOCollaborator,
        @GetUserByToken() user
    ) {
        try {
            iPage.length = Number(iPage.length) || 100;
            iPage.search = decodeURI(iPage.search || "");
            iPage.start = Number(iPage.start) || 0;
            iPage.start_date = (!iPage.start_date) ? subDays(new Date(Date.now()), 30).toISOString() : iPage.start_date;
            iPage.end_date = (!iPage.end_date) ? new Date(Date.now()).toISOString() : iPage.end_date;
            iPage.status = (iPage.status) ? iPage.status : 'done,doing,confirm,cancel'
            const result = await this.reportManangerService.reportViolationCollaborator(lang, id, iPage, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }



}