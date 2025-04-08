import { forwardRef, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Banner, bannerSchema, BASEPOINT_DB, Collaborator, collaboratorSchema, Customer, customerSchema, DeviceToken, deviceTokenSchema, ExtendOptional, extendOptionalSchema, GlobalService, GroupCustomer, groupCustomerSchema, GroupService, groupServiceSchema, InfoRewardCollaborator, infoRewardCollaboratorSchema, OptionalService, optionalServiceSchema, Order, orderSchema, PriceOption, priceOptionSchema, Promotion, promotionSchema, Service, serviceSchema, TransitionCollaborator, transitionCollaboratorSchema, TransitionCustomer, transitionCustomerSchema, UserSystem, userSystemSchema } from 'src/@core'
import { GroupOrder, groupOrderSchema } from 'src/@core/db/schema/group_order.schema'
// import { CustomerModule } from 'src/customer/customer.module';
import { CustomerSetting, customerSettingSchema } from 'src/@core/db/schema/customer_setting.schema'
import { HistoryActivity, historyActivitySchema, } from 'src/@core/db/schema/history_activity.schema'
import { HistoryOrder, historyOrderSchema } from 'src/@core/db/schema/history_order.schema'
import { HistoryPoint, historyPointSchema } from 'src/@core/db/schema/history_point.schema'
import { Notification, notificationSchema } from 'src/@core/db/schema/notification.schema'
import { ReasonCancel, reasonCancelSchema } from 'src/@core/db/schema/reason_cancel.schema'
import { ServiceFee, serviceFeeSchema } from 'src/@core/db/schema/service_fee.schema'
import { CustomExceptionModule } from 'src/@share-module/custom-exception/custom-exception.module'
import { GeneralHandleModule } from 'src/@share-module/general-handle/general-handle.module'
import { NotificationModule } from 'src/notification/notification.module'
import { ActivityAdminSystemService } from './activity-admin-system/activity-admin-system.service'
import { ActivityCollaboratorSystemService } from './activity-collaborator-system/activity-collaborator-system.service'
import { ActivityCustomerSystemService } from './activity-customer-system/activity-customer-system.service'
import { ActivitySystemService } from './activity-system/activity-system.service'
import { GroupCustomerSystemService } from './group-customer-system/group-customer-system.service'
import { HistoryOrderSystemService } from './history-order-system/history-order-system.service'
import { HistoryPointService } from './history-point/history-point.service'
import { InviteCodeSystemService } from './invite-code-system/invite-code-system.service'
import { NotificationSystemService } from './notification-system/notification-system.service'
import { OrderSystemService } from './order-system/order-system.service'

// import { WinstonModule } from 'nest-winston';
import { JwtService } from '@nestjs/jwt'
import { Address, addressSchema } from 'src/@core/db/schema/address.schema'
import { CollaboratorBonus, collaboratorBonusSchema } from 'src/@core/db/schema/collaborator_bonus.schema'
import { CollaboratorSetting, collaboratorSettingSchema } from 'src/@core/db/schema/collaborator_setting.schema'
import { ExamTest, examTestSchema } from 'src/@core/db/schema/examtest_collaborator.schema'
import { InfoTestCollaborator, infoTestCollaboratorSchema } from 'src/@core/db/schema/info_test_collaborator.schema'
import { Punish, punishSchema } from 'src/@core/db/schema/punish.schema'
import { RewardCollaborator, rewardCollaboratorSchema } from 'src/@core/db/schema/reward_collaborator.schema'
import { RepositoryModule } from 'src/@repositories/repository.module'
import { PushNotificationModule } from 'src/@share-module/push-notification/push-notification.module'
import { CoreSystemModule2 } from './@core-system/core-system.module'
import { CoreSystemService } from './@core-system/core-system.service'
import { OopSystemModule } from './@oop-system/oop-system.module'
import { AutomationSystemService } from './automation-system/automation-system.service'
import { CollaboratorSystemService } from './collaborator-system/collaborator-system.service'
import { CustomerSystemService } from './customer-system/customer-system.service'
import { ExtendOptionalSystemService } from './extend-optional-system/extend-optional-system.service'
import { GroupOrderSystemService } from './group-order-system/group-order-system.service'
import { GroupServiceSystemService } from './group-service-system/group-service-system.service'
import { HandleLogicSystemService } from './handle-logic-system/handle-logic-system.service'
import { HistoryActivitySystemService } from './history-activity-system/history-activity-system.service'
import { OptionalServiceSystemService } from './optional-service-system/optional-service-system.service'
import { PaymentSystemService } from './payment-system/payment-system.service'
import { PromotionSystemService } from './promotion-system/promotion-system.service'
import { PunishSystemService } from './punish-system/punish-system.service'
import { PunishTicketSystemService } from './punish-ticket-system/punish-ticket-system.service'
import { PushNotiSystemService } from './push-noti-system/push-noti-system.service'
import { RewardTicketSystemService } from './reward-ticket-system/reward-ticket-system.service'
import { ServiceSystemService } from './service-system/service-system.service'
import { TransactionSystemService } from './transaction-system/transaction-system.service'
import { TransitionCustomerService } from './transition-customer/transition-customer.service'

