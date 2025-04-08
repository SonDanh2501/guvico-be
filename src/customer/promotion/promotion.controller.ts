import { Body, Controller, Get, HttpException, HttpStatus, Post, Query, UseGuards, Param } from '@nestjs/common';
import { DEFAULT_LANG, ERROR, GetUserByToken, GlobalService, iPageDTO, LANGUAGE, ValidateLangPipe } from 'src/@core';
import { PromotionService } from './promotion.service';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { createGroupOrderDTOCustomer } from 'src/@core/dto/groupOrder.dto';
import { AuthService } from '../auth/auth.service';
import { GroupOrderService } from '../group-order/group-order.service';
import { HistoryPointService } from 'src/core-system/history-point/history-point.service';
import { GroupOrderSystemService } from 'src/core-system/group-order-system/group-order-system.service';
import { PromotionSystemService } from 'src/core-system/promotion-system/promotion-system.service';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';

@Controller('promotion')
export class PromotionController {
    constructor(
        private authService: AuthService,
        private promotionService: PromotionService,
        private promotionSystemService: PromotionSystemService,
        private customExceptionService: CustomExceptionService,
        private groupOrderService: GroupOrderService,
        private groupOrderSystemService: GroupOrderSystemService,
        private globalService: GlobalService,
        private historyPointService: HistoryPointService,

    ) { }

