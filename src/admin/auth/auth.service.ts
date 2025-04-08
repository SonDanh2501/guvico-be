import { HttpException, HttpStatus, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChangePasswordAdminDto, ERROR, GlobalService, LoginAdminDto } from 'src/@core';
import { UserSystem, UserSystemDocument } from 'src/@core/db/schema/user_system.schema';
import { Customer, CustomerDocument } from 'src/@core/db/schema/customer.schema';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { KeyApi, KeyApiDocument } from 'src/@core/db/schema/key_api.schema';
import { RoleAdmin, RoleAdminDocument } from 'src/@core/db/schema/role_admin.schema';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';
import { UserSystemRepositoryService } from 'src/@repositories/repository-service/user-system-repository/user-system-repository.service';

@Injectable()
export class AuthService {
    constructor(
        private globalService: GlobalService,
        private jwtService: JwtService,
        private customExceptionService: CustomExceptionService,
        private userSystemRepositoryService: UserSystemRepositoryService,
        @InjectModel(KeyApi.name) private keyApiModel: Model<KeyApiDocument>,
        @InjectModel(RoleAdmin.name) private roleAdminModel: Model<RoleAdminDocument>,
    ) { }

    async login(lang, payload: LoginAdminDto) {
        try {
            const getUserSystem = await this.userSystemRepositoryService.findOne({ email: payload.email, is_active: true, is_delete: false });
            if (!getUserSystem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ACCOUNT_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
            const isMatch = await bcrypt.compare(payload.password, getUserSystem.password);
            if (!isMatch) throw new HttpException([await this.customExceptionService.i18nError(ERROR.PASSWORD_NOT_CORRECT, lang, null)], HttpStatus.BAD_REQUEST);
            const payloadToken = {
                _id: getUserSystem._id,
                name: getUserSystem.name,
                full_name: getUserSystem.full_name,
                email: getUserSystem.email,
                role: getUserSystem.role,
                id_role_admin: getUserSystem.id_role_admin
            }
            const accessToken = await this.jwtService.sign(payloadToken);
            getUserSystem.session_login.push({
                date_login: new Date().toISOString(),
                token: accessToken
            })
            await this.userSystemRepositoryService.findByIdAndUpdate(getUserSystem._id, getUserSystem);
            // await getUserSystem.save();
            return { token: accessToken };
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }



    async getInfoByToken(lang, user) {
        try {
            const getUser = await this.userSystemRepositoryService.findOneById(user._id,{ salt: 0, password: 0, date_create: 0, permission: 0 }, 
                [{ path: 'id_service_manager', select: { _id: 1, title: 1, description: 1, thumbnail: 1 } }])
            if (!getUser) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, 'id_user')], HttpStatus.BAD_REQUEST);
            return getUser;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getPermissionByToken(lang, user) {
        try {
            const getUser = await this.userSystemRepositoryService.findOneById(user._id);
            if (!getUser) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, 'id_user')], HttpStatus.BAD_REQUEST);
            const getRoleAdmin = await this.roleAdminModel.findById(getUser.id_role_admin);
            if (!getRoleAdmin) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, 'id_role_admin')], HttpStatus.BAD_REQUEST);
            const getKeyApi = await this.keyApiModel.find({ _id: { $in: getRoleAdmin.id_key_api } });
            return getKeyApi;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    async changePassword(lang, user, payload: ChangePasswordAdminDto) {
        try {
            const isMatch = await bcrypt.compare(payload.old_password, user.password);
            if (!isMatch) throw new HttpException([await this.customExceptionService.i18nError(ERROR.PASSWORD_NOT_CORRECT, lang, null)], HttpStatus.BAD_REQUEST);
            const salt = await bcrypt.genSalt();
            const newPassword = await bcrypt.hash(payload.new_password, salt);
            user.password = newPassword
            user.salt = salt
            await user.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

}
