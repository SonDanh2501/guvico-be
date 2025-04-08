import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { MongooseModule } from '@nestjs/mongoose'
import { PassportModule } from '@nestjs/passport'
import { Address, addressSchema } from 'src/@core/db/schema/address.schema'
import { Collaborator, collaboratorSchema } from 'src/@core/db/schema/collaborator.schema'
import { CollaboratorSetting, collaboratorSettingSchema } from 'src/@core/db/schema/collaborator_setting.schema'
import { Customer, customerSchema } from 'src/@core/db/schema/customer.schema'
import { ExamTest, examTestSchema } from 'src/@core/db/schema/examtest_collaborator.schema'
import { GroupOrder, groupOrderSchema } from 'src/@core/db/schema/group_order.schema'
import { HistoryActivity, historyActivitySchema } from 'src/@core/db/schema/history_activity.schema'
import { HistoryOrder, historyOrderSchema } from 'src/@core/db/schema/history_order.schema'
import { HistoryPoint, historyPointSchema } from 'src/@core/db/schema/history_point.schema'
import { InfoTestCollaborator, infoTestCollaboratorSchema } from 'src/@core/db/schema/info_test_collaborator.schema'
import { Notification, notificationSchema } from 'src/@core/db/schema/notification.schema'
import { Order, orderSchema } from 'src/@core/db/schema/order.schema'
import { PhoneOTP, phoneOTPSchema } from 'src/@core/db/schema/phone_otp.schema'
import { ReasonCancel, reasonCancelSchema } from 'src/@core/db/schema/reason_cancel.schema'
import { RewardCollaborator, rewardCollaboratorSchema } from 'src/@core/db/schema/reward_collaborator.schema'
import { TrainingLesson, trainingLessonSchema } from 'src/@core/db/schema/training_lesson.schema'
import { TransitionCollaborator, transitionCollaboratorSchema } from 'src/@core/db/schema/transition_collaborator.schema'
import { RepositoryModule } from 'src/@repositories/repository.module'
import { CustomExceptionModule } from 'src/@share-module/custom-exception/custom-exception.module'
import { EtelecomModule } from 'src/@share-module/etelecom/etelecom.module'
import { GeneralHandleModule } from 'src/@share-module/general-handle/general-handle.module'
import { MomoModule } from 'src/@share-module/momo/momo.module'
import { SmsModule } from 'src/@share-module/sms/sms.module'
import { ZnsModule } from 'src/@share-module/zns/zns.module'
import { CoreSystemModule2 } from 'src/core-system/@core-system/core-system.module'
import { OopSystemModule } from 'src/core-system/@oop-system/oop-system.module'
import { CoreSystemModule } from 'src/core-system/core-system.module'
import { NotificationModule } from 'src/notification/notification.module'
import { BASEPOINT_DB, DeviceToken, deviceTokenSchema, GlobalService, JwtStrategy, JwtStrategyCollaborator, Service, serviceSchema } from '../@core'
import { AddressController } from './address/address.controller'
import { AddressService } from './address/address.service'
import { AuthController } from './auth/auth.controller'
import { AuthService } from './auth/auth.service'
import { ExamTestController } from './examtest/examtest.controller'
import { ExamTestService } from './examtest/examtest.service'
import { FinanceController } from './finance/finance.controller'
import { FinanceService } from './finance/finance.service'
import { JobController } from './job/job.controller'
import { JobService } from './job/job.service'
import { NotificationController } from './notification/notification.controller'
import { NotificationService } from './notification/notification.service'
import { PaymentController } from './payment/payment.controller'
import { PaymentService } from './payment/payment.service'
import { ProfileController } from './profile/profile.controller'
import { ProfileService } from './profile/profile.service'
import { RewardController } from './reward/reward.controller'
import { RewardService } from './reward/reward.service'
import { SettingController } from './setting/setting.controller'
import { SettingService } from './setting/setting.service'
@Module({
  imports: [
    MongooseModule.forRoot(BASEPOINT_DB),
    MongooseModule.forFeature([
      { name: Customer.name, schema: customerSchema },
      { name: Collaborator.name, schema: collaboratorSchema },
      { name: Order.name, schema: orderSchema },
      { name: GroupOrder.name, schema: groupOrderSchema },
      { name: ReasonCancel.name, schema: reasonCancelSchema },
      { name: DeviceToken.name, schema: deviceTokenSchema },
      { name: Address.name, schema: addressSchema },
      { name: HistoryOrder.name, schema: historyOrderSchema },
      { name: HistoryPoint.name, schema: historyPointSchema },
      { name: Notification.name, schema: notificationSchema },
      { name: TransitionCollaborator.name, schema: transitionCollaboratorSchema },
      { name: HistoryActivity.name, schema: historyActivitySchema },
      { name: Service.name, schema: serviceSchema },
      { name: PhoneOTP.name, schema: phoneOTPSchema },
      { name: CollaboratorSetting.name, schema: collaboratorSettingSchema },
      { name: ExamTest.name, schema: examTestSchema },
      { name: InfoTestCollaborator.name, schema: infoTestCollaboratorSchema },
      { name: RewardCollaborator.name, schema: rewardCollaboratorSchema },
      { name: TrainingLesson.name, schema: trainingLessonSchema },
    ]),
    // RouterModule.register(router),
    PassportModule,
    JwtModule.register({
      secret: 'sondanh2501#',
      // privateKey: "sondanh2501#", 
      signOptions: {
        expiresIn: '365d',
      },
    }),
    CoreSystemModule,
    RepositoryModule,
    CustomExceptionModule,
    SmsModule,
    NotificationModule,
    GeneralHandleModule,
    MomoModule,
    CoreSystemModule2,
    OopSystemModule,
    ZnsModule,
    EtelecomModule
  ],
  controllers: [AuthController,
    ProfileController,
    SettingController,
    JobController,
    FinanceController,
    AddressController,
    NotificationController,
    ExamTestController,
    RewardController,
    PaymentController],
  providers: [
    AuthService,
    SettingService,
    GlobalService,
    JwtStrategy,
    JobService,
    ProfileService,
    FinanceService,
    AddressService, NotificationService, ExamTestService, RewardService,
    JwtStrategyCollaborator,
    PaymentService,
    // {
    //   provide: HTTP_COLLABORATOR_INTERCEPTOR,
    //   useClass: HttpCollaboratorInterceptor,
    // },
  ]
})
export class CollaboratorModule { }

// export class CollaboratorModule implements NestModule {
//   configure(consumer: MiddlewareConsumer) {
//     consumer
//       .apply(CollaboratorMiddleWareService)
//       .forRoutes(
//         AuthController,
//         ProfileController,
//         SettingController,
//         JobController,
//         FinanceController,
//         AddressController,
//         NotificationController,
//         ExamTestController,
//         RewardController
//       );
//   }
// }