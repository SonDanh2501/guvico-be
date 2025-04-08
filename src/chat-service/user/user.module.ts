import { Module } from '@nestjs/common';
// import { CollaboratorManagerService } from 'src/admin/collaborator-manager/collaborator-manager.service';
// import { CustomerManagerService } from 'src/admin/customer-manager/customer-manager.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
    imports: [],
    controllers: [UserController],
    providers: [
        UserService,
        // CustomerManagerService,
        // CollaboratorManagerService,
    ]
})
export class UserModule {}
