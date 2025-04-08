import { Module } from '@nestjs/common';
import { VnpayController } from './vnpay.controller';
import { VnpayService } from './vnpay.service';
import { HttpModule } from '@nestjs/axios';
import { BASEPOINT_DB, Collaborator, collaboratorSchema, Customer, customerSchema } from 'src/@core';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomExceptionModule } from '../custom-exception/custom-exception.module';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forRoot(BASEPOINT_DB),
    MongooseModule.forFeature([
      { name: Customer.name, schema: customerSchema },
      { name: Collaborator.name, schema: collaboratorSchema },
    ]),
    CustomExceptionModule
  ],
  controllers: [VnpayController],
  providers: [VnpayService],
  exports: [VnpayService]
})
export class VnpayModule {}
