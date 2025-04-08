import { Controller, Get,Post, HttpException, HttpStatus, Query, UseGuards, Body, Param } from '@nestjs/common';
import { RewardTicketManageService } from './reward-ticket-manage.service';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { DEFAULT_LANG, GetUserByToken, IPageDecorator, LANGUAGE, ValidateLangPipe, createRewardTicketDTO, createRewardTicketFromPolicyDTO, editRewardTicketDTO } from 'src/@core';
import { iPageTransactionDTOAdmin } from 'src/@core/dto/transaction.dto';

@Controller('reward_ticket_manage')
export class RewardTicketManageController {
    constructor(
        private rewardTicketManageService: RewardTicketManageService
    ){}
    
    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('get_list')
    async getListItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @IPageDecorator() iPage: iPageTransactionDTOAdmin,
    ) {
        try {
            const result = await this.rewardTicketManageService.getList(lang, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('get_ticket_by_id/:id')
    async getItemById(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @IPageDecorator() iPage: iPageTransactionDTOAdmin,
        @Param("id") idTicket:string,
    ) {
        try {
            const result = await this.rewardTicketManageService.getItemById(lang, idTicket);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('create_item')
    async createItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() payload: createRewardTicketDTO,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.rewardTicketManageService.createItem(lang, payload, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('create_item_from_policy')
    async createItemByPolicy(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() payload: createRewardTicketFromPolicyDTO,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.rewardTicketManageService.createItemFromPolicy(lang, payload, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('verify_item/:id')
    async verifyItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') idTicket,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.rewardTicketManageService.verifyItem(lang, idTicket, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    } 
    
    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('delete_item/:id')
    async deleteItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') idTicket,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.rewardTicketManageService.deleteItem(lang, idTicket, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }    

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('update_item/:id')
    async updateItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') idTicket,
        @Body() payload:editRewardTicketDTO,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.rewardTicketManageService.updateItem(lang, idTicket, payload,user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    } 

}
