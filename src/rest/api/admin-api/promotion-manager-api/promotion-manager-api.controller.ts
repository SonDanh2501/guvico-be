import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { activePromotionDTOAdmin, createPromotionDTOAdmin, DEFAULT_LANG, editPromotionDTOAdmin, GetSubjectAction, GetUserByToken, IPageDecorator, iPageDTO, iPagePromotionDTOAdmin, iPageUsedPromotionDTOAdmin, LANGUAGE, newQuerySetupPositionPromotion, querySetupPositionPromotion, updatePositionPromotion, ValidateLangPipe } from 'src/@core';
import { createGroupOrderDTOCustomer } from 'src/@core/dto/groupOrder.dto';
import { PromotionSystemService } from 'src/core-system/@core-system/promotion-system/promotion-system.service';

@Controller('promotion_manager')
export class PromotionManagerApiController {
    constructor(
        private promotionSystemService: PromotionSystemService
    ) { }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('get_list')
    async getListItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @IPageDecorator() iPage: iPagePromotionDTOAdmin,
    ) {
        try {
            iPage.fieldSort = (iPage.fieldSort) ? iPage.fieldSort : "date_create";
            const result = await this.promotionSystemService.getListItem(iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('detail/:idPromotion')
    async getDetailItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('idPromotion') idPromotion: string,
    ) {
        const result = await this.promotionSystemService.getDetailItem(lang, idPromotion);
        return result;
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('create_item')
    async createItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() body: createPromotionDTOAdmin,
        @GetSubjectAction() subjectAction,
    ) {
        try {
            const result = await this.promotionSystemService.createItem(lang, subjectAction, body);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('edit_item/:idPromotion')
    async editItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('idPromotion') idPromotion: string,
        @Body() body: editPromotionDTOAdmin,
        @GetSubjectAction() subjectAction,
    ) {
        try {
            const result = await this.promotionSystemService.editItem(lang, subjectAction, idPromotion, body);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('active/:idPromotion')
    async activeItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('idPromotion') idPromotion: string,
        @Body() body: activePromotionDTOAdmin,
        @GetSubjectAction() subjectAction,
    ) {
        try {
            const result = await this.promotionSystemService.activeItem(lang, subjectAction, body, idPromotion);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @ApiTags('admin')
    @Get('delete_soft/:idPromotion')
    @UseGuards(AuthGuard('jwt_admin'))
    async softDeleteItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('idPromotion') idPromotion: string,
        @GetSubjectAction() subjectAction,
    ) {
        try {
            const result = await this.promotionSystemService.softDeleteItem(lang, subjectAction, idPromotion);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('/code_available/:idCustomer')
    async codeAvailable(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @IPageDecorator() iPage: iPageDTO,
        @Param('idCustomer') idCustomer: string,
        @GetSubjectAction() subjectAction,
        @Req() request:any,
    ) {
        try {
            request.query['address'] = decodeURI(request.query['address'] || "")
            const result = await this.promotionSystemService.codeAvailable(lang, subjectAction, iPage, idCustomer, request.query);

            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('detail_used_promotion/:idPromotion')
    async detailUsedPromotion(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('idPromotion') idPromotion: string,
        @IPageDecorator() iPage: iPageUsedPromotionDTOAdmin,
    ) {
        try {
            const result = await this.promotionSystemService.detailUsedPromotion(lang, idPromotion, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    // @UseGuards(AuthGuard('jwt_admin'))
    // @ApiTags('admin')
    // @Get('history_activity/:id')
    // async historyActivity(
    //     @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
    //     @GetUserByToken() user,
    //     @Param('id') id: string,
    //     @IPageDecorator() iPage: iPageDTO,
    // ) {
    //     try {
    //         iPage.length = Number(iPage.length) || 10;
    //         iPage.start = Number(iPage.start) || 0;
    //         const result = await this.promotionManagerService.historyActivity(lang, id, iPage);
    //         return result;
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    //     }
    // }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('get_child_promotion/:code')
    async getChildPromotion(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('code') code: string,
        @IPageDecorator() iPage: iPageUsedPromotionDTOAdmin,
    ) {
        try {
            const result = await this.promotionSystemService.getListChildPromotion(iPage, code);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('get_promotion_by_customer')
    async getPromotionByPosition(
    @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
    @Query() query: newQuerySetupPositionPromotion
    ) {
        try {
            const result = await this.promotionSystemService.getListPromotionByCustomer(lang, query);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('set_position_promotion')
    async setPositionPromotion(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() req: updatePositionPromotion,
    ) {
        try {
            const result = await this.promotionSystemService.setPositionPromotion(lang, req);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
    @Post('check_code_promotion')
    async checkCodePromotion(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() req: createGroupOrderDTOCustomer,
        @GetSubjectAction() subjectAction,
    ) {
        try {
            const result = await this.promotionSystemService.calculateCodePromotion(lang, subjectAction, req);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
