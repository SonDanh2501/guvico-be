import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DEFAULT_LANG, iPageDTO, LANGUAGE, ValidateLangPipe, GetUserByToken, getFieldsServiceCustomerDTO } from 'src/@core';
import { ServiceService } from './service.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('service')
export class ServiceController {

    constructor(private serviceService: ServiceService) { }


    @ApiTags('customer')
    @Get('service_by_group/:id')
    async getServiceByGroup(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageDTO,
        @Param("id") id: string
    ) {
        const result = await this.serviceService.getServiceByGroup(lang, iPage, id);
        return result;
    }

    @ApiTags('customer')
    @Get('get_fields_service/:id')
    async getFieldsService(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param("id") id: string,
        @Query() query: getFieldsServiceCustomerDTO
    ) {
        query.address = (query.address) ? decodeURI(query.address) : null
        const result = await this.serviceService.getFieldsService(lang, id, query);
        return result;
    }

    @ApiTags('customer')
    @Get('service/:id')
    async getDetailService(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param("id") id: string
    ) {
        const result = await this.serviceService.getDetailService(lang, id);
        return result;
    }

    // @ApiTags('customer')
    // @UseGuards(AuthGuard('jwt_customer'))
    // @Get('lastest_service')
    // async getLastestService(
    //     @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
    //     @Query() iPage: iPageDTO,
    //     @GetUserByToken() user

    // ) {
    //     const result = await this.serviceService.getLastestService(lang, iPage, user);
    //     return result;
    // }


}