const dateNow = new Date(Date.now())
const dateLogger = `${dateNow.getDate()}-${dateNow.getMonth() + 1}-${dateNow.getFullYear()}`;
@Module({
  imports: [
    // WinstonModule.forRoot({
    //   format: winston.format.combine(
    //     winston.format.timestamp(),
    //     winston.format.json(),
    //   ),
    //   transports: [
    //     new winston.transports.Console(),
    //     // new winston.transports.File({
    //     //   dirname: path.join(__dirname, `./../log/${dateLogger}`), //path to where save loggin result 
    //     //   filename: 'debug.log', //name of file where will be saved logging result
    //     //   level: 'debug',
    //     // }),
    //     // new winston.transports.File({
    //     //   dirname: path.join(__dirname, `./../log/${dateLogger}`),
    //     //   filename: 'info.log',
    //     //   level: 'info',
    //     // }),
    //     new winston.transports.File({
    //       dirname: path.join(__dirname, `./../log/${dateLogger}`),
    //       filename: 'error.log',
    //       level: 'error',
    //     }),
    //   ],
    // }),
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
      { name: GroupCustomer.name, schema: groupCustomerSchema },
      { name: HistoryOrder.name, schema: historyOrderSchema },
      { name: HistoryPoint.name, schema: historyPointSchema },
      { name: CustomerSetting.name, schema: customerSettingSchema },
      { name: Notification.name, schema: notificationSchema },
      { name: ReasonCancel.name, schema: reasonCancelSchema },
      { name: ServiceFee.name, schema: serviceFeeSchema },
      { name: DeviceToken.name, schema: deviceTokenSchema },
      { name: UserSystem.name, schema: userSystemSchema },
      { name: HistoryActivity.name, schema: historyActivitySchema },
      { name: TransitionCollaborator.name, schema: transitionCollaboratorSchema },
      { name: TransitionCustomer.name, schema: transitionCustomerSchema },
      { name: Address.name, schema: addressSchema },
      { name: ExamTest.name, schema: examTestSchema },
      { name: InfoTestCollaborator.name, schema: infoTestCollaboratorSchema },
      { name: Punish.name, schema: punishSchema },
      { name: RewardCollaborator.name, schema: rewardCollaboratorSchema },
      { name: CollaboratorBonus.name, schema: collaboratorBonusSchema },
      { name: CollaboratorSetting.name, schema: collaboratorSettingSchema },
      { name: PriceOption.name, schema: priceOptionSchema },
      { name: InfoRewardCollaborator.name, schema: infoRewardCollaboratorSchema }
    ]),
    CustomExceptionModule,
    GeneralHandleModule,
    NotificationModule,
    RepositoryModule,
    PushNotificationModule,
    forwardRef(() => CoreSystemModule2),
    OopSystemModule,
  ],
  providers: [
    OrderSystemService,
    GroupCustomerSystemService,
    HistoryOrderSystemService,
    HistoryPointService,
    NotificationSystemService,
    InviteCodeSystemService,
    ActivityCustomerSystemService,
    ActivityCollaboratorSystemService,
    ActivityAdminSystemService,
    ActivitySystemService,
    GroupOrderSystemService,
    PromotionSystemService,
    OptionalServiceSystemService,
    GroupServiceSystemService,
    ExtendOptionalSystemService,
    ServiceSystemService,
    GlobalService,
    JwtService,
    PaymentSystemService,
    CollaboratorSystemService,
    PushNotiSystemService,
    CustomerSystemService,
    PunishSystemService,
    TransitionCustomerService,
    TransactionSystemService,
    AutomationSystemService,
    PunishTicketSystemService,
    RewardTicketSystemService,
    HistoryActivitySystemService,
    HandleLogicSystemService,
    CoreSystemService,
  ],
  exports: [
    OrderSystemService,
    GroupCustomerSystemService,
    HistoryOrderSystemService,
    HistoryPointService,
    NotificationSystemService,
    InviteCodeSystemService,
    ActivityCustomerSystemService,
    ActivityCollaboratorSystemService,
    ActivityAdminSystemService,
    GroupOrderSystemService,
    PromotionSystemService,
    OptionalServiceSystemService,
    GroupServiceSystemService,
    ExtendOptionalSystemService,
    ServiceSystemService,
    PaymentSystemService,
    CollaboratorSystemService,
    PushNotiSystemService,
    ActivitySystemService,
    CustomerSystemService,
    PunishSystemService,
    TransactionSystemService,
    PunishTicketSystemService,
    RewardTicketSystemService,
    AutomationSystemService,
    HistoryActivitySystemService,
    CoreSystemService
  ]
})
export class CoreSystemModule { }
