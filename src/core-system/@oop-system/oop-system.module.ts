import { Module } from '@nestjs/common'
import { RepositoryModule } from 'src/@repositories/repository.module'
import { CustomExceptionModule } from 'src/@share-module/custom-exception/custom-exception.module'
import { GeneralHandleModule } from 'src/@share-module/general-handle/general-handle.module'
import { PushNotificationModule } from 'src/@share-module/push-notification/push-notification.module'
import { NotificationModule } from 'src/notification/notification.module'
import { AccumulationOopSystemService } from './accumulation-oop-system/accumulation-oop-system.service'
import { ActivityOopSystemService } from './activity-oop-system/activity-oop-system.service'
import { AutomationOopSystemService } from './automation-oop-system/automation-oop-system.service'
import { CollaboratorOopSystemService } from './collaborator-oop-system/collaborator-oop-system.service'
import { ContentHistoryActivityOopSystemService } from './content-history-activity-oop-system/content-history-activity-oop-system.service'
import { ContentNotificationOopSystemService } from './content-notification-oop-system/content-notification-oop-system.service'
import { CustomerOopSystemService } from './customer-oop-system/customer-oop-system.service'
import { DeviceTokenOopSystemService } from './device-token-oop-system/device-token-oop-system.service'
import { ExtendOptionalOopSystemService } from './extend-optional-oop-system/extend-optional-oop-system.service'
import { GroupCustomerOopSystemService } from './group-customer-oop-system/group-customer-oop-system.service'
import { GroupOrderOopSystemService } from './group-order-oop-system/group-order-oop-system.service'
import { GroupServiceOopSystemService } from './group-service-oop-system/group-service-oop-system.service'
import { HistoryActivityOopSystemService } from './history-activity-oop-system/history-activity-oop-system.service'
import { LeaderBoardOopSystemService } from './leader-board-oop-system/leader-board-oop-system.service'
import { LinkInviteOopSystemService } from './link-invite-oop-system/link-invite-oop-system.service'
import { NotificationOopSystemService } from './notification-oop-system/notification-oop-system.service'
import { NotificationScheduleOopSystemService } from './notification-schedule-oop-system/notification-schedule-oop-system.service'
import { OptionalServiceOopSystemService } from './optional-service-oop-system/optional-service-oop-system.service'
import { OrderOopSystemService } from './order-oop-system/order-oop-system.service'
import { PhoneBlacklistOopSystemService } from './phone-blacklist-oop-system/phone-blacklist-oop-system.service'
import { PhoneOTPOopSystemService } from './phone-otp-oop-system/phone-otp-oop-system.service'
import { PopupOopSystemService } from './popup-oop-system/popup-oop-system.service'
import { PromotionOopSystemService } from './promotion-oop-system/promotion-oop-system.service'
import { PunishPolicyOopSystemService } from './punish-policy-oop-system/punish-policy-oop-system.service'
import { PunishTicketOopSystemService } from './punish-ticket-oop-system/punish-ticket-oop-system.service'
import { RandomReferralCodeOopSystemService } from './random-referral-code-oop-system/random-referral-code-oop-system.service'
import { ReasonCancelOopSystemService } from './reason-cancel-oop-system/reason-cancel-oop-system.service'
import { ReportOopSystemService } from './report-oop-system/report-oop-system.service'
import { RewardPolicyOopSystemService } from './reward-policy-oop-system/reward-policy-oop-system.service'
import { RewardTicketOopSystemService } from './reward-ticket-oop-system/reward-ticket-oop-system.service'
import { ServiceFeeOopSystemService } from './service-fee-oop-system/service-fee-oop-system.service'
import { ServiceOopSystemService } from './service-oop-system/service-oop-system.service'
import { SettingOopSystemService } from './setting-oop-system/setting-oop-system.service'
import { TraininglessonsOopSystemService } from './traininglessons-oop-system/traininglessons-oop-system.service'
import { TransactionOopSystemService } from './transaction-oop-system/transaction-oop-system.service'
import { UserSystemOoopSystemService } from './user-system-ooop-system/user-system-ooop-system.service'

@Module({
  imports: [
    CustomExceptionModule,
    GeneralHandleModule,
    NotificationModule,
    RepositoryModule,
    PushNotificationModule,
  ],
  providers: [
    GroupOrderOopSystemService,
    NotificationOopSystemService,
    CollaboratorOopSystemService,
    CustomerOopSystemService,
    HistoryActivityOopSystemService,
    ExtendOptionalOopSystemService,
    OptionalServiceOopSystemService,
    ServiceOopSystemService,
    SettingOopSystemService,
    GroupServiceOopSystemService,
    OrderOopSystemService,
    ReasonCancelOopSystemService,
    PunishTicketOopSystemService,
    TransactionOopSystemService,
    PunishPolicyOopSystemService,
    PromotionOopSystemService,
    ServiceFeeOopSystemService,
    UserSystemOoopSystemService,
    DeviceTokenOopSystemService,
    NotificationScheduleOopSystemService,
    ActivityOopSystemService,
    LinkInviteOopSystemService,
    PhoneOTPOopSystemService,
    TraininglessonsOopSystemService,
    RandomReferralCodeOopSystemService,
    GroupCustomerOopSystemService,
    PhoneBlacklistOopSystemService,
    ReportOopSystemService,
    AccumulationOopSystemService,
    RewardPolicyOopSystemService,
    RewardTicketOopSystemService,
    ContentNotificationOopSystemService,
    PopupOopSystemService,
    AutomationOopSystemService,
    LeaderBoardOopSystemService,
    ContentHistoryActivityOopSystemService

  ],
  exports: [
    GroupOrderOopSystemService,
    NotificationOopSystemService,
    CollaboratorOopSystemService,
    CustomerOopSystemService,
    HistoryActivityOopSystemService,
    ExtendOptionalOopSystemService,
    OptionalServiceOopSystemService,
    ServiceOopSystemService,
    SettingOopSystemService,
    GroupServiceOopSystemService,
    OrderOopSystemService,
    ReasonCancelOopSystemService,
    PunishTicketOopSystemService,
    TransactionOopSystemService,
    PunishPolicyOopSystemService,
    PromotionOopSystemService,
    ServiceFeeOopSystemService,
    UserSystemOoopSystemService,
    DeviceTokenOopSystemService,
    NotificationScheduleOopSystemService,
    ActivityOopSystemService,
    LinkInviteOopSystemService,
    PhoneOTPOopSystemService,
    TraininglessonsOopSystemService,
    RandomReferralCodeOopSystemService,
    GroupCustomerOopSystemService,
    PhoneBlacklistOopSystemService,
    ReportOopSystemService,
    RewardPolicyOopSystemService,
    RewardTicketOopSystemService,
    ContentNotificationOopSystemService,
    PopupOopSystemService,
    AutomationOopSystemService,
    LeaderBoardOopSystemService,
    AccumulationOopSystemService,
    ContentHistoryActivityOopSystemService
  ]
})
export class OopSystemModule { }
