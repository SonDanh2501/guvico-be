import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { activeGroupServiceDTOAdmin, createGroupCustomerDTOAdmin, DEFAULT_LANG, editGroupCustomerDTOAdmin, GetUserByToken, iPageDTO, LANGUAGE, ValidateLangPipe } from 'src/@core';
import { GroupCustomerMamagerService } from './group-customer-mamager.service';

@Controller('group_customer_mamager')
export class GroupCustomerMamagerController {
    constructor(private groupCustomerMamagerService: GroupCustomerMamagerService) { }

    @ApiTags('admin')
    @Get('get_list')
    async getListItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageDTO,
    ) {
        try {
            iPage.length = Number(iPage.length) || 10;
            iPage.search = decodeURI(iPage.search || "");
            iPage.start = Number(iPage.start) || 0;
            const result = await this.groupCustomerMamagerService.getListItem(lang, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], HttpStatus.FORBIDDEN)
        }
    }

    @ApiTags('admin')
    @Get('get_detail/:id')
    async getDetailItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') id: string,
    ) {
        try {
            const result = await this.groupCustomerMamagerService.getDetailItem(lang, id);
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
        @Body() req: createGroupCustomerDTOAdmin,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.groupCustomerMamagerService.createItem(lang, req, user._id);
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
        @Body() req: editGroupCustomerDTOAdmin,
        @GetUserByToken() user
    ) {
        const result = await this.groupCustomerMamagerService.editItem(lang, req, id, user._id);
        return result;
    }

    @ApiTags('admin')
    @Post('delete_item/:id')
    @UseGuards(AuthGuard('jwt_admin'))
    async deleteItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') id: string,
        @GetUserByToken() user
    ) {
        const result = await this.groupCustomerMamagerService.deleteItem(lang, id, user._id);
        return result;
    }

    @ApiTags('admin')
    @Post('acti_item/:id')
    @UseGuards(AuthGuard('jwt_admin'))
    async actiItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') id: string,
        @GetUserByToken() user,
        @Body() req: activeGroupServiceDTOAdmin,
    ) {
        const result = await this.groupCustomerMamagerService.actiItem(lang, req, id, user._id);
        return result;
    }


    @ApiTags('admin')
    @Post('get_list_customer_by_group/:idGroupCustomer')
    @UseGuards(AuthGuard('jwt_admin'))
    async getListCustomerByGroupCustomer(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('idGroupCustomer') idGroupCustomer: string,
        @Query() iPage: iPageDTO,
        @GetUserByToken() user,
    ) {
        try {
            iPage.length = Number(iPage.length) || 10;
            iPage.search = decodeURI(iPage.search || "");
            iPage.start = Number(iPage.start) || 0;
            const result = await this.groupCustomerMamagerService.getListCustomerByGroupCustomer(lang, iPage, idGroupCustomer, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    // @ApiTags('admin')
    // @Post('add_customer_in_group/:id')
    // @UseGuards(AuthGuard('jwt_admin'))
    // async addCustomerInGroup(
    //     @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
    //     @Param('id') id: string,
    //     @GetUserByToken() user,
    //     @Body() req: any,
    // ) {
    //     try {
    //         const arrCustomer = req.arr_customer;
    //         const result = await this.groupCustomerMamagerService.addCustomerInGroup(lang, req, id, arrCustomer, user);
    //         return result;
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    //     }
    // }

    // @ApiTags('admin')
    // @Post('remove_customer_out_group/:id')
    // @UseGuards(AuthGuard('jwt_admin'))
    // async removeCustomerOutGroup(
    //     @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
    //     @Param('id') id: string,
    //     @GetUserByToken() user,
    //     @Body() req: any,
    // ) {
    //     try {
    //         const arrCustomer = req.arr_customer;
    //         const result = await this.groupCustomerMamagerService.removeCustomerOutGroup(lang, req, id, arrCustomer, user);
    //         return result;
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    //     }
    // }

}

