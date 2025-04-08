import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { activePromotionDTOAdmin, createGroupServiceDTOAdmin, createPromotionDTOAdmin, Customer, CustomerDocument, DEFAULT_LANG, editPromotionDTOAdmin, ERROR, GetUserByToken, IPageDecorator, iPageDTO, iPagePromotionDTOAdmin, iPageUsedPromotionDTOAdmin, LANGUAGE, querySetupPositionPromotion, updatePositionPromotion, ValidateLangPipe } from 'src/@core';
import { createGroupOrderDTOCustomer } from 'src/@core/dto/groupOrder.dto';
import { PromotionManagerService } from './promotion-manager.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GlobalService } from '../../@core/service/global.service';
import { GroupOrderSystemService } from '../../core-system/group-order-system/group-order-system.service';
import { PromotionSystemService } from '../../core-system/promotion-system/promotion-system.service';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';
import { CustomerRepositoryService } from 'src/@repositories/repository-service/customer-repository/customer-repository.service';

@Controller('promotion_manager')
export class PromotionManagerController {
    constructor(
        private promotionSystemService: PromotionSystemService,
        private promotionManagerService: PromotionManagerService,
        private globalService: GlobalService,
        private groupOrderService: GroupOrderSystemService,
        private customExceptionService: CustomExceptionService,
        private customerRepositoryService: CustomerRepositoryService,
        @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    ) { }

