import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common';
import { CollaboratorBonusService } from './collaborator-bonus.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { ValidateLangPipe, LANGUAGE, DEFAULT_LANG, iPageDTO, GetUserByToken } from 'src/@core';
import { createExamTestDTOAdmin } from 'src/@core/dto/examtest.dto';
import { actiCollaboratorBonusDTOAdmin, createCollaboratorBonusDTOAdmin, deleteCollaboratorBonusDTOAdmin, editCollaboratorBonusDTOAdmin } from 'src/@core/dto/collaboratorBonus.dto';

@Controller('collaborator_bonus')
export class CollaboratorBonusController {
    constructor(private collaboratorBonusService: CollaboratorBonusService) { }

    @ApiTags('admin')
    @Get('get_list')
    @UseGuards(AuthGuard('jwt_admin'))
    async getListItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageDTO,
        @GetUserByToken() user
    ) {
        try {
            iPage.length = Number(iPage.length) || 20;
            iPage.search = decodeURI(iPage.search || "");
            iPage.start = Number(iPage.start) || 0;
            const result = await this.collaboratorBonusService.getList(lang, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);;
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('/detail_collaborator_bonus/:id')
    async getDetailCollaboratorBonnus(
        @Param('id') id: string
    ) {
        try {
            const result = (await this.collaboratorBonusService.getDetailCollaboratorBonnus(id));
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);;
        }
    }

    @ApiTags('admin')
    @Post('/create_collaborator_bonus')
    @UseGuards(AuthGuard('jwt_admin'))
    async createItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() req: createCollaboratorBonusDTOAdmin,
        @GetUserByToken() user
    ) {
        try {
            const payload = req;
            const result = await this.collaboratorBonusService.createCollaboratorBonus(lang, payload, user._id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('edit_collaborator_bonus/:id')
    async editItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') id: string,
        @Body() req: editCollaboratorBonusDTOAdmin,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.collaboratorBonusService.editCollaboratorBonus(lang, req, id, user._id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);;
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('acti_collaborator_bonus/:id')
    async actiCollaboratorBonus(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') id: string,
        @Body() req: actiCollaboratorBonusDTOAdmin,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.collaboratorBonusService.actiCollaboratorBonus(lang, req, id, user._id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);;
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('delete_collaborator_bonus/:id')
    async deleteCollaboratorBonus(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') id: string,
        @Body() req: deleteCollaboratorBonusDTOAdmin,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.collaboratorBonusService.deleteCollaboratorBonus(lang, req, id, user._id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);;
        }
    }



}
