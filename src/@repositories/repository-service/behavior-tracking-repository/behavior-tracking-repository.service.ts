import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { BehaviorTrackingMongoRepository } from 'src/@repositories/module/mongodb/repository/behavior-tracking.mongo.repository';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';
import { BaseRepositoryService } from '../@base-repository/base-repository.abstract.service';
import { BaseRepositoryInterfaceService } from '../@base-repository/base-repository.interface.service';
import { populateArrDTO } from 'src/@core';

@Injectable()
export class BehaviorTrackingRepositoryService extends BaseRepositoryService implements BaseRepositoryInterfaceService {
    constructor(
        private behaviorTrackingMongoRepository: BehaviorTrackingMongoRepository,
        private customExceptionService: CustomExceptionService,
    ) {
        super(behaviorTrackingMongoRepository);
    }

    async findOneAndUpdateBehavior(userId, behavior) {
        try {
            const query = {
                $and: [
                    {behavior: behavior},
                    {id_user: userId}
                ]
            }
            const findItem = await this.behaviorTrackingMongoRepository.findOne(query, {}, {},[]);
            if(findItem) {
                findItem.count += 1;
                await this.behaviorTrackingMongoRepository.findByIdAndUpdate(findItem['_id'], findItem)
            } else {
                const newPayload = {
                    id_user: userId,
                    subject_action: null, // xac dinh sau
                    behavior: behavior,
                    count: 1,
                    date_create: new Date().toISOString()
                }
                await this.behaviorTrackingMongoRepository.create(newPayload);
            }
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
