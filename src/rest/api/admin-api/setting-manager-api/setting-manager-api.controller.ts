import { Controller, HttpException, HttpStatus, Post, Query, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiTags } from '@nestjs/swagger'
import { DEFAULT_LANG, LANGUAGE, ValidateLangPipe } from 'src/@core'
import { EtelecomService } from 'src/@share-module/etelecom/etelecom.service'
import { SettingSystemService } from 'src/core-system/@core-system/setting-system/setting-system.service'

@Controller('setting_manager')
export class SettingManagerApiController {
  constructor(
    private settingSystemService: SettingSystemService,
    private etelecomService: EtelecomService,
  ) {}

  @ApiTags('admin')
  @Post('/create_template_zns')
  @UseGuards(AuthGuard('jwt_admin'))
  async createTemplate(
      @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
  ) {
    try {
      return await this.etelecomService.createTemplate()
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    }
  }
}
