import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiTags } from '@nestjs/swagger'
<<<<<<< HEAD
import { DEFAULT_LANG, GetSubjectAction, GetUserByToken, IPageDecorator, LANGUAGE, ValidateLangPipe, editAcounntBankCollaboratorDTOAdmin, editPersonalInforCollaboratorDTOAdmin, iPageDTO, iPageJobListsDTOAdmin } from 'src/@core'
=======
import { DEFAULT_LANG, GetSubjectAction, GetUserByToken, IPageDecorator, LANGUAGE, ValidateLangPipe, editAcounntBankCollaboratorDTOAdmin, editPersonalInforCollaboratorDTOAdmin, iPageDTO, iPageJobListsDTOAdmin, iPageListCustomerDTOAdmin } from 'src/@core'
>>>>>>> son
import { CollaboratorSystemService } from 'src/core-system/@core-system/collaborator-system/collaborator-system.service'
import { HistoryActivitySystemService } from 'src/core-system/@core-system/history-activity-system/history-activity-system.service'

@Controller('collaborator_manager')
export class CollaboratorManagerApiController {
    constructor(
        private collaboratorSystemService: CollaboratorSystemService,
        private historyActivitySystemService: HistoryActivitySystemService

    ) {}

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('edit_personal_information/:idCollaborator')
    async editPersonalInformation(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('idCollaborator') idCollaborator: string,
        @Body() req: editPersonalInforCollaboratorDTOAdmin,
        @GetUserByToken() user,
        @GetSubjectAction() subjectAction
    ) {
        try {
            const result = await this.collaboratorSystemService.editCollaboratorPersonalInfo(lang, subjectAction, idCollaborator, req);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }

    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('edit_account_bank/:idCollaborator')
    async editAcounntBank(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('idCollaborator') idCollaborator: string,
        @Body() req: editAcounntBankCollaboratorDTOAdmin,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.collaboratorSystemService.editCollaboratorBankInfo(lang, idCollaborator, req, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);

        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('get_history_activity/:idCollaborator')
    async getHistoryActivity(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('idCollaborator') idCollaborator: string,
        @Query() iPage: iPageDTO,
        @GetUserByToken() user,
    ) {
        try {
            iPage.length = Number(iPage.length) || 10;
            iPage.search = decodeURI(iPage.search || "");
            iPage.start = Number(iPage.start) || 0;
            const result = await this.historyActivitySystemService.getListCollaborators(idCollaborator,iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('update_status_collaborator_profile/:idCollaborator')
    async getNotification(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('idCollaborator') idCollaborator: string,
        @GetSubjectAction() subjectAction,
        @Body() body: { status?:string, note_handle_admin?:string },
    ): Promise<any> {
        try {
            const result = await this.collaboratorSystemService.updateStatusCollaboratorProfile(lang, subjectAction, idCollaborator, body);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('verify_item/:idCollaborator')
    async verifyItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('idCollaborator') idCollaborator: string,
        @GetSubjectAction() subjectAction,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.collaboratorSystemService.verifyCollaborator(lang, idCollaborator, subjectAction);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('get_review/:idCollaborator')
    async getReview(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('idCollaborator') idCollaborator: string,
        @IPageDecorator() iPage: iPageDTO,
        @GetUserByToken() user,
    ) {
        try {
            iPage.length = iPage.length || 20;
            iPage.start = iPage.start || 0;
            const result = await this.collaboratorSystemService.getReviewCollaborator(lang, idCollaborator, iPage, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('get_order/:idCollaborator')
    async getOrder(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('idCollaborator') idCollaborator: string,
        @IPageDecorator() iPage: iPageJobListsDTOAdmin,
        @GetUserByToken() user,
    ) {
        try {
            iPage.length = Number(iPage.length) || 20;
            iPage.search = decodeURI(iPage.search || "");
            iPage.start = Number(iPage.start) || 0;
            iPage.status = (iPage.status) ? iPage.status : "all";
            iPage.id_service = (iPage.id_service) ? iPage.id_service : "all";
            iPage.type_sort = (iPage.type_sort) ? iPage.type_sort : "date_create";
            iPage.payment_method = (iPage.payment_method) ? iPage.payment_method : "all";
            const result = await this.collaboratorSystemService.getOrderById(lang, idCollaborator, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    
    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('get_total_order/:idCollaborator')
    async getAllOrder(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('idCollaborator') idCollaborator: string,
        @GetUserByToken() user,
    ) {
        try {
            const result = await this.collaboratorSystemService.getTotalOrderById(idCollaborator);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('/get_list_customer_block_or_favourite/:idCollaborator')
    async getListCustomerBlockOrFavourite(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageListCustomerDTOAdmin,
        @Param('idCollaborator') idCollaborator: string,
    ) {
        try {
            iPage.length = Number(iPage.length) || 10;
            iPage.search = decodeURI(iPage.search || "");
            iPage.start = Number(iPage.start) || 0;
            iPage.status = (iPage.status) ? iPage.status : 'block'
            const result = await this.collaboratorSystemService.getListCustomerBlockOrFavourite(lang, idCollaborator, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
