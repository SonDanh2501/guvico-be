import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { createOrderDTO, DEFAULT_LANG, iPageDTO, LANGUAGE, ValidateLangPipe, GetUserByToken, tipCollaboratorDTOCustomer } from 'src/@core';
import { createGroupOrderDTOCustomer } from 'src/@core/dto/groupOrder.dto';
import { HistoryOrderSystemService } from 'src/core-system/history-order-system/history-order-system.service';
import { OrderService } from './order.service';

@Controller('order')
export class OrderController {
    constructor(
        private orderService: OrderService,
        private historyOrderSystemService: HistoryOrderSystemService,
    ) { }

    @UseGuards(AuthGuard('jwt_customer'))
    @ApiTags('customer')
    @Get('get_order_by_customer')
    async getListItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageDTO,
        @GetUserByToken() user
    ) {
        iPage.length = Number(iPage.length) || 10;
        iPage.search = iPage.search || '';
        iPage.start = Number(iPage.start) || 0;
        const result = await this.orderService.getListItem(lang, iPage, user);
        return result;
    }

    @Get('detail/:id')
    async getDetailItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') id: string,
    ) {
        const result = await this.orderService.getDetailItem(lang, id);
        return result;
    }

    // @ApiTags('customer')
    @Post('create')
    async createItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() req: createOrderDTO
    ) {
        try {
            const payload = req;
            const result = await this.orderService.createItem(lang, req);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async createOrder(lang, req) {
        try {
            const payload = req;
            const result = await this.orderService.createItem(lang, req);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
    @Get('get_last_order_for_service/:idService')
    async getLastOrderForService(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param("idService") idService: string,
        @GetUserByToken() user,
    ) {
        const result = await this.orderService.getLastOrderForService(lang, user, idService);
        return result;
    }

    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
    @Get('get_single_item_for_customer')
    async getWaitingItems(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageDTO,
        @GetUserByToken() user,
    ) {
        const result = await this.orderService.getWaitingItems(lang, user, iPage);
        return result;
    }

    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
    @Get('get_history_order_for_customer')
    async getListHistoryOrder(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageDTO,
        @GetUserByToken() user
    ) {
        iPage.length = Number(iPage.length) || 10;
        iPage.search = iPage.search || '';
        iPage.start = Number(iPage.start) || 0;
        const result = await this.orderService.getListHistoryOrder(lang, iPage, user);
        return result;
    }

    // @ApiTags('customer')
    // @UseGuards(AuthGuard('jwt_customer'))
    // @Post('/customer_cancel_order/:id')
    // async customerCancelOrder(
    //     @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
    //     @Param("id") id: string,
    //     @GetUserByToken() user,
    // ) {
    //     try {
    //         const result = await this.orderService.customerCancelOrder(lang, user, id);
    //         return result;
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    //     }
    // }



    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
    @Post('/customer_cancel_order/:idOrder')
    async cancelOrder(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param("idOrder") idOrder: string,
        @Body("id_cancel") idCancel: string,
        @GetUserByToken() user,
    ) {
        try {
            const result = await this.orderService.cancelOrder(lang, user, idOrder, idCancel);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    // @ApiTags('customer')
    // @UseGuards(AuthGuard('jwt_customer'))
    // @Post('/customer_cancel_order/:idOrder')
    // async cancelJob(
    //     @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
    //     @Param("idOrder") idOrder: string,
    //     @Body("id_cancel") idCancel: string,
    //     @GetUserByToken() user,
    // ) {
    //     try {
    //         const result = await this.orderService.cancelJob(lang, user, idOrder, idCancel);
    //         return result;
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    //     }
    // }


    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
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
            const result = await this.orderService.reasonCancel(lang, user, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
    @Get('get_infor_order/:id')
    async getInforOrder(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param("id") id: string,
        @GetUserByToken() user
    ) {
        const result = await this.orderService.getInforOrder(lang, user, id);
        return result;
    }

    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
    @Get('get_order_by_group_order/:idGroupOrder')
    async getOrderByGroupOrder(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param("idGroupOrder") idGroupOrder: string,
        @GetUserByToken() user,
        @Query() iPage: iPageDTO,
    ) {
        try {
            iPage.length = Number(iPage.length) || 10;
            iPage.search = iPage.search || '';
            iPage.start = Number(iPage.start) || 0;
            const result = await this.orderService.getOrderByGroupOrder(lang, user, idGroupOrder, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }

    }
    ////////
    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
    @Post('tip_collaborator/:idOrder')
    async tipCollaborator(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param("idOrder") idOrder: string,
        @GetUserByToken() user,
        @Body() req: tipCollaboratorDTOCustomer,
    ) {
        try {
            const result = await this.orderService.tipCollaborator(lang, user, idOrder, req);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }

    }
    ////////
    ////////
    ////////

}
