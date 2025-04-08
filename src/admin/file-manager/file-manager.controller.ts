import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common';
import { FileManagerService } from './file-manager.service';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { DEFAULT_LANG, GetUserByToken, LANGUAGE, ValidateLangPipe } from 'src/@core';
import { createFileDTOAadmin, iPageFileDTOAdmin } from 'src/@core/dto/file.dto';

@Controller('file_manager')
export class FileManagerController {
    constructor(
        private fileManagerService: FileManagerService,

    ) { }

//  @ApiTags('admin')
//     @Post('/create_admin')
//     @UseGuards(AuthGuard('jwt_admin'))
//     async createItem(
//         @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
//         @Body() req: createFileDTOAadmin,
//         @GetUserByToken() user,

//     ) {
//         try {
//             const payload = req;
//             payload.date_create = new Date().toISOString();
//             const result = await this.fileManagerService.createItem(lang, payload, user._id);
//             return result;
//         } catch (err) {
//             throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
//         }
//     }

    // @ApiTags('admin')
    // @Post('/edit_admin/:id')
    // @UseGuards(AuthGuard('jwt_admin'))
    // async editItem(
    //     @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
    //     @Body() req: editUserSystemDTO,
    //     @GetUserByToken() user,
    //     @Param('id') id: string,
    // ) {
    //     try {
    //         const result = await this.fileManagerService.editItem(lang, id, req, user._id)
    //         return result;
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    //     }
    // }

    // @ApiTags('admin')
    // @Post('/acti_admin/:id')
    // @UseGuards(AuthGuard('jwt_admin'))
    // async actiItem(
    //     @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
    //     @Body() req: actiUserSystemDTO,
    //     @GetUserByToken() user,
    //     @Param('id') id: string
    // ) {
    //     try {
    //         const result = await this.fileManagerService.actiItem(lang, id, req, user._id);
    //         return result;
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    //     }
    // }

    @ApiTags('admin')
    @Post('/get_list_unconnect/:id')
    @UseGuards(AuthGuard('jwt_admin'))
    async getListFileUnconnect(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Query() iPage: iPageFileDTOAdmin
    ) {
        try {
            const result = await this.fileManagerService.getListFileUnconnect(lang, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Post('/delete_file')
    @UseGuards(AuthGuard('jwt_admin'))
    async deleteItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Body("id_files") idFiles: string[]
    ) {
        try {
            const result = await this.fileManagerService.deleteItem(lang, idFiles);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Get('/get_list')
    @UseGuards(AuthGuard('jwt_admin'))
    async getList(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Query() iPage: iPageFileDTOAdmin
    ) {
        try {
            iPage.length = Number(iPage.length) || 20;
            iPage.search = decodeURI(iPage.search || "");
            iPage.start = Number(iPage.start) || 0;
            const result = await this.fileManagerService.getList(lang, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    // @ApiTags('admin')
    // @Get('/get_detail/:id')
    // @UseGuards(AuthGuard('jwt_admin'))
    // async getDetail(
    //     @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
    //     @GetUserByToken() user,
    //     @Param('id') id: string
    // ) {
    //     try {
    //         const result = await this.fileManagerService.getDetail(lang, id, user);
    //         return result;
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    //     }
    // }
}
