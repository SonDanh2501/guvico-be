import { HttpException, HttpStatus, Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { createBannerDTOAdmin, editBannerDTOAdmin, deleteBannerDTOAdmin, ERROR, GlobalService, iPageDTO, actiBannerDTOAdmin, UserSystemDocument, POP_CUSTOMER_INFO, POP_COLLABORATOR_INFO, PERCENT_INCOME, TOTAL_NET_INCOME_BUSINESS, TOTAL_NET_INCOME, TOTAL_DISCOUNT, TOTAL_ORDER, TOTAL_GROSS_INCOME, TOTAL_COLLABORATOR_FEE, TOTAL_SERVICE_FEE, TOTAL_INCOME, TOTAL_ORDER_FEE, TEMP_DISCOUNT, TEMP_SERVICE_FEE, TOTAL_EVENTS, TOTAL_CODE, TransitionCollaborator, TransitionCollaboratorDocument, TransitionCustomer, TransitionCustomerDocument, TOTAL_REMAINDER, TOTAL_GIFT_REMAINDER, TOTAL_PAY_POINT, TOTAL_PUNISH_MONEY, TOTAL_TRANS_MONEY, LOOKUP_ID_REWARD_COLLABORATOR, TOTAL_REWARD_MONEY, InfoRewardCollaborator, InfoRewardCollaboratorDocument, TOTAL_ORDER_PAY_POINT_FEE, TOTAL_PROMOTION_FEE, TOTAL_EVENTS_FEE, iPageJobListsDTOAdmin, iPageStatisticDTO } from 'src/@core';
import { Order, OrderDocument } from 'src/@core/db/schema/order.schema';
import { Customer, CustomerDocument } from 'src/@core/db/schema/customer.schema';
import { Collaborator, CollaboratorDocument } from 'src/@core/db/schema/collaborator.schema';
import { HistoryActivity, HistoryActivityDocument } from 'src/@core/db/schema/history_activity.schema';
import { Service, ServiceDocument } from 'src/@core/db/schema/service.schema';
import { GeneralHandleService } from 'src/@share-module/general-handle/general-handle.service';
import * as moment from 'moment';
import getWeekOfMonth from 'date-fns/getWeekOfMonth'
import { GroupOrder, GroupOrderDocument } from 'src/@core/db/schema/group_order.schema';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';
import { Balance, BalanceDocument } from 'src/@core/db/schema/balance.schema';
import { endOfDay, startOfDay, subHours } from 'date-fns';
import { Punish, PunishDocument } from 'src/@core/db/schema/punish.schema';
import { CollaboratorRepositoryService } from 'src/@repositories/repository-service/collaborator-repository/collaborator-repository.service';

@Injectable()
export class StatisticService {

     constructor(
          private globalService: GlobalService,
          private generalHandleService: GeneralHandleService,
          private customExceptionService: CustomExceptionService,
          private collaboratorRepositoryService: CollaboratorRepositoryService,


          // private i18n: I18nContext,
          @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
          @InjectModel(GroupOrder.name) private groupOrderModel: Model<GroupOrderDocument>,
          @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
          @InjectModel(Collaborator.name) private collaboratorModel: Model<CollaboratorDocument>,
          @InjectModel(HistoryActivity.name) private historyActivityModel: Model<HistoryActivityDocument>,
          @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
          @InjectModel(Balance.name) private balanceModel: Model<BalanceDocument>,
          @InjectModel(TransitionCollaborator.name) private transitionCollaboratorModel: Model<TransitionCollaboratorDocument>,
          @InjectModel(TransitionCustomer.name) private transitionCustomerModel: Model<TransitionCustomerDocument>,
          @InjectModel(Punish.name) private punishModel: Model<PunishDocument>,
          @InjectModel(InfoRewardCollaborator.name) private infoRewardCollaboratorModel: Model<InfoRewardCollaboratorDocument>,
     ) { }

     async connectionServicePercent(lang) {
          try {
               const countDoneOrder = await this.orderModel.count({ status: "done", is_delete: false })
               const countAllOrder = await this.orderModel.count({ is_delete: false })
               const countNotDoneOrder = countAllOrder - countDoneOrder
               // const donePercent = Math.round(((countDoneOrder / countAllOrder) * 100) * 100) / 100;
               const query = {
                    $and: [
                         { is_delete: false },
                         {
                              $or: [{ id_collaborator: { $ne: null } },
                              { id_cancel_collaborator: { $ne: [] } },]
                         }

                    ]
               }
               const orderConnect = await this.orderModel.count(query);
               const donePercent = Math.round(((orderConnect / countAllOrder) * 100) * 100) / 100;

               const data = {
                    DoneOrder: countDoneOrder,
                    NotDoneOrder: countNotDoneOrder,
                    AllOrder: countAllOrder,
                    donePercent: donePercent,
               }
               return data;
          } catch (err) {
               throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
          }
     }
     async getActiveUsers(lang) {
          try {
               const countActiveUsers = await this.customerModel.count({ is_active: true, is_delete: false })
               const countAllUser = await this.customerModel.count({ is_delete: false })
               const countOfflineUsers = countAllUser - countActiveUsers
               const donePercent = Math.round(((countActiveUsers / countAllUser) * 100) * 100) / 100
               const data = {
                    ActiveUsers: countActiveUsers,
                    AllUser: countAllUser,
                    OfflineUsers: countOfflineUsers,
                    donePercent: donePercent,
               }
               return data;
          } catch (err) {
               throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
          }
     }
     async getTopCollaborators(lang, iPage, startDate, endDate) {
          try {
               const countActiveUsers = await this.orderModel.aggregate([
                    {
                         $match: {
                              $and: [
                                   { status: "done" },
                                   { date_work: { $lte: endDate } },
                                   { date_work: { $gte: startDate } }]
                         }
                    },
                    {
                         $lookup: {
                             from: "collaborators", 
                             localField: "id_collaborator", 
                             foreignField: "_id", 
                             as: "collaborator_info"
                         }
                    },
                    {
                         $unwind: {
                              path: "$collaborator_info",
                              preserveNullAndEmptyArrays: true
                         }
                    },
                    {
                         $group: {
                              _id: '$id_collaborator',
                              full_name: {$first: '$collaborator_info.full_name'},
                              avatar: {$first: '$collaborator_info.avatar'},
                              sumIncome: { $sum: '$net_income_collaborator' },
                         }
                    },
                    { $sort: { sumIncome: -1 } },
                    { $skip: iPage.start },
                    { $limit: iPage.length }
               ])

               const totalItem = await this.orderModel.aggregate([
                    {
                         $match: {
                              $and: [
                                   { status: "done" },
                                   { date_work: { $lte: endDate } },
                                   { date_work: { $gte: startDate } }]
                         }
                    },
                    {
                         $group: {
                              _id: {
                                   id_collaborator: '$id_collaborator',
                                   name: '$name_collaborator',
                                   full_name: '$name_collaborator',
                              },
                              sumIncome: { $sum: '$net_income_collaborator' },
                         }
                    },
                    { $count: "count" }
               ])
               const result = {
                    start: iPage.start,
                    length: iPage.length,
                    totalItem: (totalItem.length > 0) ? totalItem[0].count : 0,
                    data: countActiveUsers
               }
               return result;
          } catch (err) {
               throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
          }
     }

     // async getTopServices(lang) {
     //      try {
     //           const query_1 = {
     //                $and: [
     //                     {
     //                          total_estimate: 2
     //                     },

     //                ]
     //           }
     //           const query_2 = {
     //                $and: [
     //                     {
     //                          total_estimate: 3
     //                     },

     //                ]
     //           }
     //           const query_3 = {
     //                $and: [
     //                     {
     //                          total_estimate: 4
     //                     },

     //                ]
     //           }
     //           const count2h = await this.orderModel.count(query_1)
     //           const count3h = await this.orderModel.count(query_2)
     //           const count4h = await this.orderModel.count(query_3)
     //           const countAll = await this.orderModel.count()
     //           const order2hPercent = Math.round(((count2h / countAll) * 100) * 100) / 100
     //           const order3hPercent = Math.round(((count3h / countAll) * 100) * 100) / 100
     //           const order4hPercent = Math.round(((count4h / countAll) * 100) * 100) / 100
     //           const order2h = {
     //                name : 'Giup viec theo 2h',
     //                value: count2h,
     //           }
     //           const order3h = {
     //                name : 'Giup viec theo 3h',
     //                value: count3h,
     //           }
     //           const order4h = {
     //                name : 'Giup viec theo 4h',
     //                value: order4h,
     //           }
     //           const ordercountAll = {
     //                name : 'Giup viec theo 2h',
     //                value: count2h,
     //           }
     //           const order2h = {
     //                name : 'Giup viec theo 2h',
     //                value: count2h,
     //           }
     //           const order2h = {
     //                name : 'Giup viec theo 2h',
     //                value: count2h,
     //           }
     //           const order2h = {
     //                name : 'Giup viec theo 2h',
     //                value: count2h,
     //           }
     //           const data = {
     //                order2h,
     //                count3h: count3h,
     //                count4h: count4h,
     //                countAll: countAll,
     //                order2hPercent: order2hPercent,
     //                order3hPercent: order3hPercent,
     //                order4hPercent: order4hPercent,
     //           }
     //           return data;
     //      } catch (err) {
     //           throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
     //      }
     // }

     async getHitoryActivity(lang, iPage) {
          try {
               const query = {
                    $and: [{
                         $or: [{
                              name: {
                                   $regex: iPage.search,
                                   $options: "i"
                              }
                         },]
                    },
                    ]
               }
               const arrItem = await this.historyActivityModel.find(query)
                    .sort({ date_create: -1 })
                    .populate({ path: 'id_customer', select: { full_name: 1, name: 1 } })
                    .populate({ path: 'id_collaborator', select: { full_name: 1, name: 1 } })
                    .populate({ path: 'id_user_system', select: { full_name: 1, name: 1 } })
                    .populate({ path: 'id_admin_action', select: { full_name: 1, name: 1 } })
                    .populate({ path: 'id_order', select: { id_view: 1, address: 1, service: 1, date_create: 1 } })
                    .populate({ path: 'id_group_order', select: { id_view: 1, address: 1, service: 1, date_create: 1 } })
                    .populate({ path: 'id_promotion', select: { title: 1, code: 1 } })
                    .populate({ path: 'id_transistion_collaborator', select: { money: 1, date_created: 1, transfer_note: 1 } })
                    .populate({ path: 'id_transistion_customer', select: { money: 1, date_created: 1, transfer_note: 1 } })
                    .populate({ path: 'id_reason_cancel', select: { title: 1, description: 1 } })
                    .populate({ path: 'id_reason_punish', select: { title: 1, description: 1 } })
                    .populate({
                         path: 'id_info_reward_collaborator', select: { id_reward_collaborator: 1 }, populate: {
                              path: 'id_reward_collaborator', select: { title: 1 }
                         }
                    })
                    .populate({ path: 'id_reward', select: { title: 1 } })
                    .populate({ path: 'id_punish' })
                    .skip(iPage.start)
                    .limit(iPage.length).then();
               const count = await this.historyActivityModel.count(query)
               const result = {
                    start: iPage.start,
                    length: iPage.length,
                    totalItem: count,
                    data: arrItem
               }
               return result;
          } catch (err) {
               throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
          }
     }
     async getLastestServices(lang, iPage, admin: UserSystemDocument) {
          try {
               let query: any = {
                    $and: [{
                         $or: [{
                              name: {
                                   $regex: iPage.search,
                                   $options: "i"
                              }
                         },]
                    },
                    { is_delete: false },
                    ]
               }
               // const checkPermisstion = await this.globalService.checkPermissionArea(admin);
               // if (!checkPermisstion.permisstion) {
               //      throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
               // }
               // if (admin.id_role_admin["is_area_manager"]) {
               //      const city:0,[] = checkPermisstion.city;
               //      city.push(-1)              //      query.$and.push({ city: { $in: checkPermisstion.city } })
               // }

               const arrItem = await this.groupOrderModel.find(query)
                    .sort({ date_create: -1 })
                    .populate({ path: 'id_customer', select: { full_name: 1, name: 1 } })
                    .populate({ path: 'service._id', select: { kind: 1 } })
                    .populate({ path: 'id_collaborator', select: { full_name: 1, name: 1 } })
                    .skip(iPage.start)
                    .limit(iPage.length);
               const count = await this.historyActivityModel.count(query)
               // for (const address of arrItem['address']) {
               //      const temp = address.split(",");
               //      const administrative = {
               //           city: temp[temp.length - 1],
               //           district: temp[temp.length - 2]
               //      }
               //      // const getCodeAdministrative = await this.generalHandleService.getCodeAdministrativeToString(administrative);
               //      const callPromiseAll = await Promise.all([
               //           this.generalHandleService.getCodeAdministrativeToString(administrative),
               //           this.serviceModel.findById(arrItem['service']["_id"])
               //      ]);
               //      // const city = getCodeAdministrative.city ;
               //      // const district = getCodeAdministrative.district;

               //      const city = callPromiseAll[0].city;
               //      const district = callPromiseAll[0].district;
               const result = {
                    start: iPage.start,
                    length: iPage.length,
                    totalItem: count,
                    data: arrItem,
                    // city: city,
                    // district: district

               }
               return result;
               // }

          } catch (err) {
               throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
          }
     }
     async getJobLists(lang, iPage: iPageJobListsDTOAdmin, admin: UserSystemDocument) {
          try {
               iPage.search = iPage.search.toLocaleLowerCase().trim()

               /////////////////// phần phân quyền/ nhượng quyền khu vực ///////////////////
               if (iPage.city) {
                    iPage.city = await this.globalService.convertDistrictOrCityToArray(iPage.city)
               }
               if (iPage.district) {
                    iPage.district = await this.globalService.convertDistrictOrCityToArray(iPage.district)
               }
               /////////////////// phần phân quyền/ nhượng quyền khu vực ///////////////////
               const checkPermisstion = await this.globalService.checkPermissionArea(admin, iPage.city, iPage.district, iPage.id_service);
               if (!checkPermisstion.permisstion) {
                    throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
               }
               let sort = 'date_create'
               let query: any = {
                    $and: [
                         {
                              $or: [
                                   // {
                                   //      $or: [{
                                   //           name_collaborator: { $exists: false }
                                   //      },
                                   //      {

                                   //           name_collaborator: {
                                   //                $regex: iPage.search,
                                   //                $options: "i"
                                   //           }
                                   //      },]
                                   // },
                                   // {
                                   //      $or: [
                                   //           {
                                   //                phone_collaborator: { $exists: false }
                                   //           },
                                   //           {
                                   //                phone_collaborator: {
                                   //                     $regex: iPage.search,
                                   //                     $options: "i"
                                   //                }
                                   //           }]
                                   // },
                                   // {
                                   //      $or: [
                                   //           { name_customer: { $exists: false } }
                                   //           ,
                                   //           {
                                   //                name_customer: {
                                   //                     $regex: iPage.search,
                                   //                     $options: "i"
                                   //                }
                                   //           }
                                   //      ]
                                   // },
                                   // {
                                   //      $or: [{
                                   //           phone_customer: { $exists: false }
                                   //      }, {
                                   //           phone_customer: {
                                   //                $regex: iPage.search,
                                   //                $options: "i"
                                   //           }
                                   //      }]
                                   // },
                                   {
                                        index_search_customer: {
                                             $regex: iPage.search,
                                             $options: "i"
                                        }
                                   },
                                   {
                                        index_search_collaborator: {
                                             $regex: iPage.search,
                                             $options: "i"
                                        }
                                   },
                                   {
                                        $or: [{
                                             id_view: { $exists: false }
                                        }, {
                                             id_view: {
                                                  $regex: iPage.search,
                                                  $options: "i"
                                             }
                                        }]
                                   },
                                   {
                                        address: {
                                             $regex: iPage.search,
                                             $options: "i"
                                        }
                                   }
                              ]
                         },
                         { is_delete: false },
                         // { is_duplicate: iPage.is_duplicate === "true" ? true : false }
                    ],
               }
               let SORT = {}
               if (iPage.is_duplicate === "false") {
                    query.$and.push({ is_duplicate: false });
               }

               if (iPage.type_sort === 'date_work') {
                    sort = 'date_work'
                    // query.$and.push({ date_work: { $gte: iPage.start_date } });
                    // query.$and.push({ date_work: { $lte: iPage.end_date } });
                    SORT = { date_work: 1, _id: 1 }
               } else {
                    query.$and.push({ date_create: { $gte: iPage.start_date } });
                    query.$and.push({ date_create: { $lte: iPage.end_date } });
                    SORT = { date_create: -1, _id: 1 }
               }

               if (iPage.status !== 'all') {
                    query.$and.push({ status: iPage.status });
               }
               /////////////////// phần phân quyền/ nhượng quyền khu vực ///////////////////
               if (iPage.id_service !== 'all') {
                    query.$and.push({ 'service._id': iPage.id_service });
               } else if (checkPermisstion.id_service.length > 0) {
                    query.$and.push({ 'service._id': { $in: checkPermisstion.id_service } });
               }
               if (iPage.city) {
                    query.$and.push({ city: { $in: iPage.city } });
               } else if (checkPermisstion.city.length > 0) {
                    query.$and.push({ city: { $in: checkPermisstion.city } });
               }
               if (iPage.district) {
                    query.$and.push({ 'district': { $in: iPage.district } });
               } else if (checkPermisstion.district.length > 0) {
                    query.$and.push({ 'district': { $in: checkPermisstion.district } });
               }
               /////////////////// phần phân quyền/nhượng quyền khu vực ///////////////////
               if (admin.id_business) {

                    query.$and.push(
                         {
                              $or: [
                                   {
                                        $and: [
                                             { status: { $ne: 'pending' } },
                                             { id_business: admin.id_business }
                                        ]
                                   },
                                   {
                                        $and: [
                                             { status: 'pending' },
                                             { id_business: null }
                                        ]
                                   },
                              ]
                         }

                    );
               }
               if (iPage.payment_method !== "all") {
                    query.$and.push({ payment_method: iPage.payment_method });
               }
               const arrItem = await this.orderModel.find(query)
                    .sort(SORT)
                    .skip(Number(iPage.start))
                    .limit(Number(iPage.length))
                    .populate(POP_CUSTOMER_INFO)
                    .populate({ path: 'service._id', select: { _id: 1, title: 1, description: 1, id_group_service: 1, kind: 1, } })
                    .populate(POP_COLLABORATOR_INFO)
               const count = await this.orderModel.count(query)
               const result = {
                    start: iPage.start,
                    length: iPage.length,
                    totalItem: count,
                    data: arrItem,
               }
               return result;
          } catch (err) {
               throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
          }
     }

     async getWeekOfMonth(lang, iPage) {
          try {
               // var date = new Date();
               // date.toISOString().substring(0, 10);
               // console.log("check date", date)
               // const month = date.getMonth()
               // let weekOfMonth = getWeekOfMonth(date)
               var result = getWeekOfMonth(new Date(2017, 10, 9))
               console.log("check result", result)
               return result
               // const m1 = new Date('Sept 24, 22 13:20:18').getMonth();
               // return m1
               // import getWeekOfMonth from 'date-fns/getWeekOfMonth'F$
               // ...
               // let weekOfMonth = getWeekOfMonth(new Date())
               // return weekOfMonth
               // https://date-fns.org/v2.0.0-alpha.9/docs/getWeekOfMonth               


               // const date = iPage.date
               //      const month = date.getMonth()
               //      return month
               //          , year = date.getFullYear()
               //          , firstWeekday = new Date(year, month, 1).getDay()
               //          , lastDateOfMonth = new Date(year, month + 1, 0).getDate()
               //          , offsetDate = date.getDate() + firstWeekday - 1
               //          , index = 1 // start index at 0 or 1, your choice
               //          , weeksInMonth = index + Math.ceil((lastDateOfMonth + firstWeekday - 7) / 7)
               //          , week = index + Math.floor(offsetDate / 7);
               //      if ( week < 2 + index) return week;
               //      return week === weeksInMonth ? index + 5 : week;


               // Simple helper to parse YYYY-MM-DD as local
               //  function parseISOAsLocal(s){
               //    var b = s.split(/\D/);
               // //    return new Date(b[0],b[1]-1,b[2]);
               //  }

               //  // Tests
               //  console.log('Date          Exact|expected   not exact|expected');
               //  [   ['2013-02-01', 1, 1],['2013-02-05', 2, 2],['2013-02-14', 3, 3],
               //      ['2013-02-23', 4, 4],['2013-02-24', 5, 6],['2013-02-28', 5, 6],
               //      ['2013-03-01', 1, 1],['2013-03-02', 1, 1],['2013-03-03', 2, 2],
               //      ['2013-03-15', 3, 3],['2013-03-17', 4, 4],['2013-03-23', 4, 4],
               //      ['2013-03-24', 5, 5],['2013-03-30', 5, 5],['2013-03-31', 6, 6],
               //      ['2013-04-01', 1, 1]
               //  ].forEach(function(test){
               //    var d = parseISOAsLocal(test[0])
               //    console.log(test[0] + '        ' + 
               //    d.getWeekOfMonth(true) + '|' + test[1] + '                  ' +
               //    d.getWeekOfMonth() + '|' + test[2]); 
               //  });

               // const query = {
               //      $and: [{
               //           $or: [{
               //                name: {
               //                     $regex: iPage.search,
               //                     $options: "i"
               //                }
               //           },]
               //      },
               //      ]
               // }
               // const arrItem = await this.orderModel.find(query)
               //      .sort({ date_create: -1 })
               //      .populate({ path: 'id_customer', select: { full_name: 1, name: 1 } })
               //      .populate({ path: 'service._id', select: { kind: 1 } })
               //      .populate({ path: 'id_collaborator', select: { full_name: 1, name: 1 } })
               //      .skip(iPage.start)
               //      .limit(iPage.length).then();
               // const count = await this.historyActivityModel.count(query)
               // // for (const address of arrItem['address']) {
               // //      const temp = address.split(",");
               // //      const administrative = {
               // //           city: temp[temp.length - 1],
               // //           district: temp[temp.length - 2]
               // //      }
               // //      // const getCodeAdministrative = await this.generalHandleService.getCodeAdministrativeToString(administrative);
               // //      const callPromiseAll = await Promise.all([
               // //           this.generalHandleService.getCodeAdministrativeToString(administrative),
               // //           this.serviceModel.findById(arrItem['service']["_id"])
               // //      ]);
               // //      // const city = getCodeAdministrative.city ;
               // //      // const district = getCodeAdministrative.district;

               // //      const city = callPromiseAll[0].city;
               // //      const district = callPromiseAll[0].district;
               // const result = {
               //      start: iPage.start,
               //      length: iPage.length,
               //      totalItem: count,
               //      data: arrItem,
               //      // city: city,
               //      // district: district

               // }
               // return result;
               // }

          } catch (err) {
               throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
          }
     }
     async getTotalMoneyForTime(lang) {
          try {

          } catch (err) {
               throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
          }
     }

     async testBalance() {
          try {
               const current = new Date('2023-06-20T19:00:00.000Z');
               const getTimeZoneOffSet = current.getTimezoneOffset();
               let numberSubHour = 5;
               const timeZoneOffSetVN = -420;
               if (getTimeZoneOffSet < 0) {
                    const temp = Math.abs(timeZoneOffSetVN) - Math.abs(getTimeZoneOffSet);
                    numberSubHour = temp / 60;
               }

               const startDate = subHours(startOfDay(current), numberSubHour).toISOString();
               const endDate = subHours(endOfDay(current), numberSubHour).toISOString();
               console.log(startDate);
               console.log(endDate);

               // const query = {
               //      $and: [
               //           { is_delete: false },
               //           {
               //                date_create: {
               //                     $gte: startDate,
               //                },
               //           },
               //           {
               //                date_create: {
               //                     $lte: endDate,
               //                },
               //           }
               //      ]
               // }
               // const query_cancel = {
               //      $and: [
               //           { is_delete: false },
               //           {
               //                $or: [
               //                     {
               //                          $and: [
               //                               {
               //                                    'id_cancel_customer.date_create': {
               //                                         $gte: '2023-06-15T17:00:00.629Z'
               //                                    }
               //                               },
               //                               {
               //                                    'id_cancel_customer.date_create': {
               //                                         $lte: '2023-06-16T16:59:59.629Z'
               //                                    }
               //                               }
               //                          ]

               //                     },
               //                     {
               //                          $and: [
               //                               {
               //                                    'id_cancel_user_system.date_create': {
               //                                         $gte: '2023-06-15T17:00:00.629Z'
               //                                    }
               //                               },
               //                               {
               //                                    'id_cancel_user_system.date_create': {
               //                                         $lte: '2023-06-16T16:59:59.629Z'
               //                                    }
               //                               }
               //                          ]

               //                     },
               //                     {
               //                          $and: [
               //                               {
               //                                    'id_cancel_system.date_create': {
               //                                         $gte: '2023-06-15T17:00:00.629Z'
               //                                    }
               //                               },
               //                               {
               //                                    'id_cancel_system.date_create': {
               //                                         $lte: '2023-06-16T16:59:59.629Z'
               //                                    }
               //                               }
               //                          ]

               //                     },
               //                ]
               //           }
               //      ]
               // }
               // const getTotalInOrder = await this.orderModel.aggregate([
               //      {
               //           $match: query
               //      },
               //      {
               //           $addFields: TEMP_SERVICE_FEE
               //      },
               //      {
               //           $addFields: TEMP_DISCOUNT
               //      },
               //      {
               //           $group: {
               //                _id: {},
               //                total_order_fee: TOTAL_ORDER_FEE,
               //                total_income: TOTAL_INCOME,
               //                total_events: TOTAL_EVENTS,
               //                total_code: TOTAL_CODE,
               //                total_service_fee: TOTAL_SERVICE_FEE,
               //                total_collabotator_fee: TOTAL_COLLABORATOR_FEE,
               //                total_gross_income: TOTAL_GROSS_INCOME,
               //                total_item: TOTAL_ORDER,
               //                total_discount: TOTAL_DISCOUNT,
               //                total_net_income: TOTAL_NET_INCOME,
               //                total_net_income_business: TOTAL_NET_INCOME_BUSINESS
               //           },
               //      },
               //      {
               //           $addFields: PERCENT_INCOME
               //      },
               // ]);
               // const getTotalRefurnOrder = await this.orderModel.aggregate([
               //      {
               //           $match: query_cancel
               //      },
               //      {
               //           $addFields: TEMP_SERVICE_FEE
               //      },
               //      {
               //           $addFields: TEMP_DISCOUNT
               //      },
               //      {
               //           $group: {
               //                _id: {},
               //                total_order_fee: TOTAL_ORDER_FEE,
               //                total_income: TOTAL_INCOME,
               //                total_events: TOTAL_EVENTS,
               //                total_code: TOTAL_CODE,
               //                total_service_fee: TOTAL_SERVICE_FEE,
               //                total_collabotator_fee: TOTAL_COLLABORATOR_FEE,
               //                total_gross_income: TOTAL_GROSS_INCOME,
               //                total_item: TOTAL_ORDER,
               //                total_discount: TOTAL_DISCOUNT,
               //                total_net_income: TOTAL_NET_INCOME,
               //                total_net_income_business: TOTAL_NET_INCOME_BUSINESS
               //           },
               //      },
               //      {
               //           $addFields: PERCENT_INCOME
               //      },
               // ]);
               // const query_customer = {
               //      $and: [
               //           { is_delete: false },

               //      ]
               // }
               // const getTotalPayPoint = await this.customerModel.aggregate([
               //      { $match: query_customer },
               //      {
               //           $group: {
               //                _id: {},
               //                total_paypoint: { $sum: '$pay_point' }
               //           }
               //      }
               // ])
               // const query_collaborator = {
               //      $and: [
               //           { is_delete: false },
               //           { is_verify: true },
               //           { is_locked: false },

               //      ]
               // }
               // const getTotalCollaborator = await this.collaboratorModel.aggregate([
               //      { $match: query_collaborator },
               //      {
               //           $group: {
               //                _id: {},
               //                total_remainder: { $sum: '$remainder' },
               //                total_gift_remainder: { $sum: '$gift_remainder' }
               //           }
               //      }
               // ])
               // const query_top_up_withdraw = {
               //      $and: [
               //           { is_delete: false },
               //           { status: 'done' },
               //           { is_verify_money: true },
               //           // { date_verify_created: { $gte: startDate } },
               //           // { date_verify_created: { $lte: endDate } },
               //      ]
               // }
               // const getTotalWithdrawTopUp = await this.transitionCollaboratorModel.aggregate([
               //      { $match: query_top_up_withdraw },
               //      {
               //           $group: {
               //                _id: '$type_transfer',
               //                total: { $sum: '$money' },
               //           }
               //      }
               // ])
               // const query_punish = {
               //      $and: [
               //           { is_delete: false },
               //           { is_verify: true },
               //           { date_verify_create: { $gte: startDate } },
               //           { date_verify_create: { $lte: endDate } },
               //           { status: 'done' }
               //      ]
               // }
               // const totalPunish = await this.punishModel.aggregate([ // tổng tiền phạt trong ngày,chỉ tính các lệnh phạt được duyệt trong ngày
               //      { $match: query_punish },
               //      {
               //           $group: {
               //                _id: {},
               //                total_money: TOTAL_PUNISH_MONEY
               //           }
               //      }
               // ])
               // const query_info_reward = {
               //      $and: [
               //           { is_verify: true },
               //           { status: 'done' },
               //           { is_delete: false },
               //           { date_verify: { $gte: startDate } },
               //           { date_verify: { $lte: endDate } },
               //      ]
               // }
               // const totalInfoReward = await this.infoRewardCollaboratorModel.aggregate([
               //      { $match: query_info_reward },
               //      { $lookup: LOOKUP_ID_REWARD_COLLABORATOR },
               //      { $unwind: { path: '$id_reward_collaborator', preserveNullAndEmptyArrays: false } },
               //      {
               //           $group: {
               //                _id: '$id_reward_collaborator.type_wallet',
               //                total_money: TOTAL_REWARD_MONEY
               //           }
               //      }
               // ]);


               // const query_custome_trans = {
               //      $and: [
               //           { is_delete: false },
               //           { is_verify_money: true },
               //           { status: 'done' },
               //           // { date_verify_create: { $gte: startDate } },
               //           // { date_verify_created: { $lte: endDate } },
               //      ]
               // }
               // const totalTransCustomer = await this.transitionCustomerModel.aggregate([
               //      { $match: query_custome_trans },
               //      {
               //           $group: {
               //                _id: '$type_transfer',
               //                total_money: TOTAL_TRANS_MONEY
               //           }
               //      }
               // ])
               // let total_withdraw = 0;
               // let total_top_up = 0;
               // for (let item of totalTransCustomer) {
               //      if (item._id === 'withdraw') {
               //           total_withdraw = item.total_money
               //      }
               //      if (item._id === 'top_up') {
               //           total_top_up = item.total_money
               //      }
               // }
               const query_all_order_fee = {
                    $and: [
                         { is_delete: false },
                         { status: { $ne: 'cancel' } },
                         // { date_create: { $gte: startDate } },
                         // { date_create: { $lte: endDate } },
                    ]
               }
               // const getTotalOrderFee = await this.orderModel.aggregate([
               //      { $match: query_all_order_fee },
               //      {
               //           $group: {
               //                _id: {},
               //                total_order_fee: TOTAL_ORDER_FEE,
               //           }
               //      }
               // ])

               // const getTotalPayPoint = await this.orderModel.aggregate([
               //      { $match: query_all_order_fee },
               //      {
               //           $group: {
               //                _id: '$payment_method',
               //                total_order_fee: TOTAL_ORDER_FEE,
               //           }
               //      }
               // ])
               // let total_pay_point_order_fee = 0;
               // let total_cash_order_fee = 0;
               // let total_refurn_pay_point_order_fee = 0;
               // for (let item of getTotalPayPoint) {
               //      if (item._id === 'cash') {
               //           total_cash_order_fee = item.total_order_fee
               //      }
               //      if (item._id === 'point') {
               //           total_pay_point_order_fee = item.total_order_fee
               //      }

               // }
               // const query_refurn_order_fee = {
               //      $and: [
               //           { is_delete: false },
               //           { status: 'cancel' },
               //           // { date_create: { $gte: startDate } },
               //           // { date_create: { $lte: endDate } },
               //      ]
               // }
               // const getTotalRefurn = await this.orderModel.aggregate([
               //      { $match: query_all_order_fee },
               //      {
               //           $group: {
               //                _id: '$payment_method',
               //                total_refurn_pay_point_order_fee: TOTAL_ORDER_FEE,
               //           }
               //      }
               // ])

               // for (let item of getTotalRefurn) {
               //      if (item._id === 'point') {
               //           total_refurn_pay_point_order_fee = item.total_refurn_pay_point_order_fee
               //      }

               // }
               const query_done_order = {
                    $and: [
                         { is_delete: false },
                         { status: 'done' },
                         { date_create: { $gte: startDate } },
                         { date_create: { $lte: endDate } },
                    ]
               }
               const getDataOrder = await this.orderModel.aggregate([
                    {
                         $match: query_done_order
                    },
                    {
                         $addFields: TEMP_SERVICE_FEE
                    },
                    {
                         $addFields: TEMP_DISCOUNT
                    },
                    {
                         $group: {
                              _id: {},
                              total_order_fee: TOTAL_ORDER_FEE,
                              total_income: TOTAL_INCOME,
                              total_service_fee: TOTAL_SERVICE_FEE,
                              total_collabotator_fee: TOTAL_COLLABORATOR_FEE,
                              total_gross_income: TOTAL_GROSS_INCOME,
                              total_item: TOTAL_ORDER,
                              total_discount: TOTAL_DISCOUNT,
                              total_net_income: TOTAL_NET_INCOME,
                              total_net_income_business: TOTAL_NET_INCOME_BUSINESS,
                              total_event_fee: TOTAL_EVENTS_FEE,
                              total_promotion_fee: TOTAL_PROMOTION_FEE,
                         },
                    },
               ]);
               // const newItem = new this.balanceModel({
               //===      total_customer_punish_fee: 0, // tổng phạt khách hàng
               //===      total_collaborator_punish_fee: 0,// tổng phạt ctv
               //===      total_top_up_customer: 0, // tổng nạp khách hàng
               //===      total_withdraw_customer: 0, // tổng rút khách hàng
               //===      total_order_fee: 0, // tổng phí đặt đơn của khách hàng (tạm giữ)
               //===      total_pay_point_order_fee: 0, // tổng phí đặt đơn của khách hàng bằng pay point (tạm giữ)
               //===      total_cash_order_fee: 0, // tổng phí đặt đơn của khách hàng bằng tiền mặt (tạm tính)
               //===      total_refurn_pay_point_order_fee: 0,  // tổng tiền hoàn lại cho khách hủy đơn đặt bằng pay point
               //===      total_order_cancel_fee: 0, // tổng tiền các đơn hàng do khách hủy ca làm
               //===      total_promotion_fee: 0, // chỉ tính trên những đơn hoàn thành
               //===      total_event_fee: 0,// chỉ tính trên những đơn hoàn thành
               //===      total_opening_remainder: 0, // tổng tiền trong ví chính ctv đầu ngày
               //===      total_ending_remainder: 0,// tổng tiền trong ví chính ctv cuối ngày
               //===      total_opening_gift_remainder: 0,// tổng tiền trong ví thưởng ctv đầu ngày
               //===      total_ending_gift_remainder: 0,// tổng tiền trong ví thưởng ctv cuối ngày
               //===      total_opending_paypoint: 0,// tổng tiền trong ví pay point của kh đầu ngày
               //===      total_ending_paypoint: 0,// tổng tiền trong ví pay point của kh cuối ngày
               //===      total_given_gift_remainder: 0,// tổng tiền tặng ví thưởng ctv
               //===      total_given_remainder: 0,// tổng tiền trong ví chính ctv
               //===      total_given_paypoint: 0, // tổng tiền tặng cho khách hàng
               //===      total_top_up_collaborator: 0, // tổng nạp ctv
               //===      total_withdraw_collaborator: 0, // tổng rút ctv
               //===      total_collaborator_fee: 0, // thu nhập thực của ctv trong ngày
               //===      total_bussiness_income_from_order: 0,
               //===      total_bussiness_net_income: 0,
               // })
               return getDataOrder
          } catch (err) {
               throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
          }
     }

     async createBalance() {
          try {
               const query_collaborator = {
                    $and: [
                         { is_verify: true },
                         { is_delete: false }
                    ]
               }
               const totalCollaborator = await this.collaboratorModel.aggregate([
                    { $match: query_collaborator },
                    {
                         $group: {
                              _id: {},
                              total_remainder: TOTAL_REMAINDER,
                              total_gift_remainder: TOTAL_GIFT_REMAINDER
                         }
                    }
               ])
               const query_customer = {
                    $and: [
                         { is_active: true },
                         { is_delete: false }
                    ]
               }
               const totalCustomer = await this.customerModel.aggregate([
                    { $match: query_customer },
                    {
                         $group: {
                              _id: {},
                              total_pay_point: TOTAL_PAY_POINT,
                         }
                    }
               ])
               const newItem = new this.balanceModel({
                    total_opending_paypoint: totalCustomer.length > 0 ? totalCustomer[0].total_pay_point : 0,
                    total_opening_gift_remainder: totalCollaborator.length > 0 ? totalCollaborator[0].total_gift_remainder : 0,
                    total_opening_remainder: totalCollaborator.length > 0 ? totalCollaborator[0].total_remainder : 0,
               });
               await newItem.save();
               return newItem;
          } catch (err) {
               throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
          }
     }

     async getBalance(lang, iPage: iPageStatisticDTO) {
          try {
               const { start, length, start_date, end_date } = iPage;

          } catch (err) {
               throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
          }
     }

     async getListBalance(lang, iPage: iPageStatisticDTO) {
          try {
               const { start, length } = iPage;
               const getData = await this.balanceModel.find()
                    .sort({ date_create: -1 })
                    .skip(start)
                    .skip(length);
               const count = await this.balanceModel.count()

               const result = {
                    start: start,
                    length: length,
                    count: count,
                    data: getData
               }
               return result;
          } catch (err) {
               throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
          }
     }

     async getHistoryBalanceOpening(lang, idCollaborator, iPage: iPageJobListsDTOAdmin) {
          try {
               const getCollaborator = await this.collaboratorRepositoryService.findOneById(idCollaborator);
               if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
               let query: any = {
                    $and: [
                         { id_collaborator: idCollaborator },
                         {
                              $or: [
                                   { status_current_remainder: { $ne: 'none' } },
                                   { status_current_gift_remainder: { $ne: 'none' } },
                              ]
                         },
                         {
                              date_create: { $lte: iPage.end_date }
                         }
                    ]
               }
               const getEnding = await this.historyActivityModel.findOne(query)
                    .sort({ date_create: -1, _id: 1 })
               query.$and[2] = { $lte: iPage.start_date }
               const getOpening = await this.historyActivityModel.findOne(query)
                    .sort({ date_create: -1, _id: 1 })
               const result = {
                    balance_remainder_ending: getEnding.current_remainder,
                    balance_gift_remainder_ending: getEnding.current_gift_remainder,
                    balance_remainder_opening: getOpening.current_remainder,
                    balance_gift_remainder_opening: getOpening.current_remainder,
               }
               return result
          } catch (err) {
               throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
          }
     }

     async _getBalance(lang, idCollaborator, date: string) {
          try {
               const getCollaborator = await this.collaboratorRepositoryService.findOneById(idCollaborator);

               if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
               const temp_date = new Date(date)
               const { startDate, endDate } = await this.generalHandleService.customStartAndEndOfDay(temp_date);
               const query = {
                    $and: [
                         { date_create: { $lte: endDate } },
                         { id_collaborator: idCollaborator },
                         {
                              $or: [
                                   { status_current_remainder: { $ne: 'none' } },
                                   { status_current_gift_remainder: { $ne: 'none' } },
                              ]
                         },
                    ]
               }
               const history = await this.historyActivityModel.findOne(query)
                    .sort({ date_create: -1 })
          } catch (err) {
               throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
          }
     }



}