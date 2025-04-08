import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiTags } from '@nestjs/swagger'
import { addCollaboratorDTOAdmin, changeStatusOrderDTOAdmin, DEFAULT_LANG, GetSubjectAction, LANGUAGE, ValidateLangPipe } from 'src/@core'
import { JobSystemService } from 'src/core-system/@core-system/job-system/job-system.service'
// import { CoreSystemService } from 'src/core-system/@core-system/core-system.service';

@Controller('order_manager')
export class OrderManagerApiController {
    constructor(
        // private coreSystemService: CoreSystemService
        private jobSystemService: JobSystemService
    ){}

    // @UseGuards(AuthGuard('jwt_admin'))
    // @ApiTags('customer')
    // @Post('calculate_fee_group_order')
    // async calculateFeeGroupOrder(
    //     @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
    //     @Body() req: createGroupOrderDTOCustomer,
    //     @GetUserByToken() user,
    // ) {
    //     try {

    //         const result = await this.coreSystemService.cancelOrder(lang, req);
    //         return result;
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN)
    //     }
    // }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('/pending_to_confirm/:idOrder')
    async pendingToConfirmByAdmin(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('idOrder') idOrder:string,
        @Body() body: { idCollaborator:string },
        @GetSubjectAction() subjectAction
    ) {
        try {
            const idCollaborator = body.idCollaborator
            const result = await this.jobSystemService.pendingToConfirm(lang, subjectAction, idOrder, idCollaborator)
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('/confirm_to_doing/:idOrder')
    async confirmToDoingByAdmin(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('idOrder') idOrder:string,
        @Body() body: {idCollaborator:string},
        @GetSubjectAction() subjectAction,
    ) {
        try {
            const result = await this.jobSystemService.confirmToDoing(lang, idOrder, body.idCollaborator, subjectAction)
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('/doing_to_done/:idOrder')
    async doingToDoneByAdmin(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('idOrder') idOrder:string,
        @Body() body: {idCollaborator:string},
        @GetSubjectAction() subjectAction,
    ) {
        try {
            const result = await this.jobSystemService.doingToDone(lang, idOrder, body.idCollaborator, subjectAction)
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }



    @ApiTags()
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('/add_collaborator_to_order/:idOrder')
    async addCollaboratorToOrder(
         @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
         @Param('idOrder') idOrder: string,
         @Body() req: addCollaboratorDTOAdmin,
         @GetSubjectAction() subjectAction
    ) {
         try {
              const result = await this.jobSystemService.addCollaboratorByOrder(lang, subjectAction, idOrder, req);
              return result;
         } catch (err) {
              throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
         }
    }

    @ApiTags()
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('/change_collaborator/:idOrder')
    async changeCollaborator(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('idOrder') idOrder: string,
        @Body() req: { id_collaborator: string },
        @GetSubjectAction() subjectAction
    ) {
        try {
            const result = await this.jobSystemService.changeCollaborator(lang, subjectAction, idOrder, req.id_collaborator);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    // ------------ testing --------------

    @ApiTags('admin')
    // @UseGuards(AuthGuard('jwt_admin'))
    @Get('/test_push_noti')
    async testPushNoti(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query('fcm_token') fcmToken: string,
        // @Param('idChanel') idChanel: string

        // @GetSubjectAction() subjectAction,
    ) {
        try {
            const result = await this.jobSystemService.testPushNoti(fcmToken)
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('/change_status_order/:id')
    async changeStatusOrder(
         @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
         @Param('id') idOrder: string,
         @Body() req: changeStatusOrderDTOAdmin,
         @GetSubjectAction() subjectAction
    ) {
         try {
              const id_reason_cancel = req.id_reason_cancel
              const result = await this.jobSystemService.changeStatusOrder(lang, subjectAction, idOrder, req, req.id_reason_cancel);
              return result;
         } catch (err) {
              throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
         }
    }


    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('/update_address_for_order/:idOrder')
    async updateAddressForOrder(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('idOrder') idOrder: string,
        @Body() req: { token: string },
        @GetSubjectAction() subjectAction
    ) {
        try {
            const result = await this.jobSystemService.updateAddressForOrder(lang, subjectAction, idOrder, req);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    
}
