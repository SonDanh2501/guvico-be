import { Controller, Post, Query, Body, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { RequestService } from './request.service';
import { ValidateLangPipe } from '../../@core/pipe/validate-lang.pipe';
import { DEFAULT_LANG, LANGUAGE } from '../../@core/constant/constant';
import { ApiTags } from '@nestjs/swagger';
import { createCustomerRequestDTOCustomer, GetUserByToken } from 'src/@core';
import { AuthGuard } from '@nestjs/passport';

@Controller('request')
export class RequestController {
    constructor(
        private requestService: RequestService
    ) { }

    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
    @Post('/create_item')
    async createItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() req: createCustomerRequestDTOCustomer,
        @GetUserByToken() user
    ) {
        try {
            const result = this.requestService.createItem(lang, req, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);

        }
    }
}
