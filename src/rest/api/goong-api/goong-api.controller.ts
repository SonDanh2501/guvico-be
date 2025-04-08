import { Controller, Get, HttpException, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { GetUserByToken } from 'src/@core';
import { GoongService } from 'src/@share-module/goong/goong.service';

@Controller('')
export class GoongApiController {
    constructor(
        private goongService: GoongService,
    ) { }

    @UseGuards(AuthGuard('jwt_goong'))
    @ApiTags('google map')
    @Get('/auto_complete')
    async autoComplete(
        @Query('input') input: string,
        @GetUserByToken() user
    ) {
        try {
            return true;
            // const result = await this.goongService.autoComplete(input, user._id)
            // return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @UseGuards(AuthGuard('jwt_goong'))
    @ApiTags('google map')
    @Get('/place_detail')
    async placeDetail(
        @Query('place_id') place_id: string,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.goongService.placeDetail(place_id, user._id)
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @UseGuards(AuthGuard('jwt_goong'))
    @ApiTags('google map')
    @Get('/geocode')
    async geocode(
        @Query('latlng') latlng: string,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.goongService.geocode(latlng, user._id)
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
