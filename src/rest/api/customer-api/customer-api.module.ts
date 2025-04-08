import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager'
import { Module } from '@nestjs/common'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { CoreSystemModule2 } from 'src/core-system/@core-system/core-system.module'
import { AuthApiController } from './auth-api/auth-api.controller'
import { GroupOrderApiController } from './group-order-api/group-order-api.controller'
import { InforCollaboratorApiController } from './infor-collaborator-api/infor-collaborator-api.controller'
import { MomoApiController } from './momo-api/momo-api.controller'
import { NotificationApiController } from './notification-api/notification-api.controller'
import { OrderApiController } from './order-api/order-api.controller'
import { PaymentApiController } from './payment-api/payment-api.controller'
import { SettingApiController } from './setting-api/setting-api.controller'
import { ProfileApiController } from './profile-api/profile-api.controller';
import { PromotionApiController } from './promotion-api/promotion-api.controller';
export const CONFIG_API = {
  jwt_token: "jwt_customer",
  api_tag: "customer"
}

@Module({
  imports: [
    CoreSystemModule2,
    // CacheModule.register({
    //   ttl: 60, // seconds
    //   // max: 10, // maximum number of items in cache
    // })
  ],
  controllers: [NotificationApiController,
    AuthApiController,
    SettingApiController,
    GroupOrderApiController,
    OrderApiController,
    InforCollaboratorApiController,
    PaymentApiController,
    MomoApiController,
    ProfileApiController,
    PromotionApiController,
  ],
  providers: [
    // JwtStrategyCustomer
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: CacheInterceptor,
    // },
  ]
})
export class CustomerApiModule { }
