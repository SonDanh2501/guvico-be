import { Controller, Get, HttpException, HttpStatus, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DEFAULT_LANG, iPageDTO, LANGUAGE, ValidateLangPipe } from 'src/@core';
import { ExtendOptionalService } from '../extend-optional/extend-optional.service';
import { OptionalServiceService } from './optional-service.service';

@Controller('optional_service')
export class OptionalServiceController {
    constructor(
        private optionalServiceService: OptionalServiceService,
        private extendOptionalService: ExtendOptionalService
    ) { }

    @ApiTags('customer')
    @Get('optional_service_by_service/:id')
    async getOptionalServiceByService(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param("id") id: string
    ) {
        try {
            const iPage: iPageDTO = {
                search: "",
                length: 50,
                start: 0,
            }
            const getOptionalService = await this.optionalServiceService.getOptionalServiceByService(lang, iPage, id);
            const getHoliday = await this.optionalServiceService.getHolidayOptionalServiceByService(lang, iPage, id);
            let temp = []
            for (let i = 0; i < getOptionalService.data.length; i++) {
                temp.push(this.extendOptionalService.getExtendOptionalByOptionalService(lang, iPage, getOptionalService.data[i]._id));
            }
            const getItem = await Promise.all(temp);
            const holiday = getItem[0].data[0]?.area_fee[0]?.price_option_holiday ? getItem[0].data[0]?.area_fee[0]?.price_option_holiday : [];
            let result = {
                data: [],
                holiday: holiday
            };
            for (let i = 0; i < getOptionalService.data.length; i++) {
                const temp = {
                    _id: getOptionalService.data[i]._id,
                    title: getOptionalService.data[i].title,
                    thumbnail: getOptionalService.data[i].thumbnail,
                    description: getOptionalService.data[i].description,
                    is_active: getOptionalService.data[i].is_active,
                    type: getOptionalService.data[i].type,
                    screen: getOptionalService.data[i].screen,
                    // view_confirm: getOptionalService.data[i].view_confirm,
                    position: getOptionalService.data[i].position,
                    extend_optional: getItem[i].data

                }
                result.data.push(temp)
            }
            return result
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
