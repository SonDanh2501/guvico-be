import { Module } from '@nestjs/common'
import { CustomExceptionModule } from 'src/@share-module/custom-exception/custom-exception.module'
import { MongodbModule } from './module/mongodb/mongodb.module'
import { PostgresqlModule } from './module/postgresql/postgresql.module'
import { RedisModule } from './module/redis/redis.module'
import { AccumulationRepositoryService } from './repository-service/accumulation-repository/accumulation-repository.service'
import { AutomationRepositoryService } from './repository-service/automation-repository/automation-repository.service'
import { BehaviorTrackingRepositoryService } from './repository-service/behavior-tracking-repository/behavior-tracking-repository.service'
import { CashBookRepositoryService } from './repository-service/cash-book-repository/cash-book-repository.service'
import { CollaboratorRepositoryService } from './repository-service/collaborator-repository/collaborator-repository.service'
import { CollaboratorSettingRepositoryService } from './repository-service/collaborator-setting-repository/collaborator-setting-repository.service'
import { ConditionAutomationRepositoryService } from './repository-service/condition-automation-repository/condition-automation-repository.service'
import { ContentHistoryActivityRepositoryService } from './repository-service/content-history-activity-repository/content-history-activity-repository.service'
import { ContentNotificationRepositoryService } from './repository-service/content-notification-repository/content-notification-repository.service'
import { CustomerRepositoryService } from './repository-service/customer-repository/customer-repository.service'
import { CustomerSettingRepositoryService } from './repository-service/customer-setting-repository/customer-setting-repository.service'
import { DeviceTokenRepositoryService } from './repository-service/device-token-repository/device-token-repository.service'
import { ExamTestRepositoryService } from './repository-service/exam-test-repository/exam-test-repository.service'
import { ExtendOptionalRepositoryService } from './repository-service/extend-optional-repository/extend-optional-repository.service'
import { GroupCustomerRepositoryService } from './repository-service/group-customer-repository/group-customer-repository.service'
import { GroupOrderRepositoryService } from './repository-service/group-order-repository/group-order-repository.service'
import { GroupPromotionRepositoryService } from './repository-service/group-promotion-repository/group-promotion-repository.service'
import { GroupServiceRepositoryService } from './repository-service/group-service-repository/group-service-repository.service'
import { HistoryActivityRepositoryService } from './repository-service/history-activity-repository/history-activity-repository.service'
import { InfoTestCollaboratorRepositoryService } from './repository-service/info-test-collaborator-repository/info-test-collaborator-repository.service'
import { LeaderBoardRepositoryService } from './repository-service/leader-board-repository/leader-board-repository.service'
import { LinkInviteRepositoryService } from './repository-service/link-invite-repository/link-invite-repository.service'
import { NotificationRepositoryService } from './repository-service/notification-repository/notification-repository.service'
import { NotificationScheduleRepositoryService } from './repository-service/notification-schedule-repository/notification-schedule-repository.service'
import { OptionalServiceRepositoryService } from './repository-service/optional-service-repository/optional-service-repository.service'
import { OrderRepositoryService } from './repository-service/order-repository/order-repository.service'
import { PhoneBlacklistRepositoryService } from './repository-service/phone-blacklist-repository/phone-blacklist-repository.service'
import { PhoneOTPRepositoryService } from './repository-service/phone-otp-repository/phone-otp-repository.service'
import { PopupRepositoryService } from './repository-service/popup-repository/popup-repository.service'
import { PromotionRepositoryService } from './repository-service/promotion-repository/promotion-repository.service'
import { PunishPolicyRepositoryService } from './repository-service/punish-policy-repository/punish-policy-repository.service'
import { PunishTicketRepositoryService } from './repository-service/punish-ticket-repository/punish-ticket-repository.service'
import { RandomReferralCodeRepositoryService } from './repository-service/random-referral-code-repository/random-referral-code-repository.service'
import { ReasonsCancelRepositoryService } from './repository-service/reasons-cancel-repository/reasons-cancel-repository.service'
import { ReportRepositoryService } from './repository-service/report-repository/report-repository.service'
import { RewardPolicyRepositoryService } from './repository-service/reward-policy-repository/reward-policy-repository.service'
import { RewardTicketRepositoryService } from './repository-service/reward-ticket-repository/reward-ticket-repository.service'
import { ServiceFeeRepositoryService } from './repository-service/service-fee-repository/service-fee-repository.service'
import { ServiceRepositoryService } from './repository-service/service-repository/service-repository.service'
import { SystemSettingRepositoryService } from './repository-service/system-setting-repository/system-setting-repository.service'
import { TrainingLessonRepositoryService } from './repository-service/training-lesson-repository/training-lesson-repository.service'
import { TransactionRepositoryService } from './repository-service/transaction-repository/transaction-repository.service'
import { TriggerAutomationRepositoryService } from './repository-service/trigger-automation-repository/trigger-automation-repository.service'
import { UserSystemRepositoryService } from './repository-service/user-system-repository/user-system-repository.service'

