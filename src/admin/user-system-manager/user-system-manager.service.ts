import { HttpException, HttpStatus, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ERROR, GlobalService, CreateDTOAdmin, editUserSystemDTO, actiUserSystemDTO, iPageDTO, INFO_USER_SYSTEM, POP_ROLE_ADMIN, searchQuery } from 'src/@core';
import { UserSystem, UserSystemDocument } from 'src/@core/db/schema/user_system.schema';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ActivityAdminSystemService } from 'src/core-system/activity-admin-system/activity-admin-system.service';
import { iPageGetUserSysstemDTOAdmin, createRoleAdminDTOAdmin, updateRoleAdminDTOAdmin } from '../../@core/dto/admin.dto';
import { KeyApi, KeyApiDocument } from '../../@core/db/schema/key_api.schema';
import { RoleAdmin, RoleAdminDocument } from '../../@core/db/schema/role_admin.schema';
import { createApiDTOAdmin, updateKeyApiDTOAdmin } from '../../@core/dto/key_api.dto';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';
import { UserSystemRepositoryService } from 'src/@repositories/repository-service/user-system-repository/user-system-repository.service';

@Injectable()
export class UserSystemManagerService {
    constructor(
        private globalService: GlobalService,
        private jwtService: JwtService,
        private activityAdminSystemService: ActivityAdminSystemService,
        private customExceptionService: CustomExceptionService,
        private userSystemRepositoryService: UserSystemRepositoryService,
        @InjectModel(UserSystem.name) private userSystemModel: Model<UserSystemDocument>,
        @InjectModel(KeyApi.name) private keyApiModel: Model<KeyApiDocument>,
        @InjectModel(RoleAdmin.name) private roleAdminModel: Model<RoleAdminDocument>,
    ) { }

