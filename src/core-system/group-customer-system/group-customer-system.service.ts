import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { createOrderDTO, Customer, CustomerDocument, ERROR, GroupCustomer, GroupCustomerDocument, Order, OrderDocument } from 'src/@core';
import { GroupOrder, GroupOrderDocument } from 'src/@core/db/schema/group_order.schema';
import { CustomerRepositoryService } from 'src/@repositories/repository-service/customer-repository/customer-repository.service';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';
// import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
// import { Logger } from 'winston';

@Injectable()
export class GroupCustomerSystemService {
    constructor(
        private customExceptionService: CustomExceptionService,
        private customerRepositoryService: CustomerRepositoryService,
        // @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        @InjectModel(GroupOrder.name) private groupOrderModel: Model<GroupOrderDocument>,
        @InjectModel(GroupCustomer.name) private groupCustomerModel: Model<GroupCustomerDocument>,
        @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    ) { }

    // async updateConditionIn(idCustomer) {
    //     try {
    //         const getCustomer = await this.customerModel.findById(idCustomer);
    //         if(!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, "en", null)], HttpStatus.BAD_REQUEST);

    //         const groupCustomer = await this.groupCustomerModel.find({
    //             _id: {$nin: getCustomer.id_group_customer}
    //         });

    //         for(let item of groupCustomer) {
    //             let finalCondition = false;
    //             const arrCondition = [];
    //             for(let A of item.condition_in.condition) {
    //                 const condition = await this.checkCondition(A.kind, getCustomer, A.operator, A.value);
    //                   arrCondition.push(condition);
    //             }
    //                 for(let i = 0 ; i < arrCondition.length ; i++) {
    //                     finalCondition = (item.condition_in.type_condition === "or" ) ? finalCondition || arrCondition[i] : finalCondition && arrCondition[i];
    //                 }
    //                 if(finalCondition === true) {
    //                     getCustomer.id_group_customer.push(item._id)
    //                     await getCustomer.save();
    //                     // if(getCustomer.id_group_customer) {
    //                     //     getCustomer.id_group_customer.push(item._id)
    //                     //     await getCustomer.save();
    //                     // } else {
    //                     //     getCustomer.id_group_customer = [item._id]
    //                     //     await getCustomer.save();
    //                     // }
    //                 }
    //         }
    //         return true;
    //     } catch (err) {
    //         // this.logger.error(err.response || err.toString());
    //         throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
    //     }

    // }

    // async updateConditionOut(idCustomer) {
    //     const getCustomer = await this.customerModel.findById(idCustomer);
    //     if(!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, "en", null)], HttpStatus.BAD_REQUEST);
    //     const query = {
    //         $and: [
    //         {_id: {$in: getCustomer.id_group_customer}},
    //         {$or: [
    //             { is_delete: false },
    //             { is_delete: { $exists: false } }
    //         ]}
    //         ],
    //     }
    //     const getGroupCustomer = await this.groupCustomerModel.find(query);
    //     // console.log(getGroupCustomer, 'getGroupCustomer')
    //     for(let item of getGroupCustomer) {
    //         let finalCondition = false;
    //         const arrCondition = [];
    //         for(let A of item.condition_out.condition) {
    //             const condition = await this.checkCondition(A.kind, getCustomer, A.operator, A.value);
    //               arrCondition.push(condition);
    //         }
    //             for(let i = 0 ; i < arrCondition.length ; i++) {
    //                 finalCondition = (item.condition_in.type_condition === "or" ) ? finalCondition || arrCondition[i] : finalCondition && arrCondition[i]
    //             }
    //             if(finalCondition === true) {
    //                 const index = getCustomer.id_group_customer.indexOf(item._id);
    //                 if (index > -1) { // only splice array when item is found
    //                     getCustomer.id_group_customer.splice(index, 1); // 2nd parameter means remove one item only
    //                     await getCustomer.save();
    //                 }
    //             }
    //     }
    //     return true;
    // }


