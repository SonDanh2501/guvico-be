import { Controller, UseGuards, Get, Post, Query, HttpException, Param, Body } from '@nestjs/common';
import { CustomerRequestManagerService } from './customer-request-manager.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUserByToken } from 'src/@core';
import { ValidateLangPipe } from '../../@core/pipe/validate-lang.pipe';
import { DEFAULT_LANG, LANGUAGE } from '../../@core/constant/constant';
import { ApiTags } from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common/enums';
import { iPageCustomerRequestDTOAdmin, iPageCustomerRequestDTOAdminV2 } from '../../@core/dto/customerRequest.dto';
import { subDays } from 'date-fns';

@Controller('customer_request_manager')
export class CustomerRequestManagerController {
    constructor(
        private customerRequestManagerService: CustomerRequestManagerService
    ) { }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('/get_list')
    async getList(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Query() iPage: iPageCustomerRequestDTOAdminV2
    ) {
        try {
            iPage.contacted = (iPage.contacted !== null) ? iPage.contacted : "all";// contacted - not_contacted
            iPage.start_date = (iPage.start_date) ? iPage.start_date : subDays(new Date(Date.now()), 100).toISOString();
            iPage.end_date = (iPage.end_date) ? iPage.end_date : new Date(Date.now()).toISOString();
            iPage.status = (iPage.status) ? iPage.status : "all";
            iPage.length = Number(iPage.length) || 10;
            iPage.search = decodeURI(iPage.search || "");
            iPage.start = Number(iPage.start) || 0;
            iPage.id_service = (iPage.id_service) ? iPage.id_service : "all";
            const result = await this.customerRequestManagerService.getListV2(lang, iPage, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('/get_detail/:id')
    async getDetail(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Param('id') id: string
    ) {
        try {
            const result = await this.customerRequestManagerService.getDetail(lang, id, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('/contact/:id')
    async contact(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Param('id') id: string
    ) {
        try {
            const result = await this.customerRequestManagerService.contact(lang, id, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('/change_status/:id')
    async changeStatus(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Param('id') id: string,
        @Body() req
    ) {
        try {
            const result = await this.customerRequestManagerService.changeStatus(lang, id, user, req);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('/delete_customer_request/:id')
    async deleteCustomerRequest(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Param('id') id: string,
    ) {
        try {
            const result = await this.customerRequestManagerService.deleteRequest(lang, id, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
