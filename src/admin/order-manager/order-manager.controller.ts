import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiTags } from '@nestjs/swagger'
import { addCollaboratorDTOAdmin, adminCheckReviewDTOAdmin, changeStatusHandleReviewOrder, changeStatusOrderDTOAdmin, DEFAULT_LANG, editOrderV2DTOAdmin, GetSubjectAction, GetUserByToken, IPageDecorator, iPageDTO, iPageOrderDTOAdmin, iPageSearchOrderDTO, iPageTotalOrderDTOAdmin, LANGUAGE, ValidateLangPipe } from 'src/@core'
import { OrderManagerService } from './order-manager.service'
@Controller('order_manager')
export class OrderManagerController {
     constructor(
          private orderManagerService: OrderManagerService,
     ) { }

     @ApiTags('admin')
     @UseGuards(AuthGuard('jwt_admin'))
     @Get('/get_list')
     async getList(
          @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
          @GetUserByToken() user,
          @Query() iPage: iPageOrderDTOAdmin,
     ) {
          try {
               iPage.length = Number(iPage.length) || 100;
               iPage.search = decodeURI(iPage.search || "");
               iPage.start = Number(iPage.start) || 0;
               iPage.id_service = (!iPage.id_service) ? "" : iPage.id_service;
               // iPage.start_date = (!iPage.start_date) ? new Date(Date.now()).toISOString() : iPage.start_date;
               // iPage.end_date = (!iPage.end_date) ? new Date(Date.now()).toISOString() : iPage.end_date;
               const result = await this.orderManagerService.getList(lang, iPage, user);
               return result;
          } catch (err) {
               throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
          }
     }

     @ApiTags('admin')
     @UseGuards(AuthGuard('jwt_admin'))
     @Get('/get_detail/:id')
     async getDetailItem(
          @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
          @GetUserByToken() user,
          @Param('id') id: string,
     ) {
          try {
               const result = await this.orderManagerService.getDetailItem(lang, id, user);
               return result;
          } catch (err) {
               throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
          }
     }

     @ApiTags('admin')
     @UseGuards(AuthGuard('jwt_admin'))
     @Post('/change_status_order/:id')
     async changeStatusOrder(
          @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
          @Param('id') idOrder: string,
          @Body() req: changeStatusOrderDTOAdmin,
          @GetUserByToken() user,
          @GetSubjectAction() subjectAction,
     ) {
          try {
               const id_reason_cancel = req.id_reason_cancel
               const result = await this.orderManagerService.changeStatusOrder(lang, subjectAction, idOrder, req, user, id_reason_cancel);
               return result;
          } catch (err) {
               throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
          }
     }

