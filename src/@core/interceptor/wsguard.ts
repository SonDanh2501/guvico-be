import { CanActivate, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Observable } from "rxjs";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Collaborator, CollaboratorDocument, Customer, CustomerDocument, GetUserByToken } from "src/@core";

@Injectable()
export class WsGuard implements CanActivate {

    constructor(private jwtService: JwtService,
        @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
        @InjectModel(Collaborator.name) private collaboratorModel: Model<CollaboratorDocument>,
        ) {
    }

    async canActivate(
        context: any,
    ): Promise<boolean | any | Promise<boolean | any> | Observable<boolean | any>> {

        try {
            const bearerToken = context.args[0].handshake.headers.authorization.split(' ')[1];
            const decoded = await this.jwtService.verify(bearerToken) as any;
            const findCustomer = await this.customerModel.findById(decoded._id);
            const findCollaborator = await this.collaboratorModel.findById(decoded._id);
            const req = context.switchToHttp().getRequest();
            req["user"] = findCustomer || findCollaborator
            return true;
        } catch (ex) {
            console.log(ex);
            return false;
        }
    }
}