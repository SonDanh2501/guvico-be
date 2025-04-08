import { Body, Controller, HttpException, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common';
import { Get } from '@nestjs/common/decorators';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { actiUserSystemDTO, CreateDTOAdmin, DEFAULT_LANG, editUserSystemDTO, GetUserByToken, iPageDTO, iPageGetUserSysstemDTOAdmin, LANGUAGE, ValidateLangPipe } from 'src/@core';
import { UserSystemManagerService } from './user-system-manager.service';
import { createApiDTOAdmin, updateKeyApiDTOAdmin } from '../../@core/dto/key_api.dto';
import { createRoleAdminDTOAdmin, updateRoleAdminDTOAdmin } from '../../@core/dto/admin.dto';

@Controller('user_system_manager')
export class UserSystemManagerController {
    constructor(private userSystemManagerService: UserSystemManagerService) { }

    @ApiTags('admin')
    @Post('/create_admin')
    @UseGuards(AuthGuard('jwt_admin'))
    async createItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() req: CreateDTOAdmin,
        @GetUserByToken() user,

    ) {
        try {
            const payload = req;
            payload.date_create = new Date().toISOString();
            const result = await this.userSystemManagerService.createItem(lang, payload, user._id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Post('/edit_admin/:id')
    @UseGuards(AuthGuard('jwt_admin'))
    async editItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() req: editUserSystemDTO,
        @GetUserByToken() user,
        @Param('id') id: string,
    ) {
        try {
            const result = await this.userSystemManagerService.editItem(lang, id, req, user._id)
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Post('/acti_admin/:id')
    @UseGuards(AuthGuard('jwt_admin'))
    async actiItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() req: actiUserSystemDTO,
        @GetUserByToken() user,
        @Param('id') id: string
    ) {
        try {
            const result = await this.userSystemManagerService.actiItem(lang, id, req, user._id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Post('/delete_admin/:id')
    @UseGuards(AuthGuard('jwt_admin'))
    async deleteItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Param('id') id: string
    ) {
        try {
            const result = await this.userSystemManagerService.deleteItem(lang, id, user._id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Get('/get_list')
    @UseGuards(AuthGuard('jwt_admin'))
    async getList(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Query() iPage: iPageGetUserSysstemDTOAdmin,
    ) {
        try {
            iPage.length = Number(iPage.length) || 20;
            iPage.search = decodeURI(iPage.search || "");
            iPage.start = Number(iPage.start) || 0;
            const result = await this.userSystemManagerService.getList(lang, iPage, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Get('/get_detail/:id')
    @UseGuards(AuthGuard('jwt_admin'))
    async getDetail(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Param('id') id: string
    ) {
        try {
            const result = await this.userSystemManagerService.getDetail(lang, id, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Get('/get_list_api')
    @UseGuards(AuthGuard('jwt_admin'))
    async getListApi(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Query() iPage: iPageDTO
    ) {
        try {
            iPage.length = (iPage.length) ? iPage.length : 10;
            iPage.start = (iPage.start) ? iPage.start : 0;
            iPage.search = decodeURI(iPage.search || "");
            const result = await this.userSystemManagerService.getListApi(lang, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Post('/create_key_api')
    @UseGuards(AuthGuard('jwt_admin'))
    async createKeyApi(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Body() req: createApiDTOAdmin
    ) {
        try {
            const result = await this.userSystemManagerService.createKeyApi(lang, req, user._id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Post('/edit_key_api/:id')
    @UseGuards(AuthGuard('jwt_admin'))
    async editKeyApi(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Body() req: updateKeyApiDTOAdmin,
        @Param('id') id
    ) {
        try {
            const result = await this.userSystemManagerService.editKeyApi(lang, req, user._id, id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Get('/get_list_role_admin')
    @UseGuards(AuthGuard('jwt_admin'))
    async getListRoleAdmin(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Query() iPage: iPageDTO
    ) {
        try {
            iPage.length = (iPage.length) ? iPage.length : 10;
            iPage.start = (iPage.start) ? iPage.start : 0;
            iPage.search = decodeURI(iPage.search || "");
            const result = await this.userSystemManagerService.getListRoleAdmin(lang, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Post('/create_role_admin')
    @UseGuards(AuthGuard('jwt_admin'))
    async createRoleAdmin(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Body() req: createRoleAdminDTOAdmin
    ) {
        try {
            const result = await this.userSystemManagerService.createRoleAdmin(lang, req, user._id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Post('/edit_role_admin/:id')
    @UseGuards(AuthGuard('jwt_admin'))
    async editRoleAdmin(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Body() req: updateRoleAdminDTOAdmin,
        @Param('id') id
    ) {
        try {
            const result = await this.userSystemManagerService.editRoleAdmin(lang, req, id, user._id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Get('/get_detail_role_admin/:id')
    @UseGuards(AuthGuard('jwt_admin'))
    async getDetailRoleAdmin(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Param('id') id
    ) {
        try {
            const result = await this.userSystemManagerService.getDetailRoleAdmin(lang, id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Get('/get_detail_key_api/:id')
    @UseGuards(AuthGuard('jwt_admin'))
    async getDetailApiKey(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Param('id') id
    ) {
        try {
            const result = await this.userSystemManagerService.getDetailApiKey(lang, id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('get_setting_key_api')
    async getSettingKeyApi(
    ) {
        try {
            const result = await this.userSystemManagerService.getSettingKeyApi();
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('delete_role_admin/:idRole')
    async deleteRoleAdmin(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param("idRole") idRole: string,
        @GetUserByToken() user,
    ) {
        try {
            const result = await this.userSystemManagerService.deleteRoleAdmin(lang, idRole);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
