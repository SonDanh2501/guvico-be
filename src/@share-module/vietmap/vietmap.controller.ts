import { Controller, Get, HttpException, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { VietmapService } from './vietmap.service';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { GetUserByToken } from 'src/@core';

@Controller('maps_v2')
export class VietmapController {
    constructor(
        private vietmapService: VietmapService,
    ) {}

    @UseGuards(AuthGuard('jwt'))
    @ApiTags('maps_v2')
    @Get('/auto_complete')
    async autoComplete(
        @Query('input') input: string,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.vietmapService.autoComplete(input);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiTags('maps_v2')
    @Get('/place_detail')
    async placeDetail(
        @Query('place_id') place_id: string,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.vietmapService.placeDetail(place_id)
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    
    
    @UseGuards(AuthGuard('jwt'))
    @ApiTags('maps_v2')
    @Get('/reverse')
    async reverse(
        @Query('latlng') latlng: string,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.vietmapService.reverse(latlng)
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
