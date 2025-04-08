import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiTags } from '@nestjs/swagger'
import { CreateRewardPolicyDTO, DEFAULT_LANG, EditRewardPolicyDTO, GetSubjectAction, IPageDecorator, iPageDTO, LANGUAGE, ValidateLangPipe } from 'src/@core'
import { RewardPolicySystemService } from 'src/core-system/@core-system/reward-policy-system/reward-policy-system.service'

@Controller('reward_policy_manager')
export class RewardPolicyManagerApiController {
  constructor(
    private rewardPolicySystemServic: RewardPolicySystemService
  ) {
  }
  
    @ApiTags('admin')
    @Get('/get_list')
    @UseGuards(AuthGuard('jwt_admin'))
    async getListItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @IPageDecorator() iPage: iPageDTO,
    ) {
        try {
            const result = await this.rewardPolicySystemServic.getListItem(lang, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
  
    
    @ApiTags('admin')
    @Post('/create_item')
    @UseGuards(AuthGuard('jwt_admin'))
    async createItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() body: CreateRewardPolicyDTO,
        @GetSubjectAction() subjectAction
    ) {
        try {
            const result = await this.rewardPolicySystemServic.createNewItem(lang, subjectAction, body);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
  

    @ApiTags('admin')
    @Get('/get_detail_item/:idItem')
    @UseGuards(AuthGuard('jwt_admin'))
    async getDetailItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('idItem') idItem: string
    ) {
        try {
            const result = await this.rewardPolicySystemServic.getDetailItem(lang, idItem);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @ApiTags('admin')
    @Post('/update_item/:idItem')
    @UseGuards(AuthGuard('jwt_admin'))
    async updateItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('idItem') idItem: string,
        @Body() body: EditRewardPolicyDTO,
        @GetSubjectAction() subjectAction
    ) {
        try {
            const result = await this.rewardPolicySystemServic.updateItem(lang, subjectAction, idItem, body);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
