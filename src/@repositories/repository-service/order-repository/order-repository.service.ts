import { Injectable } from '@nestjs/common';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';
import { OrderMongoRepository } from 'src/@repositories/module/mongodb/repository/order.mongo.repository';
import { BaseRepositoryService } from 'src/@repositories/repository-service/@base-repository/base-repository.abstract.service';
import { BaseRepositoryInterfaceService } from 'src/@repositories/repository-service/@base-repository/base-repository.interface.service';

@Injectable()
export class OrderRepositoryService extends BaseRepositoryService implements BaseRepositoryInterfaceService {
    constructor(
        private orderMongoRepository: OrderMongoRepository,
        private customExceptionService: CustomExceptionService,
    ) { 
        super(orderMongoRepository);
     }


    // async findItemById(idOrder, lang?) {
    //     try {
    //         let findCache = await this.cacheManager.get(idOrder);
    //         let listCache = await this
    //         console.log(findCache, 'findCache');
    //         if(!findCache) {
    //             const findItem = await this.orderModel.findById(idOrder);
    //             if(!findItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang || "vi", "order")], HttpStatus.NOT_FOUND);
    //             await this.cacheManager.set(idOrder, findItem)
    //             findCache = findItem;
    //         }
    //         // const findItem = await this.orderModel.findById(idOrder);
    //         // if(!findItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang || "vi", "order")], HttpStatus.NOT_FOUND);
    //         return findCache;
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    //     }
    // }


    // async getListItem() {
    //     let findItemCache = await this.cacheManager.get("listOrder");
    //     console.log(findItemCache, 'findItem');
    //     if(!findItemCache) {
    //         const findItem = await this.orderModel.find().limit(800);
    //         await this.cacheManager.set("listOrder", findItem)
    //         findItemCache = findItem;
    //     }
    //     return findItemCache;
    // }


    // async findItemByIdAndSave(idOrder, payload, lang?) {
    //     try {
    //         let findCache = await this.cacheManager.get(idOrder);
    //         if(!findCache) {
    //             const findItem = await this.orderModel.findById(idOrder);
    //             if(!findItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang || "vi", "order")], HttpStatus.NOT_FOUND);
    //             await this.cacheManager.set(idOrder, payload)
    //             findCache = findItem;
    //         }
    //         return findCache;
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    //     }
    // }


    // async cleanCacheByKey(idKey) {
    //     try {
    //         this.cacheManager.del(idKey);
    //         return true;
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    //     }
    // }


    // async cleanAllCache() {
    //     try {
    //         this.cacheManager.reset();
    //         return true;
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    //     }
    // }
}
