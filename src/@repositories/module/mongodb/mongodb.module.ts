import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { BASEPOINT_DB } from 'src/@core'
import {
  Accumulation,
  accumulationSchema,
  BehaviorTracking,
  behaviorTrackingSchema,
  Collaborator,
  collaboratorSchema,
  CollaboratorSetting,
  collaboratorSettingSchema,
  ContentHistoryActivity,
  contentHistoryActivitySchema,
  ContentNotification, contentNotificationSchema,
  Customer,
  customerSchema,
  CustomerSetting,
  customerSettingSchema,
  DeviceToken, deviceTokenSchema,
  ExamTest,
  examTestSchema,
  ExtendOptional, extendOptionalSchema,
  GroupCustomer,
  groupCustomerSchema,
  GroupOrder,
  groupOrderSchema,
  GroupService,
  groupServiceSchema,
  HistoryActivity, historyActivitySchema,
  InfoTestCollaborator,
  infoTestCollaboratorSchema,
  LeaderBoard,
  leaderBoardSchema,
  LinkInvite,
  linkInviteschema,
  Notification,
  NotificationSchedule,
  notificationScheduleSchema,
  notificationSchema,
  OptionalService,
  optionalServiceSchema,
  Order,
  orderSchema,
  PhoneBlacklist,
  phoneBlacklistSchema,
  PhoneOTP,
  phoneOTPSchema,
  Popup,
  popupSchema,
  Promotion,
  promotionSchema,
  PunishPolicy, punishPolicySchema,
  PunishTicket,
  punishTicketSchema,
  RandomReferralCode,
  randomReferralCodeSchema,
  Report,
  reportSchema,
  RewardPolicy,
  rewardPolicySchema,
  RewardTicket,
  rewardTicketSchema,
  Service,
  ServiceFee,
  serviceFeeSchema,
  serviceSchema,
  SystemSetting,
  systemSettingSchema,
  TrainingLesson,
  trainingLessonSchema,
  UserSystem,
  userSystemSchema
} from './@database'
import { Automation, automationSchema } from './@database/schema/automation.schema'
import { CashBook, cashBookSchema } from './@database/schema/cash_book.schema'
import { ReasonCancel, reasonCancelSchema } from './@database/schema/reason_cancel.schema'
import { Transaction, transactionSchema } from './@database/schema/transaction.schema'
import { AccumulationMongoRepository } from './repository/accumulation.mongo.repository'
import { AutomationMongoRepository } from './repository/automation.mongo.repository'
import { BehaviorTrackingMongoRepository } from './repository/behavior-tracking.mongo.repository'
import { CashBookMongoRepository } from './repository/cash-book.mongo.repository'
import { CollaboratorSettingMongoRepository } from './repository/collaborator-setting.mongo.repository'
import { CollaboratorMongoRepository } from './repository/collaborator.mongo.repository'
import { ContentHistoryActivityMongoRepository } from './repository/content-history-activity.mongo.repository'
import { ContentNotificationMongoRepository } from './repository/content_notification.mongo.repository'
import { CustomerSettingMongoRepository } from './repository/customer-setting.mongo.repository'
import { CustomerMongoRepository } from './repository/customer.mongo.repository'
import { DeviceTokenMongoRepository } from './repository/device-token.mongo.repository'
import { ExamTestMongoRepository } from './repository/examtest.mongo.repository'
import { ExtendOptionalMongoRepository } from './repository/extend-optional.mongo.repository'
import { GroupCustomerMongoRepository } from './repository/group-customer.mongo.repository'
import { GroupOrderMongoRepository } from './repository/group-order.mongo.repository'
import { GroupServiceMongoRepository } from './repository/group-service.mongo.repository'
import { HistoryActivityMongoRepository } from './repository/history-activity.mongo.repository'
import { InfoTestCollaboratorMongoRepository } from './repository/info-test-collaborator.mongo.repository'
import { LeaderBoardMongoRepository } from './repository/leader-board.mongo.repository'
import { LinkInviteMongoRepository } from './repository/link-invite.mongo.repository'
import { NotificationMongoRepository } from './repository/notification.mongo.repository'
import { NotificationScheduleMongoRepository } from './repository/notification_schedule.mongo.repository'
import { OptionalServiceMongoRepository } from './repository/optional-service.mongo.repository'
import { OrderMongoRepository } from './repository/order.mongo.repository'
import { PhoneBlacklistMongoRepository } from './repository/phone-blacklist.mongo.repository'
import { PhoneOTPMongoRepository } from './repository/phone-otp.monogo.repository'
import { PopupMongoRepository } from './repository/popup.mongo.repository'
import { PromotionMongoRepository } from './repository/promotion.mongo.repository'
import { PunishPolicyMongoRepository } from './repository/punish-policy.mongo.repository'
import { PunishTicketMongoRepository } from './repository/punish-ticket.mongo.repository'
import { RandomReferralCodeMongoRepository } from './repository/random_referral_code.mongo.repository'
import { ReasonCancelMongoRepository } from './repository/reason-cancel.mong.repository'
import { ReportMongoRepository } from './repository/report.mongo.repository'
import { RewardPolicyMongoRepository } from './repository/reward-policy.mongo.repository'
import { RewardTicketMongoRepository } from './repository/reward-ticket.mongo.repository'
import { ServiceFeeMongoRepository } from './repository/service-fee.mongo.repository'
import { ServiceMongoRepository } from './repository/service.mongo.repository'
import { SystemSettingMongoRepository } from './repository/system-setting.mongo.repository'
import { TrainingLessonMongoRepository } from './repository/training-lesson.mongo.repository'
import { TransactionMongoRepository } from './repository/transaction.mongo.repository'
import { UserSystemMongoRepository } from './repository/user-system.repository'