    @Get('/check/:idPromotion')
    @UseGuards(AuthGuard('jwt_customer'))
    async checkPromotion(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Param("idPromotion") idPromotion: string
    ) {
        try {
            const result = await this.promotionService.checkPromotion(lang, user, idPromotion);
            return result;
        }
        catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @Get('/get_limit_count_customer')
    @UseGuards(AuthGuard('jwt_customer'))
    async getSpecificCustomer(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.promotionService.getLimitCount(lang, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    // @Get('/get_list_type_promotion')
    // @UseGuards(AuthGuard('jwt_customer'))
    // async getListTypePromotion(
    //     @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
    //     @GetUserByToken() user,
    //     @Query() iPage: iPageDTO,
    // ) {
    //     try {
    //         iPage.start = iPage.start ? iPage.start : 0;
    //         iPage.length = iPage.length ? iPage.length : 10;
    //         const result = await this.promotionService.getListTypePromotion(lang, user, iPage);
    //         return result;
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    //     }
    // }

    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
    @Get('/get_exchange_point_for_customer')
    async getExchangePointForCustomer(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageDTO,
        @Query("brand") brand: string,
        @GetUserByToken() user
    ) {
        try {
            iPage.length = Number(iPage.length) || 10;
            iPage.search = iPage.search || '';
            iPage.start = Number(iPage.start) || 0;
            const result = await this.promotionService.getExchangePointForCustomerV2(lang, iPage, user, brand);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    @ApiTags('customer')
    @Get('/get_promotion_code_for_customer_payment')
    async getPrmotionCodeForCustomerPayment(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageDTO,
        @GetUserByToken() user
    ) {
        try {
            iPage.length = Number(iPage.length) || 10;
            iPage.search = iPage.search || '';
            iPage.start = Number(iPage.start) || 0;
            const result = await this.promotionService.getPrmotionCodeForCustomerPaymentV2(lang, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
    @Get('/get_code_for_customer')
    async getCodeForCustomer(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageDTO,
        @GetUserByToken() user
    ) {
        try {
            iPage.length = Number(iPage.length) || 10;
            iPage.search = iPage.search || '';
            iPage.start = Number(iPage.start) || 0;
            const result = await this.promotionService.getCodeForCustomerV2(lang, iPage, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
    @Get('/get_list_promotion')
    async getListPromotion(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageDTO,
        @Query('id_group_promotion') id_group_promotion: string,
        @Query("brand") brand: string,
        @GetUserByToken() user
    ) {
        try {
            iPage.length = Number(iPage.length) || 10;
            iPage.search = (iPage.search) ? iPage.search.toUpperCase() : "";
            iPage.start = Number(iPage.start) || 0;
            id_group_promotion = id_group_promotion ? id_group_promotion : '';
            brand = brand ? brand : '';
            const result = await this.promotionService.getListPromotionV2(lang, iPage, user, id_group_promotion, brand);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }

    }

    @ApiTags('customer')
    @Get('/get_list_promotion_guest')
    async getListPromotionGuest(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageDTO,
        @Query('id_group_promotion') id_group_promotion: string,
    ) {
        try {
            iPage.length = Number(iPage.length) || 10;
            iPage.search = (iPage.search) ? iPage.search.toUpperCase() : "";
            iPage.start = Number(iPage.start) || 0;
            id_group_promotion = id_group_promotion ? id_group_promotion : '';
            const result = await this.promotionService.getListPromotionGuestV2(lang, iPage, id_group_promotion);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @UseGuards(AuthGuard('jwt_customer'))
    @ApiTags('customer')
    @Post('check_code_promotion')
    async checkCodePromotion(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() req: createGroupOrderDTOCustomer,
        @GetUserByToken() user
    ) {
        try {
            if (!req.code_promotion || req.code_promotion === "") {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
            }
            req.id_customer = user._id;
            const getCustomer = await this.authService.getInfoByToken(lang, user);
            const infoJob = await this.groupOrderSystemService.calculateFeeGroupOrder(lang, req);
            const result = await this.promotionSystemService.calculateCodePromotion(lang, infoJob, req.code_promotion, getCustomer);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @UseGuards(AuthGuard('jwt_customer'))
    @ApiTags('customer')
    @Post('check_event_promotion')
    async checkEventPromotion(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() req: createGroupOrderDTOCustomer,
        @GetUserByToken() user
    ) {
        try {
            req.id_customer = user._id;
            const infoJob = await this.groupOrderSystemService.calculateFeeGroupOrder(lang, req);
            const result = await this.promotionSystemService.calculateEventPromotion(lang, infoJob, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    @ApiTags('customer')
    @Post('/exchange_point_for_customer/:idPromotion')
    @UseGuards(AuthGuard('jwt_customer'))
    async ExchangePoint(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Param("idPromotion") idPromotion: string
    ) {
        try {
            const result = await this.promotionService.exchangePoint(lang, idPromotion, user);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    @ApiTags('customer')
    @Get('/get_detail_promotion/:id')
    // @UseGuards(AuthGuard('jwt_customer'))
    async getDetailPromotion(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        // @GetUserByToken() user,
        @Param("id") id: string
    ) {
        try {
            const result = await this.promotionService.getDetailPromotion(lang, id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    @ApiTags('customer')
    @Get('/code_has_exchange')
    @UseGuards(AuthGuard('jwt_customer'))
    async codeHasExchange(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageDTO,
        @Query("brand") brand: string,
        @GetUserByToken() user
    ) {
        try {
            iPage.length = Number(iPage.length) || 10;
            iPage.search = (iPage.search) ? iPage.search.toUpperCase() : "";
            iPage.start = Number(iPage.start) || 0;
            const Brand = brand || null;
            const result = await this.promotionService.codeHasExchangeV2(lang, iPage, Brand, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('customer')
    @Get('/code_available')
    @UseGuards(AuthGuard('jwt_customer'))
    async codeAvailable(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageDTO,
        @Query("brand") brand: string,
        @Query("id_service") id_service: string,
        @Query("address") address: string,
        @GetUserByToken() user
    ) {
        try {
            iPage.length = Number(iPage.length) || 20;
            iPage.search = (iPage.search) ? iPage.search.toUpperCase() : "";
            iPage.start = Number(iPage.start) || 0;
            const tempAddress = decodeURI(address || "");
            const Brand = brand || null;
            const idService = id_service || null;
            const result = await this.promotionSystemService.codeAvailable(lang, iPage, Brand, idService, user, tempAddress);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('customer')
    @Get('/get_list_group_promotion')
    async getListGroupPromotion(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageDTO,
    ) {
        try {
            iPage.length = Number(iPage.length) || 10;
            iPage.search = (iPage.search) ? iPage.search.toUpperCase() : "";
            iPage.start = Number(iPage.start) || 0;
            const result = await this.promotionService.getListGroupPromotion(lang, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
    @Get('/get_list_promotion_by_brand')
    async getListPromotionByBrand(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageDTO,
        @Query('brand') brand: string,
        @GetUserByToken() user
    ) {
        try {
            iPage.length = Number(iPage.length) || 10;
            iPage.search = (iPage.search) ? iPage.search.toUpperCase() : "";
            iPage.start = Number(iPage.start) || 0;
            brand = brand ? brand : '';
            const result = await this.promotionService.getListPromotionByBrand(lang, iPage, user, brand);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
    @Get('/get_my_list_promotion')
    async getMyListPromotion(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageDTO,
        @Query('brand') brand: string,
        @GetUserByToken() user
    ) {
        try {
            iPage.length = Number(iPage.length) || 10;
            iPage.search = (iPage.search) ? iPage.search.toUpperCase() : "";
            iPage.start = Number(iPage.start) || 0;
            brand = brand ? brand : '';
            const result = await this.promotionService.getMyListPromotion(lang, iPage, user, brand);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
