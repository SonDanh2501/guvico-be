import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Query, UploadedFile, UseInterceptors, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { createBannerDTOAdmin, DEFAULT_LANG, editAddressDTOAdmin, actiAddressDTOAdmin, deleteAddressDTOAdmin, iPageDTO, LANGUAGE, ValidateLangPipe, createAddressDTOCustomer, GlobalService, GetUserByToken } from 'src/@core';
import { AddressService } from './address.service';
import { AuthGuard } from '@nestjs/passport';


@Controller('address')
export class AddressController {
    constructor(
        private addressService: AddressService,
        private globalService: GlobalService
    ) { }

    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
    @Get('/get_list_item')
    async getListItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageDTO,
        @GetUserByToken() user,

    ) {
        try {
            // console.log(user, 'check user ')
            iPage.length = Number(iPage.length) || 10;
            iPage.search = iPage.search || '';
            iPage.start = Number(iPage.start) || 0;
            // const payload = user;
            // const convertPhone = await this.globalService.convertPhone(lang, user)
            // payload.phone = convertPhone.phone;
            // const convertToken = await this.globalService.decryptObject(user);
            // payload._id = user._id;

            const result = await this.addressService.getListItem(lang, iPage, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }




    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
    @Post('/create_item')
    async createItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() req: createAddressDTOCustomer,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.addressService.createItem(lang, req, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
    @Get('detail_item/:id')
    async detailItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Param('id') id: string,
    ) {
        const result = await this.addressService.detailItem(lang, id, user);
        return result;
    }


    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
    @Post('edit_item/:id')
    async editItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Param('id') id: string,
        @Body() req: editAddressDTOAdmin,
    ) {
        const result = await this.addressService.editItem(lang, id, req, user);
        return result;
    }
    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
    @Post('set_address_default/:id')
    async setIsDefaultAddress(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Param('id') id: string,
    ) {
        try {
            const result = await this.addressService.setIsDefaultAddress(lang, id, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }

    }
    // @ApiTags('customer')
    // @UseGuards(AuthGuard('jwt_customer'))
    // @Post('acti_item')
    // async adminActiAddress(
    //     @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
    //     @GetUserByToken() user,
    //     @Body() req: actiAddressDTOAdmin,
    // ) {
    //     const result = await this.addressService.adminActiAddress(lang, req, user);
    //     return result;
    // }
    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
    @Post('delete_item/:id')
    async deleteAddress(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Param('id') id: string,
        @Body() req: deleteAddressDTOAdmin,
    ) {
        const result = await this.addressService.deleteAddress(lang, id, req, user);
        return result;
    }
}
