import { Controller, Get, Param, Post, Query, UseGuards, Body, HttpException, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { DEFAULT_LANG, iPageDTO, LANGUAGE, ValidateLangPipe, deleteCollaboratorTransDTOAdmin, editDocumentCollaboratorDTOAdmin, editPersonalInforCollaboratorDTOAdmin, WithdrawMoneyCollaboratorDTOAdmin, editCollaboratorTransDTOAdmin, verifyCollaboratorTransDTOAdmin, createCollaboratorDTOAdmin, TranferMoneyCollaboratorDTOAdmin, topupCollaboratorDTOAdmin, lockCollaboratorDTOAdmin, editCollaboratorDTOAdmin, deleteCollaboratorDTOAdmin, actiCollaboratorDTOAdmin, GetUserByToken, iPageTransferCollaboratorDTOAdmin, iPageTransitionCollaboratorDTOAdmin, iPageListCollaboratorDTOAdmin, GlobalService, UserSystemDocument, changeMoneyCollaborator } from 'src/@core';
import { CollaboratorManagerService } from './collaborator-manager.service';
import { changeHandleProfileDTOAdmin, dashBoardCollaboratorDTOAdmin, editAcounntBankCollaboratorDTOAdmin, iPageGetCollaboratorByTypeDTOAdmin, iPageGetCollaboratorCanConfirmJobDTOAdmin, iPageGetCollaboratorDTOAdmin, iPageHistoryActivityCollaboratorDTOAdmin, iPageHistoryOrderDTOCollaborator, lockCollaboratorV2DTOAdmin } from '../../@core/dto/collaborator.dto';
import { add, addDays, subDays } from 'date-fns';
import { CollaboratorSystemService } from 'src/core-system/collaborator-system/collaborator-system.service';

@Controller('collaborator_manager')
export class CollaboratorManagerController {
    constructor(
        private collaboratorManagerService: CollaboratorManagerService,
        private collaboratorSystemService: CollaboratorSystemService
    ) { }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('/create_item')
    async adminCreateItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() req: createCollaboratorDTOAdmin,
        @GetUserByToken() admin
    ) {
        try {
            const payload = req;
            payload.date_create = new Date().toISOString();
            payload.email = (payload.email) ? payload.email : "";
            const result = await this.collaboratorManagerService.adminCreateItem(lang, payload, admin);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    // khong dung nua
    // @ApiTags('admin')
    // @UseGuards(AuthGuard('jwt_admin'))
    // @Get('/get_list_item')
    // async getListItem(
    //     @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
    //     @Query() iPage: iPageDTO,
    //     @GetUserByToken() user
    // ) {
    //     try {
    //         iPage.length = Number(iPage.length) || 10;
    //         iPage.search = decodeURI(iPage.search || "");
    //         iPage.start = Number(iPage.start) || 0;
    //         const result = await this.collaboratorManagerService.getListItem(lang, iPage, user);
    //         return result;
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    //     }
    // }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('/get_detail/:id')
    async getDetailItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param("id") id: string,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.collaboratorManagerService.getDetailItem(lang, id, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('edit_item/:id')
    async adminEditCollaborator(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') id: string,
        @Body() req: editCollaboratorDTOAdmin,
        @GetUserByToken() user,
    ) {
        try {
            const result = await this.collaboratorManagerService.adminEditCollaborator(lang, req, id, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    // @ApiTags('admin')
    // @UseGuards(AuthGuard('jwt_admin'))
    // @Post('add_remainder/:id')
    // async addRemainder(
    //     @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
    //     @Param('id') id: string,
    //     @Body() req: editCollaboratorDTOAdmin,
    //     @GetUserByToken() user,
    // ) {
    //     try {
    //         const result = await this.collaboratorManagerService.adminEditCollaborator(lang, req, id, user._id);
    //         return result;
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    //     }
    // }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('acti_item/:id')
    async adminActiCollaborator(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') id: string,
        @Body() req: actiCollaboratorDTOAdmin,
        @GetUserByToken() user,
    ) {
        try {
            const result = await this.collaboratorManagerService.adminActiCollaborator(lang, req, id, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }

    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('lock_item/:id')
    async adminLockCollaborator(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') id: string,
        @Body() req: lockCollaboratorDTOAdmin,
        @GetUserByToken() user,
    ) {
        try {
            const result = await this.collaboratorManagerService.adminLockCollaborator(lang, req, id, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);

        }

    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('delete_item/:id')
    async adminDeleteCollaborator(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') id: string,
        @GetUserByToken() user,
    ) {
        try {
            const result = await this.collaboratorManagerService.adminDeleteCollaborator(lang, id, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('verify_item/:idCollaborator')
    async verifyItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('idCollaborator') idCollaborator: string,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.collaboratorManagerService.verifyItem(lang, idCollaborator, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('top_up/:idCollaborator')
    async topupAccount(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('idCollaborator') idCollaborator: string,
        @Body() req: TranferMoneyCollaboratorDTOAdmin,
        @GetUserByToken() user,
    ) {
        try {
            const result = await this.collaboratorManagerService.topupAccountCollaborator(lang, req, idCollaborator, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('withdraw/:idCollaborator')
    async withdrawAccount(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('idCollaborator') idCollaborator: string,
        @Body() req: WithdrawMoneyCollaboratorDTOAdmin,
        @GetUserByToken() user,
    ) {
        try {
            const result = await this.collaboratorManagerService.withdrawAccount(lang, req, idCollaborator, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }

    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('/get_list_transitions')
    async getListTrans(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageTransferCollaboratorDTOAdmin,
        @GetUserByToken() user
    ) {
        try {
            iPage.length = Number(iPage.length) || 10;
            iPage.search = decodeURI(iPage.search || "");
            iPage.transfer_note = decodeURI(iPage.transfer_note || "");
            iPage.start = Number(iPage.start) || 0;
            iPage.type_transition = (iPage.type_transition) ? iPage.type_transition : "all";
            const result = await this.collaboratorManagerService.getListTransitionsCollaboratorV2(lang, iPage, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }

    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('delete_trans/:id')
    async adminDeleteCollaboratorTrans(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') id: string,
        @Body() req: deleteCollaboratorTransDTOAdmin,
        @GetUserByToken() user,
    ) {
        try {
            const result = await this.collaboratorManagerService.adminDeleteCollaboratorTrans(lang, req, id, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('verify_trans/:id')
    async adminVerifyCollaboratorTrans(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') id: string,
        @Body() req: verifyCollaboratorTransDTOAdmin,
        @GetUserByToken() user: UserSystemDocument
    ) {
        try {
            const result = await this.collaboratorManagerService.adminVerifyCollaboratorTrans(lang, req, id, user);
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
    //     @Body() req: editCollaboratorTransDTOAdmin,
    //     @GetUserByToken() user,
    // ) {
    //     try {
    //         const result = await this.collaboratorManagerService.adminEditCustomerTrans(lang, req, id, user._id);
    //         return result;
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    //     }
    // }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('cancel_trans/:id')
    async adminCancelTrans(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') id: string,
        @GetUserByToken() user,
    ) {
        try {
            const result = await this.collaboratorManagerService.adminCancelCollaboratorTrans(lang, id, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('edit_personal_information/:idCollaborator')
    async editPersonalInformation(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('idCollaborator') idCollaborator: string,
        @Body() req: editPersonalInforCollaboratorDTOAdmin,
        @GetUserByToken() user,
    ) {
        try {
            const result = await this.collaboratorManagerService.editPersonalInformation(lang, req, idCollaborator, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }

    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('edit_personal_document/:idCollaborator')
    async editPersonalDocument(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('idCollaborator') idCollaborator: string,
        @Body() req: editDocumentCollaboratorDTOAdmin,
        @GetUserByToken() user,
    ) {
        try {
            const result = await this.collaboratorManagerService.editPersonalDocument(lang, req, idCollaborator, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    // @ApiTags('admin')
    // @UseGuards(AuthGuard('jwt_admin'))
    // @Get('/get_history_transfer/:idCollaborator')
    // async getHistoryTransfer(
    //     @Param('idCollaborator') idCollaborator: string,
    //     @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
    //     @GetUserByToken() user,
    // ) {
    //     try {
    //         const result = await this.collaboratorManagerService.getHistoryTransfer(lang, idCollaborator, user);
    //         return result;
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    //     }
    // }
    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('get_history_remainder/:idCollaborator')
    async getHistoryRemainder(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('idCollaborator') idCollaborator: string,
        @Query() iPage: iPageDTO,
        @GetUserByToken() user,
    ) {
        try {
            iPage.length = Number(iPage.length) || 10;
            iPage.search = decodeURI(iPage.search || "");
            iPage.start = Number(iPage.start) || 0;
            const result = await this.collaboratorManagerService.getHistoryRemainder(lang, iPage, idCollaborator, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('get_history_activity/:idCollaborator')
    async getHistoryActivity(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('idCollaborator') idCollaborator: string,
        @Query() iPage: iPageHistoryActivityCollaboratorDTOAdmin,
        @Body("type_fillter") type_fillter: string[],
        @GetUserByToken() user,
    ) {
        try {
            iPage.length = Number(iPage.length) || 10;
            iPage.search = decodeURI(iPage.search || "");
            iPage.start = Number(iPage.start) || 0;
            const typeFillter = (type_fillter) ? type_fillter : [];
            const result = await this.collaboratorManagerService.getHistoryActivity(lang, iPage, idCollaborator, user, typeFillter);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('get_transition_history_activity/:idCollaborator')
    async getTransitionHistoryActivity(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('idCollaborator') idCollaborator: string,
        @Query() iPage: iPageDTO,
        @GetUserByToken() user,
    ) {
        try {
            iPage.length = Number(iPage.length) || 10;
            iPage.search = decodeURI(iPage.search || "");
            iPage.start = Number(iPage.start) || 0;
            const result = await this.collaboratorManagerService.getTransitionHistoryActivity(lang, iPage, idCollaborator, user);
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('get_collaborator_by_type')
    async getCollaboratorByType(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Query() iPage: iPageGetCollaboratorByTypeDTOAdmin,
    ) {
        try {
            iPage.length = Number(iPage.length) || 10;
            iPage.search = decodeURI(iPage.search || "");
            iPage.start = Number(iPage.start) || 0;
            const result = await this.collaboratorManagerService.getCollaboratorByTypeV2(lang, iPage, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('get_history_collaborator/:idCollaborator')
    async getHistoryCollaborators(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageDTO,
        @Param("idCollaborator") idCollaborator: string,
        @GetUserByToken() user
    ) {
        try {
            iPage.length = Number(iPage.length) || 10;
            iPage.search = decodeURI(iPage.search || "");
            iPage.start = Number(iPage.start) || 0;
            const result = await this.collaboratorManagerService.getHistoryCollaborators(lang, iPage, idCollaborator, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('get_request_topup_withdraw/:idCollaborator')
    async getRequestTopupWithdraw(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageDTO,
        @Param("idCollaborator") idCollaborator: string,
        @GetUserByToken() user
    ) {
        try {
            iPage.length = Number(iPage.length) || 10;
            iPage.search = decodeURI(iPage.search || "");
            iPage.start = Number(iPage.start) || 0;
            const result = await this.collaboratorManagerService.getRequestTopupWithdraw(lang, iPage, idCollaborator, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }

    }

    // @ApiTags('admin')
    // @UseGuards(AuthGuard('jwt_admin'))
    // @Get('get_collaborator_can_confirm_job/:id')
    // async getCollaboratorDontHaveJob(
    //     @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
    //     @Query() iPage: iPageGetCollaboratorCanConfirmJobDTOAdmin,
    //     @Param('id') idOrder: string,
    //     @GetUserByToken() user
    // ) {
    //     try {
    //         const result = await this.collaboratorManagerService.getCollaboratorCanConfirmJob(lang, iPage, idOrder);
    //         return result;
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);

    //     }
    // }

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
            const result = await this.collaboratorManagerService.editAcounntBank(lang, idCollaborator, req, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);

        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('get_remainder/:idCollaborator')
    async getRamainder(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('idCollaborator') idCollaborator: string,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.collaboratorManagerService.getRamainder(lang, idCollaborator, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('get_transition/:idCollaborator')
    async getTransition(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('idCollaborator') idCollaborator: string,
        @Query() iPage: iPageDTO,
        @GetUserByToken() user,
    ) {
        try {
            iPage.length = Number(iPage.length) || 10;
            iPage.search = decodeURI(iPage.search || "");
            iPage.start = Number(iPage.start) || 0;
            const result = await this.collaboratorManagerService.getTransition(lang, iPage, idCollaborator, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('lock_collaborator/:idCollaborator')
    async lockCollaborator(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('idCollaborator') idCollaborator: string,
        @GetUserByToken() user,
        @Body() req: lockCollaboratorV2DTOAdmin
    ) {
        try {
            req.date_lock = req.date_lock || null;
            req.is_locked = req.is_locked || false;
            const result = await this.collaboratorManagerService.lockCollaborator(lang, idCollaborator, req, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('check_lock_collaborator/:idCollaborator')
    async checkLockCollaborator(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('idCollaborator') idCollaborator: string,
        @GetUserByToken() user,
    ) {
        try {
            const result = await this.collaboratorManagerService.checkLockCollaborator(lang, idCollaborator, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('get_revenue_and_expenditure')
    async revenueAndExpenditure(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageTransitionCollaboratorDTOAdmin,
        @GetUserByToken() user,
    ) {
        try {
            iPage.length = iPage.length || 20;
            iPage.start = iPage.start || 0;
            iPage.start_date = iPage.start_date || subDays(new Date(Date.now()), 30).toISOString();
            iPage.end_date = iPage.end_date || new Date(Date.now()).toISOString();
            const result = await this.collaboratorManagerService.revenueAndExpenditure(lang, iPage, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('total_top_up_withdraw/:idCollaborator')
    async totalTopUpWithdraw(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('idCollaborator') idCollaborator: string,
        @GetUserByToken() user,
    ) {
        try {
            const result = await this.collaboratorManagerService.totalTopUpWithdraw(lang, idCollaborator, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('contacted_collaborator/:idCollaborator')
    async contactedCollaborator(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('idCollaborator') idCollaborator: string,
        @GetUserByToken() user,
    ) {
        try {
            const result = await this.collaboratorManagerService.contactedCollaborator(lang, idCollaborator, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('monetary_fine/:idCollaborator')
    async monetaryFineCollaborator(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('idCollaborator') idCollaborator: string,
        @GetUserByToken() user,
        @Body() req
    ) {
        try {
            const result = await this.collaboratorManagerService.monetaryFineCollaborator(lang, idCollaborator, req, user);
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
        @Query() iPage: iPageDTO,
        @GetUserByToken() user,
    ) {
        try {
            iPage.length = iPage.length || 20;
            iPage.start = iPage.start || 0;
            const result = await this.collaboratorManagerService.getReview(lang, idCollaborator, iPage, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    // loai bo trong phien ban sap toi
    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('get_history_activity_v2/:idCollaborator')
    async getHistoryActivityV2(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('idCollaborator') idCollaborator: string,
        @Query() iPage: iPageDTO,
        @GetUserByToken() user,
    ) {
        try {
            iPage.length = iPage.length || 20;
            iPage.start = iPage.start || 0;
            const result = await this.collaboratorManagerService.getHistoryActivityV2(lang, idCollaborator, iPage, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    // loai bo trong phien ban sap toi
    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('detail_history_activity/:idOrder')
    async getDetailHistoryActivity(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('idOrder') idOrder: string,
        @Query() iPage: iPageDTO,
        @Body() req,
        @GetUserByToken() user,
    ) {
        try {
            iPage.length = iPage.length || 20;
            iPage.start = iPage.start || 0;
            const result = await this.collaboratorManagerService.getDetailHistoryActivity(lang, req, idOrder, iPage, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('get_order_history/:idCollaborator')
    async getOrderHistory(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('idCollaborator') idCollaborator: string,
        @Query() iPage: iPageDTO,
        @GetUserByToken() user,
    ) {
        try {
            iPage.length = iPage.length || 20;
            iPage.start = iPage.start || 0;
            const result = await this.collaboratorManagerService.getOrderHistory(lang, idCollaborator, iPage, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('/get_collaborator_block_or_favorite/:idCustomer')
    async getCollaboratorBlockOrFavorite(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageTransferCollaboratorDTOAdmin,
        @Param('idCustomer') idCustomer: string,
        @GetUserByToken() user
    ) {
        try {
            iPage.length = Number(iPage.length) || 10;
            iPage.search = decodeURI(iPage.search || "");
            iPage.start = Number(iPage.start) || 0;
            const result = await this.collaboratorManagerService.getCollaboratorBlockOrFavorite(lang, idCustomer, iPage, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('/get_list_collaborator_block_or_favourite/:idCustomer')
    async getListCollaboratorBlockOrFavourite(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageListCollaboratorDTOAdmin,
        @Param('idCustomer') idCustomer: string,
        @GetUserByToken() user
    ) {
        try {
            iPage.length = Number(iPage.length) || 10;
            iPage.search = decodeURI(iPage.search || "");
            iPage.start = Number(iPage.start) || 0;
            iPage.status = (iPage.status) ? iPage.status : 'all'
            const result = await this.collaboratorManagerService.getListCollaboratorBlockOrFavourite(lang, idCustomer, iPage, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Get('/report_topup_withdraw_collaborator')
    @UseGuards(AuthGuard('jwt_admin'))
    async reportTopUpWithDrawCollaborator(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageHistoryOrderDTOCollaborator,
        @GetUserByToken() user
    ) {
        try {
            iPage.length = Number(iPage.length) ? Number(iPage.length) : 100;
            iPage.start = Number(iPage.start) ? Number(iPage.start) : 0;
            const result = await this.collaboratorManagerService.reportTopUpWithDrawCollaborator(lang, iPage, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Get('/get_list_invite_collaborator/:idCollaborator')
    @UseGuards(AuthGuard('jwt_admin'))
    async getListInviteCollaborator(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageDTO,
        @GetUserByToken() user,
        @Param('idCollaborator') idCollaborator: string
    ) {
        try {
            iPage.length = Number(iPage.length) ? Number(iPage.length) : 100;
            iPage.start = Number(iPage.start) ? Number(iPage.start) : 0;
            const result = await this.collaboratorManagerService.getListInviteCollaborator(lang, iPage, idCollaborator);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    // @ApiTags('admin')
    // @Get('/get_list_invite_collaborator/:idCollaborator')
    // @UseGuards(AuthGuard('jwt_admin'))
    // async collaboratorActivity(
    //     @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
    //     @Query() iPage: iPageHistoryOrderDTOCollaborator,
    //     @GetUserByToken() user,
    //     @Param('idCollaborator') idCollaborator: string
    // ) {
    //     try {
    //         iPage.length = Number(iPage.length) ? Number(iPage.length) : 10;
    //         iPage.start = Number(iPage.start) ? Number(iPage.start) : 0;
    //         const result = await this.collaboratorManagerService.collaboratorActivity(lang, iPage, idCollaborator);
    //         return result;
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    //     }
    // }

    // api bo o phien ban toi
    @ApiTags('admin')
    @Get('/dash_board_collaborator/:idCollaborator')
    @UseGuards(AuthGuard('jwt_admin'))
    async dashBoardCollaborator(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageDTO,
        @GetUserByToken() user,
        @Param('idCollaborator') idCollaborator: string
    ) {
        try {
            iPage.length = Number(iPage.length) ? Number(iPage.length) : 10;
            iPage.start = Number(iPage.start) ? Number(iPage.start) : 0;
            const result = await this.collaboratorManagerService.dashBoardCollaborator(lang, iPage, idCollaborator);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Get('/dash_board_overview_collaborator/:idCollaborator')
    @UseGuards(AuthGuard('jwt_admin'))
    async dashBoardOverviewCollaborator(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iQuery: dashBoardCollaboratorDTOAdmin,
        @GetUserByToken() user,
        @Param('idCollaborator') idCollaborator: string
    ) {
        try {
            const result = await this.collaboratorManagerService.dashBoardOverviewCollaborator(lang, idCollaborator, iQuery);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Get('/test/:idCollaborator')
    async test(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageDTO,
        @Param('idCollaborator') idCollaborator: string
    ) {
        try {
            console.log('idCollaborator', idCollaborator);

            const result = await this.collaboratorManagerService.test(idCollaborator);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Post('/change_money_wallet/:idCollaborator')
    @UseGuards(AuthGuard('jwt_admin'))
    async changeMoneyWallet(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Param('idCollaborator') idCollaborator: string,
        @Body() req: changeMoneyCollaborator
    ) {
        try {
            const result = await this.collaboratorManagerService.changeMoneyWallet(lang, req, idCollaborator, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    @ApiTags('admin')
    @Post('/update_status_collaborator/:id_collaborator')
    @UseGuards(AuthGuard('jwt_admin'))
    async updateStatusCollaborator(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id_collaborator') id: string,
        @Body() req: changeHandleProfileDTOAdmin,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.collaboratorManagerService.updateStatusCollaborator(lang, id, req, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Get('/get_total_collaborator_by_status')
    @UseGuards(AuthGuard('jwt_admin'))
    async getTotalCollaboratorByStatus(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query("arr_status") arrStatus: string,
        @Query("search") search: string,
        @Query("city") city: string,
        @GetUserByToken() user
    ) {
        try {
            const decorArrStatus = arrStatus || "actived"
            const decorSearch = search || "";
            const decorCity = city || null;
            const result = await this.collaboratorManagerService.getTotalCollaboratorByStatus(lang, user, decorArrStatus, decorSearch, decorCity);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Get('/get_total_collaborator_by_area')
    @UseGuards(AuthGuard('jwt_admin'))
    async getTotalCollaboratorByArea(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query("arr_status") arrStatus: string,
        @Query("search") search: string,
        @Query("city") city: string,
        @GetUserByToken() user
    ) {
        try {
            const decorArrStatus = arrStatus || "actived"
            const decorSearch = search || "";
            const decorCity = city || null;
            const result = await this.collaboratorManagerService.getTotalCollaboratorByArea(lang, user, decorArrStatus, decorSearch, decorCity);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('get_list')
    async getListItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Query() iPage: iPageGetCollaboratorDTOAdmin,
    ) {
        try {
            iPage.length = Number(iPage.length) || 10;
            iPage.search = decodeURI(iPage.search || "");
            iPage.start = Number(iPage.start) || 0;
            iPage.status = (iPage.status) ? iPage.status.split(",") : ["actived"]
            const result = await this.collaboratorManagerService.getListItem(lang, iPage, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('balance_money/:id')
    async balanceMoney(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') id: string,
    ) {
        try {
            const result = await this.collaboratorSystemService.balanceMoney(lang, id);
            return result
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }



    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('find_one_by_id_redis/:id')
    async findOneByIdRedis(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') id: string,
    ) {
        try {
            const result = await this.collaboratorSystemService.findOneByIdRedis(lang, id);
            return result
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

}
