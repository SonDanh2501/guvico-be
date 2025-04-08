import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiTags } from '@nestjs/swagger'
import { createCustomerDTOAdmin, DEFAULT_LANG, editCustomerDTOAdmin, GetSubjectAction, GetUserByToken, IPageDecorator, iPageDTO, LANGUAGE, ValidateLangPipe } from 'src/@core'
import { AuthSystemService } from 'src/core-system/@core-system/auth-system/auth-system.service'
import { CustomerSystemService } from 'src/core-system/@core-system/customer-system/customer-system.service'

@Controller('customer_manager')
export class CustomerManagerApiController {
    constructor(
        private customerSystemService: CustomerSystemService,
        private authSystemService: AuthSystemService,

    ) {}


    // @ApiTags('admin')
    // @UseGuards(AuthGuard('jwt_admin'))
    // @Get('get_list')
    // async getListItem(
    //     @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
    //     @IPageDecorator() iPage: iPageDTO,
    //     @GetUserByToken() user,
    //     @GetSubjectAction() subjectAction
    // ) {
    //     try {
    //         const result = await this.customerSystemService.getListItem(lang, iPage);
    //         return result;
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    //     }
    // }


    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('/get_detail/:id')
    async getDetailItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param("id") id: string,
        @GetUserByToken() user,
        @GetSubjectAction() subjectAction
    ) {
        try {
            const result = await this.customerSystemService.getDetailItem(lang, subjectAction, id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    // @ApiTags('admin')
    // @Post('/create_item')
    // @UseGuards(AuthGuard('jwt_admin'))
    // async adminCreateItem(
    //     @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
    //     @Body() req: createCustomerDTOAdmin,
    //     @GetUserByToken() user,
    //     @GetSubjectAction() subjectAction
    // ) {
    //     try {
    //         const payload = req;
    //         payload.date_create = new Date().toISOString();
    //         payload.email = (payload.email) ? payload.email : "";
    //         const result = await this.customerManagerService.adminCreateItem(lang, payload, user);
    //         return result;
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    //     }
    // }

    // @ApiTags('admin')
    // @Post('edit_item/:id')
    // @UseGuards(AuthGuard('jwt_admin'))
    // async adminEditItem(
    //     @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
    //     @Param('id') id: string,
    //     @Body() req: editCustomerDTOAdmin,
    //     @GetUserByToken() user,
    //     @GetSubjectAction() subjectAction
    // ) {
    //     try {
    //         req.birthday = req.birthday ? req.birthday : null;
    //         const result = await this.customerManagerService.adminEditItem(lang, req, id, user._id);
    //         return result;
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    //     }
    // }

    
    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('get_list_refferred_person/:idCustomer')
    async getListReferredPerson(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('idCustomer') idCustomer: string,
        @GetUserByToken() user,
        @IPageDecorator() iPage: iPageDTO,
        // @GetSubjectAction() subjectAction
    ) {
        try {
            const result = await this.customerSystemService.getListReferralPersonForAdmin(lang, idCustomer, iPage, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('edit_item/:idCustomer')
    async adminEditCustomer(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('idCustomer') idCustomer: string,
        @Body() req: editCustomerDTOAdmin,
        @GetSubjectAction() subjectAction
    ) {
        try {
            const result = await this.customerSystemService.editCustomer(lang, subjectAction, idCustomer, req);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('/create_new_customer')
    async createNewCustomer(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() body: createCustomerDTOAdmin,
        @GetSubjectAction() subjectAction
    ) {
        try {
            const result = await this.authSystemService.registerForCustomerByAdmin(lang, subjectAction, body);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


}
