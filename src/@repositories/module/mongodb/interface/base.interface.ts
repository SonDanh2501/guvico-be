// export type FindAllResponse<T> = { count: number; items: T[] };

import { iPageDTO, populateArrDTO } from "src/@core"

export interface BaseRepositoryInterface<T> {
    // // findAll(
    // //     condition: object,
    // //     options?: object,
    // // ): Promise<FindAllResponse<T>>;

    findOneById(id: string, selectOption: Object, populateArr: populateArrDTO[]): Promise<T | null>;

    findOne(condition: Object, selectOption: Object, sortOption: Object, populateArr: populateArrDTO[]): Promise<T | null>;

    getListDataByCondition(condition: Object, selectOption: Object, sortOption: Object, populateArr: populateArrDTO[]): Promise<T[]>; // lay danh sach data khong can phan trang

    getListPaginationDataByCondition(iPage: iPageDTO, condition: Object, selectOption: Object, sortOption: Object, populateArr: populateArrDTO[], isPopuplateFirst: boolean): Promise<any>; // lay danh sach data co phan trang

    countDataByCondition(condition: Object, populateArr: populateArrDTO[], isPopuplateFirst: boolean): Promise<number>; // tong so luong item phu hop voi dieu kien

    create(dto: T | any): Promise<any>;

    findByIdAndUpdate(id: string, dto: Object): Promise<T>;

    findByIdAndSoftDelete(id: string): Promise<boolean>; // xoa tam thoi voi is_delete = true

    findByIdAndPermanentlyDelete(id: string): Promise<boolean>; // xoa vinh vien ra khoi database

    aggregateQuery(condition: Object[], options): Promise<any>;

    updateMany(condition: Object, dto: Object, options: object): Promise<any>;

    saveItem(dto: T | any): Promise<T>;

    createMany(dto: T[] | any): Promise<any>

    deleteMany(condition: Object): Promise<any>; // xoa vinh vien ra khoi database
}
