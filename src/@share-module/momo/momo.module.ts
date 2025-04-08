import { Module } from '@nestjs/common';
import { MomoService } from './momo.service';
import { MomoController } from './momo.controller';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { BASEPOINT_DB, Collaborator, Customer, TransitionCollaborator, TransitionCustomer, collaboratorSchema, customerSchema, transitionCollaboratorSchema, transitionCustomerSchema } from 'src/@core';
import { CustomExceptionModule } from '../custom-exception/custom-exception.module';
import { CoreSystemModule } from 'src/core-system/core-system.module';
import { RepositoryModule } from 'src/@repositories/repository.module';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forRoot(BASEPOINT_DB),
    MongooseModule.forFeature([
      { name: Customer.name, schema: customerSchema },
      { name: Collaborator.name, schema: collaboratorSchema },
      { name: TransitionCustomer.name, schema: transitionCustomerSchema },
      { name: TransitionCollaborator.name, schema: transitionCollaboratorSchema },
    ]),
    CustomExceptionModule,
    CoreSystemModule,
    RepositoryModule
  ],
  providers: [MomoService],
  controllers: [MomoController],
  exports: [MomoService]
})
export class MomoModule { }