// export const BASEPOINT_DB = "mongodb://guvi:guvi0123789@database-test.guvico.com/guvico-test"
// export const BASEPOINT_DB = "mongodb://guvi2022:Guvi2022@database.guvico.com/guvico"

@Module({
  imports: [
    MongooseModule.forRoot(BASEPOINT_DB),
    MongooseModule.forFeature([
      { name: Customer.name, schema: customerSchema },
      { name: Collaborator.name, schema: collaboratorSchema },
      { name: GroupOrder.name, schema: groupOrderSchema },
      { name: Order.name, schema: orderSchema },
      { name: Transaction.name, schema: transactionSchema },
      { name: CashBook.name, schema: cashBookSchema },
      { name: UserSystem.name, schema: userSystemSchema },
      { name: RewardPolicy.name, schema: rewardPolicySchema },
      { name: RewardTicket.name, schema: rewardTicketSchema },
      { name: PunishPolicy.name, schema: punishPolicySchema },
      { name: PunishTicket.name, schema: punishTicketSchema },
      { name: Automation.name, schema: automationSchema },
      { name: HistoryActivity.name, schema: historyActivitySchema },
      { name: ReasonCancel.name, schema: reasonCancelSchema},
      { name: ExtendOptional.name, schema: extendOptionalSchema},
      { name: ContentNotification.name, schema: contentNotificationSchema},
      { name: DeviceToken.name, schema: deviceTokenSchema},
      { name: Notification.name, schema: notificationSchema },
      { name: Service.name, schema: serviceSchema },
      { name: CustomerSetting.name, schema: customerSettingSchema },
      { name: CollaboratorSetting.name, schema: collaboratorSettingSchema },
      { name: GroupService.name, schema: groupServiceSchema },
      { name: OptionalService.name, schema: optionalServiceSchema },
      { name: Promotion.name, schema: promotionSchema },
      { name: ServiceFee.name, schema: serviceFeeSchema },
      { name: NotificationSchedule.name, schema: notificationScheduleSchema },
      { name: LinkInvite.name, schema: linkInviteschema },
      { name: TrainingLesson.name, schema: trainingLessonSchema },
      { name: ExamTest.name, schema: examTestSchema },
      { name: InfoTestCollaborator.name, schema: infoTestCollaboratorSchema },
      { name: PhoneOTP.name, schema: phoneOTPSchema },
      { name: BehaviorTracking.name, schema: behaviorTrackingSchema },
      { name: RandomReferralCode.name, schema: randomReferralCodeSchema },
      { name: GroupCustomer.name, schema: groupCustomerSchema },
      { name: PhoneBlacklist.name, schema: phoneBlacklistSchema },
      { name: Report.name, schema: reportSchema },
      { name: SystemSetting.name, schema: systemSettingSchema },
      { name: Accumulation.name, schema: accumulationSchema },
      {name: Popup.name, schema: popupSchema },
      {name: LeaderBoard.name, schema: leaderBoardSchema },
      {name: ContentHistoryActivity.name, schema: contentHistoryActivitySchema }

    ]),
  ],
  providers: [
    CustomerMongoRepository,
    TransactionMongoRepository,
    CollaboratorMongoRepository,
    UserSystemMongoRepository,
    RewardPolicyMongoRepository,
    RewardTicketMongoRepository,
    PunishPolicyMongoRepository,
    PunishTicketMongoRepository,
    AutomationMongoRepository,
    OrderMongoRepository,
    CashBookMongoRepository,
    HistoryActivityMongoRepository,
    GroupOrderMongoRepository,
    ReasonCancelMongoRepository,
    ExtendOptionalMongoRepository,
    ContentNotificationMongoRepository,
    DeviceTokenMongoRepository,
    NotificationMongoRepository,
    ServiceMongoRepository,
    CustomerSettingMongoRepository,
    CollaboratorSettingMongoRepository,
    GroupServiceMongoRepository,
    OptionalServiceMongoRepository,
    PromotionMongoRepository,
    ServiceFeeMongoRepository,
    NotificationScheduleMongoRepository,
    LinkInviteMongoRepository,
    TrainingLessonMongoRepository,
    ExamTestMongoRepository,
    InfoTestCollaboratorMongoRepository,
    PhoneOTPMongoRepository,
    BehaviorTrackingMongoRepository,
    RandomReferralCodeMongoRepository,
    GroupCustomerMongoRepository,
    PhoneBlacklistMongoRepository,
    ReportMongoRepository,
    SystemSettingMongoRepository,
    AccumulationMongoRepository,
    PopupMongoRepository,
    LeaderBoardMongoRepository,
    ContentHistoryActivityMongoRepository,
  ],
  exports: [
    CustomerMongoRepository,
    TransactionMongoRepository,
    CollaboratorMongoRepository,
    UserSystemMongoRepository,
    RewardPolicyMongoRepository,
    RewardTicketMongoRepository,
    PunishPolicyMongoRepository,
    PunishTicketMongoRepository,
    AutomationMongoRepository,
    OrderMongoRepository,
    CashBookMongoRepository,
    HistoryActivityMongoRepository,
    GroupOrderMongoRepository,
    ReasonCancelMongoRepository,
    ExtendOptionalMongoRepository,
    ContentNotificationMongoRepository,
    DeviceTokenMongoRepository,
    NotificationMongoRepository,
    ServiceMongoRepository,
    CustomerSettingMongoRepository,
    CollaboratorSettingMongoRepository,
    GroupServiceMongoRepository,
    OptionalServiceMongoRepository,
    PromotionMongoRepository,
    ServiceFeeMongoRepository,
    NotificationScheduleMongoRepository,
    LinkInviteMongoRepository,
    TrainingLessonMongoRepository,
    ExamTestMongoRepository,
    InfoTestCollaboratorMongoRepository,
    PhoneOTPMongoRepository,
    BehaviorTrackingMongoRepository,
    RandomReferralCodeMongoRepository,
    GroupCustomerMongoRepository,
    PhoneBlacklistMongoRepository,
    ReportMongoRepository,
    SystemSettingMongoRepository,
    AccumulationMongoRepository,
    PopupMongoRepository,
    LeaderBoardMongoRepository,
    ContentHistoryActivityMongoRepository
  ]
})
export class MongodbModule { }
