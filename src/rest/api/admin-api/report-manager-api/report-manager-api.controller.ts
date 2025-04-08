import { Controller, Get, HttpException, HttpStatus, Post, Query, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiTags } from '@nestjs/swagger'
import { endOfDay, startOfMonth } from 'date-fns'
import { DEFAULT_LANG, IPageDecorator, iPageReportOrderByCustomerDTOAdmin, LANGUAGE, ValidateLangPipe } from 'src/@core'
import { getListMessagesEtelecomDTOAdmin, reportCashBookDTOAdmin } from 'src/@core/dto/report.dto'
import { EtelecomService } from 'src/@share-module/etelecom/etelecom.service'

// import { actiTrainingDTOAdmin, createTrainingDTOAdmin, editTrainingDTOAdmin, iPageTrainingLessonDTOAdmin } from 'src/@core/dto/trainingLesson.dto';
import { ReportSystemService } from 'src/core-system/@core-system/report-system/report-system.service'
@Controller('report_mananger')
export class ReportManagerApiController {
    constructor(
        private reportSystemService: ReportSystemService,
        private etelecomService: EtelecomService,
    ) { }

    @ApiTags('admin')
    @Get('/report_order_by_customer')
    @UseGuards(AuthGuard('jwt_admin'))
    async reportOrderByCustomer(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @IPageDecorator() iPage: iPageReportOrderByCustomerDTOAdmin,
    ) {
        try {
            iPage.start_date = (iPage.start_date) ? iPage.start_date : startOfMonth(new Date(Date.now())).toISOString();
            iPage.end_date = (iPage.end_date) ? iPage.end_date : endOfDay(new Date(Date.now())).toISOString();
            iPage.type_customer = (iPage.type_customer) ? iPage.type_customer : 'all';
            iPage.type_date = (iPage.type_date) ? iPage.type_date : 'all';
            iPage.type_status = (iPage.type_status) ? (iPage.type_status) : "all"
            const result = await this.reportSystemService.reportOrderByCustomer(lang, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Get('/report_first_order_by_customer')
    @UseGuards(AuthGuard('jwt_admin'))
    async reportFirstOrderByCustomer(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @IPageDecorator() iPage: iPageReportOrderByCustomerDTOAdmin,
    ) {
        try {
            iPage.start_date = (iPage.start_date) ? iPage.start_date : startOfMonth(new Date(Date.now())).toISOString();
            iPage.end_date = (iPage.end_date) ? iPage.end_date : endOfDay(new Date(Date.now())).toISOString();
            iPage.type_customer = (iPage.type_customer) ? iPage.type_customer : 'all';
            iPage.type_date = (iPage.type_date) ? iPage.type_date : 'all';
            iPage.type_status = (iPage.type_status) ? (iPage.type_status) : "all"
            const result = await this.reportSystemService.reportFirstOrderByCustomer(lang, iPage);
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
        @IPageDecorator() iPage: iPageReportOrderByCustomerDTOAdmin,
    ) {
        try {
            iPage.start_date = (iPage.start_date) ? iPage.start_date : startOfMonth(new Date(Date.now())).toISOString();
            iPage.end_date = (iPage.end_date) ? iPage.end_date : endOfDay(new Date(Date.now())).toISOString();
            iPage.type_customer = (iPage.type_customer) ? iPage.type_customer : 'all';
            iPage.type_date = (iPage.type_date) ? iPage.type_date : 'all';
            iPage.type_status = (iPage.type_status) ? (iPage.type_status) : "all"
            const result = await this.reportSystemService.reportTotalOrderByCustomer(lang, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Get('/report_total_first_order_by_customer')
    @UseGuards(AuthGuard('jwt_admin'))
    async reportTotalFirstOrderByCustomer(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @IPageDecorator() iPage: iPageReportOrderByCustomerDTOAdmin,
    ) {
        try {
            iPage.start_date = (iPage.start_date) ? iPage.start_date : startOfMonth(new Date(Date.now())).toISOString();
            iPage.end_date = (iPage.end_date) ? iPage.end_date : endOfDay(new Date(Date.now())).toISOString();
            iPage.type_customer = (iPage.type_customer) ? iPage.type_customer : 'all';
            iPage.type_date = (iPage.type_date) ? iPage.type_date : 'all';
            iPage.type_status = (iPage.type_status) ? (iPage.type_status) : "all"
            const result = await this.reportSystemService.reportTotalFirstOrderByCustomer(lang, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Get('/generate_customer_satisfaction_report')
    @UseGuards(AuthGuard('jwt_admin'))
    async generateCustomerSatisfactionReport(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @IPageDecorator() iPage: iPageReportOrderByCustomerDTOAdmin,
    ) {
        try {
            iPage.start_date = (iPage.start_date) ? iPage.start_date : startOfMonth(new Date(Date.now())).toISOString();
            iPage.end_date = (iPage.end_date) ? iPage.end_date : endOfDay(new Date(Date.now())).toISOString();
            const result = await this.reportSystemService.generateCustomerSatisfactionReport(iPage.start_date, iPage.end_date);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    // @UseGuards(AuthGuard('jwt_admin'))
    @Post('/create_report_at_midnight')
    async createReportAtMidnight(
    ) {
        try {
            const result = await this.reportSystemService.createReportAtMidnightByCallApi();
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    // Báo cáo tổng thu chi
    @ApiTags('admin')
    @Get('/report_cash_book')
    @UseGuards(AuthGuard('jwt_admin'))
    async reportCashBook(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @IPageDecorator() iPage: reportCashBookDTOAdmin,
    ) {
        try {
            iPage.start = (iPage.start) ? iPage.start : 0;
            iPage.length = (iPage.length) ? iPage.length : 20;
            iPage.start_date = (iPage.start_date) ? iPage.start_date : startOfMonth(new Date(Date.now())).toISOString();
            iPage.end_date = (iPage.end_date) ? iPage.end_date : endOfDay(new Date(Date.now())).toISOString();
            iPage.type_date = (iPage.type_date) ? iPage.type_date : 'all';
            const result = await this.reportSystemService.reportCashBook(lang, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    // Báo cáo chi tiết tổng thu chi
    @ApiTags('admin')
    @Get('/detail_report_cash_book')
    @UseGuards(AuthGuard('jwt_admin'))
    async detailReportCashBook(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @IPageDecorator() iPage: reportCashBookDTOAdmin,
    ) {
        try {
            iPage.start = (iPage.start) ? iPage.start : 0;
            iPage.length = (iPage.length) ? iPage.length : 20;
            iPage.start_date = (iPage.start_date) ? iPage.start_date : startOfMonth(new Date(Date.now())).toISOString();
            iPage.end_date = (iPage.end_date) ? iPage.end_date : endOfDay(new Date(Date.now())).toISOString();
            iPage.type_date = (iPage.type_date) ? iPage.type_date : 'all';
            const result = await this.reportSystemService.detailReportCashBook(lang, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    // Báo cáo thu chi của đối tác
    @ApiTags('admin')
    @Get('/report_cash_book_collaborator')
    @UseGuards(AuthGuard('jwt_admin'))
    async reportCashBookCollaborator(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @IPageDecorator() iPage: reportCashBookDTOAdmin,
    ) {
        try {
            iPage.start = (iPage.start) ? iPage.start : 0;
            iPage.length = (iPage.length) ? iPage.length : 20;
            iPage.start_date = (iPage.start_date) ? iPage.start_date : startOfMonth(new Date(Date.now())).toISOString();
            iPage.end_date = (iPage.end_date) ? iPage.end_date : endOfDay(new Date(Date.now())).toISOString();
            iPage.type_date = (iPage.type_date) ? iPage.type_date : 'all';
            const result = await this.reportSystemService.reportCashBookCollaborator(lang, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    // Báo cáo chi tiết thu chi của đối tác
    @ApiTags('admin')
    @Get('/detail_report_cash_book_collaborator')
    @UseGuards(AuthGuard('jwt_admin'))
    async detailReportCashBookCollaborator(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @IPageDecorator() iPage: reportCashBookDTOAdmin,
    ) {
        try {
            iPage.start = (iPage.start) ? iPage.start : 0;
            iPage.length = (iPage.length) ? iPage.length : 20;
            iPage.start_date = (iPage.start_date) ? iPage.start_date : startOfMonth(new Date(Date.now())).toISOString();
            iPage.end_date = (iPage.end_date) ? iPage.end_date : endOfDay(new Date(Date.now())).toISOString();
            const result = await this.reportSystemService.detailReportCashBookByCollaborator(lang, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    // Báo cáo thu chi của khách hàng
    @ApiTags('admin')
    @Get('/report_cash_book_customer')
    @UseGuards(AuthGuard('jwt_admin'))
    async reportCashBookCustomer(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @IPageDecorator() iPage: reportCashBookDTOAdmin,
    ) {
        try {
            iPage.start = (iPage.start) ? iPage.start : 0;
            iPage.length = (iPage.length) ? iPage.length : 20;
            iPage.start_date = (iPage.start_date) ? iPage.start_date : startOfMonth(new Date(Date.now())).toISOString();
            iPage.end_date = (iPage.end_date) ? iPage.end_date : endOfDay(new Date(Date.now())).toISOString();
            iPage.type_date = (iPage.type_date) ? iPage.type_date : 'all';
            const result = await this.reportSystemService.reportCashBookCustomer(lang, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    // Báo cáo chi tiết thu chi của khách hàng
    @ApiTags('admin')
    @Get('/detail_report_cash_book_customer')
    @UseGuards(AuthGuard('jwt_admin'))
    async detailReportCashBookCustomer(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @IPageDecorator() iPage: reportCashBookDTOAdmin,
    ) {
        try {
            iPage.start = (iPage.start) ? iPage.start : 0;
            iPage.length = (iPage.length) ? iPage.length : 20;
            iPage.start_date = (iPage.start_date) ? iPage.start_date : startOfMonth(new Date(Date.now())).toISOString();
            iPage.end_date = (iPage.end_date) ? iPage.end_date : endOfDay(new Date(Date.now())).toISOString();
            const result = await this.reportSystemService.detailReportCashBookByCustomer(lang, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    // Báo cáo hoạt động đơn hàng
    @ApiTags('admin')
    @Get('/report_order_activity')
    @UseGuards(AuthGuard('jwt_admin'))
    async reportOrderAcitivy(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @IPageDecorator() iPage: reportCashBookDTOAdmin,
    ) {
        try {
            iPage.start = (iPage.start) ? iPage.start : 0;
            iPage.length = (iPage.length) ? iPage.length : 20;
            iPage.start_date = (iPage.start_date) ? iPage.start_date : startOfMonth(new Date(Date.now())).toISOString();
            iPage.end_date = (iPage.end_date) ? iPage.end_date : endOfDay(new Date(Date.now())).toISOString();
            const result = await this.reportSystemService.reportOrderActivity(lang, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    
    // Báo cáo chi tiết hoạt động đơn hàng
    @ApiTags('admin')
    @Get('/report_detail_order_activity')
    @UseGuards(AuthGuard('jwt_admin'))
    async reportDetailOrderAcitivy(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @IPageDecorator() iPage: reportCashBookDTOAdmin,
    ) {
        try {
            iPage.start = (iPage.start) ? iPage.start : 0;
            iPage.length = (iPage.length) ? iPage.length : 20;
            iPage.start_date = (iPage.start_date) ? iPage.start_date : startOfMonth(new Date(Date.now())).toISOString();
            iPage.end_date = (iPage.end_date) ? iPage.end_date : endOfDay(new Date(Date.now())).toISOString();
            const result = await this.reportSystemService.reportDetailOrderActivity(lang, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    

    @ApiTags('admin')
    @Get('/get_list_message_etelecom')
    @UseGuards(AuthGuard('jwt_admin'))
    async getListMessagesOfEtelecom(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @IPageDecorator() iPage: getListMessagesEtelecomDTOAdmin,
    ) {
        try {
            iPage.length = (iPage.length) ? iPage.length : 20;
            iPage.start_date = (iPage.start_date) ? iPage.start_date : new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
            iPage.end_date = (iPage.end_date) ? iPage.end_date : new Date(new Date().setHours(23, 59, 59, 999)).toISOString();
            const result = await this.etelecomService.getListMessages(iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
