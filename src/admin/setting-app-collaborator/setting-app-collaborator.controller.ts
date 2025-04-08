import { Body, Controller, Get, HttpException, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { SettingAppCollaboratorService } from './setting-app-collaborator.service';

@Controller('setting_app_collaborator')
export class SettingAppCollaboratorController {
    constructor(private settingAppCollaboratorService: SettingAppCollaboratorService) { }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('get_setting')
    async getSetting(
    ) {
        try {
            const result = await this.settingAppCollaboratorService.getSetting();
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }

    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('edit_setting')
    async editSetting(
        @Body() req: any,
    ) {
        try {
            const result = await this.settingAppCollaboratorService.editSetting(req);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
