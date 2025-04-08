import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Query, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiTags } from '@nestjs/swagger'
import { subDays, subYears } from 'date-fns'
import { addCollaboratorDTOAdmin, DEFAULT_LANG, GetSubjectAction, GetUserByToken, IPageDecorator, iPageDTO, iPageJobListsDTOAdmin, iPageReportGroupOrderDTOAdmin, LANGUAGE, ValidateLangPipe } from 'src/@core'
import { cancelGroupOrderDTOAdmin, createGroupOrderDTOAdmin, createGroupOrderDTOCustomer } from 'src/@core/dto/groupOrder.dto'
import { GroupOrderSystemService2 } from 'src/core-system/@core-system/group-order-system/group-order-system.service'
import { GroupOrderSystemService } from 'src/core-system/group-order-system/group-order-system.service'
import { GroupOrderManagerService } from './group-order-manager.service'

@Controller('group-order-manager')
export class GroupOrderManagerController {
    constructor(
        private groupOrderManagerService: GroupOrderManagerService,
        private groupOrderService: GroupOrderSystemService,
        private groupOrderSystemService: GroupOrderSystemService,
        private groupOrderSystemService2: GroupOrderSystemService2

    ) { }

    @ApiTags('admin')
    @Get('get_list')
    async getListItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @IPageDecorator() iPage: iPageDTO,
    ) {
        try {
            const result = await this.groupOrderManagerService.getListItem(lang, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Get('get_list_group_order_expired')
    async getListGroupOrderExpired(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @IPageDecorator() iPage: iPageJobListsDTOAdmin
    ) {
        try {
            iPage.status = (iPage.status) ? iPage.status : "all";
            iPage.start_date = (iPage.start_date) ? iPage.start_date : subDays(new Date(Date.now()), 30).toISOString();
            iPage.end_date = (iPage.end_date) ? iPage.end_date : new Date(Date.now()).toISOString();
            const result = await this.groupOrderManagerService.getListGroupOrderExpired(lang, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }

    }


    @ApiTags('admin')
    @Get('get_detail/:id')
    async getDetailItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') id: string,
    ) {
        try {
            const result = await this.groupOrderManagerService.getDetailItem(lang, id);
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
        @Body() req: any,
        @GetUserByToken() user,
    ) {
        try {
            const result = await this.groupOrderManagerService.editItem(lang, req, id, user._id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }

    }

    @UseGuards(AuthGuard('jwt_admin'))
    @ApiTags('admin')
    @Post('calculate_fee_group_order')
    async calculateFeeGroupOrder(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() req: createGroupOrderDTOCustomer,
        @GetUserByToken() user,
        @GetSubjectAction() subjectAction
    ) {
        try {
            // const getCustomer = await this.authService.getInfoByToken(lang, user);
            // const result = await this.groupOrderService.calculateFeeGroupOrder(lang, req, 'admin');
            // return result;
            const result = await this.groupOrderSystemService2.calculateFeeGroupOrder(lang, req, subjectAction);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    // @UseGuards(AuthGuard('jwt_admin'))
    // @ApiTags('admin')
    // @Post('create')
    // async createItem(
    //     @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
    //     @Body() req: createGroupOrderDTOAdmin,
    //     @GetUserByToken() user,
    //     @IPageDecorator() iPage: iPageDTO,
    // ) {
    //     try {
    //         const result = await this.groupOrderService.createItem(lang, req, user, 0);
    //         if (req.id_collaborator && (req.id_collaborator !== "" || req.id_collaborator !== null)) {
    //             const payload = {
    //                 id_collaborator: req.id_collaborator
    //             }
    //             await this.groupOrderManagerService.addCollaborator(lang, payload, result._id, user._id);
    //         }
    //         return result;
    //     } catch (err) {
    //         console.log(err, 'err')
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    //     }
    // }

    @UseGuards(AuthGuard('jwt_admin'))
    @ApiTags('admin')
    @Post('create')
    async createItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() body: createGroupOrderDTOAdmin,
        @GetUserByToken() user,
        @IPageDecorator() iPage: iPageDTO,
        @Req() request:any
    ) {
        try {
            const subjectAction = {
                type: "admin",
                _id: user._id
            }
            const stepByStep = {
                is_calculate_fee: true,
                is_check_prmotion: true,
                is_check_wallet_customer: true,
                is_check_wallet_collaborator: (body.id_collaborator) ? true : false,
                is_create_group_order: true,
                is_create_order: true,
                is_payment_service_customer: true,
                is_minus_collaborator: (body.id_collaborator) ? true : false
            }
            const result = await this.groupOrderSystemService2.createGroupOrder(lang, subjectAction, request, stepByStep, body, user);
            return result;
        } catch (err) {
            console.log(err, 'err')
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    


    @UseGuards(AuthGuard('jwt_admin'))
    @ApiTags('admin')
    @Post('get_service_fee')
    async getServiceFee(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() req: createGroupOrderDTOCustomer,
    ) {
        try {
            // const payload = req;
            // const getCustomer = await this.authService.getInfoByToken(lang, user);
            const result = await this.groupOrderService.getServiceFee(lang, req);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('delete_group_order/:id')
    async deleteOrder(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') id: string,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.groupOrderManagerService.deleteGroupOrder(lang, id, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('change_cancel_to_done/:id')
    async changeCancelToDone(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') id: string,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.groupOrderManagerService.changeCancelToDone(lang, id, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    // @ApiTags('admin')
    // @UseGuards(AuthGuard('jwt_admin'))
    // @Post('cancel_group_order/:idGroupOrder')
    // async cancelGroupOrder(
    //     @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
    //     @Param('idGroupOrder') idGroupOrder: string,
    //     @GetUserByToken() user
    // ) {
    //     try {
    //         const result = await this.groupOrderManagerService.cancelGroupOrder(lang, idGroupOrder, user);
    //         return result;
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    //     }
    // }




    // @ApiTags('admin')
    // @UseGuards(AuthGuard('jwt_admin'))
    // @Post('cancel_group_order/:idGroupOrder')
    // async cancelGroupOrder(
    //     @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
    //     @Param('idGroupOrder') idGroupOrder: string,
    //     @GetUserByToken() user,
    //     @Body() req: cancelGroupOrderDTOAdmin
    // ) {
    //     try {
    //         const idCancel = (req.id_reason_cancel) ? req.id_reason_cancel : "";
    //         const result = await this.groupOrderSystemService.cancelGroupOrder(lang, idGroupOrder, idCancel, "admin", user);
    //         return result;
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    //     }
    // }




    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('cancel_group_order_v2_backup/:idGroupOrder')
    async cancelGroupOrderV2(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('idGroupOrder') idGroupOrder: string,
        @GetUserByToken() user,
        @Body() req: cancelGroupOrderDTOAdmin
    ) {
        try {
            const idCancel = (req.id_reason_cancel) ? req.id_reason_cancel : "";
            const result = await this.groupOrderSystemService.cancelGroupOrderV2(lang, idGroupOrder, idCancel, "admin", user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags()
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('/add_collaborator_to_order/:idGroupOrder')
    async addCollaboratorToOrder(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('idGroupOrder') idGroupOrder: string,
        @Body() req: addCollaboratorDTOAdmin,
        @GetUserByToken() user,
    ) {
        try {
            const result = await this.groupOrderManagerService.addCollaborator(lang, req, idGroupOrder, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    // xoa bo, da chuyen sang report manager
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
            const result = await this.groupOrderManagerService.reportGroupOrderV2(lang, iPage, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('/get_history_order_by_group_order/:idGroupOrder')
    async getHistoryOrderByGroupOrder(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Param('idGroupOrder') idGroupOrder: string,
        @IPageDecorator() iPage: iPageReportGroupOrderDTOAdmin,
    ) {
        try {
            iPage.start_date = iPage.start_date ? iPage.start_date : subYears(new Date(Date.now()), 3).toISOString();
            iPage.end_date = iPage.end_date ? iPage.end_date : new Date(Date.now()).toISOString();
            const result = await this.groupOrderManagerService.getHistoryOrderByGroupOrder(lang, iPage, user, idGroupOrder);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('/change_collaborator/:idGroupOrder')
    async changeCollaborator(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Param('idGroupOrder') idGroupOrder: string,
    ) {
        try {
            const result = await this.groupOrderManagerService.changeCollaboratorV2(lang, idGroupOrder, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('/unassign_collaborator/:idGroupOrder')
    async unassignCollaborator(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() admin,
        @Param('idGroupOrder') idGroupOrder: string,
    ) {
        try {
            const result = await this.groupOrderManagerService.unassignCollaborator(lang, idGroupOrder, admin);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('cancel_group_order_v2/:idGroupOrder')
    async cancelGroupOrder(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('idGroupOrder') idGroupOrder: string,
        @GetUserByToken() user,
        @Body() req: cancelGroupOrderDTOAdmin
    ) {
        try {
            const idCancel = (req.id_reason_cancel) ? req.id_reason_cancel : "";
            const result = await this.groupOrderManagerService.cancelGroupOrder(lang, user, idGroupOrder, idCancel);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    
}

