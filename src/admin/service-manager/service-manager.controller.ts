import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common';
import { DEFAULT_LANG, GetUserByToken, iPageDTO, iPagePriceServiceDTOAdmin, LANGUAGE, ValidateLangPipe } from 'src/@core';
import { createServiceDTOAdmin, editServiceDTOAdmin, activeServiceDTOAdmin } from 'src/@core/dto/service.dto';
import { ServiceManagerService } from './service-manager.service';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { addDays, endOfDay, startOfDay, subDays } from 'date-fns';

@Controller('service_manager')
export class ServiceManagerController {
    constructor(private serviceManagerService: ServiceManagerService) { }

    @ApiTags('admin')
    @Get('get_list')
    @UseGuards(AuthGuard('jwt'))
    async getListItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageDTO,
        @GetUserByToken() user,
    ) {
        iPage.length = Number(iPage.length) || 10;
        iPage.search = decodeURI(iPage.search || "");
        iPage.start = Number(iPage.start) || 0;
        const result = await this.serviceManagerService.getListItem(lang, iPage);
        return result;
    }

    @ApiTags('admin')
    @Get('get_list_service_by_group_service/:id')
    @UseGuards(AuthGuard('jwt_admin'))
    async getListServiceByGroupService(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageDTO,
        @Param('id') id: string,
        @GetUserByToken() user,
    ) {
        try {
            iPage.length = Number(iPage.length) || 10;
            iPage.start = Number(iPage.start) || 0;
            const result = await this.serviceManagerService.getListServiceByGroupService(lang, iPage, id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }

    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('get_detail/:id')
    async getDetailItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') id: string,
    ) {
        try {
            const result = await this.serviceManagerService.getDetailItem(lang, id);
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
        @Body() req: createServiceDTOAdmin,
        @GetUserByToken() user,
    ) {
        try {
            const result = await this.serviceManagerService.createItem(lang, req, user._id);
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
        @Body() req: editServiceDTOAdmin,
        @GetUserByToken() user,
    ) {
        try {
            const result = await this.serviceManagerService.editItem(lang, req, id, user._id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }

    }
    @ApiTags('admin')
    @Post('active_item/:id')
    @UseGuards(AuthGuard('jwt_admin'))
    async activeItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') id: string,
        @Body() req: activeServiceDTOAdmin,
        @GetUserByToken() user,
    ) {
        try {
            const result = await this.serviceManagerService.activeItem(lang, req, id, user._id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }

    }
    @ApiTags('admin')
    @Post('delete_item/:id')
    @UseGuards(AuthGuard('jwt_admin'))
    async deleteItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') id: string,
        @GetUserByToken() user,
    ) {
        try {
            const result = await this.serviceManagerService.deleteItem(lang, id, user._id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Get('price_service/:idService')
    @UseGuards(AuthGuard('jwt_admin'))
    async priceOnService(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('idService') idService: string,
        @GetUserByToken() user,
        @Query() iPage: iPagePriceServiceDTOAdmin
    ) {
        try {
            iPage.city = (iPage.city) ? iPage.city : 79;
            iPage.district = (iPage.district) ? iPage.district : 769;
            iPage.start_date = (iPage.start_date) ? iPage.start_date : startOfDay(Date.now()).toISOString();
            iPage.end_date = (iPage.end_date) ? iPage.end_date : addDays(Date.now(), 7).toISOString();
            iPage.step = (iPage.step) ? iPage.step : 30;
            iPage.start_time = (iPage.start_time) ? iPage.start_time : 7;
            iPage.end_time = (iPage.end_time) ? iPage.end_time : 12;
            iPage.start_minute = (iPage.start_minute) ? iPage.start_minute : 0;
            iPage.end_minute = (iPage.end_minute) ? iPage.end_minute : 0;
            iPage.timezone = (iPage.timezone) ? iPage.timezone : 7;
            const result = await this.serviceManagerService.priceOnService(lang, idService, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
