import { Controller, Get, HttpException, HttpStatus, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { DEFAULT_LANG, LANGUAGE, ValidateLangPipe } from 'src/@core';
import { PromotionSystemService } from 'src/core-system/@core-system/promotion-system/promotion-system.service';

@Controller('promotion_api')
export class PromotionApiController {
    constructor(private promotionSystemService: PromotionSystemService) {
    }

    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
    @Get('get_detail_item/:idPromotion')
    async getDetailItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('idPromotion') idPromotion: string,
    ) {
        try {
            const result = await this.promotionSystemService.getDetailItemForMobile(lang, idPromotion);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], HttpStatus.FORBIDDEN);

        }
    }

}
