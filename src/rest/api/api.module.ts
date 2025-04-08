import { Module } from '@nestjs/common'
import { RouterModule } from '@nestjs/core'
import { AdminApiModule } from './admin-api/admin-api.module'
import { CollaboratorApiModule } from './collaborator-api/collaborator-api.module'
import { CustomerApiModule } from './customer-api/customer-api.module'
import { CustomerWebApiModule } from './customer-web-api/customer-web-api.module'
import { GoongApiModule } from './goong-api/goong-api.module'
import { WellKnownController } from './well-known/well-known.controller'
import { LinkInviteApiModule } from './link-invite-api/link-invite-api.module'

const api = 'api'

const router = [
  {
    path: `${api}/customer`,
    module: CustomerApiModule,
  },
  {
    path: `${api}/collaborator`,
    module: CollaboratorApiModule,
  },
  {
    path: `${api}/admin`,
    module: AdminApiModule,
  },
  {
    path: `${api}/goong`,
    module: GoongApiModule,
  },
  {
    path: `${api}/customer_web`,
    module: CustomerWebApiModule,
  },
  {
    path: `${api}/link_invite`,
    module: LinkInviteApiModule,
  },
]


@Module({
  imports: [
    RouterModule.register(router),
    CustomerApiModule, 
    CollaboratorApiModule, 
    AdminApiModule,
    GoongApiModule,
    CustomerWebApiModule,
    LinkInviteApiModule
  ],
  controllers: [WellKnownController],
})
export class ApiModule {}
