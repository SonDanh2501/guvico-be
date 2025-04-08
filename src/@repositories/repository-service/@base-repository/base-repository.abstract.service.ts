import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { iPageDTO, populateArrDTO } from 'src/@core'
import { BaseRedisRepositoryInterface } from 'src/@repositories/module/redis/interface'
import { BaseRepositoryInterfaceService } from 'src/@repositories/repository-service/@base-repository/base-repository.interface.service'
import { BaseRepositoryInterface } from '../../module/mongodb/interface/base.interface'
@Injectable()
export abstract class BaseRepositoryService implements BaseRepositoryInterfaceService {
    constructor(
        private readonly repository: BaseRepositoryInterface<any>,
        private readonly repositoryCache?: BaseRedisRepositoryInterface<any> // neu ko can caching thi ko can truyen them reidsRepository
    ) {
        this.repository = repository;
        this.repositoryCache = repositoryCache || null
    }

    async findOneById(id: string, selectOption?: Object, populateArr?: populateArrDTO[] | [], is_find_delete?: boolean | false) {
        try {
            let findItem = null;
            if (this.repositoryCache !== null && this.repositoryCache.returnIsReadyConnect()) {
                if (!selectOption && !populateArr) {
                    findItem = await this.repositoryCache.findOneById(id);
                }
            }
            
            if (!findItem) {
                
                findItem = await this.repository.findOneById(id, selectOption || {}, populateArr || []);
                if (this.repositoryCache !== null && this.repositoryCache.returnIsReadyConnect()) {
                    if (!selectOption && !populateArr || !findItem.is_delete) { // neu lay data tho khong can populate thi save lai trong cache
                        this.repositoryCache.findByIdAndUpdate(id, findItem);
                    }
                }
            }
            return (!findItem || !is_find_delete && findItem.is_delete) ? null : findItem;

            // const findItem = await this.repository.findOneById(id, selectOption || {}, populateArr || []);
            // return (!findItem || !is_delete && findItem.is_delete) ? null : findItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findOne(condition?: Object, selectOption?: Object, sortOption?: Object, populateArr?: populateArrDTO[] | [], is_delete?: boolean) {
        try {
            const findItem = await this.repository.findOne(condition || {}, selectOption || {}, sortOption || {}, populateArr || []);
            return (!findItem || !is_delete && findItem.is_delete) ? null : findItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getListDataByCondition(condition: Object, selectOption?: Object, sortOption?: Object, populateArr?: populateArrDTO[]) {
        try {
            const result = await this.repository.getListDataByCondition(condition, selectOption || {}, sortOption || {}, populateArr || []);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getListPaginationDataByCondition(iPage: iPageDTO, condition: Object, selectOption?: Object, sortOption?: Object, populateArr?: populateArrDTO[], isPopuplateFirst?: boolean) {
        try {
            const result = await this.repository.getListPaginationDataByCondition(iPage, condition, selectOption || {}, sortOption || {}, populateArr || [], isPopuplateFirst || true);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async countDataByCondition(condition: Object, populateArr?: populateArrDTO[], isPopuplateFirst?: boolean) {
        try {
            const result = await this.repository.countDataByCondition(condition, populateArr || [], isPopuplateFirst || true);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async create(dto: Object) {
        try {
            const result = await this.repository.create(dto);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findByIdAndUpdate(id: string, dto: Object) {
        try {
            // console.log('op day3');

            const result = await this.repository.findByIdAndUpdate(id, dto);
            // console.log('op day2');

            if (this.repositoryCache !== null && this.repositoryCache.returnIsReadyConnect()) {
                // console.log('op day');
                const findCaching = await this.repositoryCache.findOneById(id);
                if (findCaching) {
                    this.repositoryCache.findByIdAndUpdate(id, result)
                }
            }

            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findByIdAndSoftDelete(id: string) {
        try {
            const result = await this.repository.findByIdAndSoftDelete(id);
            // if (this.repositoryCache == null) {
            //     this.repositoryCache.findByIdAndDelete(id)
            // }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findByIdAndPermanentlyDelete(id: string) {
        try {
            const result = await this.repository.findByIdAndPermanentlyDelete(id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async aggregateQuery(condition: Object[], options?) {
        try {
            const result = await this.repository.aggregateQuery(condition, options || {});
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateMany(condition: Object, dto: Object, options?) {
        try {
            const result = await this.repository.updateMany(condition, dto, options || {});
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async saveItem(dto: Object) {
        try {
            // console.log('op day3');

            const result = await this.repository.saveItem(dto);
            // console.log('op day2');

            if (this.repositoryCache !== null) {
                // console.log('op day');

                const findCaching = await this.repositoryCache.findOneById(result._id);
                if (findCaching) {
                    this.repositoryCache.findByIdAndUpdate(result._id, result)
                }
            }

            return result;

        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async createMany(dto: Object[]) {
        try {
            const result = await this.repository.createMany(dto);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async deleteMany(condition: Object) {
        try {
            const result = await this.repository.deleteMany(condition);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
