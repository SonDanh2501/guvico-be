import { forwardRef, Module } from '@nestjs/common'
import { CustomExceptionModule } from 'src/@share-module/custom-exception/custom-exception.module'
import { GeneralHandleModule } from 'src/@share-module/general-handle/general-handle.module'
import { OopSystemModule } from '../@oop-system/oop-system.module'
import { CollaboratorSystemService } from './collaborator-system/collaborator-system.service'
import { CustomerSystemService } from './customer-system/customer-system.service'
import { HistoryActivitySystemService } from './history-activity-system/history-activity-system.service'
import { NotificationSystemService } from './notification-system/notification-system.service'
import { OrderSystemService2 } from './order-system/order-system.service'
import { SettingSystemService } from './setting-system/setting-system.service'
// import { GroupOrderSystemService } from './group-order-system/group-order-system.service';
import { RepositoryModule } from 'src/@repositories/repository.module'
import { WebsocketModule } from 'src/rest/websocket/websocket.module'
import { CoreSystemModule } from '../core-system.module'
import { GroupOrderSystemService2 } from './group-order-system/group-order-system.service'
import { JobSystemService } from './job-system/job-system.service'
import { PunishTicketSystemService } from './punish-ticket-system/punish-ticket-system.service'
import { PushNotificationSystemService } from './push-notification-system/push-notification-system.service'
import { UserSystemSystemService } from './user-system-system/user-system-system.service'

import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { GlobalService } from 'src/@core'
import { MomoModule } from 'src/@share-module/@momo/momo.module'
import { EtelecomModule } from 'src/@share-module/etelecom/etelecom.module'
import { PushNotificationModule } from 'src/@share-module/push-notification/push-notification.module'
import { SmsModule } from 'src/@share-module/sms/sms.module'
import { VnpayModule } from 'src/@share-module/vnpay/vnpay.module'
import { ZnsModule } from 'src/@share-module/zns/zns.module'
import { CustomerGateway } from 'src/rest/websocket/customer-websocket/customer.gateway'
import { AccumulationSystemService } from './accumulation-system/accumulation-system.service'
import { AuthSystemService } from './auth-system/auth-system.service'
import { AutomationSystemService } from './automation-system/automation-system.service'
import { ContentHistoryActivitySystemService } from './content-history-activity-system/content-history-activity-system.service'
import { ContentNotificationSystemService } from './content-notification-system/content-notification-system.service'
import { DeviceTokenSystemService } from './device-token-system/device-token-system.service'
import { FinanceSystemService } from './finance-system/finance-system.service'
import { InforCollaboratorSystemService } from './infor-collaborator-system/infor-collaborator-system.service'
import { InviteSystemService } from './invite-system/invite-system.service'
import { LeaderBoardSystemService } from './leader-board-system/leader-board-system.service'
import { MomoSystemService } from './momo-system/momo-system.service'
import { NotificationScheduleSystemService } from './notification-schedule-system/notification-schedule-system.service'
import { PaymentSystemService } from './payment-system/payment-system.service'
import { PhoneOTPSystemService } from './phone-otp-system/phone-otp-system.service'
import { PopupSystemService } from './popup-system/popup-system.service'
import { PromotionSystemService } from './promotion-system/promotion-system.service'
import { PunishPolicySystemService } from './punish-policy-system/punish-policy-system.service'
import { RandomReferralCodeSystemService } from './random-referral-code-system/random-referral-code-system.service'
import { ReportSystemService } from './report-system/report-system.service'
import { RewardPolicySystemService } from './reward-policy-system/reward-policy-system.service'
import { RewardTicketSystemService } from './reward-ticket-system/reward-ticket-system.service'
import { TraininglessonsSystemService } from './traininglessons-system/traininglessons-system.service'
import { TransactionSystemService } from './transaction-system/transaction-system.service'
import { QueuesSystemService } from './queues-system/queues-system.service'
import { QueuesModule } from 'src/@share-module/queues/queues.module'

@Module({
    imports: [
        CustomExceptionModule,
        GeneralHandleModule,
        OopSystemModule,
        RepositoryModule,
        WebsocketModule,
        MomoModule,
        forwardRef(() => CoreSystemModule),
        PushNotificationModule,
        PassportModule,
        JwtModule.register({
            secret: 'sondanh2501#',
            signOptions: {
                expiresIn: '365d',
            },
        }),
        VnpayModule,
        SmsModule,
        ZnsModule,
        EtelecomModule,
        // QueuesModule
    ],
    providers: [
        NotificationSystemService,
        // GroupOrderSystemService, 
        GroupOrderSystemService2,
        OrderSystemService2,
        HistoryActivitySystemService,
        CustomerSystemService,
        SettingSystemService,
        CollaboratorSystemService,
        JobSystemService,
        PunishTicketSystemService,
        PushNotificationSystemService,
        UserSystemSystemService,
        InforCollaboratorSystemService,
        NotificationScheduleSystemService,
        CustomerGateway,
        PaymentSystemService,
        MomoSystemService,
        TransactionSystemService,
        InviteSystemService,
        DeviceTokenSystemService,
        PhoneOTPSystemService,
        GlobalService,
        AuthSystemService,
        TraininglessonsSystemService,
        PromotionSystemService,
        ReportSystemService,
        FinanceSystemService,
        RandomReferralCodeSystemService,
        RewardTicketSystemService,
        PunishPolicySystemService,
        RewardPolicySystemService,
        PopupSystemService,
        AutomationSystemService,
        LeaderBoardSystemService,
        AccumulationSystemService,
        ContentHistoryActivitySystemService,
        ContentNotificationSystemService,
        QueuesSystemService
    ],
    exports: [
        NotificationSystemService,
        // GroupOrderSystemService, 
        GroupOrderSystemService2,
        OrderSystemService2,
        HistoryActivitySystemService,
        CustomerSystemService,
        SettingSystemService,
        CollaboratorSystemService,
        JobSystemService,
        PunishTicketSystemService,
        PushNotificationSystemService,
        UserSystemSystemService,
        InforCollaboratorSystemService,
        NotificationScheduleSystemService,
        PaymentSystemService,
        MomoSystemService,
        TransactionSystemService,
        DeviceTokenSystemService,
        PhoneOTPSystemService,
        AuthSystemService,
        TraininglessonsSystemService,
        PromotionSystemService,
        ReportSystemService,
        FinanceSystemService,
        RandomReferralCodeSystemService,
        InviteSystemService,
        RewardTicketSystemService,
        PunishPolicySystemService,
        RewardPolicySystemService,
        PopupSystemService,
        AutomationSystemService,
        LeaderBoardSystemService,
        AccumulationSystemService,
        ContentHistoryActivitySystemService,
        ContentNotificationSystemService,
        QueuesSystemService
    ]
})
export class CoreSystemModule2 { }