import { HttpModule } from '@nestjs/axios'
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { MongooseModule } from '@nestjs/mongoose'
import { PassportModule } from '@nestjs/passport'
import { Address, addressSchema } from 'src/@core/db/schema/address.schema'
import { Banner, bannerSchema } from 'src/@core/db/schema/banner.schema'
import { Customer, customerSchema } from 'src/@core/db/schema/customer.schema'
import { CustomerSetting, customerSettingSchema } from 'src/@core/db/schema/customer_setting.schema'
import { ExtendOptional, extendOptionalSchema } from 'src/@core/db/schema/extend_optional.schema'
import { FeedBack, feedBackSchema } from 'src/@core/db/schema/feedback.schema'
import { GroupOrder, groupOrderSchema } from 'src/@core/db/schema/group_order.schema'
import { GroupPromotion, groupPromotionSchema } from 'src/@core/db/schema/group_promotion.schema'
import { GroupService, groupServiceSchema } from 'src/@core/db/schema/group_service.schema'
import { HistoryActivity, historyActivitySchema } from 'src/@core/db/schema/history_activity.schema'
import { HistoryPoint, historyPointSchema } from 'src/@core/db/schema/history_point.schema'
import { Notification, notificationSchema } from 'src/@core/db/schema/notification.schema'
import { OptionalService, optionalServiceSchema } from 'src/@core/db/schema/optional_service.schema'
import { Order, orderSchema } from 'src/@core/db/schema/order.schema'
import { Popup, popupSchema } from 'src/@core/db/schema/popup.schema'
import { Promotion, promotionSchema } from 'src/@core/db/schema/promotion.schema'
import { ReasonCancel, reasonCancelSchema } from 'src/@core/db/schema/reason_cancel.schema'
import { Service, serviceSchema } from 'src/@core/db/schema/service.schema'
import { ServiceFee, serviceFeeSchema } from 'src/@core/db/schema/service_fee.schema'
import { TransitionCustomer, transitionCustomerSchema } from 'src/@core/db/schema/transition_customer.schema'
import { TypeFeedBack, typeFeedBackSchema } from 'src/@core/db/schema/type_feedback.schema'
import { CustomerMiddleWareService } from 'src/@core/middle/customer-middleware.service'
import { RepositoryModule } from 'src/@repositories/repository.module'
import { CustomExceptionModule } from 'src/@share-module/custom-exception/custom-exception.module'
import { EtelecomModule } from 'src/@share-module/etelecom/etelecom.module'
import { GeneralHandleModule } from 'src/@share-module/general-handle/general-handle.module'
import { MomoModule } from 'src/@share-module/momo/momo.module'
import { SmsModule } from 'src/@share-module/sms/sms.module'
import { VnpayModule } from 'src/@share-module/vnpay/vnpay.module'
import { ZnsModule } from 'src/@share-module/zns/zns.module'
import { CoreSystemModule2 } from 'src/core-system/@core-system/core-system.module'
import { CoreSystemModule } from 'src/core-system/core-system.module'
import { NotificationModule } from 'src/notification/notification.module'
import { BASEPOINT_DB, Collaborator, collaboratorSchema, DeviceToken, deviceTokenSchema, GlobalService, GroupCustomer, groupCustomerSchema, JwtStrategy, JwtStrategyCustomer, News, newsSchema } from '../@core'
import { CustomerRequest, customerRequestSchema } from '../@core/db/schema/customer_request.schema'
import { PhoneOTP, phoneOTPSchema } from '../@core/db/schema/phone_otp.schema'
import { AddressController } from './address/address.controller'
import { AddressService } from './address/address.service'
import { AuthController } from './auth/auth.controller'
import { AuthService } from './auth/auth.service'
import { BannerController } from './banner/banner.controller'
import { BannerService } from './banner/banner.service'
import { ExtendOptionalController } from './extend-optional/extend-optional.controller'
import { ExtendOptionalService } from './extend-optional/extend-optional.service'
import { FeedbackController } from './feedback/feedback.controller'
import { FeedbackService } from './feedback/feedback.service'
import { FinanceController } from './finance/finance.controller'
import { FinanceService } from './finance/finance.service'
import { GroupOrderController } from './group-order/group-order.controller'
import { GroupOrderService } from './group-order/group-order.service'
import { GroupServiceController } from './group-service/group-service.controller'
import { GroupServiceService } from './group-service/group-service.service'
import { NewsController } from './news/news.controller'
import { NewsService } from './news/news.service'
import { NotificationController } from './notification/notification.controller'
import { NotificationService } from './notification/notification.service'
import { OptionalServiceController } from './optional-service/optional-service.controller'
import { OptionalServiceService } from './optional-service/optional-service.service'
import { OrderController } from './order/order.controller'
import { OrderService } from './order/order.service'
import { PaymentController } from './payment/payment.controller'
import { PaymentService } from './payment/payment.service'
import { PopupController } from './popup/popup.controller'
import { PopupService } from './popup/popup.service'
import { ProfileController } from './profile/profile.controller'
import { ProfileService } from './profile/profile.service'
import { PromotionController } from './promotion/promotion.controller'
import { PromotionService } from './promotion/promotion.service'
import { RequestController } from './request/request.controller'
import { RequestService } from './request/request.service'
import { ReviewController } from './review/review.controller'
import { ReviewService } from './review/review.service'
import { ServiceController } from './service/service.controller'
import { ServiceService } from './service/service.service'
import { SettingController } from './setting/setting.controller'
import { SettingService } from './setting/setting.service'