    @ApiTags('admin')
    @Get('get_list')
    @UseGuards(AuthGuard('jwt_admin'))
    async getListItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @IPageDecorator() iPage: iPagePromotionDTOAdmin,
        @Query('status') status: string,
        @Query('id_service') id_service: string,
        @Query('id_group_promotion') id_group_promotion: string,
        @Query('exchange') exchange,
        @GetUserByToken() user,
    ) {
        status = (status) ? status : null;
        id_service = (id_service) ? id_service : "";
        id_group_promotion = (id_group_promotion) ? id_group_promotion : "";
        exchange = (exchange) ? exchange : "";
        iPage.fieldSort = (iPage.fieldSort) ? iPage.fieldSort : "date_create";
        const result = await this.promotionManagerService.getListItem(lang, iPage, status, id_service, exchange, id_group_promotion);
        return result;
    }

    @ApiTags('admin')
    @Get('detail/:id')
    @UseGuards(AuthGuard('jwt_admin'))
    async getDetailItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') id: string,
        @GetUserByToken() user,
    ) {
        const result = await this.promotionManagerService.getDetailItem(lang, id);
        return result;
    }

    @ApiTags('admin')
    @Post('create_item')
    @UseGuards(AuthGuard('jwt_admin'))
    async createItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() req: createPromotionDTOAdmin,
        @GetUserByToken() user,
    ) {
        try {
            const result = await this.promotionManagerService.createItem(lang, req, user._id);
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
        @Body() req: editPromotionDTOAdmin,
        @GetUserByToken() user,
    ) {
        const result = await this.promotionManagerService.editItemV2(lang, req, id, user._id);
        return result;
    }

    @ApiTags('admin')
    @Post('active/:id')
    @UseGuards(AuthGuard('jwt_admin'))
    async activeItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') id: string,
        @Body() req: activePromotionDTOAdmin,
        @GetUserByToken() user,
    ) {
        const result = await this.promotionManagerService.activeItem(lang, req, id, user._id);
        return result;
    }
    @ApiTags('admin')
    @Get('delete_soft/:id')
    @UseGuards(AuthGuard('jwt_admin'))
    async deleteSoftItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') id: string,
        @GetUserByToken() user,
    ) {
        const result = await this.promotionManagerService.deleteSoftItem(lang, id, user._id);
        return result;
    }

    @ApiTags('admin')
    @Get('/code_available/:id')
    @UseGuards(AuthGuard('jwt_admin'))
    async codeAvailable(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @IPageDecorator() iPage: iPageDTO,
        @Query("brand") brand: string,
        @Query("id_service") id_service: string,
        @Query("address") address: string,
        @GetUserByToken() user,
        @Param('id') idCustomer: string,
    ) {
        try {
            const tempAddress = decodeURI(address || "");
            const Brand = brand || null;
            const idService = id_service ? id_service : "";
            // const result = await this.promotionManagerService.codeAvailable(lang, iPage, Brand, id, user._id, idService);
            const result = await this.promotionSystemService.codeAvailable(lang, iPage, Brand, idService, idCustomer, tempAddress, user);

            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @UseGuards(AuthGuard('jwt_admin'))
    @ApiTags('admin')
    @Post('check_code_promotion/:id')
    async checkCodePromotion(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() req: createGroupOrderDTOCustomer,
        @GetUserByToken() user,
        @Param('id') id: string
    ) {
        try {
            if (!req.code_promotion || req.code_promotion === "") {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
            }
            const getCustomer = await this.customerRepositoryService.findOneById(id);
            const infoJob = await this.groupOrderService.calculateFeeGroupOrder(lang, req, "admin");
            // const result = await this.promotionService.calculateCodePromotion(lang, infoJob, req.code_promotion, getCustomer);
            const result = await this.promotionSystemService.calculateCodePromotion(lang, infoJob, req.code_promotion, getCustomer);

            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @UseGuards(AuthGuard('jwt_admin'))
    @ApiTags('admin')
    @Post('check_event_promotion/:idCustomer')
    async checkEventPromotion(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() req: createGroupOrderDTOCustomer,
        @GetUserByToken() user,
        @Param('idCustomer') idCustomer: string
    ) {
        try {
            // const getCustomer = await this.customerModel.findById(id);
            const infoJob = await this.groupOrderService.calculateFeeGroupOrder(lang, req, "admin");
            const result = await this.promotionSystemService.calculateEventPromotion(lang, infoJob, idCustomer);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    // @UseGuards(AuthGuard('jwt_admin'))
    // @ApiTags('admin')
    // @Post('notification_promotion')
    // async notificationPromotion(
    //     @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
    //     @Body() req: createGroupOrderDTOCustomer,
    //     @GetUserByToken() user,
    //     @Param('id') id: string
    // ) {
    //     try {
    //         // const getCustomer = await this.customerModel.findById(id);
    //         const infoJob = await this.groupOrderService.calculateFeeGroupOrder(lang, req);
    //         const result = await this.promotionService.calculateEventPromotion(lang, infoJob, id);
    //         return result;
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    //     }
    // }

    @UseGuards(AuthGuard('jwt_admin'))
    @ApiTags('admin')
    @Get('test')
    async notificationPromotion(
    ) {
        try {
            const result = await this.promotionManagerService.testV3();
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @UseGuards(AuthGuard('jwt_admin'))
    @ApiTags('admin')
    @Get('detail_used_promotion/:id')
    async detailUsedPromotion(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Param('id') id: string,
        @IPageDecorator() iPage: iPageUsedPromotionDTOAdmin,
    ) {
        try {
            iPage.status = (iPage.status) ? iPage.status : "";
            const result = await this.promotionManagerService.detailUsedPromotion(lang, id, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @UseGuards(AuthGuard('jwt_admin'))
    @ApiTags('admin')
    @Get('history_activity/:id')
    async historyActivity(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Param('id') id: string,
        @IPageDecorator() iPage: iPageDTO,
    ) {
        try {
            iPage.length = Number(iPage.length) || 10;
            iPage.start = Number(iPage.start) || 0;
            const result = await this.promotionManagerService.historyActivity(lang, id, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @UseGuards(AuthGuard('jwt_admin'))
    @ApiTags('admin')
    @Get('get_child_promotion/:code')
    async getChildPromotion(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Param('code') code: string,
        @IPageDecorator() iPage: iPageUsedPromotionDTOAdmin,
    ) {
        try {
            iPage.status = (iPage.status) ? iPage.status : 'all'; // used,not-used
            const result = await this.promotionManagerService.getChildPromotion(lang, code, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    @UseGuards(AuthGuard('jwt_admin'))
    @ApiTags('admin')
    @Get('get_promotion_by_position')
    async getPromotionByPosition(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Query() query: querySetupPositionPromotion
    ) {
        try {
            query.customer = (query.customer !== null && query.customer !== undefined && query.customer !== "") ? query.customer : null;
            query.group_customer = (query.group_customer !== null && query.group_customer !== undefined && query.group_customer !== "") ? query.group_customer : null;
            const result = await this.promotionManagerService.getPromotionByPosition(lang, query);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @UseGuards(AuthGuard('jwt_admin'))
    @ApiTags('admin')
    @Post('set_position_promotion')
    async setPositionPromotion(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() req: updatePositionPromotion,
        @GetUserByToken() user,
    ) {
        try {
            const result = await this.promotionManagerService.setPositionPromotion(lang, req);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
