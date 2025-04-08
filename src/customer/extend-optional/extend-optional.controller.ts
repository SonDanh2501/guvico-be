import { Controller, Get, Param, Query } from '@nestjs/common';
import { DEFAULT_LANG, iPageDTO, LANGUAGE, ValidateLangPipe } from 'src/@core';
import { ExtendOptionalService } from './extend-optional.service';

@Controller('extend_optional')
export class ExtendOptionalController {
    constructor(private extendOptionalService: ExtendOptionalService) {}


    // @Get('extend_optional_by_optional_service/:id')
    async getExtendOptionalByOptionalService(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageDTO,
        @Param("id") id: string
    ) { 
        const result = await this.extendOptionalService.getExtendOptionalByOptionalService(lang, iPage, id);
        return result;
    }
}
