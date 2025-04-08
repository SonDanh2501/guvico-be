import { Module } from '@nestjs/common';
import { LinkInviteApiController } from './link-invite-api.controller';
import { CoreSystemModule2 } from 'src/core-system/@core-system/core-system.module';

@Module({
    imports: [CoreSystemModule2],
    controllers: [LinkInviteApiController],
    providers: []
})
export class LinkInviteApiModule {}
 