import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Query, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiTags } from '@nestjs/swagger'
import { DEFAULT_LANG, GetSubjectAction, GetUserByToken, IPageDecorator, iPageDTO, LANGUAGE, ValidateLangPipe } from 'src/@core'
import { createGroupOrderDTO, createGroupOrderDTOCustomer } from 'src/@core/dto/groupOrder.dto'
import { GroupOrderSystemService2 } from 'src/core-system/@core-system/group-order-system/group-order-system.service'
import { JobSystemService } from 'src/core-system/@core-system/job-system/job-system.service'

@Controller('group_order')
export class GroupOrderApiController {
    constructor(
        private groupOrderSystemService: GroupOrderSystemService2,
        private jobSystemService: JobSystemService
    ) {}

    @UseGuards(AuthGuard('jwt_customer'))
    @ApiTags('customer')
    @Post('calculate_fee_group_order')
    async calculateFeeGroupOrder(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() req: createGroupOrderDTOCustomer,
        @GetUserByToken() user,
        @GetSubjectAction() subjectAction
    ) {
        try {
            req.id_customer = user._id;
            const result = await this.jobSystemService.calculateFeeGroupOrder(lang, req, subjectAction);
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
        @GetSubjectAction() subjectAction,
        @Req() request: any,
    ) {
        try {
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
            const result = await this.jobSystemService.createGroupOrder(lang, subjectAction, request, stepByStep, body, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN)
        }
    }

    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
    @Post('cancel_group_order/:idGroupOrder')
    async cancelGroupOrder(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('idGroupOrder') idGroupOrder: string,
        @GetUserByToken() user,
        @Body("id_cancel") idCancel: string,
        @GetSubjectAction() subjectAction
    ) {
        try {
            const stepCancel = {
                isCancel: true,
                isRefundCustomer: true,
                isRefundCollaborator: true,
                isPunishCollaborator: false,
                isPunishCustomer: false,
                isUnassignCollaborator: false,
                isMinusNextOrderCollaborator: false
            }
            const result = await this.groupOrderSystemService.cancelGroupOrder(lang, subjectAction, idGroupOrder, idCancel, stepCancel)
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN)
        }
    }
    
    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
    @Get('get_history_group_order_by_customer')
    async getHistoryGroupOrderByCustomer(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @IPageDecorator() iPage: iPageDTO,
        @GetUserByToken() user,
        @GetSubjectAction() subjectAction
    ) {
        const result = await this.groupOrderSystemService.getGroupOrderHistoryByCustomer(user._id, iPage);
        return result;
    }
    
    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
    @Post('update_transaction_execution_date/:idGroupOrder')
    async updateTransactionExecutionDate(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('idGroupOrder') idGroupOrder: string,
    ) {
        try {
            const result = await this.groupOrderSystemService.updateTransactionExecutionDate(lang, idGroupOrder);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN)
        }
    }
    
    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
    @Get('get_infor_group_order/:idGroupOrder')
    async getInforGroupOrder(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param("idGroupOrder") idGroupOrder: string,
        @GetSubjectAction() subjectAction,
    ) {
        try {
            return await this.groupOrderSystemService.getInforGroupOrder(lang, subjectAction, idGroupOrder)
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
