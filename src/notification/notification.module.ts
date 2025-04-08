import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { MongooseModule } from '@nestjs/mongoose'
import { BASEPOINT_DB, GlobalService, GroupCustomer, groupCustomerSchema } from '../@core';
import { DeviceToken, deviceTokenSchema } from 'src/@core/db/schema/device_tokens.schema';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

@Module({
    imports: [
        MongooseModule.forRoot(BASEPOINT_DB),
        MongooseModule.forFeature([

            { name: DeviceToken.name, schema: deviceTokenSchema }
        ]),
        PassportModule,
        JwtModule.register({
            secret: 'sondanh2501#',
            signOptions: {
                expiresIn: '1 hour',
            },
        }),

    ],
    controllers: [NotificationController],
    providers: [NotificationService],
    exports: [NotificationService]
})


export class NotificationModule { }
