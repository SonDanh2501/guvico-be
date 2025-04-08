import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { ObjectId } from 'bson'
import { Types } from 'mongoose'
import { ERROR, GlobalService, iPageDTO } from 'src/@core'
import { PAYMENT_METHOD, STATUS_ORDER } from 'src/@repositories/module/mongodb/@database/enum'
import { TYPE_SUBJECT_ACTION, TYPE_USER_OBJECT } from 'src/@repositories/module/mongodb/@database/enum/base.enum'
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service'
import { CollaboratorOopSystemService } from 'src/core-system/@oop-system/collaborator-oop-system/collaborator-oop-system.service'
import { CustomerOopSystemService } from 'src/core-system/@oop-system/customer-oop-system/customer-oop-system.service'
import { HistoryActivityOopSystemService } from 'src/core-system/@oop-system/history-activity-oop-system/history-activity-oop-system.service'
import { OrderOopSystemService } from 'src/core-system/@oop-system/order-oop-system/order-oop-system.service'
import { SettingOopSystemService } from 'src/core-system/@oop-system/setting-oop-system/setting-oop-system.service'
import { UserSystemOoopSystemService } from 'src/core-system/@oop-system/user-system-ooop-system/user-system-ooop-system.service'
import { PhoneOTPSystemService } from '../phone-otp-system/phone-otp-system.service'

@Injectable()
export class CustomerSystemService {
    constructor(
        private globalService: GlobalService,
        private customExceptionService: CustomExceptionService,
        private customerOopSystemService: CustomerOopSystemService,
        private orderOopSystemService: OrderOopSystemService,
        private historyActivityOopSystemService: HistoryActivityOopSystemService,
        private collaboratorOopSystemService: CollaboratorOopSystemService,
        private settingOopSystemService: SettingOopSystemService,
        private userSystemOoopSystemService: UserSystemOoopSystemService,

        private phoneOTPSystemService: PhoneOTPSystemService,
    ) { }

    async paymentService(groupOrder, money) {
        try {

        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getDetailItem(lang, subjectAction, idCustomer) {
        try {
            if (subjectAction.type === TYPE_SUBJECT_ACTION.customer && subjectAction._id.toString() !== idCustomer.toString()) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "customer")], HttpStatus.NOT_FOUND)
            }
            const getCustomer = await this.customerOopSystemService.getDetailItem(lang, idCustomer)
            return getCustomer;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // async getList(lang, subjectAction, iPage) {
    //     try {
    //         // const currentMonth = getMonth(new Date(Date.now()));
    //         let query: any = {
    //             $and: [
    //                 { is_delete: false },
    //                 {
    //                     $or: [
    //                         {
    //                             index_search: {
    //                                 $regex: iPage.search,
    //                                 $options: "i"
    //                             }
    //                         }
    //                     ]
    //                 },
    //             ]
    //         }


    //         const getDataCustomer = await this.customerOopSystemService.getList()

    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    //     }
    // } 

    async createItem(lang, subjectAction, idCustomer) {

    }

