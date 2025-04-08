import { Controller, Get, HttpException, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { RewardService } from './reward.service';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { DEFAULT_LANG, GetUserByToken, LANGUAGE, ValidateLangPipe, iPageDTO } from 'src/@core';

@Controller('reward')
export class RewardController {
    constructor(
        private rewardService: RewardService
    ) { }

    @ApiTags('collaborator')
    @UseGuards(AuthGuard('jwt_collaborator'))
    @Get('/get_list_reward')
    async getListReward(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Query() iPage: iPageDTO
    ) {
        try {
            const result = await this.rewardService.getListReward(lang, iPage, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

}