     @ApiTags()
     @UseGuards(AuthGuard('jwt_admin'))
     @Get('/get_order_by_customer/:id')
     async getOrderByCustomer(
          @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
          @Param('id') idCustomer: string,
          @Query() iPage: iPageDTO,
          @GetUserByToken() user
     ) {
          try {
               iPage.length = Number(iPage.length) || 100;
               iPage.valueSort = iPage.valueSort || 'all';
               iPage.start = Number(iPage.start) || 0;
               // iPage.typeSort = Number(iPage.typeSort) || -1;
               const result = await this.orderManagerService.getOrderByCustomer(lang, iPage, idCustomer, user);
               return result;
          } catch (err) {
               throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);

          }
     }

     @ApiTags()
     @UseGuards(AuthGuard('jwt_admin'))
     @Post('/add_collaborator_to_order/:idOrder')
     async addCollaboratorToOrder(
          @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
          @Param('idOrder') idOrder: string,
          @Body() req: addCollaboratorDTOAdmin,
          @GetUserByToken() user,
          @GetSubjectAction() subjectAction
     ) {
          try {
               const result = await this.orderManagerService.addCollaborator(lang, req, idOrder, user, subjectAction);
               return result;
          } catch (err) {
               throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
          }
     }

     @ApiTags()
     @UseGuards(AuthGuard('jwt_admin'))
     @Get('/get_order_by_group_order/:idGroupOrder')
     async getOrderByGroupOrder(
          @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
          @Param('idGroupOrder') idGroupOrder: string,
          @GetUserByToken() user,
          @IPageDecorator() iPage: iPageDTO,
     ) {
          try {
               console.log('====================================');
               console.log(iPage.length);
               console.log('====================================');
               const result = await this.orderManagerService.getOrderByGroupOrderV2(lang, iPage, idGroupOrder, user);
               return result;
          } catch (err) {
               throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
          }
     }

     // @ApiTags('admin')
     // @UseGuards(AuthGuard('jwt_admin'))
     // @Post('/change_status_order_v2/:idOrder')
     // async changeStatusOrderV2(
     //      @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
     //      @Param('idOrder') idOrder: string,
     //      @Body() req: changeStatusOrderDTOAdmin,
     //      @GetUserByToken() user,
     // ) {
     //      try {
     //           const id_reason_cancel = req.id_reason_cancel
     //           const result = await this.orderManagerService.changeStatusOrder(lang, idOrder, req, user, id_reason_cancel);
     //           return result;
     //      } catch (err) {
     //           throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
     //      }
     // }

     @ApiTags('admin')
     @UseGuards(AuthGuard('jwt_admin'))
     @Post('/edit_date_work/:idOrder')
     async editDateWork(
          @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
          @Param('idOrder') idOrder: string,
          @Body() req: editOrderV2DTOAdmin,
          @GetUserByToken() user,
     ) {
          try {
               const result = await this.orderManagerService.editDateWork(lang, idOrder, req, user);
               return result;
          } catch (err) {
               throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
          }
     }


     @ApiTags('admin')
     @Get('/test/:idOrder')
     async test(
          @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
          @Param('idOrder') idOrder: string,
          @GetUserByToken() user,
     ) {
          try {
               // const result = await this.orderManagerService.test(lang, idOrder);
               // return result;
          } catch (err) {
               throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
          }
     }

     @ApiTags('admin')
     @Post('/admin_check_review/:idOrder')
     @UseGuards(AuthGuard('jwt_admin'))
     async adminCheckReview(
          @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
          @Param('idOrder') idOrder: string,
          @GetUserByToken() user,
          @Body() req: adminCheckReviewDTOAdmin
     ) {
          try {
               const result = await this.orderManagerService.adminCheckReview(lang, idOrder, req, user);
               return result;
          } catch (err) {
               throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
          }
     }

     @ApiTags('admin')
     @Post('/note_admin/:idOrder')
     @UseGuards(AuthGuard('jwt_admin'))
     async noteAdmin(
          @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
          @Param('idOrder') idOrder: string,
          @GetUserByToken() user,
          @Body() req: adminCheckReviewDTOAdmin
     ) {
          try {
               req.note_admin = req.note_admin ? req.note_admin : ''
               const result = await this.orderManagerService.noteAdmin(lang, idOrder, req, user);
               return result;
          } catch (err) {
               throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
          }
     }

     @ApiTags('admin')
     @Post('/change_collaborator/:idOrder')
     @UseGuards(AuthGuard('jwt_admin'))
     async changeCollaboratorV2(
          @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
          @Param('idOrder') idOrder: string,
          @GetUserByToken() user,
          @Body() req: addCollaboratorDTOAdmin,
          @GetSubjectAction() subjectAction
     ) {
          try {
               const result = await this.orderManagerService.changeCollaboratorV2(lang, idOrder, user);
               if (result) {
                    await this.orderManagerService.addCollaborator(lang, req, idOrder, user, subjectAction);
               }
               return result;
          } catch (err) {
               throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
          }
     }

     @ApiTags('admin')
     @Get('/test')
     @UseGuards(AuthGuard('jwt_admin'))
     async testSchedule(
          @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
          @GetUserByToken() user,
          // @Param('id') id: string
     ) {
          try {
               const result = await this.orderManagerService.test();
               return result;
          } catch (err) {
               throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
          }
     }


     @ApiTags('admin')
     @UseGuards(AuthGuard('jwt_admin'))
     @Get('/search_order')
     async searchOrder(
          @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
          @GetUserByToken() user,
          @IPageDecorator() iPage: iPageSearchOrderDTO,
     ) {
          try {
               iPage.length = Number(iPage.length) || 100;
               iPage.search = decodeURI(iPage.search || "");
               iPage.start = Number(iPage.start) || 0;
               // iPage.collaborator = iPage.collaborator || "";
               const result = await this.orderManagerService.searchOrder(lang, iPage, user);
               return result;
          } catch (err) {
               throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
          }
     }

     @ApiTags('admin')
     @Post('/update_process_review_order')
     @UseGuards(AuthGuard('jwt_admin'))
     async updateProcessReviewOrder(
          @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
          @Body() req: changeStatusHandleReviewOrder,
          @GetUserByToken() user
     ) {
          try {
               const result = await this.orderManagerService.updateProcessReviewOrder(lang, req, user);
               return result;
          } catch (err) {
               throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
          }
     }

     @ApiTags('admin')
     @UseGuards(AuthGuard('jwt_admin'))
     @Get('/get_total_order')
     async getTotalOrder(
          @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
          @GetUserByToken() user,
          @IPageDecorator() iPage: iPageTotalOrderDTOAdmin,
     ) {
          try {
               iPage.id_service = (iPage.id_service) ? iPage.id_service : "all";
               iPage.payment_method = (iPage.payment_method) ? iPage.payment_method : "all";

               const result = await this.orderManagerService.getTotalOrder(lang, iPage);
               return result;
          } catch (err) {
               throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
          }
     }
}
