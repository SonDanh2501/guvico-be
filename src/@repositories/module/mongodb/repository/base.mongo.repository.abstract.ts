// import { BaseEntity } from '@modules/shared/base/base.entity';
import { Model, Types } from 'mongoose'
import { populateArrDTO } from 'src/@core'
import { BaseRepositoryInterface } from 'src/@repositories/module/mongodb/interface/base.interface'
import { BaseEntity } from '../@database'
// import { FindAllResponse } from 'src/types/common.type';

export abstract class BaseMongoRepositoryAbstract<T extends BaseEntity> implements BaseRepositoryInterface<T>
{
    protected constructor(private readonly model: Model<T>) {
        this.model = model;
    }

    async findOneById(id: string, selectOption, populateArr): Promise<T> {
        let item = await this.model.findById(id).select(selectOption);
        const payload = [];
        for (let i = 0; i < populateArr.length; i++) {
            payload.push(item.populate({ path: populateArr[i].path, select: populateArr[i].select }))
        }
        await Promise.all(payload);
        return item;

        // const condition = {
        //     $and: [
        //         { _id: new Types.ObjectId(id) }
        //     ]
        // }

        // const templateSchema = new this.model();
        // let query = [
        // ];
        // query.push({
        //     $project: {}
        // })
        // query = await this.setSelectOption(query, selectOption, templateSchema)
        // query = await this.setPopulate(query, populateArr, templateSchema)
        // query = await this.setQueryMatch(query, condition)

        // // console.log(query, 'query');
        


        // query.push(query[0]);
        // // query.push(query[0]);

        // query.shift();
        // const data = await this.model.aggregate(query)
        // return data.length > 0 ? data[0] : null;
    }


    async findOne(condition: Object, selectOption, sortOption, populateArr): Promise<T> {

        // if(!condition['$and']) {
        //     condition = {
        //         $and: [
        //             condition
        //         ]
        //     }
        // }

        // const templateSchema = new this.model();
        // let query = [
        // ];
        // query.push({
        //     $project: {}
        // })
        // query = await this.setSelectOption(query, selectOption, templateSchema)
        // query = await this.setPopulate(query, populateArr, templateSchema)
        // query = await this.setQueryMatch(query, condition)
        // query.push(query[0]);
        // query.shift();
        // const data = await this.model.aggregate(query)
        // return data.length > 0 ? data[0] : null;

        // // console.log(condition, 'condition');
        // console.log(condition, 'condition');
        

        const item = await this.model.findOne(condition)
            .select(selectOption)
            .sort(sortOption)
            .exec();
        const payload = [];
        for (let i = 0; i < populateArr.length; i++) {
            payload.push(item.populate({ path: populateArr[i].path, select: populateArr[i].select }))
        }
        await Promise.all(payload);
        return item;
    }

    async getListDataByCondition(condition, selectOption, sortOption, populateArr): Promise<T[]> {
        
        const templateSchema = new this.model();
        let query = [
        ];
        query.push({
            $project: {}
        })
        query = await this.setSelectOption(query, selectOption, templateSchema)
        query = await this.setPopulate(query, populateArr, templateSchema)
        query = await this.setQueryMatch(query, condition)

        query = await this.setSort(query, sortOption)
        // console.log(query, "queryqqqq");
        // console.log(query[query.length - 2]['$match']['$and'], "queryqqqq");

        // console.log(query[query.length - 2]['$match']['$and'][1].status, "queryqqqq");

        // console.log(query[query.length - 1]['$and'][1], "queryqqqq");
        // ['$and'][1].status
        
        query.push(query[0]);
        query.shift();
        const data = await this.model.aggregate(query)
        
        return data;
    }

