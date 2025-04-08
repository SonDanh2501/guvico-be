import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { ERROR } from 'src/@core'
import { DeviceTokenRepositoryService } from 'src/@repositories/repository-service/device-token-repository/device-token-repository.service'
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service'

@Injectable()
export class DeviceTokenOopSystemService {
    constructor(
        private customExceptionService: CustomExceptionService,
        private deviceTokenRepositoryService: DeviceTokenRepositoryService
    ) { }

    async getDetailItem(lang, idDeviceToken) {
        try {
            const getCustomer = await this.deviceTokenRepositoryService.findOneById(idDeviceToken);
            if (!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "device_token")], HttpStatus.NOT_FOUND)
            return getCustomer;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getDetailItemByUserId(lang, idUser) {
        try {
            const query = {
                $and: [
                    { user_id: idUser }
                ]
            }
            return await this.deviceTokenRepositoryService.findOne(query, {}, { date_update: -1 });

        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async createItem(payload) {
        try {
            payload.user_id = payload.user_id.toString()
            const newItem = await this.deviceTokenRepositoryService.create({
                token: payload.token,
                date_create: new Date().toISOString(),
                user_object: payload.user_object,
                user_id: payload.user_id
            })

            const findRemoveLastDeviceToken = await this.deviceTokenRepositoryService.findOne({ user_id: payload.user_id, user_object: payload.user_object }, {}, { date_create: 1 });
            if (findRemoveLastDeviceToken) {
                await this.deviceTokenRepositoryService.findByIdAndUpdate(findRemoveLastDeviceToken._id, { is_delete: true });
            }
            return newItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getList(lstId, user_object?) {
        try {
            const aggregateQuery = [
                {
                    $match: {
                        is_delete: false
                    }
                },
                {
                    $sort: { user_id: 1, date_update: -1 }
                },
                {
                    $group: {
                        _id: "$user_id",
                        latestRecord: { $first: "$$ROOT" }
                    }
                },
                {
                    $replaceRoot: { newRoot: "$latestRecord" }
                }
            ]

            if (lstId.length > 0) {
                aggregateQuery[0].$match['user_id'] = { $in: lstId }
            } 

            if (user_object){
                aggregateQuery[0].$match['user_object'] = user_object
            }

            const lstDeviceToken = await this.deviceTokenRepositoryService.aggregateQuery(aggregateQuery);

            return lstDeviceToken;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async updateDeviceToken(subjectAction, payload) {
        try {
            // Cap nhat lai deviceToken moi nhat
            const user_id = subjectAction._id.toString()
            const findLastDeviceToken = await this.deviceTokenRepositoryService.findOne({ user_id: user_id }, {}, { date_update: -1 },);

            if (findLastDeviceToken) {
                findLastDeviceToken.is_delete = true;
                await this.deviceTokenRepositoryService.findByIdAndUpdate(findLastDeviceToken._id, findLastDeviceToken);
            }

            const query = {
                token: payload.device_token
            }
            const deviceToken = await this.deviceTokenRepositoryService.findOne(query, {}, {}, [], true);

            if (deviceToken) {
                deviceToken.is_delete = false;
                deviceToken.user_id = subjectAction._id;
                deviceToken.user_object = subjectAction.type;
                deviceToken.date_update = new Date(Date.now()).toISOString(),

                await this.deviceTokenRepositoryService.findByIdAndUpdate(deviceToken._id, deviceToken);

                return deviceToken
            } else {
                const payloadCreate = {
                    user_id: subjectAction._id,
                    token: payload.device_token,
                    user_object: subjectAction.type
                }
                const newDeviceToken = await this.createItem(payloadCreate)

                return newDeviceToken
            }
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async deleteSoftDeviceToken(lstId) {
        try {
            const query = {
                $and: [
                    { _id: { $in: lstId }}
                ]
            }
            return await this.deviceTokenRepositoryService.updateMany(query, { $set: { is_delete: true } })
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
