import { forwardRef, Module } from '@nestjs/common'
import { CoreSystemModule2 } from 'src/core-system/@core-system/core-system.module'
import { AdminGateway } from './admin-websocket/admin.gateway'
import { CollaboratorGateway } from './collaborator-websocket/collaborator.gateway'
import { CustomerGateway } from './customer-websocket/customer.gateway'

@Module({
  imports: [
    forwardRef(() => CoreSystemModule2),
  ],
  providers:[CollaboratorGateway, CustomerGateway, AdminGateway],
  exports:[CollaboratorGateway, CustomerGateway, AdminGateway]
})
export class WebsocketModule {}