    async getListPaginationDataByCondition(iPage, condition, selectOption, sortOption, populateArr: populateArrDTO[], isPopuplateFirst: boolean): Promise<any> {
        const templateSchema = new this.model();
        let query = [
        ];
        query.push({
            $project: {}
        })
        // query = await this.setSelectOption(query, selectOption, templateSchema);
        // query = await this.setPopulate(query, populateArr, templateSchema);
        // query = await this.setQueryMatch(query, condition);
        // query = await this.setSort(query, sortOption)

        query = await this.setSelectOption(query, selectOption, templateSchema);
        if(isPopuplateFirst === true) {
            query = await this.setPopulate(query, populateArr, templateSchema);
            query = await this.setQueryMatch(query, condition);
        } else {
            query = await this.setQueryMatch(query, condition);
            query = await this.setPopulate(query, populateArr, templateSchema);
        }
        query = await this.setSort(query, sortOption)
        query.push(query[0]);
        query.shift();
        
        query.push({
            $facet: {
                totalItem: [
                    {
                        $count: 'count'
                    }
                ],
                data: [{ $skip: iPage.start }, { $limit: iPage.length }],
            },
        })
        const data = await this.model.aggregate(query)
        const result = {
            ...iPage,
            totalItem: (data[0]["totalItem"][0]) ? data[0]["totalItem"][0].count : 0,
            data: data[0]["data"] || []
        }
        return result;
    }

    async countDataByCondition(condition, populateArr: populateArrDTO[], isPopuplateFirst): Promise<number> {
        if (populateArr.length > 0) {
            const templateSchema = new this.model();
            let query = [
            ];
            query.push({
                $project: {}
            })
            query = await this.setSelectOption(query, {}, templateSchema);
            query = await this.setPopulate(query, populateArr, templateSchema)
            query = await this.setQueryMatch(query, condition)
            query.push(query[0]);
            query.shift();
            query.push({
                $count: 'totalItem'
            })
            const data = await this.model.aggregate(query)
            if (data.length > 0) {
                return data[0].totalItem;
            } else {
                return 0;
            }
        } else {
            const count = await this.model.countDocuments(condition);
            return count;
        }
    }

    async create(dto: T | any): Promise<any> {
        const created_data = new this.model(dto);
        const result = await created_data.save();
        return result;
    }

    async findByIdAndUpdate(id: string, dto: Partial<T>): Promise<T> {
        const result = await this.model.findOneAndUpdate(
            { _id: id },
            dto,
            { new: true },
        );
        return result;
    }

    async findByIdAndSoftDelete(id: string): Promise<boolean> {
        const findItem = await this.model.findById(id);
        if (!findItem || findItem.is_delete === true) {
            return false;
        }
        const deleteItem = await this.model.findByIdAndUpdate(id, { is_delete: true });
        return (deleteItem) ? true : false;
    }


    async findByIdAndPermanentlyDelete(id: string): Promise<boolean> {
        const delete_item = await this.model.findById(id);
        if (!delete_item) {
            return false;
        }
        return !!(await this.model.findByIdAndDelete(id));
    }

    async aggregateQuery(condition, options): Promise<any> {
        return await this.model.aggregate(condition, options);
    }

    async updateMany(condition, dto, options): Promise<any> {
        return await this.model.updateMany(condition, dto, options);
    }

    async saveItem(dto: T | any): Promise<any> {
        // const created_data = new this.model(dto);
        // const result = await created_data.save();
        // let result = this.model(dto);
        return await dto.save();
    }

    async createMany(dto: T[] | any): Promise<any> {
        // const created_data = new this.model(dto);
        // const payloadCreate = []
        // for(const item of dto) {
        //     payloadCreate.push(new this.model(item));
        // }
        // const result = await this.model.insertMany(payloadCreate);
        const result = await this.model.insertMany(dto);

        // const result = await created_data.save();
        return result;
    }


    async setSelectOption(query, selectOption, templateSchema) {

        // console.log(templateSchema, 'templateSchema');
        

        if (Object.keys(selectOption).length > 0) {
            query[0]['$project'] = { ...query[0]['$project'], ...selectOption }
        } else {
            const getKey = Object.keys(JSON.parse(JSON.stringify(templateSchema)));
            // console.log(getKey, 'getKey');
            
            let selectArr = {}
            for (const itemSelect of getKey) {

                // console.log(itemSelect, 'itemSelect');
                
                if(Object.prototype.toString.call(templateSchema[itemSelect]) === '[object Object]') {
                    // console.log(itemSelect, 'itemSelect');
                    // console.log(templateSchema[itemSelect], 'templateSchema[itemSelect]');
                    
                    // const getKeyItemSelect = Object.keys(templateSchema[itemSelect])
                    const getKeyItemSelect = Object.keys(JSON.parse(JSON.stringify(templateSchema[itemSelect])));

                    // console.log(getKeyItemSelect, 'getKeyItemSelect');

                }
            // if(templateSchema[itemSelect], 'ssss')


                selectArr = { ...selectArr, ...{ [`${itemSelect}`]: 1 } }
            }
            query[0]['$project'] = { ...query[0]['$project'], ...selectArr }
        }
        return query;
    }

