import { Controller, Get, HttpException, HttpStatus, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import * as AministrativeDivision from 'src/@core/constant/provincesVN.json';
import * as AministrativeDivisionHCM from 'src/@core/constant/provincesVNHCM.json';
import { SettingService } from './setting.service';

@Controller('setting')
export class SettingController {
    constructor(
        private settingService: SettingService,
    ) { }


    @ApiTags('collaborator')
    @Get('get_list_setting')
    async settings() {
        try {
            const setting = await this.settingService.getSetting();
            const result = {
                google_api_key: "",
                goong_key: "no_goong_key",
                aministrative_division: AministrativeDivision,
                background_header: setting.background_header,
                min_money_bank: setting.min_money_bank,
                min_money_momo: setting.min_money_momo
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], HttpStatus.FORBIDDEN);
        }
    }


    @ApiTags('collaborator')
    @Get('get_list_area_hcm_city')
    async areaHCMcity() {
        try {
            const result = {
                aministrative_division_HCM: AministrativeDivisionHCM,
                aministrative_division: AministrativeDivisionHCM,
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], HttpStatus.FORBIDDEN);
        }
    }
}
