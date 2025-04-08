import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose'
import { AuthController } from './auth/auth.controller';
import { CollaboratorManagerController } from './collaborator-manager/collaborator-manager.controller';
import { CustomerManagerController } from './customer-manager/customer-manager.controller';
import { PromotionManagerController } from './promotion-manager/promotion-manager.controller';
import { PromotionManagerService } from './promotion-manager/promotion-manager.service';
import { CustomerManagerService } from './customer-manager/customer-manager.service';
import { CollaboratorManagerService } from './collaborator-manager/collaborator-manager.service';
import { BASEPOINT_DB, GlobalService, GroupCustomer, groupCustomerSchema, InfoRewardCollaborator, infoRewardCollaboratorSchema, JwtStrategyAdmin, Order, orderSchema } from '../@core';
import { UserSystemManagerController } from './user-system-manager/user-system-manager.controller';
import { UserSystemManagerService } from './user-system-manager/user-system-manager.service';
import { AuthService } from './auth/auth.service';
import { UserSystem, userSystemSchema } from 'src/@core/db/schema/user_system.schema';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { Customer, customerSchema } from 'src/@core/db/schema/customer.schema';
import { Collaborator, collaboratorSchema } from 'src/@core/db/schema/collaborator.schema';
import { TransitionCollaborator, transitionCollaboratorSchema } from 'src/@core/db/schema/transition_collaborator.schema';
import { TransitionCustomer, transitionCustomerSchema } from 'src/@core/db/schema/transition_customer.schema';
import { GroupServiceManagerController } from './group-service-manager/group-service-manager.controller';
import { GroupServiceManagerService } from './group-service-manager/group-service-manager.service';
import { ServiceManagerService } from './service-manager/service-manager.service';
import { ServiceManagerController } from './service-manager/service-manager.controller';
import { OptionalServiceManagerController } from './optional-service-manager/optional-service-manager.controller';
import { OptionalServiceManagerService } from './optional-service-manager/optional-service-manager.service';
import { GroupService, groupServiceSchema } from 'src/@core/db/schema/group_service.schema';
import { Service, serviceSchema } from 'src/@core/db/schema/service.schema';
import { OptionalService, optionalServiceSchema } from 'src/@core/db/schema/optional_service.schema';
import { ExtendOptional, extendOptionalSchema } from 'src/@core/db/schema/extend_optional.schema';
import { ExtendOptionalManagerController } from './extend-optional-manager/extend-optional-manager.controller';
import { ExtendOptionalManagerService } from './extend-optional-manager/extend-optional-manager.service';
import { Promotion, promotionSchema } from 'src/@core/db/schema/promotion.schema';
import { BannerManagerController } from './banner-manager/banner-manager.controller';
import { BannerManagerService } from './banner-manager/banner-manager.service';
import { Banner, bannerSchema } from 'src/@core/db/schema/banner.schema';
import { DeviceToken, deviceTokenSchema } from 'src/@core/db/schema/device_tokens.schema';
import { AministrativeDivisionManagerController } from './aministrative-division-manager/aministrative-division-manager.controller';
import { AministrativeDivisionManagerService } from './aministrative-division-manager/aministrative-division-manager.service';
import { District, districtSchema } from 'src/@core/db/schema/district.schema';
import { Province, provinceSchema } from 'src/@core/db/schema/province.schema';
import { GroupCustomerMamagerController } from './group-customer-mamager/group-customer-mamager.controller';
import { GroupCustomerMamagerService } from './group-customer-mamager/group-customer-mamager.service';
import { NewsManagerController } from './news-manager/news-manager.controller';
import { NewsManagerService } from './news-manager/news-manager.service';
import { News, newsSchema } from 'src/@core/db/schema/news.schema';
// import { OrderSystemService } from 'src/core-system/order-system/order-system.service';
import { CoreSystemModule } from 'src/core-system/core-system.module';
import { OrderManagerController } from './order-manager/order-manager.controller';
import { GroupOrderManagerController } from './group-order-manager/group-order-manager.controller';
import { GroupOrderManagerService } from './group-order-manager/group-order-manager.service';
import { OrderManagerService } from './order-manager/order-manager.service';
import { GroupOrder, groupOrderSchema } from 'src/@core/db/schema/group_order.schema';
import { CollaboratorSetting, collaboratorSettingSchema } from 'src/@core/db/schema/collaborator_setting.schema';
import { CustomerSetting, customerSettingSchema } from 'src/@core/db/schema/customer_setting.schema';
import { ReasonCancel, reasonCancelSchema } from 'src/@core/db/schema/reason_cancel.schema';
import { ReasonCancelManagerController } from './reason-cancel-manager/reason-cancel-manager.controller';
import { ReasonCancelManagerService } from './reason-cancel-manager/reason-cancel-manager.service';
import { CustomExceptionModule } from 'src/@share-module/custom-exception/custom-exception.module';
import { PushNotificationManagerController } from './push-notification-manager/push-notification-manager.controller';
import { PushNotificationManagerService } from './push-notification-manager/push-notification-manager.service';
import { PushNotification, pushNotificationSchema } from 'src/@core/db/schema/push_notification.schema';
import { NotificationModule } from 'src/notification/notification.module';
import { FileController } from './file/file.controller';
import { FeedbackManagerService } from './feedback-manager/feedback-manager.service';
import { FeedbackManagerController } from './feedback-manager/feedback-manager.controller';
import { FeedBack, feedBackSchema } from 'src/@core/db/schema/feedback.schema';
import { ReportManangerController } from './report-mananger/report-mananger.controller';
import { ReportManangerService } from './report-mananger/report-mananger.service';
import { HistoryActivity, historyActivitySchema } from 'src/@core/db/schema/history_activity.schema';
import { StatisticController } from './statistic/statistic.controller';
import { StatisticService } from './statistic/statistic.service';
import { GeneralHandleService } from 'src/@share-module/general-handle/general-handle.service';
import { SettingAppCustomerController } from './setting-app-customer/setting-app-customer.controller';
import { SettingAppCustomerService } from './setting-app-customer/setting-app-customer.service';
import { SettingAppCollaboratorService } from './setting-app-collaborator/setting-app-collaborator.service';
import { SettingAppCollaboratorController } from './setting-app-collaborator/setting-app-collaborator.controller';
import { ClickLinkManagerController } from './click-link-manager/click-link-manager.controller';
import { ClickLinkManagerService } from './click-link-manager/click-link-manager.service';
import { ClickLink, clickLinkSchema } from 'src/@core/db/schema/click_link.schema';
import { TypeFeedBack, typeFeedBackSchema } from '../@core/db/schema/type_feedback.schema';
import { CustomerRequestManagerController } from './customer-request-manager/customer-request-manager.controller';
import { CustomerRequestManagerService } from './customer-request-manager/customer-request-manager.service';
import { CustomerRequest, customerRequestSchema } from '../@core/db/schema/customer_request.schema';
import { TransitionPoint, transitionPointSchema } from '../@core/db/schema/transition_point.schema';
import { KeyApi, keyApiSchema } from '../@core/db/schema/key_api.schema';
import { RoleAdmin, roleAdminSchema } from '../@core/db/schema/role_admin.schema';
import { ActivitySystemService } from 'src/core-system/activity-system/activity-system.service';
import { Address, addressSchema } from 'src/@core/db/schema/address.schema';
import { ExamTestController } from './examtest/examtest.controller';
import { ExamTestService } from './examtest/examtest.service';
import { ExamTest, examTestSchema } from 'src/@core/db/schema/examtest_collaborator.schema';
import { InfoTestCollaborator, infoTestCollaboratorSchema } from 'src/@core/db/schema/info_test_collaborator.schema';
import { InfoTestCollaboratorController } from './info-test-collaborator/info-test-collaborator.controller';
import { InfoTestCollaboratorService } from './info-test-collaborator/info-test-collaborator.service';

