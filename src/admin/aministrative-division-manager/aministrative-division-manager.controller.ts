import { Controller, Get, HttpException, HttpStatus, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import * as AministrativeDivision from 'src/@core/constant/provincesVN.json';
import { AministrativeDivisionManagerService } from './aministrative-division-manager.service';

@Controller('aministrative_division_manager')
export class AministrativeDivisionManagerController {
    constructor(
        // private aministrativeDivisionManagerService: AministrativeDivisionManagerService
    ) { }

    @ApiTags('admin')
    @Get('get_aministrative_division')
    async settings() {
        try {
            const result = {
                aministrative_division: AministrativeDivision
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    //     @ApiTags('admin')
    //     @Get('get_aministrative_division/:code')

    //     async getList(
    //         @Param('code') code: string,
    //         ) {
    //     try {
    //         const result = await this.aministrativeDivisionManagerService.getProvince(code);
    //         return result;
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    //     }
    // }
}