    async checkCondition(kind, getCustomer, operator, value) {
        let condition = false;
        let valueCustomer: any;
        let valueCompare: any;
        switch (kind) {
            case "total_order":
                // total_price: tổng số tiền khách hàng chi trả (cứ hoàn thành đơn thì final_fee sẽ được cộng vào total_price và lưu lại)
                if (operator === ">") condition = (Number(getCustomer.total_price) > Number(value)) ? true : false;
                else if (operator === "<") condition = (getCustomer.total_price < Number(value)) ? true : false;
                else if (operator === "==") condition = (getCustomer.total_price === Number(value)) ? true : false;
                else if (operator === "!=") condition = (getCustomer.total_price !== Number(value)) ? true : false;
                else if (operator === ">=") condition = (getCustomer.total_price > Number(value) || getCustomer.total_price === Number(value)) ? true : false;
                else if (operator === "<=") condition = (getCustomer.total_price < Number(value) || getCustomer.total_price === Number(value)) ? true : false;
                break;
            case "rank_point":
                if (operator === ">") condition = (getCustomer.rank_point > Number(value)) ? true : false;
                else if (operator === "<") condition = (getCustomer.rank_point < Number(value)) ? true : false;
                else if (operator === "==") condition = (getCustomer.rank_point === Number(value)) ? true : false;
                else if (operator === "!=") condition = (getCustomer.rank_point !== Number(value)) ? true : false;
                else if (operator === ">=") condition = (getCustomer.rank_point > Number(value) || getCustomer.rank_point === Number(value)) ? true : false;
                else if (operator === "<=") condition = (getCustomer.rank_point < Number(value) || getCustomer.rank_point === Number(value)) ? true : false;
                break;
            case "month_birthday":
                // const month_birthday = Number(new Date(getCustomer.birthday).getMonth()) + 1;
                const month_birthday = Number(new Date(getCustomer.birthday).getMonth());
                if (operator === ">") condition = (month_birthday > Number(value)) ? true : false;
                else if (operator === "<") condition = (month_birthday < Number(value)) ? true : false;
                else if (operator === "==") condition = (month_birthday === Number(value)) ? true : false;
                else if (operator === "!=") condition = (month_birthday !== Number(value)) ? true : false;
                else if (operator === ">=") condition = (month_birthday > Number(value) || month_birthday === Number(value)) ? true : false;
                else if (operator === "<=") condition = (month_birthday < Number(value) || month_birthday === Number(value)) ? true : false;
                break;
            case "date_create":
                const date_create = Number(new Date(getCustomer.date_create).getTime());
                const dateCreateSetting = Number(new Date(value).getTime());
                if (operator === ">") condition = (date_create > dateCreateSetting) ? true : false;
                else if (operator === "<") condition = (date_create < dateCreateSetting) ? true : false;
                else if (operator === "==") condition = (date_create === dateCreateSetting) ? true : false;
                else if (operator === "!=") condition = (date_create !== dateCreateSetting) ? true : false;
                else if (operator === ">=") condition = (date_create > dateCreateSetting || date_create === dateCreateSetting) ? true : false;
                else if (operator === "<=") condition = (date_create < dateCreateSetting || date_create === dateCreateSetting) ? true : false;
                break;
            case "group_order_success_done":
                valueCustomer = await this.groupOrderModel.count({ id_customer: getCustomer._id, status: "done" })
                if (operator === ">") condition = (valueCustomer > value) ? true : false;
                else if (operator === "<") condition = (valueCustomer < value) ? true : false;
                else if (operator === "==") condition = (valueCustomer === value) ? true : false;
                else if (operator === "!=") condition = (valueCustomer !== value) ? true : false;
                else if (operator === ">=") condition = (valueCustomer > value || valueCustomer === value) ? true : false;
                else if (operator === "<=") condition = (valueCustomer < value || valueCustomer === value) ? true : false;
                break;
            case "group_order_success":
                valueCustomer = await this.groupOrderModel.count({ id_customer: getCustomer._id })
                if (operator === ">") condition = (valueCustomer > value) ? true : false;
                else if (operator === "<") condition = (valueCustomer < value) ? true : false;
                else if (operator === "==") condition = (valueCustomer === value) ? true : false;
                else if (operator === "!=") condition = (valueCustomer !== value) ? true : false;
                else if (operator === ">=") condition = (valueCustomer > value || valueCustomer === value) ? true : false;
                else if (operator === "<=") condition = (valueCustomer < value || valueCustomer === value) ? true : false;
                break;
            case "last_order_date_work_success":
                valueCompare = await this.groupOrderModel.findOne({ id_customer: getCustomer._id, status: "done" }).sort({ date_work: -1 })
                if (!valueCompare) break;
                valueCompare = new Date(valueCompare.date_work).getTime();
                const value1 = valueCompare + (value * 24 * 60 * 60 * 1000);
                if (operator === ">") condition = (valueCompare > value1) ? true : false;
                else if (operator === "<") condition = (valueCompare < value1) ? true : false;
                else if (operator === "==") condition = (valueCompare === value1) ? true : false;
                else if (operator === "!=") condition = (valueCompare !== value1) ? true : false;
                else if (operator === ">=") condition = (valueCompare > value1 || valueCompare === value1) ? true : false;
                else if (operator === "<=") condition = (valueCompare < value1 || valueCompare === value1) ? true : false;
                break;
            case "last_order_date_create_success":
                valueCustomer = await this.groupOrderModel.findOne({ id_customer: getCustomer._id }).sort({ date_create: -1 })
                if (!valueCustomer) break;
                valueCompare = new Date(valueCustomer.date_create).getTime();
                const value2 = valueCompare + (value * 24 * 60 * 60 * 1000);
                if (operator === ">") condition = (valueCompare > value2) ? true : false;
                else if (operator === "<") condition = (valueCompare < value2) ? true : false;
                else if (operator === "==") condition = (valueCompare === value2) ? true : false;
                else if (operator === "!=") condition = (valueCompare !== value2) ? true : false;
                else if (operator === ">=") condition = (valueCompare > value2 || valueCompare === value2) ? true : false;
                else if (operator === "<=") condition = (valueCompare < value2 || valueCompare === value2) ? true : false;
                break;
            case "area": // nhóm khách hàng theo khu vực tỉnh thành phố
                if (operator === "==") condition = (getCustomer.city === Number(value)) ? true : false;
                else if (operator === "!=") condition = (getCustomer.city !== Number(value)) ? true : false;
                break;
            case "is_active": // nhóm khách hàng bị khóa hoặc              
                if (operator === "==") condition = (getCustomer.is_active === Boolean(value)) ? true : false;
                break;
            case "is_staff": // nhóm khách hàng nhân viên công ty
                if (operator === "==") condition = (getCustomer.is_staff === Boolean(value)) ? true : false;
                // else if (operator === "!=") condition = (getCustomer.is_staff !== true) ? true : false;
                break;
            case "order_success":
                valueCustomer = await this.orderModel.count({ id_customer: getCustomer._id, status: "done" })
                if (operator === ">") condition = (valueCustomer > value) ? true : false;
                else if (operator === "<") condition = (valueCustomer < value) ? true : false;
                else if (operator === "==") condition = (valueCustomer === value) ? true : false;
                else if (operator === "!=") condition = (valueCustomer !== value) ? true : false;
                else if (operator === ">=") condition = (valueCustomer > value || valueCustomer === value) ? true : false;
                else if (operator === "<=") condition = (valueCustomer < value || valueCustomer === value) ? true : false;
                break;
            default:
                break;
        }
        return condition;
    }

