import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager'
import { Module } from '@nestjs/common'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { CoreSystemModule2 } from 'src/core-system/@core-system/core-system.module'
import { AffiliateApiController } from './affiliate-api/affiliate-api.controller'
import { AuthApiController } from './auth-api/auth-api.controller'
export const CONFIG_API = {
  jwt_token: "jwt_customer",
  api_tag: "customer_web"
}

@Module({
  imports: [
    CoreSystemModule2,
    // CacheModule.register({
    //   ttl: 60, // seconds
    //   // max: 10, // maximum number of items in cache
    // })
  ],
  controllers: [
    AffiliateApiController,
    AuthApiController
  ],
  providers: [
    // JwtStrategyCustomer,
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: CacheInterceptor,
    // },
  ]
})
export class CustomerWebApiModule { }