@Module({
  imports: [
    MongooseModule.forRoot(BASEPOINT_DB),
    MongooseModule.forFeature([
      { name: Customer.name, schema: customerSchema },
      { name: Collaborator.name, schema: collaboratorSchema },
      { name: GroupService.name, schema: groupServiceSchema },
      { name: Service.name, schema: serviceSchema },
      { name: OptionalService.name, schema: optionalServiceSchema },
      { name: ExtendOptional.name, schema: extendOptionalSchema },
      { name: Order.name, schema: orderSchema },
      { name: GroupOrder.name, schema: groupOrderSchema },
      { name: Promotion.name, schema: promotionSchema },
      { name: Banner.name, schema: bannerSchema },
      { name: Address.name, schema: addressSchema },
      { name: GroupCustomer.name, schema: groupCustomerSchema },
      { name: HistoryPoint.name, schema: historyPointSchema },
      { name: DeviceToken.name, schema: deviceTokenSchema },
      { name: Notification.name, schema: notificationSchema },
      { name: ReasonCancel.name, schema: reasonCancelSchema },
      { name: FeedBack.name, schema: feedBackSchema },
      { name: TypeFeedBack.name, schema: typeFeedBackSchema },
      { name: ServiceFee.name, schema: serviceFeeSchema },
      { name: TransitionCustomer.name, schema: transitionCustomerSchema },
      { name: HistoryActivity.name, schema: historyActivitySchema },
      { name: PhoneOTP.name, schema: phoneOTPSchema },
      { name: CustomerSetting.name, schema: customerSettingSchema },
      { name: News.name, schema: newsSchema },
      { name: Popup.name, schema: popupSchema },
      { name: CustomerRequest.name, schema: customerRequestSchema },
      { name: GroupPromotion.name, schema: groupPromotionSchema },
    ]),
    PassportModule,
    JwtModule.register({
      secret: 'sondanh2501#',
      // privateKey: "sondanh2501#",
      signOptions: {
        expiresIn: '365d',
      },
    }),
    SmsModule,
    HttpModule,
    CustomExceptionModule,
    CoreSystemModule,
    NotificationModule,
    GeneralHandleModule,
    VnpayModule,
    MomoModule,
    //QueuesModule,
    RepositoryModule,
    CoreSystemModule2,
    // CronjobModule
    ZnsModule,
    EtelecomModule,
  ],
  controllers: [
    AuthController,
    OrderController,
    PromotionController,
    ServiceController,
    BannerController,
    GroupServiceController,
    OptionalServiceController,
    ExtendOptionalController,
    SettingController,
    ProfileController,
    GroupOrderController,
    AddressController,
    NewsController,
    NotificationController,
    FeedbackController,
    FinanceController,
    PopupController,
    ReviewController,
    PaymentController,
    RequestController
  ],
  providers: [
    AuthService,
    GlobalService,
    GroupServiceService,
    OptionalServiceService,
    ExtendOptionalService,
    ServiceService,
    OrderService,
    PromotionService,
    BannerService,
    ProfileService,
    GroupOrderService,
    AddressService,
    NewsService,
    NotificationService,
    FinanceService,
    FeedbackService,
    JwtStrategy,
    SettingService,
    NewsService,
    PopupService,
    ReviewService,
    PaymentService,
    RequestService,
    JwtStrategyCustomer,
    // MomoService
    // GroupCustomerSystemService,
    // {
    //   provide: APP_GUARD,
    //   useClass: JwtStrategyCustomer,
    // },
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: HttpCustomerInterceptor,
    // }
  ],
  exports: [
    GroupOrderService,
    OrderService,
    ServiceService
  ]
})
// export class CustomerModule { }
export class CustomerModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CustomerMiddleWareService)
      .exclude({ path: "/customer/payment/*", method: RequestMethod.ALL })
      .forRoutes(
        AuthController,
        OrderController,
        PromotionController,
        ServiceController,
        BannerController,
        GroupServiceController,
        OptionalServiceController,
        ExtendOptionalController,
        SettingController,
        ProfileController,
        GroupOrderController,
        AddressController,
        NewsController,
        NotificationController,
        FeedbackController,
        FinanceController,
        PopupController,
        ReviewController
      )
  }
}