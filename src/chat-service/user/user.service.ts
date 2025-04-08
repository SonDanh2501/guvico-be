import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CollaboratorManagerService } from 'src/admin/collaborator-manager/collaborator-manager.service';
import { CustomerManagerService } from 'src/admin/customer-manager/customer-manager.service';
import { UserSystemManagerService } from 'src/admin/user-system-manager/user-system-manager.service';

@Injectable()
export class UserService {
    constructor (
            // private customerManagerService: CustomerManagerService,
            // private collaboratorManagerService: CollaboratorManagerService,
            // private userSystemManagerService: UserSystemManagerService
            ) {}

        // createUser(payload: any) {
        //     const createUser = new this.userModel({
        //         name: payload.name,
        //         nickname: ""
        //     })
        //     return createUser.save();
        // }

        // async findCustomer(id: string) {
        //     try {
        //         const findItem = await this.customerManagerService.getDetailItem("vi", id);
        //         return findItem;
        //     } catch (err) {
        //         throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        //     }
        // }

        // async findCollaborator(id: string) {
        //     try {
        //         const findItem = await this.collaboratorManagerService.getDetailItem("vi", id);
        //         return findItem;
        //     } catch (err) {
        //         throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        //     }
        // }

        // async findUserSystem(id: string) {
        //     try {
        //         const findItem = await this.userSystemManagerService.getDetailItem("vi", id);
        //         return findItem;
        //     } catch (err) {
        //         throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        //     }
        // }
}
