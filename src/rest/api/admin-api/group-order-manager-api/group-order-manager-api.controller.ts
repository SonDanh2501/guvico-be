import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Query, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiTags } from '@nestjs/swagger'
import { DEFAULT_LANG, GetSubjectAction, GetUserByToken, IPageDecorator, iPageDTO, LANGUAGE, ValidateLangPipe } from 'src/@core'
import { createGroupOrderDTO } from 'src/@core/dto/groupOrder.dto'
import { GroupOrderSystemService2 } from 'src/core-system/@core-system/group-order-system/group-order-system.service'
import { HistoryActivitySystemService } from 'src/core-system/@core-system/history-activity-system/history-activity-system.service'
import { JobSystemService } from 'src/core-system/@core-system/job-system/job-system.service'

@Controller('group_order_manager')
export class GroupOrderManagerApiController {
    constructor(
        // private coreSystemService: CoreSystemService,
        private groupOrderSystemService: GroupOrderSystemService2,
        private historyActivitySystemService: HistoryActivitySystemService,

        private jobSystemService: JobSystemService

    ){}


    @UseGuards(AuthGuard('jwt_admin'))
    @ApiTags('admin')
    @Post('unassign_collaborator/:idGroupOrder')
    async unassignCollaborator(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body("is_punish_collaborator") is_punish_collaborator: boolean,
        @Param('idGroupOrder') idGroupOrder: string,
        @GetUserByToken() user,
    ) {
        try {
            const stepCancel = {
                isCancel: false,
                isRefundCustomer: false,
                isRefundCollaborator: true,
                isPunishCollaborator: is_punish_collaborator || false,
                isPunishCustomer: false,
                isUnassignCollaborator: true,
                isMinusNextOrderCollaborator: false
            }
            // const subjectAction = user._id.toString()
            const subjectAction = {
                _id: user._id.toString(),
                type: "admin"
            }
            // const result = await this.coreSystemService.cancelGroupOrder(lang, subjectAction, idGroupOrder, null, stepCancel)
            const result = await this.groupOrderSystemService.cancelGroupOrder(lang, subjectAction, idGroupOrder, null, stepCancel)

            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN)
        }
    }

    @UseGuards(AuthGuard('jwt_admin'))
    @ApiTags('admin')
    @Get('get_history_activity_for_group_order/:idGroupOrder')
    async getHistoryActivityForGroupOrder(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageDTO,
        @Param('idGroupOrder') idGroupOrder: string,
        @GetUserByToken() user,
    ) {
        try {
            const result = await this.groupOrderSystemService.getHistoryActivityGroupOrder(idGroupOrder, iPage)
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN)
        }
    }


    @UseGuards(AuthGuard('jwt_admin'))
    @ApiTags('admin')
    @Post('calculate_fee_group_order')
    async calculateFeeGroupOrder(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() req: createGroupOrderDTO,
        @GetUserByToken() user,
        @GetSubjectAction() subjectAction
    ) {
        try {
            const result = await this.jobSystemService.calculateFeeGroupOrder(lang, req, subjectAction);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @UseGuards(AuthGuard('jwt_admin'))
    @ApiTags('admin')
    @Post('create')
    async createItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() body: createGroupOrderDTO,
        @GetUserByToken() user,
        @Req() request: any,
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
            const result = await this.jobSystemService.createGroupOrder(lang, subjectAction, request, stepByStep, body, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    @UseGuards(AuthGuard('jwt_admin'))
    @ApiTags('admin')
    @Get('get_group_order_by_customer/:idCustomer')
    async getGroupOrderByCustomer(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @IPageDecorator() iPage: iPageDTO,
        @Param('idCustomer') idCustomer: string,
        @GetUserByToken() user,
    ) {
        try {
            const result = await this.groupOrderSystemService.getGroupOrderByCustomer(idCustomer, iPage)
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN)
        }
    }


        @ApiTags('admin')
        @UseGuards(AuthGuard('jwt_admin'))
        @Get('/get_history_order_by_group_order/:idGroupOrder')
        async getHistoryOrderByGroupOrder(
            @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
            @GetSubjectAction() subjectAction,
            @Param('idGroupOrder') idGroupOrder: string,
            @IPageDecorator() iPage: iPageDTO,
        ) {
            try {
                const result = await this.historyActivitySystemService.getListHistoryActivitiesForGroupOrder(lang, iPage, subjectAction, idGroupOrder);
                return result;
            } catch (err) {
                throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
            }
        }
}
