import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { CoreSystemModule2 } from 'src/core-system/@core-system/core-system.module'
import { AuthApiController } from './auth-api/auth-api.controller'
import { GroupOrderApiController } from './group-order-api/group-order-api.controller'
import { NotificationApiController } from './notification-api/notification-api.controller'
import { OrderApiController } from './order-api/order-api.controller'
import { SettingApiController } from './setting-api/setting-api.controller'
import { TrainingLessonApiController } from './training-lesson-api/training-lesson-api.controller'
import { TransactionApiController } from './transaction-api/transaction-api.controller'
import { FinanceApiController } from './finance-api/finance-api.controller';
import { CollaboratorMiddleWareService } from 'src/@core/middle/collaborator-middleware.service'
// import { SettingOopSystemService } from 'src/core-system/@oop-system/setting-oop-system/setting-oop-system.service'
import { OopSystemModule } from 'src/core-system/@oop-system/oop-system.module'
import { AccumulationApiController } from './accumulation-api/accumulation-api.controller';

export const CONFIG_API = {
  jwt_token: "jwt_collaborator",
  api_tag: "collaborator"
}
@Module({
  imports: [
    CoreSystemModule2
  ],
  controllers: [
    GroupOrderApiController,
    OrderApiController,
    AuthApiController,
    NotificationApiController,
    TransactionApiController,
    SettingApiController,
    TrainingLessonApiController,
    FinanceApiController,
    AccumulationApiController,
  ]
})


export class CollaboratorApiModule {}

// export class CollaboratorApiModule implements NestModule {
//   configure(consumer: MiddlewareConsumer) {
//     consumer
//       .apply(CollaboratorMiddleWareService)
//       .forRoutes(
//         GroupOrderApiController,
//         OrderApiController,
//         AuthApiController,
//         NotificationApiController,
//         TransactionApiController,
//         SettingApiController,
//         TrainingLessonApiController,
//         FinanceApiController
//       );
//   }
// }
