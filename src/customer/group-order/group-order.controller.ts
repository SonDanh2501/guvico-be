import { Body, Controller, Get, Headers, HttpException, HttpStatus, Param, Post, Query, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiTags } from '@nestjs/swagger'
import { DEFAULT_LANG, GetSubjectAction, GetUserByToken, LANGUAGE, ValidateLangPipe, iPageDTO, iPageHistoryGroupOrderDTOCustomer } from 'src/@core'
import { createGroupOrderDTO, createGroupOrderDTOCustomer } from 'src/@core/dto/groupOrder.dto'
import { GroupOrderSystemService2 } from 'src/core-system/@core-system/group-order-system/group-order-system.service'
import { GroupOrderSystemService } from 'src/core-system/group-order-system/group-order-system.service'
import { HistoryOrderSystemService } from 'src/core-system/history-order-system/history-order-system.service'
import { AuthService } from '../auth/auth.service'
import { PromotionService } from '../promotion/promotion.service'
import { GroupOrderService } from './group-order.service'

@Controller('group_order')
export class GroupOrderController {
    constructor(
        private authService: AuthService,
        private groupOrderService: GroupOrderService,
        private groupOrderSystemService: GroupOrderSystemService,
        private promotionService: PromotionService,
        private historyOrderSystemService: HistoryOrderSystemService,
        private groupOrderSystemService2: GroupOrderSystemService2
        // @InjectQueue('create_order') private readonly createOrderQueueService: Queue,
    ) { }

