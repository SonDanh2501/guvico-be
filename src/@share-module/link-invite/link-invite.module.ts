import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BASEPOINT_DB } from 'src/@core';
import { LinkInvite, linkInviteschema } from 'src/@core/db/schema/link_invite.schema';
import { CustomExceptionModule } from '../custom-exception/custom-exception.module';
import { LinkInviteController } from './link-invite.controller';
import { LinkInviteService } from './link-invite.service';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forRoot(BASEPOINT_DB),
    MongooseModule.forFeature([
      { name: LinkInvite.name, schema: linkInviteschema },
    ]),
    CustomExceptionModule
  ],
  controllers: [LinkInviteController],
  providers: [LinkInviteService]
})
export class LinkInviteModule {}
