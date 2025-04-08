import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
// import { BASEPOINT_DB, Customer, customerSchema, GlobalService, JwtStrategy, Order, orderSchema, Promotion, promotionSchema } from 'src/@core';
import { MongooseModule } from '@nestjs/mongoose'
// import { GroupOrder, groupOrderSchema } from 'src/@core/db/schema/group_order.schema';
import { JwtService } from '@nestjs/jwt'
import { BASEPOINT_DB, Collaborator, collaboratorSchema, Customer, customerSchema, DeviceToken, deviceTokenSchema, GlobalService, HistoryActivity, historyActivitySchema, HistoryOrder, historyOrderSchema, InfoRewardCollaborator, infoRewardCollaboratorSchema, Order, orderSchema, Promotion, promotionSchema, UserSystem, userSystemSchema } from 'src/@core'
import { GroupOrder, groupOrderSchema } from 'src/@core/db/schema/group_order.schema'
import { Service, serviceSchema } from 'src/@core/db/schema/service.schema'
import { AdminModule } from 'src/admin/admin.module'
import { CoreSystemModule } from 'src/core-system/core-system.module'
import { CustomerSchedulerService } from './customer-scheduler/customer-scheduler.service'
import { GroupCustomerScheduleService } from './group-customer-schedule/group-customer-schedule.service'
// import { NotificationModule } from 'src/notification/notification.module';
import { Balance, balanceSchema } from 'src/@core/db/schema/balance.schema'
import { CollaboratorSetting, collaboratorSettingSchema } from 'src/@core/db/schema/collaborator_setting.schema'
import { InfoTestCollaborator, infoTestCollaboratorSchema } from 'src/@core/db/schema/info_test_collaborator.schema'
import { Punish, punishSchema } from 'src/@core/db/schema/punish.schema'
import { ReasonCancel, reasonCancelSchema } from 'src/@core/db/schema/reason_cancel.schema'
import { RewardCollaborator, rewardCollaboratorSchema } from 'src/@core/db/schema/reward_collaborator.schema'
import { TransitionCollaborator, transitionCollaboratorSchema } from 'src/@core/db/schema/transition_collaborator.schema'
import { RepositoryModule } from 'src/@repositories/repository.module'
import { GeneralHandleModule } from 'src/@share-module/general-handle/general-handle.module'
import { PushNotificationModule } from 'src/@share-module/push-notification/push-notification.module'
import { InfoRewardCollaboratorService } from 'src/admin/info-reward-collaborator/info-reward-collaborator.service'
import { PunishManagerService } from 'src/admin/punish-manager/punish-manager.service'
import { CoreSystemModule2 } from 'src/core-system/@core-system/core-system.module'
import { NotificationModule } from 'src/notification/notification.module'
import { LinkInvite, linkInviteschema } from '../@core/db/schema/link_invite.schema'
import { Notification, notificationSchema } from '../@core/db/schema/notification.schema'
import { PushNotification, pushNotificationSchema } from '../@core/db/schema/push_notification.schema'
import { TransitionCustomer, transitionCustomerSchema } from '../@core/db/schema/transition_customer.schema'
import { CustomExceptionService } from '../@share-module/custom-exception/custom-exception.service'
import { ActivitySystemService } from '../core-system/activity-system/activity-system.service'
import { NotificationSystemService } from '../core-system/notification-system/notification-system.service'
import { CollaboratorSchedulerService } from './collaborator-scheduler/collaborator-scheduler.service'
import { FirstMonthService } from './first-month/first-month.service'
import { LinkInviteService } from './link-invite/link-invite.service'
import { MidnightService } from './midnight/midnight.service'
import { OrderSchedulerService } from './order-scheduler/order-scheduler.service'
import { PromotionSchedulerService } from './promotion-scheduler/promotion-scheduler.service'
import { PunishPeriodicScheduleService } from './punish-periodic-schedule/punish-periodic-schedule.service'
import { PushNotificationService } from './push-notification/push-notification.service'
import { TransitionSchedulerService } from './transition-scheduler/transition-scheduler.service'

@Module({
  imports: [ScheduleModule.forRoot(),
  MongooseModule.forRoot(BASEPOINT_DB),
  MongooseModule.forFeature([
    { name: Customer.name, schema: customerSchema },
    { name: Collaborator.name, schema: collaboratorSchema },
    { name: Order.name, schema: orderSchema },
    { name: GroupOrder.name, schema: groupOrderSchema },
    { name: DeviceToken.name, schema: deviceTokenSchema },
    // { name: Promotion.name, schema: promotionSchema },
    { name: Service.name, schema: serviceSchema },
    { name: TransitionCollaborator.name, schema: transitionCollaboratorSchema },
    { name: HistoryOrder.name, schema: historyOrderSchema },
    { name: UserSystem.name, schema: userSystemSchema },
    { name: HistoryActivity.name, schema: historyActivitySchema },
    { name: ReasonCancel.name, schema: reasonCancelSchema },
    { name: Promotion.name, schema: promotionSchema },
    { name: PushNotification.name, schema: pushNotificationSchema },
    { name: LinkInvite.name, schema: linkInviteschema },
    { name: TransitionCustomer.name, schema: transitionCustomerSchema },
    { name: Notification.name, schema: notificationSchema },
    { name: CollaboratorSetting.name, schema: collaboratorSettingSchema },
    { name: Punish.name, schema: punishSchema },
    { name: RewardCollaborator.name, schema: rewardCollaboratorSchema },
    { name: InfoRewardCollaborator.name, schema: infoRewardCollaboratorSchema },
    { name: Balance.name, schema: balanceSchema },
    { name: InfoTestCollaborator.name, schema: infoTestCollaboratorSchema },

  ]),
    AdminModule,
    CoreSystemModule,
    NotificationModule,
    GeneralHandleModule,
    RepositoryModule,
    CoreSystemModule2,
    PushNotificationModule,
  ],
  controllers: [],
  providers: [
    GlobalService,
    JwtService,
    ActivitySystemService,
    CustomExceptionService,
    // OrderService,
    // GroupOrderService,
    // ExtendOptionalService,
    // OptionalServiceService,
    // JwtStrategy,
    CustomerSchedulerService, 
    GroupCustomerScheduleService,
    OrderSchedulerService,
    TransitionSchedulerService,
    PromotionSchedulerService,
    PushNotificationService,
    LinkInviteService,
    NotificationSystemService,
    PunishManagerService,
    MidnightService,
    FirstMonthService,
    InfoRewardCollaboratorService,
    PunishPeriodicScheduleService,
    CollaboratorSchedulerService,
  ],
})
export class CronjobModule { }