    @UseGuards(AuthGuard('jwt_customer'))
    @ApiTags('customer')
    @Post('calculate_fee_group_order')
    async calculateFeeGroupOrder(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() req: createGroupOrderDTO,
        @GetUserByToken() user,
        @GetSubjectAction() subjectAction,
    ) {
        try {
            req.id_customer = user._id
            const result = await this.groupOrderSystemService2.calculateFeeGroupOrder(lang, req, subjectAction);
            // const result = await this.groupOrderSystemService.calculateFeeGroupOrder(lang, req);

            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN)
        }
    }

    @UseGuards(AuthGuard('jwt_customer'))
    @ApiTags('customer')
    @Post('create')
    async createItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() body: createGroupOrderDTO,
        @GetUserByToken() user,
        @Query() iPage: iPageDTO,
        @Req() request: any,
    ) {
        try {
            const subjectAction = {
                type: "customer",
                _id: user._id
            }
            const stepByStep = {
                is_calculate_fee: true,
                is_check_promotion: true,
                is_check_wallet_customer: true,
                is_check_wallet_collaborator: false,
                is_create_group_order: true,
                is_create_order: true,
                is_payment_service_customer: true,
                is_minus_collaborator: false
            }
            body.id_customer = user._id

            const result = await this.groupOrderSystemService2.createGroupOrder(lang, subjectAction, request, stepByStep, body, user);
            return result;
            // const result = await this.groupOrderService.createItem(lang, req, user, headers.version.toString());
            // return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN)
        }
    }

    @UseGuards(AuthGuard('jwt_customer'))
    @ApiTags('customer')
    @Post('create_with_queue')
    async createWithQueue(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() req: createGroupOrderDTOCustomer,
        @GetUserByToken() user,
        @Query() iPage: iPageDTO,
        @Headers() headers
    ) {
        try {
            req.id_customer = user._id;
            const infoJob = await this.groupOrderSystemService.calculateFeeGroupOrder(lang, req);
            const checkBalance = await this.groupOrderSystemService.checkBalanceCustomer(lang, infoJob, user);
            const payload = {
                lang,
                req,
                admin: null,
                headers: headers.version.toString(),
                infoJob: infoJob
            }
            // const result = await this.createOrderQueueService.add("customer", payload)
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN)
        }
    }

    @UseGuards(AuthGuard('jwt_customer'))
    @ApiTags('customer')
    @Get('get_last_group_order_on_queue')
    async getLastGroupOrderOnQueue(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Query("timestamp") timestamp: number,
    ) {
        try {
            const result = await this.groupOrderService.getLastGroupOrderOnQueue(lang, timestamp, user)
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN)
        }
    }

    @UseGuards(AuthGuard('jwt_customer'))
    @ApiTags('customer')
    @Post('get_service_fee')
    async getServiceFee(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() req: createGroupOrderDTOCustomer,
        @GetUserByToken() user
    ) {
        try {
            const getCustomer = await this.authService.getInfoByToken(lang, user);
            const result = await this.groupOrderService.getServiceFee(lang, req, getCustomer);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN)
        }
    }

    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
    @Get('get_loop_item_for_customer')
    async getLoopItems(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageDTO,
        @GetUserByToken() user,
    ) {
        try {
            iPage.length = Number(iPage.length) || 10;
            iPage.search = iPage.search || '';
            iPage.start = Number(iPage.start) || 0;
            const result = await this.groupOrderService.getLoopItems(lang, user, iPage,);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN)
        }
    }


    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
    @Get('get_schedule_item_for_customer')
    async getScheduleItems(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageDTO,
        @GetUserByToken() user,
    ) {
        try {
            iPage.length = Number(iPage.length) || 10;
            iPage.search = iPage.search || '';
            iPage.start = Number(iPage.start) || 0;
            const result = await this.groupOrderService.getScheduleItems(lang, user, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN)
        }
    }
    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
    @Get('get_default_address')
    async setDefaultAddress(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
    ) {
        try {
            const result = await this.groupOrderService.setDefaultAddress(lang, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN)
        }
    }

    @UseGuards(AuthGuard('jwt_customer'))
    @Get('/get_list_item')
    async getListItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageDTO,
        @GetUserByToken() user,
    ) {
        try {
            // console.log(user, 'check user ')
            iPage.length = Number(iPage.length) || 10;
            iPage.search = iPage.search || '';
            iPage.start = Number(iPage.start) || 0;
            const result = await this.groupOrderService.getListItem(lang, iPage, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN)
        }
    }

    @Get('/get_last_item')
    async getLastItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
    ) {
        try {
            const result = await this.groupOrderService.getLastItem(lang);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN)
        }
    }

    // @ApiTags('customer')
    // @UseGuards(AuthGuard('jwt_customer'))
    // @Post('/cancel_group_order/:idGroupOrder')
    // async cancelGroupOrder(
    //     @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
    //     @Param("idGroupOrder") idGroupOrder: string,
    //     @Body("id_cancel") idCancel: string,
    //     @GetUserByToken() user,
    // ) {
    //     const result = await this.groupOrderService.cancelGroupOrder(lang, idGroupOrder, idCancel, user);
    //     return result;
    // }

    @UseGuards(AuthGuard('jwt_customer'))
    @Get('get_group_order_by_order/:idOrder')
    async getGroupOrderByOrder(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('idOrder') idOrder: string,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.groupOrderService.getGroupOrderByOrder(lang, idOrder, user._id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN)
        }
    }

    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
    @Get('get_infor_group_order/:id')
    async getInforGroupOrder(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param("id") id: string,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.groupOrderService.getInforGroupOrder(lang, user, id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN)
        }
    }


    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
    @Get('get_last_group_order')
    async getLastGroupOrder(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
    ) {
        try {
            const result = await this.groupOrderService.getLastGroupOrder(lang, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN)
        }
    }

    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
    @Get('get_last_group_order_for_service/:idService')
    async getLastOrderForService(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param("idService") idService: string,
        @GetUserByToken() user,
    ) {
        try {
            const result = await this.groupOrderService.getLastGroupOrderForService(lang, user, idService);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN)
        }
    }

    // backup
    // @ApiTags('customer')
    // @UseGuards(AuthGuard('jwt_customer'))
    // @Post('cancel_group_order_v2/:idGroupOrder')
    // async cancelGroupOrderV2(
    //     @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
    //     @Param('idGroupOrder') idGroupOrder: string,
    //     @GetUserByToken() user,
    //     @Body("id_cancel") idCancel: string,
    // ) {
    //     try {
    //         const result = await this.groupOrderSystemService.cancelGroupOrderV2(lang, idGroupOrder, idCancel, 'customer', user);
    //         return result;
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN)
    //     }
    // }
    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
    @Get('get_history_group_order_for_customer')
    async getListHistoryOrder(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageHistoryGroupOrderDTOCustomer,
        @GetUserByToken() user
    ) {
        try {
            iPage.length = Number(iPage.length) ? iPage.length : 10;
            iPage.start = Number(iPage.start) ? iPage.start : 0;
            iPage.type = iPage.type ? iPage.type : 'loop'
            const result = await this.groupOrderService.getListHistoryGroupOrder(lang, iPage, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN)
        }
    }


    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
    @Post('cancel_group_order_v2/:idGroupOrder')
    async cancelGroupOrder(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('idGroupOrder') idGroupOrder: string,
        @GetUserByToken() user,
        @Body("id_cancel") idCancel: string,
    ) {
        try {
            const result = await this.groupOrderService.cancelGroupOrder(lang, idGroupOrder, idCancel, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN)
        }
    }
}
