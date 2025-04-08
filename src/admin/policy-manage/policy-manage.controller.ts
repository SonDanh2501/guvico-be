import { Body, Controller, Get, Param, Post, Query, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { DEFAULT_LANG, GetUserByToken, iPageDTO, iPageHistoryOrderDTOCollaborator, LANGUAGE, ValidateLangPipe, iPageOrderDTOAdmin, changeStatusOrderDTOAdmin, addCollaboratorDTOAdmin, editOrderV2DTOAdmin, adminCheckReviewDTOAdmin, iPageSearchOrderForCollaborator, changeStatusHandleReviewOrder, IPageDecorator, CreateRewardPolicyDTO } from 'src/@core';
import { CreatePunishPolicyDTO,  EditPunishPolicyDTO, IPagePunishPolicyDTO, IPageRewardPolicyDTO, EditRewardPolicyDTO} from 'src/@core';
import { PolicyManageService } from './policy-manage.service';

@Controller('policy_manage')
export class PolicyManageController {
    constructor(
          private policyManageService:PolicyManageService
    ){}

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('/create_punish_policy')
    async createPunishPolicy(
         @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
         @GetUserByToken() user,
         @Body() req: CreatePunishPolicyDTO,
    ) {
          try {
               const payload = req;
               const result = await this.policyManageService.createPunishPolicy(lang, payload, user);
               return result
          } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
          }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('/edit_punish_policy/:id')
    async editPunishPolicy(
         @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
         @Param('id') idPunish,
         @GetUserByToken() user,
         @Body() req: EditPunishPolicyDTO,
    ) {
          try {
            const payload = req;
            const result = await this.policyManageService.editPunishPolicy(lang, idPunish,payload, user); 
            return result;
          } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
          }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('/get_list_punish_policy')
    async getListPunishPolicy(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: IPagePunishPolicyDTO,
    ) {
        try {
          iPage.length = Number(iPage.length) || 10;
          iPage.search = decodeURI(iPage.search || "");
          iPage.start = Number(iPage.start) || 0;
          const result = await this.policyManageService.getListPunishPolicies(lang, iPage);
          return result;
        } catch (err) {
          throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('/get_punish_policy_by_id/:id')
    async getPunishPolicyById(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') idPunish,
    ) {
        try {
          const result = await this.policyManageService.getPunishPolicyById(lang, idPunish);
          return result;
        } catch (err) {
          throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('/delete_punish_policy_by_id/:id')
    async softDeletePunishPolicy(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') idPunish,
        @GetUserByToken() user,
    ) {
        try {
          const result = await this.policyManageService.softDeletePunishPolicy(lang, idPunish, user);
          return result;
        } catch (err) {
          throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    // Reward Policy
    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('/get_list_reward_policy')
    async getListRewardPolicy(
      @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
      @Query() iPage: IPageRewardPolicyDTO,
    ) {
        try {
          iPage.length = Number(iPage.length) || 10;
          iPage.search = decodeURI(iPage.search || "");
          iPage.start = Number(iPage.start) || 0;
          const result = await this.policyManageService.getListRewardPolicy(lang, iPage);
          return result;
        } catch (err) {
          throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('/get_reward_policy_by_id/:id')
    async getRewardPolicyById(
      @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
      @Param("id") idRewardPolicy,
    ) {
        try {
          const result = await this.policyManageService.getRewardPolicyById(lang, idRewardPolicy);
          return result;
        } catch (err) {
          throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('/create_reward_policy')
    async createRewardPolicy(
      @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
      @GetUserByToken() userInfo,
      @Body() req:CreateRewardPolicyDTO,
    ) {
        try {
          const payload = req;
          const result = await this.policyManageService.createRewardPolicy(lang,payload ,userInfo);
          return result;
        } catch (err) {
          throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('/edit_reward_policy/:id')
    async editRewardPolicy(
      @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
      @GetUserByToken() userInfo,
      @Body() req:EditRewardPolicyDTO,
      @Param("id") idRewardPolicy,
    ) {
        try {
          const payload = req;
          const result = await this.policyManageService.editRewardPolicy(lang, idRewardPolicy, payload, userInfo);
          return result;
        } catch (err) {
          throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('/delete_reward_policy/:id')
    async softDeleteRewardPolicy(
      @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
      @GetUserByToken() userInfo,
      @Body() req:EditRewardPolicyDTO,
      @Param("id") idRewardPolicy,
    ) {
        try {
          const payload = req;
          const result = await this.policyManageService.softDeleteRewardPolicy(lang, idRewardPolicy, userInfo);
          return result;
        } catch (err) {
          throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


}
