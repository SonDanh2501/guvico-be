import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Banner, bannerSchema, BASEPOINT_DB, Collaborator, collaboratorSchema, Customer, customerSchema, DeviceToken, deviceTokenSchema, ExtendOptional, extendOptionalSchema, GroupCustomer, groupCustomerSchema, GroupService, groupServiceSchema, News, newsSchema, OptionalService, optionalServiceSchema, Order, orderSchema, Promotion, promotionSchema, Service, serviceSchema, TransitionCustomer, transitionCustomerSchema, UserSystem, userSystemSchema } from 'src/@core'
import { CollaboratorSetting, collaboratorSettingSchema } from 'src/@core/db/schema/collaborator_setting.schema'
import { CustomerRequest, customerRequestSchema } from 'src/@core/db/schema/customer_request.schema'
import { CustomerSetting, customerSettingSchema } from 'src/@core/db/schema/customer_setting.schema'
import { ExamTest, examTestSchema } from 'src/@core/db/schema/examtest_collaborator.schema'
import { FeedBack, feedBackSchema } from 'src/@core/db/schema/feedback.schema'
import { GroupOrder, groupOrderSchema } from 'src/@core/db/schema/group_order.schema'
import { GroupPromotion, groupPromotionSchema } from 'src/@core/db/schema/group_promotion.schema'
import { HistoryActivity, historyActivitySchema } from 'src/@core/db/schema/history_activity.schema'
import { InfoTestCollaborator, infoTestCollaboratorSchema } from 'src/@core/db/schema/info_test_collaborator.schema'
import { KeyApi, keyApiSchema } from 'src/@core/db/schema/key_api.schema'
import { Notification, notificationSchema } from 'src/@core/db/schema/notification.schema'
import { PriceOption, priceOptionSchema } from 'src/@core/db/schema/price_option.schema'
import { Punish, punishSchema } from 'src/@core/db/schema/punish.schema'
import { PushNotification, pushNotificationSchema } from 'src/@core/db/schema/push_notification.schema'
import { ReasonCancel, reasonCancelSchema } from 'src/@core/db/schema/reason_cancel.schema'
import { RoleAdmin, roleAdminSchema } from 'src/@core/db/schema/role_admin.schema'
import { ServiceFee, serviceFeeSchema } from 'src/@core/db/schema/service_fee.schema'
import { TrainingLesson, trainingLessonSchema } from 'src/@core/db/schema/training_lesson.schema'
import { TypeFeedBack, typeFeedBackSchema } from 'src/@core/db/schema/type_feedback.schema'
import { PhoneOTP, phoneOTPSchema, PunishPolicy, punishPolicySchema, PunishTicket, punishTicketSchema, Report, reportSchema, SystemSetting, systemSettingSchema } from 'src/@repositories/module/mongodb/@database'
import { CashBook, cashBookSchema } from 'src/@repositories/module/mongodb/@database/schema/cash_book.schema'
import { Transaction, transactionSchema } from 'src/@repositories/module/mongodb/@database/schema/transaction.schema'
import { RepositoryModule } from 'src/@repositories/repository.module'
import { CoreSystemModule2 } from 'src/core-system/@core-system/core-system.module'
import { OopSystemModule } from 'src/core-system/@oop-system/oop-system.module'
import { CoreSystemModule } from 'src/core-system/core-system.module'
import { Address, addressSchema } from '../../@core/db/schema/address.schema'
import { LinkInvite, linkInviteschema } from '../../@core/db/schema/link_invite.schema'
import { TransitionCollaborator, transitionCollaboratorSchema } from '../../@core/db/schema/transition_collaborator.schema'
import { CustomExceptionModule } from '../custom-exception/custom-exception.module'
import { GeneralHandleModule } from '../general-handle/general-handle.module'
import { MigrateService } from './migrate.service'

@Module({
  imports: [
    MongooseModule.forRoot(BASEPOINT_DB),
    MongooseModule.forFeature([
      { name: Customer.name, schema: customerSchema },
      { name: Collaborator.name, schema: collaboratorSchema },
      { name: UserSystem.name, schema: userSystemSchema },
      { name: Promotion.name, schema: promotionSchema },
      { name: Order.name, schema: orderSchema },
      { name: GroupOrder.name, schema: groupOrderSchema },
      { name: PushNotification.name, schema: pushNotificationSchema },
      { name: ExtendOptional.name, schema: extendOptionalSchema },
      { name: TypeFeedBack.name, schema: typeFeedBackSchema },
      { name: Notification.name, schema: notificationSchema },
      { name: ServiceFee.name, schema: serviceFeeSchema },
      { name: ReasonCancel.name, schema: reasonCancelSchema },
      { name: Service.name, schema: serviceSchema },
      { name: HistoryActivity.name, schema: historyActivitySchema },
      { name: OptionalService.name, schema: optionalServiceSchema },
      { name: TransitionCustomer.name, schema: transitionCustomerSchema },
      { name: FeedBack.name, schema: feedBackSchema },
      { name: GroupCustomer.name, schema: groupCustomerSchema },
      { name: News.name, schema: newsSchema },
      { name: Banner.name, schema: bannerSchema },
      { name: TransitionCollaborator.name, schema: transitionCollaboratorSchema },
      { name: Address.name, schema: addressSchema },
      { name: LinkInvite.name, schema: linkInviteschema },
      { name: DeviceToken.name, schema: deviceTokenSchema },
      { name: CollaboratorSetting.name, schema: collaboratorSettingSchema },
      { name: GroupService.name, schema: groupServiceSchema },
      { name: KeyApi.name, schema: keyApiSchema },
      { name: PriceOption.name, schema: priceOptionSchema },
      { name: RoleAdmin.name, schema: roleAdminSchema },
      { name: CustomerSetting.name, schema: customerSettingSchema },
      { name: ExamTest.name, schema: examTestSchema },
      { name: Punish.name, schema: punishSchema },
      { name: InfoTestCollaborator.name, schema: infoTestCollaboratorSchema },
      { name: TrainingLesson.name, schema: trainingLessonSchema },
      { name: GroupPromotion.name, schema: groupPromotionSchema },
      { name: CustomerRequest.name, schema: customerRequestSchema },
      { name: Transaction.name, schema: transactionSchema },
      { name: CashBook.name, schema: cashBookSchema },
      { name: PunishTicket.name, schema: punishTicketSchema },
      { name: Report.name, schema: reportSchema },
      { name: SystemSetting.name, schema: systemSettingSchema },
      { name: PhoneOTP.name, schema: phoneOTPSchema },
      { name: PunishPolicy.name, schema: punishPolicySchema },
    ]),
    CustomExceptionModule,
    GeneralHandleModule,
    RepositoryModule,
    CoreSystemModule,
    CoreSystemModule2,
    CoreSystemModule2,
    OopSystemModule
  ],
  providers: [MigrateService],
  exports: [MigrateService]
})
export class MigrateModule { }