    async updateConditionIn(idCustomer) {
        try {
            const getCustomer = await this.customerRepositoryService.findOneById(idCustomer);
            if (!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, "en", null)], HttpStatus.BAD_REQUEST);
            const query = {
                $and: [
                    { _id: { $nin: getCustomer.id_group_customer } },
                    { is_active: true },
                    { is_delete: false }
                ]
            }
            const groupCustomer = await this.groupCustomerModel.find(query); // Tìm những nhóm khách hàng mà khách hàng hiện tại không thuộc

            for (let item of  groupCustomer) {
                // let finalCondition = false ;
                let finalCondition;
                const arrCondition = [];
                for (let condition_level_1 of item.condition_in.condition_level_1) {
                    let arrChildCondition = [];
                    let finalChildCondition;
                    // let finalChildCondition = false;
                    for (const condition of condition_level_1.condition) {
                        const temp = await this.checkCondition(condition.kind, getCustomer, condition.operator, condition.value);
                        arrChildCondition.push(temp);
                    }

                    if (arrChildCondition.length > 1) {
                        if (condition_level_1.type_condition === "or") {
                            finalChildCondition = arrChildCondition.some(Boolean) // Phép or trên từng phần tử
                        }
                        if (condition_level_1.type_condition === "and") {
                            finalChildCondition = arrChildCondition.every(Boolean) // Phép and trên từng phần tử
                        }
                        // for (let i = 0; i < arrChildCondition.length; i++) {
                        //     finalChildCondition = (condition_level_1.type_condition === "or") ? finalChildCondition || arrChildCondition[i] : finalChildCondition && arrChildCondition[i]; // Khúc này bủn
                        // }
                    } else {
                        finalChildCondition = arrChildCondition[0] || false; // mặc định giá trị là false nếu không có condition nào để check
                    }

                    arrCondition.push(finalChildCondition);
                }


                // Điều kiện tổng cuối cùng
                if (arrCondition.length > 1) {
                    // for (let i = 0; i < arrCondition.length; i++) {
                    //     finalCondition = (item.condition_in.type_condition === "or") ? finalCondition || arrCondition[i] : finalCondition && arrCondition[i];
                    // }
                    if (item.condition_in.type_condition === "or") {
                        finalCondition = arrCondition.some(Boolean) // Phép or trên từng phần tử
                    }
                    if (item.condition_in.type_condition === "and") {
                        finalCondition = arrCondition.every(Boolean) // Phép and trên từng phần tử
                    }
                } else {
                    finalCondition = arrCondition[0] || false
                }
                if (finalCondition === true) {
                    getCustomer.id_group_customer.push(item._id)
                }
            }
            await this.customerRepositoryService.findByIdAndUpdate(idCustomer, getCustomer);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async updateConditionOut(idCustomer) {
        try {
            const getCustomer = await this.customerRepositoryService.findOneById(idCustomer);
            if (!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, "en", null)], HttpStatus.BAD_REQUEST);
            const query = {
                $and: [
                    { _id: { $in: getCustomer.id_group_customer } },
                    { is_delete: false }
                ]
            }
            const groupCustomer = await this.groupCustomerModel.find(query); // Tìm nhóm khách hàng mà khách hàng thuộc tương ứng trong bảng GroupCustomer
            for (let item of groupCustomer) {
                // let finalCondition = false;
                let finalCondition;
                const arrCondition = [];
                for (let condition_level_1 of item.condition_out.condition_level_1) {
                    let arrChildCondition = [];
                    // let finalChildCondition = false;
                    let finalChildCondition;
                    for (const condition of condition_level_1.condition) {
                        const temp = await this.checkCondition(condition.kind, getCustomer, condition.operator, condition.value);
                        arrChildCondition.push(temp);
                    }
                    if (arrChildCondition.length > 1) {
                        // for (let i = 0; i < arrChildCondition.length; i++) {
                        //     finalChildCondition = (condition_level_1.type_condition === "or") ? finalChildCondition || arrChildCondition[i] : finalChildCondition && arrChildCondition[i];
                        // }
                        if (condition_level_1.type_condition === "or") {
                            finalChildCondition = arrChildCondition.some(Boolean) // Phép or trên từng phần tử
                        }
                        if (condition_level_1.type_condition === "and") {
                            finalChildCondition = arrChildCondition.every(Boolean) // Phép and trên từng phần tử
                        }
                    } else {
                        finalChildCondition = arrChildCondition[0] || finalChildCondition;
                    }
                    arrCondition.push(finalChildCondition);
                }
                if (arrCondition.length > 1) {
                    // for (let i = 0; i < arrCondition.length; i++) {
                    //     finalCondition = (item.condition_out.type_condition === "or") ? finalCondition || arrCondition[i] : finalCondition && arrCondition[i];
                    // }
                    if (item.condition_in.type_condition === "or") {
                        finalCondition = arrCondition.some(Boolean) // Phép or trên từng phần tử
                    }
                    if (item.condition_in.type_condition === "and") {
                        finalCondition = arrCondition.every(Boolean) // Phép and trên từng phần tử
                    }
                } else {
                    finalCondition = arrCondition[0] || finalCondition;
                }
                if (finalCondition === true) {
                    var index = getCustomer.id_group_customer.indexOf(item._id);
                    if (index !== -1) {
                        getCustomer.id_group_customer.splice(index, 1);
                    }
                }
            }
            await this.customerRepositoryService.findByIdAndUpdate(idCustomer, getCustomer);
            return true;
        } catch (err) {
            console.log(err, 'err');

            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async upateGroupCustomerByIdOrder(idOrder) {
        try {
            const findOrder = await this.orderModel.findById(idOrder);
            if(!findOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, "order", null)], HttpStatus.BAD_REQUEST);
            const findCustomer = await this.customerRepositoryService.findOneById(findOrder.id_customer.toString());
            if(!findCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, "customer", null)], HttpStatus.BAD_REQUEST);
            await this.updateConditionIn(findCustomer._id)
            await this.updateConditionOut(findCustomer._id)
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async upateGroupCustomerByIdGroupOrder(idGroupOrder) {
        try {
            const findGroupOrder = await this.groupOrderModel.findById(idGroupOrder);
            if(!findGroupOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, "group_order", null)], HttpStatus.BAD_REQUEST);
            const findCustomer = await this.customerRepositoryService.findOneById(findGroupOrder.id_customer.toString());
            if(!findCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, "customer", null)], HttpStatus.BAD_REQUEST);
            await this.updateConditionIn(findCustomer._id)
            await this.updateConditionOut(findCustomer._id)
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async upateGroupCustomerByIdCustomer(idCustomer) {
        try {
            const findCustomer = await this.customerRepositoryService.findOneById(idCustomer);
            if(!findCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, "customer", null)], HttpStatus.BAD_REQUEST);
            await this.updateConditionIn(findCustomer._id)
            await this.updateConditionOut(findCustomer._id)
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async updateAllCustomer() {
        const iPageCustomer = {
            search: "",
            start: 0,
            length: 100,
          }
          let arrCustomer = []
          do {
            arrCustomer = await this.customerModel.find().select({ _id: 1 }).skip(iPageCustomer.start).limit(iPageCustomer.length);
            for (const item of arrCustomer) {
              await this.updateConditionIn(item._id)
              await this.updateConditionOut(item._id)
            }
            iPageCustomer.start = iPageCustomer.start + iPageCustomer.length;
          } while (Number(arrCustomer.length) == Number(iPageCustomer.length))
    }

}
