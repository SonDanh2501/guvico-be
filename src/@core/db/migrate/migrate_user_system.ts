import { UserSystem, UserSystemDocument, userSystemSchema } from 'src/@core/db/schema/user_system.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HttpException, HttpStatus, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { CustomerRepositoryService } from 'src/@repositories/repository-service/customer-repository/customer-repository.service';


@Injectable()
export class UserSystemManagerService {
  constructor(

    private customerRepositoryService: CustomerRepositoryService,
    @InjectModel(UserSystem.name) private userSystemModel: Model<UserSystemDocument>,
  ) { }
  async up() {
    // Then you can use it in the migration like so  
    await this.customerRepositoryService.create({ firstName: 'Ada', lastName: 'Lovelace' });

    // OR do something such as
    const users = await this.customerRepositoryService.findOne();
    /* Do something with users */
  }
}