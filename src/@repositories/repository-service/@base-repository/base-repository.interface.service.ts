// export type FindAllResponse<T> = { count: number; items: T[] };

import { iPageDTO, populateArrDTO } from "src/@core"

export interface BaseRepositoryInterfaceService {

    findOneById(id: string, selectOption?: Object, populateArr?: populateArrDTO[], is_delete?: boolean): Promise<any>; // neu khong truyen tham so is_delete thi mac dinh tra ve null khi is_delete = true

    findOne(condition?: Object, selectOption?: Object, sortOption?: Object, populateArr?: populateArrDTO[], is_delete?: boolean): Promise<any>; // neu khong truyen tham so is_delete thi mac dinh tra ve null khi is_delete = true

    getListDataByCondition(condition: Object, selectOption?: Object, populateArr?: populateArrDTO[]): Promise<any>; // lay danh sach data khong can phan trang

    getListPaginationDataByCondition(iPage: iPageDTO, condition: Object, selectOption?: Object, sortOption?: Object, populateArr?: populateArrDTO[], isPopuplateFirst?: boolean): Promise<any>; // lay danh sach data co phan trang

    countDataByCondition(condition: Object, populateArr?: populateArrDTO[], isPopuplateFirst?: boolean): Promise<number>; // tong so luong items phu hop voi dieu kien

    create(dto: Object): Promise<any>;

    findByIdAndUpdate(id: string, dto: Object): Promise<any>;

    findByIdAndSoftDelete(id: string): Promise<any>; // xoa tam thoi voi is_delete = true

    findByIdAndPermanentlyDelete(id: string): Promise<any>; // xoa vinh vien ra khoi database

    aggregateQuery(condition: Object[], options?): Promise<any>;

    updateMany(condition: Object, dto: Object): Promise<any>

    createMany(dto: Object[]): Promise<any>;

    saveItem(dto: Object): Promise<any>;

    deleteMany(condition: Object): Promise<any>; // xoa vinh vien ra khoi database
}
