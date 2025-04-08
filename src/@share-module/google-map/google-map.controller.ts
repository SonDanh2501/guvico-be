import { Controller, Get, HttpException, HttpStatus, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { GetUserByToken } from 'src/@core';
import { GoogleMapService } from './google-map.service';

@Controller('google_map')
export class GoogleMapController {
    constructor(
        private googleMapService: GoogleMapService,
    ) { }

    @UseGuards(AuthGuard('jwt'))
    @ApiTags('google map')
    @Get('/auto_complete')
    async autoComplete(
        @Query('input') input: string,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.googleMapService.autoComplete(input, user._id)
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiTags('google map')
    @Get('/place_detail')
    async placeDetail(
        @Query('place_id') place_id: string,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.googleMapService.placeDetail(place_id, user._id)
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiTags('google map')
    @Get('/geocode')
    async geocode(
        @Query('latlng') latlng: string,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.googleMapService.geocode(latlng, user._id)
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

}