    async updateSessionSocketCustomer(client, isDisconnect: boolean = true) {
        try {
            if (client.payload) {
                // 1. Lay thong tin KH
                let getCustomer = await this.customerOopSystemService.getDetailItemForWebSocket(client.payload._id);
                // 2. Neu khong co KH
                if (!getCustomer) {
                    return null
                }
                // 3. Neu co thi cap nhat session_socket cho KH
                getCustomer = await this.customerOopSystemService.updateSocketCustomer('vi', getCustomer._id, isDisconnect, client.id)

                return getCustomer
            } else {
                return null
            }
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async setDefaultPaymentMethod(lang, idCustomer, type_payment_method) {
        try {
            const [getCustomer, getCustomerSetting] = await Promise.all([
                this.customerOopSystemService.getDetailItem(lang, idCustomer),
                this.settingOopSystemService.getCustomerSetting(lang)
            ])

            const paymentMethod = getCustomerSetting.payment_method.find((e) => e.method === PAYMENT_METHOD[type_payment_method])
            if (paymentMethod) {
                getCustomer.payment_method_default = { ...paymentMethod }

                await this.customerOopSystemService.updateCustomer(lang, getCustomer)
            }

            return true
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async sendOTP(lang, payload) {
        try {
            // Kiem tra so dien thoai
            payload.phone = await this.globalService.normalizePhoneNumber(lang, payload.phone)
            await this.customerOopSystemService.getCustomerByPhone(lang, payload);
            return await this.phoneOTPSystemService.generateOTP(lang, payload, TYPE_USER_OBJECT.customer)
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getListReferralPersonByCustomer(subjectAction, iPage: iPageDTO, id_customer?) {
        try {
            let idCustomer = subjectAction.type === TYPE_SUBJECT_ACTION.customer ? subjectAction._id : new ObjectId(id_customer)
            const [numberReferralPerson, getLstReferralPerson] = await Promise.all([this.customerOopSystemService.getNumberReferralPersonByCustomer(idCustomer), this.customerOopSystemService.getListPaginationReferralPersonByCustomer(idCustomer, iPage)])
            const lstData = [];

            for (let i = 0; i < getLstReferralPerson.data.length; i++) {
                const total_done_order = await this.orderOopSystemService.countOrdersByCustomer(getLstReferralPerson.data[i]._id, STATUS_ORDER.done)

                let maskedNumber = getLstReferralPerson.data[i].phone
                if(subjectAction.type !== TYPE_SUBJECT_ACTION.admin) {
                    maskedNumber = await this.globalService.getMaskedNumber(getLstReferralPerson.data[i].phone)
                }

                lstData.push({
                    _id: getLstReferralPerson.data[i]._id,
                    full_name: getLstReferralPerson.data[i].full_name,
                    email: getLstReferralPerson.data[i].email,
                    rank: getLstReferralPerson.data[i].rank,
                    date_create: getLstReferralPerson.data[i].date_create,
                    avatar: getLstReferralPerson.data[i].avatar,
                    phone: maskedNumber,
                    total_done_order: total_done_order
                });
            }
            const result = {
                start: iPage.start,
                length: iPage.length,
                totalItem: numberReferralPerson,
                data: lstData
            }

            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getCustomerInfo(lang, idCustomer) {
        try {
            const [getCustomer, totalReferralPerson, getListHistoryActivity, totalReferralPerson30DaysAgo, getListHistoryActivity30DaysAgo, getListReferralPerson] = await Promise.all([
                this.customerOopSystemService.getCustomerInfo(lang, idCustomer),
                this.customerOopSystemService.getNumberReferralPersonByCustomer(idCustomer),
                this.historyActivityOopSystemService.getListForReferrerPerson(idCustomer),
                this.customerOopSystemService.getNumberReferralPersonByCustomer(idCustomer, true),
                this.historyActivityOopSystemService.getListForReferrerPerson(idCustomer, true),
                this.customerOopSystemService.getListReferralPersonByCustomer(idCustomer)
            ])

            // Tinh tong tien nhan chiet khau
            let totalDiscount = 0
            for (let i = 0; i < getListHistoryActivity.length; i++) {
                totalDiscount += getListHistoryActivity[i].value
            }

            // Tinh tong tien nhan chiet khau 30 ngay gan nhat
            let totalDiscount30DaysAgo = 0
            for (let i = 0; i < getListHistoryActivity30DaysAgo.length; i++) {
                totalDiscount30DaysAgo += getListHistoryActivity30DaysAgo[i].value
            }

            const newCustomerObj = { ...getCustomer._doc }
            newCustomerObj['promotional_referral_link'] = `https://guvi.page.link/?link=https://guvico.com/guvi-app?code%3D${newCustomerObj.promotional_referral_code}&apn=com.guvico_customer&isi=6443966297&ibi=com.product.guvico.customer`
            newCustomerObj['referral_link'] = `https://guvi.page.link/?link=https://guvico.com/guvi-app?code%3D${newCustomerObj.referral_code}&apn=com.guvico_customer&isi=6443966297&ibi=com.product.guvico.customer`
            newCustomerObj['total_discount'] = totalDiscount
            newCustomerObj['total_discount_30_days_ago'] = totalDiscount30DaysAgo
            newCustomerObj['total_referral_person'] = totalReferralPerson
            newCustomerObj['total_referral_person_30_days_ago'] = totalReferralPerson30DaysAgo
            newCustomerObj['bank_name'] = null
            newCustomerObj['account_number'] = null
            newCustomerObj['account_holder'] = null

            // Lay thong tin ngan hang
            if(newCustomerObj.bank_account !== null && newCustomerObj.bank_account !== undefined) {
                const maskedNumber = await this.globalService.getMaskedNumber(newCustomerObj.bank_account['account_number'])
                newCustomerObj['account_number'] = maskedNumber
                newCustomerObj['bank_name'] = newCustomerObj.bank_account['bank_name']
                newCustomerObj['account_holder'] = newCustomerObj.bank_account['account_holder']
            }

            newCustomerObj['total_number_orders'] = 0
            newCustomerObj['total_number_orders_30_days_ago'] = 0
            // Lay tong so don hang hoan thanh cua danh sach nguoi duoc gioi thieu
            if(getListReferralPerson.length > 0) {
                const lstIdCustomer = getListReferralPerson.map((e) => e._id)

                const [totalNumberOrders, totalNumberOrders30DaysAgo] = await Promise.all([
                    this.orderOopSystemService.countOrdersByListCustomer(lstIdCustomer, false, STATUS_ORDER.done),
                    this.orderOopSystemService.countOrdersByListCustomer(lstIdCustomer, true, STATUS_ORDER.done)
                ])

                newCustomerObj['total_number_orders'] = totalNumberOrders
                newCustomerObj['total_number_orders_30_days_ago'] = totalNumberOrders30DaysAgo
            }
            
            return newCustomerObj
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async checkHaveBankAccount(lang, idCustomer) {
        try {
            const getCustomer = await this.customerOopSystemService.getDetailItem(lang, idCustomer)
            if (getCustomer.bank_account !== null && getCustomer.bank_account !== undefined)  {
                return true
            } else {
                return false
            }
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getListReferredPerson(lang, subjectAction, iPage: iPageDTO) {
        try {
            const getCustomer = await this.customerOopSystemService.getDetailItem(lang, subjectAction._id);
            const [numberReferralPerson, getLstReferralPerson] = await Promise.all([this.customerOopSystemService.getNumberReferralPerson(getCustomer._id), this.customerOopSystemService.getListPaginationReferralPerson(iPage, getCustomer._id)])
            const lstData = [];

            for (let i = 0; i < getLstReferralPerson.length; i++) {
                let [total_order, total_done_order] = await Promise.all([this.orderOopSystemService.countOrdersByCustomer(getLstReferralPerson[i]._id), this.orderOopSystemService.countOrdersByCustomer(getLstReferralPerson[i]._id, STATUS_ORDER.done)]);
                let money_after_step_final = 0;
                let money_when_invite = 0;
                // Khoang thoi gian neu khach hang khong co don hang nao thi tinh co 1 don hang va 1 don hang hoan thanh
                if (getLstReferralPerson[i].date_create < '2023-05-30T17:00:00.577Z' && getLstReferralPerson[i].total_price === 0) {
                    total_done_order = 1;
                    total_order = 1;
                }
                // Khoang thoi gian nhan voucher 25.000
                if (getLstReferralPerson[i].date_create < '2023-06-08T17:00:00.577Z') {
                    money_after_step_final = 25000;
                    // Khoang thoi gian nhan voucher 20.000
                } else if (getLstReferralPerson[i].date_create > '2023-06-08T17:00:00.577Z' && getLstReferralPerson[i].date_create < '2023-12-05T02:50:45.748Z') {
                    money_after_step_final = 20000;
                } else {
                    // Thoi gian hien tai nhan voucher 50.000
                    money_after_step_final = 50000;
                }
                if (getLstReferralPerson[i].date_create > '2023-06-08T17:00:00.577Z' && getLstReferralPerson[i].date_create < '2023-12-05T02:50:45.748Z') {
                    money_when_invite = 2000;
                }
                lstData.push({
                    _id: getLstReferralPerson[i]._id,
                    full_name: getLstReferralPerson[i].full_name,
                    date_create: getLstReferralPerson[i].date_create,
                    step_3: total_order > 0,
                    step_4: total_done_order > 0,
                    money_when_invite: money_when_invite,
                    money_after_step_final: money_after_step_final
                });
            }
            const result = {
                start: iPage.start,
                length: iPage.length,
                totalItem: numberReferralPerson,
                data: lstData
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async getListReferralPersonForAdmin(lang, idCustomer, iPage: iPageDTO, user) {
        try {
            const getCustomer = await this.customerOopSystemService.getDetailItem(lang, idCustomer)
            const checkPermisstion = await this.globalService.checkPermissionArea(user, getCustomer.city);
            if (!checkPermisstion.permisstion) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            }
            const lstData = []
            const [numberReferralPerson, getListReferralPerson] = await Promise.all([this.customerOopSystemService.getNumberReferralPerson(getCustomer._id), this.customerOopSystemService.getListPaginationReferralPerson(iPage, getCustomer._id, true)])

            for (let i = 0; i < getListReferralPerson.length; i++) {
                let [total_order, total_done_order] = await Promise.all([this.orderOopSystemService.countOrdersByCustomer(getListReferralPerson[i]._id), this.orderOopSystemService.countOrdersByCustomer(getListReferralPerson[i]._id, STATUS_ORDER.done)]);

                // Khoang thoi gian neu khach hang khong co don hang nao thi tinh co 1 don hang va 1 don hang hoan thanh
                if (getListReferralPerson[i].date_create < '2023-05-30T17:00:00.577Z' && getListReferralPerson[i].total_price === 0) {
                    total_done_order = 1;
                    total_order = 1;
                }
                const customer = {
                    _id: getListReferralPerson[i]._id,
                    id_view: getListReferralPerson[i].id_view,
                    full_name: getListReferralPerson[i].full_name,
                    phone: getListReferralPerson[i].phone,
                    code_phone_area: getListReferralPerson[i].code_phone_area,
                    date_create: getListReferralPerson[i].date_create,
                    email: getListReferralPerson[i].email,
                    birthday: getListReferralPerson[i].birthday,
                    rank_point: getListReferralPerson[i].rank_point,
                    avatar: getListReferralPerson[i].avatar,
                    total_order: total_order,
                    total_done_order: total_done_order,
                    total_price: getListReferralPerson[i].total_price
                }
                lstData.push(customer)
            }
            const result = {
                start: iPage.start,
                length: iPage.length,
                totalItem: numberReferralPerson,
                data: lstData
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getPaymentInformationByCustomer(lang, idCustomer) {
        try {
            const [getCustomer, getCustomerSetting] = await Promise.all([
                this.customerOopSystemService.getDetailItem(lang, idCustomer),
                this.settingOopSystemService.getCustomerSetting(lang)
            ])

            const lstPaymentInformation = []
            for (let i = 0; i < getCustomerSetting.payment_method.length; i++) {
                let paymentInformation = getCustomer.payment_information.find((e) => e.method === getCustomerSetting.payment_method[i].method && getCustomerSetting.payment_method[i].is_activated)
                if (paymentInformation) {
                    paymentInformation = { ...paymentInformation._doc, ...getCustomerSetting.payment_method[i]._doc }

                    lstPaymentInformation.push(paymentInformation)
                }
            }

            return lstPaymentInformation
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    async createBankAccount(lang, subjectAction, payload) {
    try {
        const payloadDependency = {
            customer: null,
        }
    
        payload.bank_name =  payload.bank_name.trim().replace(/\s{2,}/g, ' ')
        payload.account_number = payload.account_number.trim().replace(/\s{2,}/g, ' ')
        payload.account_holder = payload.account_holder.trim().replace(/\s{2,}/g, ' ')
    
        const getCustomer = await this.customerOopSystemService.getDetailItem(lang, subjectAction._id)
        
        getCustomer.bank_account = {}

        getCustomer.bank_account['bank_name'] = payload?.bank_name
        getCustomer.bank_account['account_number'] = payload?.account_number 
        getCustomer.bank_account['account_holder'] = payload?.account_holder

        payloadDependency.customer = await this.customerOopSystemService.updateCustomer(getCustomer._id, getCustomer)
        await this.historyActivityOopSystemService.createBankAccount(subjectAction, payloadDependency)
        
        return true
    } catch (err) {
        throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
    }

    async getListCustomerHaveIdInviter() {
        try {
            const getListOrder = await this.orderOopSystemService.getListOrderTest()
            let lstIdCustomer = getListOrder.map((e) => e.id_customer)
            const getListCustomer = await this.customerOopSystemService.getListCustomerByLstId(lstIdCustomer, true)
            const listId = getListCustomer.map((e) => e._id)
            const getListOrderByIdCustomer = await this.orderOopSystemService.getListOrderByLstId(listId)
            const newList = getListOrderByIdCustomer.filter((e) => new Date(e.end_date_work).getTime() >= new Date("2024-10-06T14:13:05.722Z").getTime())
            const lstIdOrder = newList.map((e) => e._id)
            const getListHistory = await this.historyActivityOopSystemService.getListHistoryActivity(lstIdOrder)
            const lstOrderId = getListHistory.map((e) => e.id_order.toString())
            const newListOrder = newList.filter((e) => !lstOrderId.includes(e._id.toString()))
            const listIdCustomer = newListOrder.map((e) => e.id_customer)
            const getListCustomer2 = await this.customerOopSystemService.getListCustomerByLstId(listIdCustomer, true)
            const lstIdInviter = getListCustomer2.map((e) => new Types.ObjectId(e.id_inviter))
            const lstInviter = await this.customerOopSystemService.getListCustomerByLstId(lstIdInviter, false)
            const lstCollaborator = await this.collaboratorOopSystemService.getListCollaborator(lstIdInviter, {})

            return { lstInviter: lstInviter, listCustomer: getListCustomer2, listOrder: newListOrder, listCollaborator: lstCollaborator }
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async editCustomer(lang, subjectAction, idCustomer, payload) {
        try {
            const payloadDependency = {
                customer: null, 
                admin_action: null,
            }
            if(subjectAction.type == "admin") {
                payloadDependency.admin_action = await this.userSystemOoopSystemService.getDetailItem(lang, subjectAction._id)
            }
            const getCustomer = await this.customerOopSystemService.getDetailItem(lang, idCustomer)
            getCustomer.full_name = payload?.full_name;
            getCustomer.email = payload?.email;
            getCustomer.gender = payload?.gender;
            getCustomer.birth_date = payload?.birthday;
            if (!getCustomer.bank_account && payload?.bank_name.length > 0 && payload?.account_number.length > 0 && payload?.account_holder.length > 0) {
                getCustomer.bank_account = {}
                getCustomer.bank_account['bank_name'] = payload?.bank_name || ""
                getCustomer.bank_account['account_number'] = payload?.account_number || "" 
                getCustomer.bank_account['account_holder'] = payload?.account_holder || ""
            }
            // 1. Cập nhật
            payloadDependency.customer = await this.customerOopSystemService.updateCustomer(getCustomer._id, getCustomer)
            // 2. Chạy log
            await this.historyActivityOopSystemService.editCustomer(subjectAction, payloadDependency);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }



    

    // async editCollaboratorPersonalInfo(lang, subjectAction, idCollaborator, payload) {
    //     try {
    //         const payloadDependency = {
    //             collaborator: null,
    //             admin_action: null
    //         }
    //         // 1. Cập nhật
    //         payloadDependency.collaborator = await this.collaboratorOopSystemService.updateCollaboratorPersonalInformation(lang, idCollaborator, payload);
    //         // 2. Chạy log
    //         return true;
    //     }
    //     catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    //     }
    // }
}
