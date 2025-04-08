import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { GroupPromotionManagerService } from './group-promotion-manager.service';
import { DEFAULT_LANG, GetUserByToken, IPageDecorator, LANGUAGE, ValidateLangPipe, iPageDTO } from 'src/@core';
import { createGroupPromotionDTOAdmin, editGroupPromotionDTOAdmin } from 'src/@core/dto/groupPromotion.dto';
import { actiGroupPromotionDTOAdmin } from '../../@core/dto/groupPromotion.dto';

@Controller('group_promotion_manager')
export class GroupPromotionManagerController {
    constructor(
        private groupPromotionManagerService: GroupPromotionManagerService
    ) { }
    @ApiTags('admin')
    @Get('get_list')
    @UseGuards(AuthGuard('jwt_admin'))
    async getListItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageDTO,
        @GetUserByToken() user,
        // @IPageDecorator() iPage: iPageDTO
    ) {
        try {
            iPage.length = Number(iPage.length) || 10;
            iPage.search = decodeURI(iPage.search || "");
            iPage.start = Number(iPage.start) || 0;
            const result = await this.groupPromotionManagerService.getListItem(lang, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], HttpStatus.FORBIDDEN)
        }
    }
    @ApiTags('admin')
    @Get('get_detail/:id')
    @UseGuards(AuthGuard('jwt_admin'))
    async getDetailItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') id: string,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.groupPromotionManagerService.getDetailItem(lang, id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], HttpStatus.FORBIDDEN)
        }

    }
    @ApiTags('admin')
    @Post('create_item')
    @UseGuards(AuthGuard('jwt_admin'))
    async createItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() req: createGroupPromotionDTOAdmin,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.groupPromotionManagerService.createItem(lang, req, user._id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Post('edit_item/:id')
    @UseGuards(AuthGuard('jwt_admin'))
    async editItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') id: string,
        @Body() req: editGroupPromotionDTOAdmin,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.groupPromotionManagerService.editItem(lang, req, id, user._id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }

    }

    @ApiTags('admin')
    @Post('delete_item/:id')
    @UseGuards(AuthGuard('jwt_admin'))
    async deleteItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') id: string,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.groupPromotionManagerService.deleteItem(lang, id, user._id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }

    }

    @ApiTags('admin')
    @Post('acti_item/:id')
    @UseGuards(AuthGuard('jwt_admin'))
    async actiItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') id: string,
        @GetUserByToken() user,
        @Body() req: actiGroupPromotionDTOAdmin,
    ) {
        try {
            const result = await this.groupPromotionManagerService.actiItem(lang, req, id, user._id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    // @ApiTags('admin')
    // @Post('get_list_customer_by_group/:idGroupCustomer')
    // @UseGuards(AuthGuard('jwt_admin'))
    // async getListCustomerByGroupCustomer(
    //     @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
    //     @Param('idGroupCustomer') idGroupCustomer: string,
    //     @Query() iPage: iPageDTO,
    //     @GetUserByToken() user,
    // ) {
    //     try {
    //         const result = await this.groupPromotionManagerService.getListCustomerByGroupCustomer(lang, iPage, idGroupCustomer, user);
    //         return result;
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    //     }
    // }

}