import { PunishManagerController } from './punish-manager/punish-manager.controller';
import { PunishManagerService } from './punish-manager/punish-manager.service';
import { Punish, punishSchema } from 'src/@core/db/schema/punish.schema';
import { ReasonPunishManagerController } from './reason-punish-manager/reason-punish-manager.controller';
import { ReasonPunishManagerService } from './reason-punish-manager/reason-punish-manager.service';
import { ReasonPunish, reasonPunishSchema } from 'src/@core/db/schema/reason_punish.schema';
import { RewardCollaboratorManagerController } from './reward-collaborator-manager/reward-collaborator-manager.controller';
import { RewardCollaboratorManagerService } from './reward-collaborator-manager/reward-collaborator-manager.service';
import { RewardCollaborator, rewardCollaboratorSchema } from 'src/@core/db/schema/reward_collaborator.schema';
import { CollaboratorBonusController } from './collaborator-bonus/collaborator-bonus.controller';
import { CollaboratorBonusService } from './collaborator-bonus/collaborator-bonus.service';
import { CollaboratorBonus, collaboratorBonusSchema } from 'src/@core/db/schema/collaborator_bonus.schema';
import { CustomerSystemService } from 'src/core-system/customer-system/customer-system.service';
import { InfoRewardCollaboratorService } from './info-reward-collaborator/info-reward-collaborator.service';
import { InfoRewardCollaboratorController } from './info-reward-collaborator/info-reward-collaborator.controller';
import { Balance, balanceSchema } from 'src/@core/db/schema/balance.schema';
import { FileManagerService } from './file-manager/file-manager.service';
import { FileManagerController } from './file-manager/file-manager.controller';
import { FileManager, fileManagerSchema } from 'src/@core/db/schema/file_manager.schema';
import { TrainingLessonManagerService } from './training-lesson-manager/training-lesson-manager.service';
import { TrainingLessonManagerController } from './training-lesson-manager/training-lesson-manager.controller';
import { TrainingLesson, trainingLessonSchema } from 'src/@core/db/schema/training_lesson.schema';
import { RepositoryModule } from 'src/@repositories/repository.module';
import { GroupPromotionManagerService } from './group-promotion-manager/group-promotion-manager.service';
import { GroupPromotionManagerController } from './group-promotion-manager/group-promotion-manager.controller';
import { GroupPromotion, groupPromotionSchema } from 'src/@core/db/schema/group_promotion.schema';
import { BusinessManagerService } from './business-manager/business-manager.service';
import { BusinessManagerController } from './business-manager/business-manager.controller';
import { Business, businessSchema } from 'src/@core/db/schema/business.schema';
import { SettingSystemManagerController } from './setting-system-manager/setting-system-manager.controller';
import { SettingSystemManagerService } from './setting-system-manager/setting-system-manager.service';
import { TransactionManagerController } from './transaction-manager/transaction-manager.controller';
import { TransactionManagerService } from './transaction-manager/transaction-manager.service';
import { PolicyManageController } from './policy-manage/policy-manage.controller';
import { PolicyManageService } from './policy-manage/policy-manage.service';
import { PunishTicketManageService } from './punish-ticket-manage/punish-ticket-manage.service';
import { PunishTicketManageController } from './punish-ticket-manage/punish-ticket-manage.controller';
import { RewardTicketManageController } from './reward-ticket-manage/reward-ticket-manage.controller';
import { RewardTicketManageService } from './reward-ticket-manage/reward-ticket-manage.service';
import { CoreSystemModule2 } from 'src/core-system/@core-system/core-system.module';

