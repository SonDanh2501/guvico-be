import { Controller, Get, HttpException, HttpStatus, Param, Query, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiTags } from '@nestjs/swagger'
import { DEFAULT_LANG, GetSubjectAction, IPageDecorator, iPageDTO, LANGUAGE, ValidateLangPipe } from 'src/@core'
import { iPageTransitionDTOAdmin } from 'src/@core/dto/transition.dto'
import { CustomerSystemService } from 'src/core-system/@core-system/customer-system/customer-system.service'
import { HistoryActivitySystemService } from 'src/core-system/@core-system/history-activity-system/history-activity-system.service'
import { TransactionSystemService } from 'src/core-system/@core-system/transaction-system/transaction-system.service'

@Controller('affiliate_manager')
export class AffiliateManagerApiController {
  constructor(
    private customerSystemService: CustomerSystemService,
    private historyActivitySystemService: HistoryActivitySystemService,
    private transactionSystemService: TransactionSystemService,
  ) {}

  // Danh sách những người giới thiệu
  @ApiTags('admin')
  @UseGuards(AuthGuard('jwt_admin'))
  @Get('get_list_referral_person/:idCustomer')
  async getListOfReferralPerson(
    @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
    @GetSubjectAction() subjectAction,
    @IPageDecorator() iPage: iPageDTO,
    @Param('idCustomer') idCustomer: string
  ) {
    try {
      iPage.start = (iPage.start) ? iPage.start : 0;
      iPage.length = (iPage.length) ? iPage.length : 10;
      return await this.customerSystemService.getListReferralPersonByCustomer(subjectAction, iPage, idCustomer);
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    }
  }

  @ApiTags('admin')
  @UseGuards(AuthGuard('jwt_admin'))
  @Get('get_customer_info/:idCustomer')
  async getCustomerInfo(
    @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
    @Param('idCustomer') idCustomer: string
  ) {
    try {
      const result = await this.customerSystemService.getCustomerInfo(lang, idCustomer);
      return result
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    }
  }


  // Lịch sử nhận chiết khấu
  @ApiTags('admin')
  @UseGuards(AuthGuard('jwt_admin'))
  @Get('get_list_activity/:idCustomer')
  async getListHistoryActivity(
      @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
      @GetSubjectAction() subjectAction,
      @IPageDecorator() iPage: iPageDTO,
      @Param('idCustomer') idCustomer: string
  ) {
      try {
          return await this.historyActivitySystemService.getListHistoryActivitiesForReferrerPerson(subjectAction, iPage, idCustomer);
      } catch (err) {
          throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
      }
  }

  // Lịch sử yêu cầu rút
  @ApiTags('customer')
  @UseGuards(AuthGuard('jwt_admin'))
  @Get('get_list_transaction/:idCustomer')
  async getListTransaction(
    @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
    @GetSubjectAction() subjectAction,
    @IPageDecorator() iPage: iPageTransitionDTOAdmin,
    @Param('idCustomer') idCustomer: string
  ) {
    try {
      return await this.transactionSystemService.getListForAffiliateProgram(lang, subjectAction, iPage, idCustomer);
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    }
  }
}
