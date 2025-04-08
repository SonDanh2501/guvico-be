import { Controller, Get, Param, Post, Query, UseGuards, Body, HttpException, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { DEFAULT_LANG, iPageDTO, LANGUAGE, ValidateLangPipe, verifyCustomerTransDTOAdmin, WithDrawMoneyCustomerDTOAdmin, deleteCustomerTransDTOAdmin, editCustomerTransDTOAdmin, lockCustomerDTOAdmin, TranferMoneyCustomerDTOAdmin, createCustomerDTOAdmin, editCustomerDTOAdmin, deleteCustomerDTOAdmin, actiCustomerDTOAdmin, GetUserByToken, iPageGetCustomerByTypeDTOAdmin, editPointAndRankPointCustomerDTOAdmin, iPageGetTotalCustomerDTOAdmin, iPageGetHistoryPointCustomerDTOAdmin, iPageTransferCollaboratorDTOAdmin, createTopUpPointCustomerDTOAdmin, iPageCustomerPointDTOAdmin, editInforDTOCustomer, iPageCustomerScoreDTOAdmin, iPageReportCustomerDTOAdmin, setIsStaffDTOAdmin, createAddressCustomerDTOAdmin, IPageDecorator } from 'src/@core';
import { CustomerManagerService } from './customer-manager.service';
import { iPageGetCollaboratorByTypeDTOAdmin } from '../../@core/dto/collaborator.dto';
import { endOfDay, endOfYear, startOfDay, startOfMonth, startOfYear, subDays } from 'date-fns';
import { CustomerRepositoryService } from 'src/@repositories/repository-service/customer-repository/customer-repository.service';

@Controller('customer_manager')
export class CustomerManagerController {
    constructor(
        private customerManagerService: CustomerManagerService,
        private customerRepositoryService: CustomerRepositoryService
    ) { }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('get_list')
    async getListItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageDTO,
        @GetUserByToken() user
    ) {
        try {
            iPage.length = Number(iPage.length) || 10;
            iPage.search = decodeURI(iPage.search || "");
            iPage.start = Number(iPage.start) || 0;
            const result = await this.customerManagerService.getListItem(lang, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('/get_detail/:id')
    async getDetailItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param("id") id: string,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.customerManagerService.getDetailItem(lang, id, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Post('/create_item')
    @UseGuards(AuthGuard('jwt_admin'))
    async adminCreateItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() req: createCustomerDTOAdmin,
        @GetUserByToken() user
    ) {
        try {
            const payload = req;
            payload.date_create = new Date().toISOString();
            payload.email = (payload.email) ? payload.email : "";
            const result = await this.customerManagerService.adminCreateItem(lang, payload, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Post('edit_item/:id')
    @UseGuards(AuthGuard('jwt_admin'))
    async adminEditItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') id: string,
        @Body() req: editCustomerDTOAdmin,
        @GetUserByToken() user
    ) {
        try {
            req.birthday = req.birthday ? req.birthday : null;
            const result = await this.customerManagerService.adminEditItem(lang, req, id, user._id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Post('acti_item/:id')
    @UseGuards(AuthGuard('jwt_admin'))
    async adminActiCustomer(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') id: string,
        @Body() req: actiCustomerDTOAdmin,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.customerManagerService.adminActiCustomer(lang, req, id, user._id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('delete_item/:id')
    @UseGuards(AuthGuard('jwt_admin'))
    async adminDeleteCustomer(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') id: string,
        @Body() req: deleteCustomerDTOAdmin,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.customerManagerService.adminDeleteCustomer(lang, req, id, user._id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('lock_item/:id')
    @UseGuards(AuthGuard('jwt_admin'))
    async adminLockCustomer(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') id: string,
        @Body() req: lockCustomerDTOAdmin,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.customerManagerService.adminLockCustomer(lang, req, id, user._id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }

    }


    @ApiTags('admin')
    @Post('top_up/:idCustomer')
    @UseGuards(AuthGuard('jwt_admin'))
    async topupAccount(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('idCustomer') idCustomer: string,
        @Body() req: TranferMoneyCustomerDTOAdmin,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.customerManagerService.topupAccountCustomer(lang, idCustomer, req, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('withdraw/:idCustomer')
    async withdrawAccount(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('idCustomer') idCustomer: string,
        @Body() req: WithDrawMoneyCustomerDTOAdmin,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.customerManagerService.withdrawAccountCustomer(lang, req, idCustomer, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }

    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('cancel_transition/:idTransition')
    async cancelTransition(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('idTransition') idTransition: string,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.customerManagerService.cancelTransition(lang, idTransition, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }

    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('/get_list_transitions')
    async getListTransitions(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageTransferCollaboratorDTOAdmin,
        @GetUserByToken() user
    ) {
        try {
            iPage.length = Number(iPage.length) || 10;
            iPage.search = decodeURI(iPage.search || "");
            iPage.start = Number(iPage.start) || 0;
            const result = await this.customerManagerService.getListTransitionsCustomerV2(lang, iPage, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }

    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('delete_trans/:id')
    @UseGuards(AuthGuard('jwt_admin'))
    async adminDeleteCustomerTrans(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') id: string,
        @Body() req: deleteCustomerTransDTOAdmin,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.customerManagerService.adminDeleteCustomerTrans(lang, req, id, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    @ApiTags('admin')
    @Post('verify_trans/:id')
    @UseGuards(AuthGuard('jwt_admin'))
    async adminVerifyCustomerTrans(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') id: string,
        @Body() req: verifyCustomerTransDTOAdmin,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.customerManagerService.adminVerifyCustomerTrans(lang, req, id, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    // @ApiTags('admin')
    // @UseGuards(AuthGuard('jwt_admin'))
    // @Post('edit_trans/:id')
    // async adminEditCustomerTrans(
    //     @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
    //     @Param('id') id: string,
    //     @Body() req: editCustomerTransDTOAdmin,
    //     @GetUserByToken() user
    // ) {
    //     try {
    //         const result = await this.customerManagerService.adminEditCustomerTrans(lang, req, id, user._id);
    //         // console.log('check result', result);
    //         return result;
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    //     }
    // }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('/get_total_order/:id')
    async getTotalOrder(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param("id") id: string
    ) {
        try {
            const result = await this.customerManagerService.getTotalOrder(lang, id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('/get_lastest_gr_order/:id')
    async getLastedGrOrder(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param("id") id: string
    ) {
        try {
            const result = await this.customerManagerService.getLastedGrOrder(lang, id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('get_customer_by_type')
    async getCustomerByType(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Query() iPage: iPageGetCustomerByTypeDTOAdmin,
    ) {
        try {
            iPage.length = Number(iPage.length) || 20;
            iPage.search = iPage.search || "";
            iPage.start = Number(iPage.start) || 0;
            iPage.customer_type = (iPage.customer_type) ? iPage.customer_type : 'all';
            iPage.id_group_customer = (iPage.id_group_customer) ? iPage.id_group_customer : 'all';
            iPage.valueSort = iPage.valueSort ? iPage.valueSort : 'date_create';
            iPage.typeSort = iPage.typeSort ? iPage.typeSort : '-1';
            const result = await this.customerManagerService.getCustomerByTypeV2(lang, iPage, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('get_customer_by_reputation')
    async getCustomerByReputation(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Query() iPage: iPageCustomerScoreDTOAdmin,
    ) {
        try {
            iPage.length = Number(iPage.length) || 20;
            iPage.search = iPage.search || "";
            iPage.start = Number(iPage.start) || 0;
            iPage.start_point = Number(iPage.start_point) ? iPage.start_point : 0
            iPage.end_point = Number(iPage.end_point) ? iPage.end_point : 100
            const result = await this.customerManagerService.getCustomerByReputation(lang, iPage, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('/edit_point_and_rank_point/:id')
    async editPointAndRankPoint(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Param('id') id: string,
        @Body() req: editPointAndRankPointCustomerDTOAdmin
    ) {
        try {
            // const result = await this.customerManagerService.editPointAndRankPoint(lang, id, user._id, req)
            // return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('total_customer')
    async totalCustomer(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Query() iPage: iPageGetTotalCustomerDTOAdmin,// hỏi lại a đạt
    ) {
        try {
            iPage.start_date = (iPage.start_date) ? iPage.start_date : startOfDay(new Date(Date.now())).toISOString();
            iPage.end_date = (iPage.end_date) ? iPage.end_date : endOfDay(new Date(Date.now())).toISOString();
            const result = await this.customerManagerService.totalCustomer(lang, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('total_customer_monthly/:year')
    async totalCustomerMonthly(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Param('year') year: number,// hỏi lại a đạt
    ) {
        try {
            const result = await this.customerManagerService.totalCustomerMonthly(lang, year);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('total_customer_dayly')
    async totalCustomerDayly(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Query() iPage: iPageGetTotalCustomerDTOAdmin,// hỏi lại a đạt
    ) {
        try {
            iPage.start_date = (iPage.start_date) ? iPage.start_date : startOfDay(new Date(Date.now())).toISOString();
            iPage.end_date = (iPage.end_date) ? iPage.end_date : endOfDay(new Date(Date.now())).toISOString();
            const result = await this.customerManagerService.totalCustomerDayly(lang, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('detail_total_customer_daily')
    async detailTotalCustomerDayly(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Query() iPage: iPageGetTotalCustomerDTOAdmin,// hỏi lại a đạt
    ) {
        try {
            iPage.start = (iPage.start) ? iPage.start : 0;
            iPage.length = (iPage.length) ? iPage.length : 20;
            iPage.start_date = (iPage.start_date) ? iPage.start_date : startOfDay(new Date(Date.now())).toISOString();
            iPage.end_date = (iPage.end_date) ? iPage.end_date : endOfDay(new Date(Date.now())).toISOString();
            const result = await this.customerManagerService.detailTotalCustomerDayly(lang, iPage);
            return result
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('get_history_activity_customer/:idCustomer')
    async getHistoryActivityCustomer(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Query() iPage: iPageGetHistoryPointCustomerDTOAdmin,
        @Param('idCustomer') idCustomer: string,
    ) {
        try {
            // iPage.start_date = (iPage.start_date) ? iPage.start_date : subDays(new Date(Date.now()), 30).toISOString();
            // iPage.end_date = (iPage.end_date) ? iPage.end_date : endOfDay(new Date(Date.now())).toISOString();
            iPage.start = (iPage.start) ? iPage.start : 0;
            iPage.length = (iPage.length) ? iPage.length : 20;
            const result = await this.customerManagerService.getHistoryActivityCustomer(lang, iPage, idCustomer, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('get_history_points_customer/:idCustomer')
    async getHistoryPointsCustomer(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Query() iPage: iPageGetHistoryPointCustomerDTOAdmin,
        @Param('idCustomer') idCustomer: string,
    ) {
        try {
            iPage.start_date = (iPage.start_date) ? iPage.start_date : subDays(new Date(Date.now()), 30).toISOString();
            iPage.end_date = (iPage.end_date) ? iPage.end_date : endOfDay(new Date(Date.now())).toISOString();
            iPage.start = (iPage.start) ? iPage.start : 0;
            iPage.length = (iPage.length) ? iPage.length : 20;
            const result = await this.customerManagerService.getHistoryPointsCustomer(lang, iPage, idCustomer, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    //không xài 
    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('top_up_point_customer/:idCustomer')
    async topUpPointCustomer(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Body() req: createTopUpPointCustomerDTOAdmin,
        @Param('idCustomer') idCustomer: string,
    ) {
        try {
            const result = await this.customerManagerService.topUpPointCustomer(lang, req, idCustomer, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    //không xài 
    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('verify_point_customer/:idTransitionPoint')
    async verifyPointCustomer(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Param('idTransitionPoint') idTransitionPoint: string,
    ) {
        try {
            const result = await this.customerManagerService.verifyPointCustomer(lang, idTransitionPoint, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    //không xài 
    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('cancel_point_customer/:idTransitionPoint')
    async cancelPointCustomer(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Param('idTransitionPoint') idTransitionPoint: string,
    ) {
        try {
            const result = await this.customerManagerService.cancelPointCustomer(lang, idTransitionPoint, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    //không xài 
    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('delete_point_customer/:idTransitionPoint')
    async deletePointCustomer(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Param('idTransitionPoint') idTransitionPoint: string,
    ) {
        try {
            const result = await this.customerManagerService.deletePointCustomer(lang, idTransitionPoint, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('get_list_transition_point_customer')
    async getListTransitionPointCustomer(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Query() iPage: iPageCustomerPointDTOAdmin // cần làm lại 
    ) {
        try {
            iPage.start_date = (iPage.start_date) ? iPage.start_date : "2020-03-25T02:55:03.892Z";
            iPage.end_date = (iPage.end_date) ? iPage.end_date : endOfDay(new Date(Date.now())).toISOString();
            iPage.start = (iPage.start) ? iPage.start : 0;
            iPage.length = (iPage.length) ? iPage.length : 20;
            iPage.status = (iPage.status) ? iPage.status : "all";
            iPage.verify = (iPage.verify) ? iPage.verify : "all";
            iPage.search = decodeURI(iPage.search || "");
            iPage.type_point = (iPage.type_point) ? iPage.type_point : "all";
            const result = await this.customerManagerService.getListTransitionPointCustomer(lang, iPage, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('get_detail_transition_point_customer/:idTransitionPoint')
    async getDetailTransitionPointCustomer(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Param('idTransitionPoint') idTransitionPoint: string,
    ) {
        try {
            const result = await this.customerManagerService.getDetailTransitionPointCustomer(lang, idTransitionPoint, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('get_address_by_customer/:idCustomer')
    async getAddressHistoryCustomer(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageDTO,
        @GetUserByToken() user,
        @Param('idCustomer') idCustomer: string
    ) {
        try {
            iPage.length = Number(iPage.length) || 10;
            iPage.search = decodeURI(iPage.search || "");
            iPage.start = Number(iPage.start) || 0;
            const result = await this.customerManagerService.getAddresByCustomer(lang, idCustomer, iPage, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('create_address_for_customer/:idCustomer')
    async createAddressForCustomer(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() req: createAddressCustomerDTOAdmin,
        @GetUserByToken() user,
        @Param('idCustomer') idCustomer: string
    ) {
        try {
            console.log('do day');

            const result = await this.customerManagerService.createAddressForCustomer(lang, idCustomer, req, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('report_total_top_up')
    async totalTopUpWithdraw(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageReportCustomerDTOAdmin,
        @GetUserByToken() user
    ) {
        try {
            iPage.start_date = (iPage.start_date) ? iPage.start_date : startOfMonth(new Date(Date.now())).toISOString();
            iPage.end_date = (iPage.end_date) ? iPage.end_date : endOfDay(new Date(Date.now())).toISOString();
            iPage.start = (iPage.start) ? iPage.start : 0;
            iPage.length = (iPage.length) ? iPage.length : 20;
            iPage.search = decodeURI(iPage.search || "");
            const result = await this.customerManagerService.reportTotalTopup(lang, iPage, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('get_invite_customer/:idCustomer')
    async getInviteCustomer(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageDTO,
        @GetUserByToken() user,
        @Param('idCustomer') idCustomer: string
    ) {
        try {
            iPage.length = Number(iPage.length) || 10;
            iPage.search = decodeURI(iPage.search || "");
            iPage.start = Number(iPage.start) || 0;
            const result = await this.customerManagerService.getInviteCustomer(lang, idCustomer, iPage, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    // @ApiTags('admin')
    // @UseGuards(AuthGuard('jwt_admin'))
    // @Get('get_address_by_customer/:id_user')
    // async getAdressByCustomer(
    //     @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
    //     @Query()iPage: iPageDTO,
    //     @GetUserByToken() user,
    //     @Param('id_user') idCustomer: string
    // ) {
    //     try {
    //         iPage.length = Number(iPage.length) || 10;
    //         iPage.search = decodeURI(iPage.search || "");
    //         iPage.start = Number(iPage.start) || 0;
    //         const result = await this.customerManagerService.getAdressByCustomer(lang, idCustomer, iPage);
    //         return result;
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    //     }
    // }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('search_customer')
    async searchCustomer(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageDTO,
        @GetUserByToken() user
    ) {
        try {
            iPage.length = Number(iPage.length) || 10;
            iPage.search = decodeURI(iPage.search || "");
            iPage.start = Number(iPage.start) || 0;
            const result = await this.customerManagerService.searchCustomer(lang, iPage, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('add_favourite_collaborator/:idCustomer')
    async addFavouriteCollaborator(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param("idCustomer") idCustomer: string,
        @Query('id_collaborator') id_collaborator: string,
    ) {
        try {
            const result = await this.customerManagerService.addFavouriteCollaborator(lang, id_collaborator, idCustomer);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('unfavourite_collaborator/:idCustomer')
    async unFavouriteCollaborator(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param("idCustomer") idCustomer: string,
        @Query('id_collaborator') id_collaborator: string,
    ) {
        try {
            const result = await this.customerManagerService.unFavouriteCollaborator(lang, id_collaborator, idCustomer);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('block_collaborator/:idCustomer')
    async blockCollaborator(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param("idCustomer") idCustomer: string,
        @Query('id_collaborator') id_collaborator: string,
    ) {
        try {
            const result = await this.customerManagerService.blockCollaborator(lang, id_collaborator, idCustomer);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('unblock_collaborator/:idCustomer')
    async unblockCollaborator(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param("idCustomer") idCustomer: string,
        @Query('id_collaborator') id_collaborator: string,
    ) {
        try {
            const result = await this.customerManagerService.unblockCollaborator(lang, id_collaborator, idCustomer);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('get_used_promotion_by_customer/:idCustomer')
    async getUsedPromotionByCustomer(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param("idCustomer") idCustomer: string,
        @Query() iPage: iPageReportCustomerDTOAdmin
    ) {
        try {
            const result = await this.customerManagerService.getUsedPromotionByCustomer(lang, iPage, idCustomer);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('get_customer_review/:idCustomer')
    async getCustomerReview(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param("idCustomer") idCustomer: string,
        @Query() iPage: iPageDTO
    ) {
        try {
            const result = await this.customerManagerService.getCustomerReview(lang, iPage, idCustomer);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }



    // @ApiTags('admin')
    // @UseGuards(AuthGuard('jwt_admin'))
    // @Get('get_list_test')
    // async testList(
    //     @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
    //     @GetUserByToken() user
    // ) {
    //     try {
    //         const result = await this.customerRepositoryService.find();
    //         return result;
    //         // return true;
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    //     }
    // }

    // @ApiTags('admin')
    // @UseGuards(AuthGuard('jwt_admin'))
    // @Get('get_list_test_no_cache')
    // async testListNoCache(
    //     @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
    //     @GetUserByToken() user
    // ) {
    //     try {
    //         const result = await this.customerRepositoryService.findNoCache();
    //         return result;
    //         // return true;
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    //     }
    // }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('set_is_staff/:idCustomer')
    async setIsStaff(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Param('idCustomer') idCustomer,
        @Body() req: setIsStaffDTOAdmin
    ) {
        try {
            const result = await this.customerManagerService.setIsStaff(lang, idCustomer, req, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Get('test_repo/:idCustomer')
    async testRepo(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('idCustomer') idCustomer,
    ) {
        try {
            const result = await this.customerRepositoryService.findOneById(idCustomer);
            return result;
            // return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    @ApiTags('admin')
    @Get('get_list_test')
    async testList(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @IPageDecorator() iPage: iPageDTO
    ) {
        try {

            const result = await this.customerManagerService.testList(iPage);
            return result;
            // return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