    async createItem(lang, payload: CreateDTOAdmin, idAdmin: string) {
        try {
            const salt = await bcrypt.genSalt();
            payload.password = await bcrypt.hash(payload.password, salt);
            const checkEmail = await this.userSystemRepositoryService.findOne({ email: payload.email })
            if (checkEmail) throw new HttpException([await this.customExceptionService.i18nError(ERROR.EMAIL_EXISTS, lang, null)], HttpStatus.BAD_REQUEST);
            const newAdmin = await this.userSystemRepositoryService.create({
                password: payload.password,
                salt: salt,
                name: payload.name,
                full_name: payload.full_name,
                email: payload.email || "",
                role: payload.role,
                id_role_admin: payload.id_role_admin,
                date_create: new Date(Date.now()).toISOString(),
                area_manager_lv_0: payload.area_manager_lv_0,
                area_manager_lv_1: payload.area_manager_lv_1,
                area_manager_lv_2: payload.area_manager_lv_2,
                id_service_manager: payload.id_service_manager,
                id_business: payload.id_business
            });
            await newAdmin.save();
            this.activityAdminSystemService.createAdmin(idAdmin, newAdmin._id)
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async editItem(lang, id, payload: editUserSystemDTO, idAdmin: string) {
        try {
            const getUser = await this.userSystemRepositoryService.findOneById(id);
            if (!getUser) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            const checkEmail = await this.userSystemRepositoryService.findOne({ email: payload.email, _id: { $ne: getUser._id } })
            if (checkEmail) throw new HttpException([await this.customExceptionService.i18nError(ERROR.EMAIL_EXISTS, lang, null)], HttpStatus.BAD_REQUEST);
            getUser.email = payload.email || getUser.email;
            getUser.full_name = payload.full_name || getUser.full_name;
            getUser.id_role_admin = payload.id_role_admin || getUser.id_role_admin;
            getUser.area_manager_lv_0 = payload.area_manager_lv_0 ? payload.area_manager_lv_0 : getUser.area_manager_lv_0;
            getUser.area_manager_lv_1 = payload.area_manager_lv_1 ? payload.area_manager_lv_1 : getUser.area_manager_lv_1;
            getUser.area_manager_lv_2 = payload.area_manager_lv_2 ? payload.area_manager_lv_2 : getUser.area_manager_lv_2;
            getUser.id_service_manager = payload.id_service_manager ? payload.id_service_manager : getUser.id_service_manager;
            getUser.id_business = payload.id_business ? payload.id_business : getUser.id_business;
            if (payload.password !== getUser.password
                && payload.password !== null && payload.password !== ""
                && payload.password !== undefined) {
                const salt = await bcrypt.genSalt();
                const newPassword = await bcrypt.hash(payload.password, salt);
                getUser.password = newPassword
                getUser.salt = salt
            }

            await getUser.save();
            this.activityAdminSystemService.editAdmin(idAdmin, getUser._id);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async actiItem(lang, id, payload: actiUserSystemDTO, idAdmin: string) {
        try {
            const getUser = await this.userSystemRepositoryService.findOneById(id);
            if (!getUser) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            getUser.is_active = (payload.is_active === getUser.is_active) ? getUser.is_active : payload.is_active;
            await getUser.save();
            this.activityAdminSystemService.actiAdmin(idAdmin, getUser._id);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async deleteItem(lang, id, idAdmin: string) {
        try {
            const getUser = await this.userSystemRepositoryService.findOneById(id);
            if (!getUser) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            getUser.is_delete = true;
            await getUser.save();
            this.activityAdminSystemService.deleteAdmin(idAdmin, getUser._id);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getList(lang, iPage: iPageGetUserSysstemDTOAdmin, admin: UserSystemDocument) {
        try {
            const query: any = searchQuery(["full_name", "email"], iPage)
            const result = await this.userSystemRepositoryService.getListPaginationDataByCondition(iPage, query, {}, { date_create: -1 }, [
            ]);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getDetail(lang, id: string, admin: UserSystemDocument) {
        try {
            const getUser = await this.userSystemModel.findById(id)
                .select(INFO_USER_SYSTEM)
                .populate(POP_ROLE_ADMIN)
                .populate({ path: 'id_service_manager', select: { title: 1, description: 1, } })
                .populate({ path: 'id_business' })
            if (!getUser) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            // const checkPermisstion = await this.globalService.checkPermissionArea(admin);
            // if (!checkPermisstion.permisstion) {
            //     throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            // }
            return getUser;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getListApi(lang, iPage) {
        try {
            const query = {
                $and: [
                    { is_delete: false },
                    // { is_active: true },
                    {
                        $or: [
                            {
                                name_api: {
                                    $regex: iPage.search,
                                    $options: "i"
                                }
                            }
                        ]
                    }
                ]
            }
            const getList = await this.keyApiModel.find(query)
                .skip(iPage.start)
                .limit(iPage.length)
                .select({ _id: 1, description: 1, name_api: 1, date_create: 1, is_delete: 1, is_active: 1, });;
            const count = await this.keyApiModel.count(query);
            const result = {
                start: iPage.start,
                length: iPage.length,
                totalItem: count,
                data: getList
            };
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async createKeyApi(lang, payload: createApiDTOAdmin, idAdmin) {
        try {
            const getAdmin = await this.userSystemRepositoryService.findOneById(idAdmin);
            if (!getAdmin) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, "admin")], HttpStatus.NOT_FOUND);
            if (getAdmin.role !== "admin") throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            const getKeyApi = await this.keyApiModel.findOne({
                is_delete: false,
                is_active: true,
                url_access: payload.url_access,
            })
            if (getKeyApi) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ACCOUNT_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            const newItem = new this.keyApiModel({
                date_create: new Date(Date.now()).toISOString(),
                is_delete: false,
                is_active: true,
                url_access: payload.url_access,
                name_api: payload.name_api,
                description: payload.description || ""
            });
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async editKeyApi(lang, payload: updateKeyApiDTOAdmin, idAdmin, idKeyApi) {
        try {
            const getAdmin = await this.userSystemRepositoryService.findOneById(idAdmin);
            if (!getAdmin) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, "admin")], HttpStatus.NOT_FOUND);
            const getKeyApi = await this.keyApiModel.findById(idKeyApi);
            if (!getKeyApi) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "key api")], HttpStatus.NOT_FOUND);
            getKeyApi.url_access = payload.url_access || getKeyApi.url_access;
            getKeyApi.name_api = payload.name_api || getKeyApi.name_api;
            getKeyApi.description = payload.description || getKeyApi.description;
            await getKeyApi.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getDetailApiKey(lang, idKeyApi) {
        try {
            const getKeyApi = await this.keyApiModel.findById(idKeyApi)
                .select({ _id: 1, description: 1, name_api: 1, date_create: 1, is_delete: 1, is_active: 1, });
            if (!getKeyApi) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "key api")], HttpStatus.NOT_FOUND);
            return getKeyApi;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async createRoleAdmin(lang, payload: createRoleAdminDTOAdmin, idAdmin) {
        try {
            const newItem = new this.roleAdminModel({
                name_role: payload.name_role,
                id_key_api: payload.id_key_api || [],
                type_role: payload.type_role || "",
                is_permission: payload.is_permission,
                is_area_manager: payload.is_area_manager,
                area_manager_level_0: payload.area_manager_level_0 || 'viet_nam',
                area_manager_level_1: payload.area_manager_level_1 || [],
                area_manager_level_2: payload.area_manager_level_2 || [],
                date_create: new Date(Date.now()).toISOString(),
                is_service_manager: payload.is_service_manager,
                id_service_manager: payload.id_service_manager
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);

        }
    }

    async editRoleAdmin(lang, payload: updateRoleAdminDTOAdmin, idRoleAdmin, idAdmin) {
        try {
            const getRoleAdmin = await this.roleAdminModel.findOne({ _id: idRoleAdmin });
            if (!getRoleAdmin) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "role admin")], HttpStatus.NOT_FOUND);
            getRoleAdmin.id_key_api = (payload.id_key_api) ? payload.id_key_api : getRoleAdmin.id_key_api;
            getRoleAdmin.name_role = (payload.name_role) ? payload.name_role : getRoleAdmin.name_role;
            getRoleAdmin.is_permission = (payload.is_permission !== getRoleAdmin.is_permission && payload.is_permission) ? payload.is_permission : getRoleAdmin.is_permission;
            getRoleAdmin.is_area_manager = (payload.is_area_manager !== getRoleAdmin.is_area_manager && payload.is_area_manager) ? payload.is_area_manager : getRoleAdmin.is_area_manager;
            getRoleAdmin.area_manager_level_0 = 'viet_nam'
            getRoleAdmin.area_manager_level_1 = payload.area_manager_level_1 || getRoleAdmin.area_manager_level_1;
            getRoleAdmin.area_manager_level_2 = payload.area_manager_level_2 || getRoleAdmin.area_manager_level_2;
            getRoleAdmin.is_service_manager = payload.is_service_manager || getRoleAdmin.is_service_manager;
            getRoleAdmin.id_service_manager = payload.id_service_manager || getRoleAdmin.id_service_manager;
            await getRoleAdmin.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getListRoleAdmin(lang, iPage) {
        try {
            const query = {
                $and: [
                    { is_delete: false },
                    // { is_active: true },
                    {
                        $or: [
                            {
                                name_role: {
                                    $regex: iPage.search,
                                    $options: "i"
                                }
                            }
                        ]
                    }
                ]
            }

            const getList = await this.roleAdminModel.find(query)
                .skip(iPage.start)
                .limit(iPage.length)
                .sort({ date_create: -1 })
            const count = await this.roleAdminModel.count(query);
            const result = {
                start: iPage.start,
                length: iPage.length,
                totalItem: count,
                data: getList
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getDetailRoleAdmin(lang, idRoleAdmin) {
        try {
            const getKeyApi = await this.roleAdminModel.findById(idRoleAdmin)
            if (!getKeyApi) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "key api")], HttpStatus.NOT_FOUND);
            return getKeyApi;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getSettingKeyApi() {
        try {
            const arrItem = await this.keyApiModel.aggregate([
                {
                    $group:
                    {
                        _id: "$key_group_api",
                        permission: {
                            $push:
                            {
                                "_id": "$_id",
                                "name_api": "$name_api",
                                "url_access": "$url_access",
                                "description": "$description",
                                "date_create": "$date_create",
                                "is_delete": "$is_delete",
                                "is_active": "$is_active",
                                "key_group_api": "$key_group_api",
                                "name_group_api": "$name_group_api",
                                "key_api_parent": "$key_api_parent"
                            },
                        }
                    },
                },
                {
                    $sort: { name_api: -1 }
                }
            ]).sort({ _id: 1 })

            return arrItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    async deleteRoleAdmin(lang, idRole) {
        try {
            const findRole = await this.roleAdminModel.findById(idRole);
            if (!findRole) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "idRole")], HttpStatus.NOT_FOUND);
            findRole.is_delete = true;
            await findRole.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}