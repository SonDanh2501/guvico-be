import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common';
import { RewardCollaboratorManagerService } from './reward-collaborator-manager.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { ValidateLangPipe, LANGUAGE, DEFAULT_LANG, iPageDTO, GetUserByToken } from 'src/@core';
import { createRewardCollaboratorDTOAdmin, editRewardCollaboratorDTOAdmin, actiRewardCollaboratorAdmin, deleteRewardCollaboratorAdmin } from 'src/@core/dto/reward-collaborator.dto';

@Controller('reward_collaborator_manager')
export class RewardCollaboratorManagerController {
    constructor(private rewardCollaboratorManagerService: RewardCollaboratorManagerService) { }

    @ApiTags('admin')
    @Get('get_list')
    @UseGuards(AuthGuard('jwt_admin'))
    async getListItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageDTO,
        @GetUserByToken() user
    ) {
        try {
            iPage.length = Number(iPage.length) || 20;
            iPage.search = decodeURI(iPage.search || "");
            iPage.start = Number(iPage.start) || 0;
            const result = await this.rewardCollaboratorManagerService.getList(lang, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);;
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('/detail_reward/:idReward')
    async getDetailQuestion(
        @Param('idReward') idQuestion: string,
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
    ) {
        try {
            const result = (await this.rewardCollaboratorManagerService.getDetailReward(lang, idQuestion));
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);;
        }
    }

    @ApiTags('admin')
    @Post('/create_reward')
    @UseGuards(AuthGuard('jwt_admin'))
    async createItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() req: createRewardCollaboratorDTOAdmin,
        @GetUserByToken() user
    ) {
        try {
            const payload = req;
            const result = await this.rewardCollaboratorManagerService.createReward(lang, payload, user._id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('edit_reward/:id')
    async editItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') id: string,
        @Body() req: editRewardCollaboratorDTOAdmin,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.rewardCollaboratorManagerService.editReward(lang, req, id, user._id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);;
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('acti_reward/:id')
    async adminActiExamtest(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') id: string,
        @Body() req: actiRewardCollaboratorAdmin,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.rewardCollaboratorManagerService.actiReward(lang, req, id, user._id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);;
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('delete_reward/:id')
    async adminDeleteQuestion(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') id: string,
        @Body() req: deleteRewardCollaboratorAdmin,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.rewardCollaboratorManagerService.deleteReward(lang, req, id, user._id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);;
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('test')
    async test(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.rewardCollaboratorManagerService.processRewarkCollaborator();
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);;
        }
    }
}