// const router = [
//   {
//     path: '/customer_manager',
//     controller: CustomerManagerController,
//   },
//   {
//     path: '/setting_general_manager',
//     controller: SettingGeneralManagerController,
//   },  
//   {
//     path: '/collaborator_manager',
//     controller: CollaboratorManagerController,
//   },
// ]

@Module({
  imports: [
    MongooseModule.forRoot(BASEPOINT_DB),
    MongooseModule.forFeature([
      { name: UserSystem.name, schema: userSystemSchema },
      { name: Customer.name, schema: customerSchema },
      { name: Collaborator.name, schema: collaboratorSchema },
      { name: GroupService.name, schema: groupServiceSchema },
      { name: Service.name, schema: serviceSchema },
      { name: OptionalService.name, schema: optionalServiceSchema },
      { name: ExtendOptional.name, schema: extendOptionalSchema },
      { name: Promotion.name, schema: promotionSchema },
      { name: Banner.name, schema: bannerSchema },
      { name: GroupCustomer.name, schema: groupCustomerSchema },
      { name: Order.name, schema: orderSchema },
      { name: GroupOrder.name, schema: groupOrderSchema },
      { name: News.name, schema: newsSchema },
      { name: CustomerSetting.name, schema: customerSettingSchema },
      { name: CollaboratorSetting.name, schema: collaboratorSettingSchema },
      { name: DeviceToken.name, schema: deviceTokenSchema },
      { name: ReasonCancel.name, schema: reasonCancelSchema },
      { name: PushNotification.name, schema: pushNotificationSchema },
      { name: FeedBack.name, schema: feedBackSchema },
      { name: TransitionCollaborator.name, schema: transitionCollaboratorSchema },
      { name: TransitionCustomer.name, schema: transitionCustomerSchema },
      { name: HistoryActivity.name, schema: historyActivitySchema },
      { name: ClickLink.name, schema: clickLinkSchema },
      { name: TypeFeedBack.name, schema: typeFeedBackSchema },
      { name: CustomerRequest.name, schema: customerRequestSchema },
      { name: TransitionPoint.name, schema: transitionPointSchema },
      { name: KeyApi.name, schema: keyApiSchema },
      { name: RoleAdmin.name, schema: roleAdminSchema },
      { name: Address.name, schema: addressSchema },
      { name: ExamTest.name, schema: examTestSchema },
      { name: InfoTestCollaborator.name, schema: infoTestCollaboratorSchema },
      { name: Punish.name, schema: punishSchema },
      { name: ReasonPunish.name, schema: reasonPunishSchema },
      { name: RewardCollaborator.name, schema: rewardCollaboratorSchema },
      { name: CollaboratorBonus.name, schema: collaboratorBonusSchema },
      { name: CollaboratorSetting.name, schema: collaboratorSettingSchema },
      { name: InfoRewardCollaborator.name, schema: infoRewardCollaboratorSchema },
      { name: Balance.name, schema: balanceSchema },
      { name: FileManager.name, schema: fileManagerSchema },
      { name: TrainingLesson.name, schema: trainingLessonSchema },
      { name: GroupPromotion.name, schema: groupPromotionSchema },
      { name: Business.name, schema: businessSchema },


    ]),
    PassportModule,
    JwtModule.register({
      secret: 'sondanh2501#',
      signOptions: {
        expiresIn: '365d',
      },
    }),
    CoreSystemModule,
    CustomExceptionModule,
    NotificationModule,
    RepositoryModule,
    CoreSystemModule2
  ],
  controllers: [
    AuthController,
    CollaboratorManagerController,
    CustomerManagerController,
    PromotionManagerController,
    UserSystemManagerController,
    GroupServiceManagerController,
    ServiceManagerController,
    OptionalServiceManagerController,
    ExtendOptionalManagerController,
    BannerManagerController,
    GroupCustomerMamagerController,
    NewsManagerController,
    OrderManagerController,
    GroupOrderManagerController,
    ReasonCancelManagerController, PushNotificationManagerController, FileController, FeedbackManagerController, ReportManangerController, StatisticController, SettingAppCustomerController, SettingAppCollaboratorController,
    AministrativeDivisionManagerController,
    ClickLinkManagerController,
    CustomerRequestManagerController,
    ExamTestController,
    InfoTestCollaboratorController,
    PunishManagerController,
    ReasonPunishManagerController,
    RewardCollaboratorManagerController,
    CollaboratorBonusController,
    InfoRewardCollaboratorController,
    FileManagerController,
    TrainingLessonManagerController,
    GroupPromotionManagerController,
    BusinessManagerController,
    SettingSystemManagerController,
    TransactionManagerController,
    PolicyManageController,
    PunishTicketManageController,
    RewardTicketManageController,
  ],
  providers: [PromotionManagerService,
    CustomerManagerService,
    CollaboratorManagerService,
    AuthService,
    JwtStrategyAdmin,
    GlobalService,
    GroupServiceManagerService,
    ServiceManagerService,
    OptionalServiceManagerService,
    ExtendOptionalManagerService,
    UserSystemManagerService,
    BannerManagerService,
    GroupCustomerMamagerService,
    NewsManagerService,
    GroupOrderManagerService,
    OrderManagerService,
    ReasonCancelManagerService,
    PushNotificationManagerService,
    FeedbackManagerService,
    ReportManangerService,
    StatisticService,
    GeneralHandleService,
    SettingAppCustomerService,
    SettingAppCollaboratorService,
    ClickLinkManagerService,
    CustomerRequestManagerService,
    // AministrativeDivisionManagerService,
    ActivitySystemService,
    ExamTestService,
    InfoTestCollaboratorService,
    PunishManagerService,
    ReasonPunishManagerService,
    RewardCollaboratorManagerService,
    CollaboratorBonusService,
    CustomerSystemService,
    InfoRewardCollaboratorService,
    FileManagerService,
    TrainingLessonManagerService,
    GroupPromotionManagerService,
    BusinessManagerService,
    SettingSystemManagerService,
    TransactionManagerService,
    PolicyManageService,
    PunishTicketManageService,
    RewardTicketManageService,
    // CustomerRepositoryService
  ],
  exports: [GroupCustomerMamagerService, CustomerManagerService, ReasonPunishManagerService]
})
export class AdminModule { }
