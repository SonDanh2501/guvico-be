import { Body, Controller, Get, HttpException, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { SettingAppCustomerService } from './setting-app-customer.service';
import { editCustomerSettingDTOAdmin } from '../../@core/dto/customerSetting.dto';

@Controller('setting_app_customer')
export class SettingAppCustomerController {
    constructor(private settingAppCustomerService: SettingAppCustomerService) { }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('get_setting')
    async getSetting(
    ) {
        try {
            const result = await this.settingAppCustomerService.getSetting();
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('edit_setting')
    async editSetting(
        @Body() req: editCustomerSettingDTOAdmin,
    ) {
        try {
            const result = await this.settingAppCustomerService.editSetting(req);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