    async setPopulate(query, populateArr, templateSchema) {
        if (populateArr.length > 0) {
            for (const item of populateArr) {
                if (["id_admin_action", "id_admin_verify", "id_admin"].findIndex(x => x === item.path) > -1) {
                    const newQueryLookUp = {
                        $lookup: {
                            from: "usersystems",
                            localField: item.path,
                            foreignField: '_id',
                            as: item.path
                        }
                    }
                    query.push(newQueryLookUp);
                } else if (item.path.indexOf("._id") > -1) {
                    let fromPath = item.path.split(".")
                    const newQueryLookUp = {
                        $lookup: {
                            from: fromPath[fromPath.length - 2].replace("_", "") + "s",
                            localField: item.path,
                            foreignField: '_id',
                            as: item.path
                        }
                    }
                    query.push(newQueryLookUp);
                } 
                else {
                    const arrPath = item.path.split('_')
                    let fromPath = '';
                    arrPath.map((item, index) => {
                        if (index !== 0) {
                            fromPath += item
                        }
                    })
                    const newQueryLookUp = {
                        $lookup: {
                            from: fromPath + "s",
                            localField: item.path,
                            foreignField: '_id',
                            as: item.path
                        }
                    }
                    query.push(newQueryLookUp);
                }
                    const getKey = Object.keys(item.select);
                    let selectArr = {}
                    for (const itemSelect of getKey) {
                        selectArr = { ...selectArr, ...{ [`${item.path}.${itemSelect}`]: item.select[itemSelect] } }
                    }

                    if(item.path.indexOf("._id") > -1) {
                        delete query[0]['$project'][item.path.split(".")[0]]
                    } else {
                        delete query[0]['$project'][item.path]
                    }
                    query[0]['$project'] = { ...query[0]['$project'], ...selectArr }


                    console.log(item.path, 'item.path');
                    // console.log(templateSchema, 'templateSchema');

                    console.log(templateSchema[item.path], 'Array.isArray(templateSchema[item.path])');
                    

                    if (Array.isArray(templateSchema[item.path]) === false) query.push({ $unwind: { path: `$${item.path}`, preserveNullAndEmptyArrays: true } })

            }
        }
        return query;
    }

    async setQueryMatch(query, condition) {
        // config cho condition trong $match
        if (condition.$and) condition.$and.push({ is_delete: false });
        else condition = { ...condition, ...{ is_delete: false } };
        const getKeysQuery = Object.keys(condition);

        let holdQueryLookup = []
        for(const item of condition[getKeysQuery[0]]) {
            
            const getObjectKeys = Object.keys(item)
            const findQueryIndex = query.findIndex(x => {
                if(x['$lookup'] && x['$lookup'].as === getObjectKeys[0]) return true;
                else false
            })
            if(findQueryIndex > 0) {
                holdQueryLookup.push(query[findQueryIndex])
                holdQueryLookup.push(query[findQueryIndex + 1])
                query[findQueryIndex] = null
                query[findQueryIndex + 1] = null
                query = query.filter(x => x !== null)
            }
        }
        if (JSON.stringify(condition).length > 10) {
            query.push({
                $match: condition
            })
        }
        query = [...query, ...holdQueryLookup]
        return query;
    }

    async setSort(query, sortOption) {
        // push sort 
        if (JSON.stringify(sortOption).length > 3) {
            query.push({
                $sort: sortOption
            })
        }
        return query;
    }

    async deleteMany(condition): Promise<any> {
        return await this.model.deleteMany(condition);
    }

    // async findAll(
    //     condition: FilterQuery<T>,
    //     options?: QueryOptions<T>,
    // ): Promise<FindAllResponse<T>> {
    //     const [count, items] = await Promise.all([
    //         this.model.count({ ...condition, deleted_at: null }),
    //         this.model.find({ ...condition, deleted_at: null }, options?.projection, options),
    //     ]);
    //     return {
    //         count,
    //         items,
    //     };
    // }
}