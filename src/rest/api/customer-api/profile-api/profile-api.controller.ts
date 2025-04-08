import { Controller, Get, HttpException, HttpStatus, Query, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiTags } from '@nestjs/swagger'
import { DEFAULT_LANG, GetSubjectAction, IPageDecorator, iPageDTO, LANGUAGE, ValidateLangPipe } from 'src/@core'
import { CustomerSystemService } from 'src/core-system/@core-system/customer-system/customer-system.service'

@Controller('profile')
export class ProfileApiController {
  constructor(
    private customerSystemService: CustomerSystemService
  ) { }

  @ApiTags('customer')
  @UseGuards(AuthGuard('jwt_customer'))
  @Get('get_list_referred_person')
  async getListReferredPerson(
      @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
      @GetSubjectAction() subjectAction,
      @IPageDecorator() iPage: iPageDTO,
  ) {
      try {
          const result = await this.customerSystemService.getListReferredPerson(lang, subjectAction, iPage);
          return result;
      } catch (err) {
          throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
      }
  }
}
