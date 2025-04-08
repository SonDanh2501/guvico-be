import { Controller, Get, HttpException, HttpStatus, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DEFAULT_LANG, LANGUAGE, ValidateLangPipe } from 'src/@core';
import { PopupService } from './popup.service';

@Controller('popup')
export class PopupController {
    constructor(
        private popupService: PopupService,
        ) {}

        
        @ApiTags('customer')
        @Get('get_popup')
        async getPopup(
            @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        ) {
            try {
                const result = await this.popupService.getPopup(lang);
                return result;
            } catch (err) {
                throw new HttpException(err.response || [{message: err.toString(), field: null}], HttpStatus.FORBIDDEN);
            }
        }
}