@Module({
  imports: [
    MongodbModule,
    PostgresqlModule,
    CustomExceptionModule,
    RedisModule,
  ],
  providers: [
    CustomerRepositoryService,
    TransactionRepositoryService,
    CollaboratorRepositoryService,
    UserSystemRepositoryService,
    PunishPolicyRepositoryService,
    PunishTicketRepositoryService,
    RewardTicketRepositoryService,
    RewardPolicyRepositoryService,
    ConditionAutomationRepositoryService,
    TriggerAutomationRepositoryService,
    AutomationRepositoryService,
    OrderRepositoryService,
    CashBookRepositoryService,
    HistoryActivityRepositoryService,
    GroupOrderRepositoryService,
    ReasonsCancelRepositoryService,
    ExtendOptionalRepositoryService,
    ContentNotificationRepositoryService,
    DeviceTokenRepositoryService,
    NotificationRepositoryService,
    ServiceRepositoryService,
    CustomerSettingRepositoryService,
    CollaboratorSettingRepositoryService,
    GroupServiceRepositoryService,
    OptionalServiceRepositoryService,
    PromotionRepositoryService,
    GroupPromotionRepositoryService,
    ServiceFeeRepositoryService,
    NotificationScheduleRepositoryService,
    LinkInviteRepositoryService,
    TrainingLessonRepositoryService,
    ExamTestRepositoryService,
    InfoTestCollaboratorRepositoryService,
    PhoneOTPRepositoryService,
    BehaviorTrackingRepositoryService,
    RandomReferralCodeRepositoryService,
    GroupCustomerRepositoryService,
    PhoneBlacklistRepositoryService,
    ReportRepositoryService,
    SystemSettingRepositoryService,
    AccumulationRepositoryService,
    PopupRepositoryService,
    LeaderBoardRepositoryService,
    ContentHistoryActivityRepositoryService,
  ],
  exports: [
    OrderRepositoryService,
    CustomerRepositoryService,
    TransactionRepositoryService,
    CollaboratorRepositoryService,
    UserSystemRepositoryService,
    PunishPolicyRepositoryService,
    PunishTicketRepositoryService,
    RewardTicketRepositoryService,
    RewardPolicyRepositoryService,
    AutomationRepositoryService,
    HistoryActivityRepositoryService,
    GroupOrderRepositoryService,
    ReasonsCancelRepositoryService,
    ExtendOptionalRepositoryService,
    ContentNotificationRepositoryService,
    DeviceTokenRepositoryService,
    NotificationRepositoryService,
    ServiceRepositoryService,
    CustomerSettingRepositoryService,
    CollaboratorSettingRepositoryService,
    GroupServiceRepositoryService,
    OptionalServiceRepositoryService,
    PromotionRepositoryService,
    GroupPromotionRepositoryService,
    ServiceFeeRepositoryService,
    NotificationScheduleRepositoryService,
    LinkInviteRepositoryService,
    TrainingLessonRepositoryService,
    ExamTestRepositoryService,
    InfoTestCollaboratorRepositoryService,
    PhoneOTPRepositoryService,
    BehaviorTrackingRepositoryService,
    RandomReferralCodeRepositoryService,
    GroupCustomerRepositoryService,
    PhoneBlacklistRepositoryService,
    ReportRepositoryService,
    SystemSettingRepositoryService,
    AccumulationRepositoryService,
    PopupRepositoryService,
    LeaderBoardRepositoryService,
    ContentHistoryActivityRepositoryService
  ]
})
export class RepositoryModule { }
