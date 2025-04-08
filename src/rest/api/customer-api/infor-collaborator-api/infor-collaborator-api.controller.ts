import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IPageDecorator, iPageDTO } from 'src/@core';
import { InforCollaboratorSystemService } from 'src/core-system/@core-system/infor-collaborator-system/infor-collaborator-system.service';
@Controller('infor-collaborator-api')
export class InforCollaboratorApiController {
    constructor(
        private inforCollaboratorSystemService: InforCollaboratorSystemService
    ) { }
    @ApiTags('customer')
    @Get('reviews_infor_collaborator/:idCollab')
    async getInforReviewsCollaborator(
        @IPageDecorator() iPage: iPageDTO,
        @Param('idCollab') idCollab: string,
    ) {
        try {
            const result = await this.inforCollaboratorSystemService.getInforReviews(iPage, idCollab);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN)
        }
    }
}
