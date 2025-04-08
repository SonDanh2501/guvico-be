import { Module } from '@nestjs/common'
import { EtelecomModule } from 'src/@share-module/etelecom/etelecom.module'
import { CoreSystemModule2 } from 'src/core-system/@core-system/core-system.module'
import { AffiliateManagerApiController } from './affiliate-manager-api/affiliate-manager-api.controller'
import { CollaboratorManagerApiController } from './collaborator-manager-api/collaborator-manager-api.controller'
import { CustomerManagerApiController } from './customer-manager-api/customer-manager-api.controller'
import { GroupOrderManagerApiController } from './group-order-manager-api/group-order-manager-api.controller'
import { NotificationScheduleManagerApiController } from './notification-schedule-manager-api/notification-schedule-manager-api.controller'
import { OrderManagerApiController } from './order-manager-api/order-manager-api.controller'
import { PopupManagerApiController } from './popup-manager-api/popup-manager-api.controller'
import { PromotionManagerApiController } from './promotion-manager-api/promotion-manager-api.controller'
import { PunishPolicyManagerApiController } from './punish-policy-manager-api/punish-policy-manager-api.controller'
import { PunishTicketManagerApiController } from './punish-ticket-manager-api/punish-ticket-manager-api.controller'
import { ReportManagerApiController } from './report-manager-api/report-manager-api.controller'
import { RewardPolicyManagerApiController } from './reward-policy-manager-api/reward-policy-manager-api.controller'
import { SettingManagerApiController } from './setting-manager-api/setting-manager-api.controller'
import { TrainingLessonManagerApiController } from './training-lesson-manager-api/training-lesson-manager-api.controller'
import { TransactionManagerApiController } from './transaction-manager-api/transaction-manager-api.controller'
import { ContentNotificationManagerApiController } from './content-notification-manager-api/content-notification-manager-api.controller';
import { ContentHistoryActivityManagerApiController } from './content-history-activity-manager-api/content-history-activity-manager-api.controller';
import { AccumulationApiController } from './accumulation-api/accumulation-api.controller'

@Module({
  imports: [
    CoreSystemModule2,
    EtelecomModule
  ],
  controllers: [
    CustomerManagerApiController,
    CollaboratorManagerApiController,
    OrderManagerApiController,
    GroupOrderManagerApiController,
    PromotionManagerApiController,
    PunishTicketManagerApiController,
    NotificationScheduleManagerApiController,
    TrainingLessonManagerApiController,
    TransactionManagerApiController,
    ReportManagerApiController,
    AffiliateManagerApiController,
    SettingManagerApiController,
    RewardPolicyManagerApiController,
    PunishPolicyManagerApiController,
    PopupManagerApiController,
    ContentNotificationManagerApiController,
    ContentHistoryActivityManagerApiController,
    AccumulationApiController
  ]
})
export class AdminApiModule { }
