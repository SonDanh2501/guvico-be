import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { ERROR } from 'src/@core'
import { OrderRepositoryService } from 'src/@repositories/repository-service/order-repository/order-repository.service'
import { ReportRepositoryService } from 'src/@repositories/repository-service/report-repository/report-repository.service'
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service'

@Injectable()
export class ReportOopSystemService {
  constructor(
    private customExceptionService: CustomExceptionService,
    private reportRepositoryService: ReportRepositoryService,
    private orderRepositoryService: OrderRepositoryService
  ) {}

  async createManyItems(lstPayload) {
    try {
      return await this.reportRepositoryService.createMany(lstPayload)
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
  async getReportByTimeFrame(startTime, endTime) {
    try {
      const query = {
        $and: [
          { time_start_report: startTime },
          { time_end_report: endTime }
        ]
      }

      return await this.reportRepositoryService.findOne(query)
    } catch(err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
  async getDetailItem(lang, idItem) {
    try {
        const getItem = await this.reportRepositoryService.findOneById(idItem);
        if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "order")], HttpStatus.NOT_FOUND)
        return getItem;
    } catch (err) {
        throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateReport(lang, report) {
    try {
      await this.getDetailItem(lang, report._id)
      return await this.reportRepositoryService.findByIdAndUpdate(report._id, report)
    } catch(err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Báo cáo tổng thu chi
  async getReportCashBook(lang, iPage) {
    try {
      let query: any = {
          $and: [
                  { is_delete: false },
                  { 
                    time_start_report: {$gte: iPage.start_date}
                  },
                  { 
                    time_end_report: {$lte: iPage.end_date}
                  },

              ]
          }

      const getReportCashBook = await this.reportRepositoryService.aggregateQuery([
          {
              $match: query
          },
          {
            $addFields: {
              tempDate: {
                $toDate: "$time_start_report"
              }
            }
          },
          {
            $group: {
              _id: { "$dateToString": { "format": "%d-%m-%Y", "timezone": "Asia/Ho_Chi_Minh", "date": "$tempDate" } },
              // Tổng thu
              total_income: { $sum: "$total_income"},
              // Tổng chi
              total_expenses: { $sum: "$total_expenses"},
              // Tổng số giao dịch thu
              total_income_transactions: { $sum: "$total_income_transactions"},
              // Tổng số giao dịch chi
              total_expenses_transactions: { $sum: "$total_expenses_transactions"},
              sort_date_start_record: { $first: "$time_start_report" },
            }
          },
          { $sort: { sort_date_start_record: -1 } },
          { $skip: Number(iPage.start) },
          { $limit: Number(iPage.length) }
      ]);

      const totalItem = await this.reportRepositoryService.aggregateQuery([
        {
            $match: query
        },
        {
            $group: {
                _id: {},
                total_income: {$sum: "$total_income"},
                total_expenses: {$sum: "$total_expenses"},
                total_income_transactions: {$sum: "$total_income_transactions"},
                total_expenses_transactions: {$sum: "$total_expenses_transactions"},
            },
        },
      ]);

      const count = await this.reportRepositoryService.aggregateQuery([
        {
            $match: query
        },
        {
          $addFields: {
            tempDate: {
              $toDate: "$time_start_report"
            }
          }
        },
        {
          $group: {
            _id: { "$dateToString": { "format": "%d-%m-%Y", "timezone": "Asia/Ho_Chi_Minh", "date": "$tempDate" } },
          }
        },
        { $count: 'total' },
      ])
      
      const result = {
          start: iPage.start,
          length: iPage.length,
          data: getReportCashBook || [],
          total: count[0].total || 0,
          totalItem: totalItem || []
      };
      return result;
    } catch (err) {
        throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }
  
  // Báo cáo chi tiết tổng thu chi
  async getDetailReportCashBook(lang, iPage) {
    try {
      let query: any = {
          $and: [
                  { is_delete: false },
                  { 
                    time_start_report: {$gte: iPage.start_date}
                  },
                  { 
                    time_end_report: {$lte: iPage.end_date}
                  },

              ]
          }

      const getReportCashBook = await this.reportRepositoryService.aggregateQuery([
          {
              $match: query
          },
          { $skip: Number(iPage.start) },
          { $limit: Number(iPage.length) }
      ]);

      const totalItem = await this.reportRepositoryService.aggregateQuery([
        {
            $match: query
        },
        {
            $group: {
                _id: {},
                total_income: {$sum: "$total_income"},
                total_expenses: {$sum: "$total_expenses"},
                total_income_transactions: {$sum: "$total_income_transactions"},
                total_expenses_transactions: {$sum: "$total_expenses_transactions"},
            },
        },
    ]);

      const count = await this.reportRepositoryService.countDataByCondition(query)

      const result = {
          start: iPage.start,
          length: iPage.length,
          data: getReportCashBook || [],
          total: count || 0,
          totalItem: totalItem || []
      };
      return result;
    } catch (err) {
        throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }

  // Báo cáo thu chi đối tác
  async getReportCashBookCollaborator(lang, iPage) {
    try {
      let query: any = {
          $and: [
                  { is_delete: false },
                  { 
                    time_start_report: {$gte: iPage.start_date}
                  },
                  { 
                    time_end_report: {$lte: iPage.end_date}
                  },
              ]
          }

      const getReportCashBookCollaborator = await this.reportRepositoryService.aggregateQuery(
        [
          {
            $match: query
          },
          {
            $addFields: {
              tempDate: {
                $toDate: "$time_start_report"
              }
            }
          },
          {
            $unwind:
              "$detailed_total_income_from_collaborators"
          },
          // Tính tổng thu, tổng chi, và tổng của từng phương thức giao dịch thu
          {
            $group: {
              _id: "$_id",
              tempDate: { $first: "$tempDate" },
              detailed_total_expenses_for_collaborators: {
                $first:
                  "$detailed_total_expenses_for_collaborators"
              },
              total_income_from_collaborators: {
                $first: "$total_income_from_collaborators"
              },
              total_income_from_collaborators_bank: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        "$detailed_total_income_from_collaborators.payment_method",
                        "bank"
                      ]
                    },
                    "$detailed_total_income_from_collaborators.money",
                    0
                  ]
                }
              },
              total_income_from_collaborators_momo: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        "$detailed_total_income_from_collaborators.payment_method",
                        "momo"
                      ]
                    },
                    "$detailed_total_income_from_collaborators.money",
                    0
                  ]
                }
              },
              total_expenses_for_collaborators: {
                $first:
                  "$total_expenses_for_collaborators"
              }
            }
          },
          {
            $unwind:
              "$detailed_total_expenses_for_collaborators"
          },
          // Giữ nguyên các giá trị hiện tại và tính tổng của từng phương thức giao dịch chi
          {
            $group: {
              _id: "$_id",
              tempDate: { $first: "$tempDate" },
              total_income_from_collaborators: {
                $first: "$total_income_from_collaborators"
              },
              total_income_from_collaborators_bank: {
                $first:
                  "$total_income_from_collaborators_bank"
              },
              total_income_from_collaborators_momo: {
                $first:
                  "$total_income_from_collaborators_momo"
              },
              total_expenses_for_collaborators: {
                $first:
                  "$total_expenses_for_collaborators"
              },
              total_expenses_for_collaborators_bank: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        "$detailed_total_expenses_for_collaborators.payment_method",
                        "bank"
                      ]
                    },
                    "$detailed_total_expenses_for_collaborators.money",
                    0
                  ]
                }
              }
            }
          },
          // Tính tổng hết lại
          {
            $group: {
              _id: {
                $dateToString: {
                  format: "%d-%m-%Y",
                  timezone: "Asia/Ho_Chi_Minh",
                  date: "$tempDate"
                }
              },
        
              total_income_from_collaborators: {
                $sum: "$total_income_from_collaborators"
              },
              total_income_from_collaborators_bank: {
                $sum: "$total_income_from_collaborators_bank"
              },
              total_income_from_collaborators_momo: {
                $sum: "$total_income_from_collaborators_momo"
              },
              total_expenses_for_collaborators: {
                $sum: "$total_expenses_for_collaborators"
              },
              total_expenses_for_collaborators_bank: {
                $sum: "$total_expenses_for_collaborators_bank"
              },
              sort_date_start_record: {
                $first: "$tempDate"
              }
            }
          },
          { $sort: { sort_date_start_record: -1 } },
          { $skip: Number(iPage.start) },
          { $limit: Number(iPage.length) }
        ]
      );

      const totalItem = await this.reportRepositoryService.aggregateQuery([
        {
          $match: query
        },
        {
          $unwind:
            "$detailed_total_income_from_collaborators"
        },
        // Tính tổng thu, tổng chi, và tổng của từng phương thức giao dịch thu
        {
          $group: {
            _id: "$_id",
            detailed_total_expenses_for_collaborators: {
              $first:
                "$detailed_total_expenses_for_collaborators"
            },
            total_income_from_collaborators: {
              $first: "$total_income_from_collaborators"
            },
            total_income_from_collaborators_bank: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$detailed_total_income_from_collaborators.payment_method",
                      "bank"
                    ]
                  },
                  "$detailed_total_income_from_collaborators.money",
                  0
                ]
              }
            },
            total_income_from_collaborators_momo: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$detailed_total_income_from_collaborators.payment_method",
                      "momo"
                    ]
                  },
                  "$detailed_total_income_from_collaborators.money",
                  0
                ]
              }
            },
            total_expenses_for_collaborators: {
              $first:
                "$total_expenses_for_collaborators"
            }
          }
        },
        {
          $unwind:
            "$detailed_total_expenses_for_collaborators"
        },
        // Giữ nguyên các giá trị hiện tại và tính tổng của từng phương thức giao dịch chi
        {
          $group: {
            _id: "$_id",
            total_income_from_collaborators: {
              $first: "$total_income_from_collaborators"
            },
            total_income_from_collaborators_bank: {
              $first:
                "$total_income_from_collaborators_bank"
            },
            total_income_from_collaborators_momo: {
              $first:
                "$total_income_from_collaborators_momo"
            },
            total_expenses_for_collaborators: {
              $first:
                "$total_expenses_for_collaborators"
            },
            total_expenses_for_collaborators_bank: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$detailed_total_expenses_for_collaborators.payment_method",
                      "bank"
                    ]
                  },
                  "$detailed_total_expenses_for_collaborators.money",
                  0
                ]
              }
            }
          }
        },
        // Tính tổng hết lại
        {
          $group: {
            _id: null,
            total_income_from_collaborators: {
              $sum: "$total_income_from_collaborators"
            },
            total_income_from_collaborators_bank: {
              $sum: "$total_income_from_collaborators_bank"
            },
            total_income_from_collaborators_momo: {
              $sum: "$total_income_from_collaborators_momo"
            },
            total_expenses_for_collaborators: {
              $sum: "$total_expenses_for_collaborators"
            },
            total_expenses_for_collaborators_bank: {
              $sum: "$total_expenses_for_collaborators_bank"
            }
          }
        }
      ]);

      const count = await this.reportRepositoryService.aggregateQuery([
        {
            $match: query
        },
        {
          $addFields: {
            tempDate: {
              $toDate: "$time_start_report"
            }
          }
        },
        {
          $group: {
            _id: { "$dateToString": { "format": "%d-%m-%Y", "timezone": "Asia/Ho_Chi_Minh", "date": "$tempDate" } },
          }
        },
        { $count: 'total' },
      ])

      const result = {
          start: iPage.start,
          length: iPage.length,
          data: getReportCashBookCollaborator || [],
          total: count[0].total || 0,
          totalItem: totalItem || []
      };
      return result;
    } catch (err) {
        throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }

  // Báo cáo chi tiết thu chi đối tác
  async getDetailReportCashBookCollaborator(lang, iPage) {
    try {
      let query: any = {
          $and: [
                  { is_delete: false },
                  { 
                    time_start_report: {$gte: iPage.start_date}
                  },
                  { 
                    time_end_report: {$lte: iPage.end_date}
                  },

              ]
          }

      const getReportCashBook = await this.reportRepositoryService.aggregateQuery([
          {
              $match: query
          },
          { $skip: Number(iPage.start) },
          { $limit: Number(iPage.length) }
      ]);

      const totalItem = await this.reportRepositoryService.aggregateQuery([
          {
            $match: query
          },
          {
            $unwind:
              "$detailed_total_income_from_collaborators"
          },
          // Tính tổng thu, tổng chi, và tổng của từng phương thức giao dịch thu
          {
            $group: {
              _id: "$_id",
              detailed_total_expenses_for_collaborators: {
                $first:
                  "$detailed_total_expenses_for_collaborators"
              },
              total_income_from_collaborators: {
                $first: "$total_income_from_collaborators"
              },
              total_income_from_collaborators_bank: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        "$detailed_total_income_from_collaborators.payment_method",
                        "bank"
                      ]
                    },
                    "$detailed_total_income_from_collaborators.money",
                    0
                  ]
                }
              },
              total_income_from_collaborators_momo: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        "$detailed_total_income_from_collaborators.payment_method",
                        "momo"
                      ]
                    },
                    "$detailed_total_income_from_collaborators.money",
                    0
                  ]
                }
              },
              total_expenses_for_collaborators: {
                $first:
                  "$total_expenses_for_collaborators"
              }
            }
          },
          {
            $unwind:
              "$detailed_total_expenses_for_collaborators"
          },
          // Giữ nguyên các giá trị hiện tại và tính tổng của từng phương thức giao dịch chi
          {
            $group: {
              _id: "$_id",
              total_income_from_collaborators: {
                $first: "$total_income_from_collaborators"
              },
              total_income_from_collaborators_bank: {
                $first:
                  "$total_income_from_collaborators_bank"
              },
              total_income_from_collaborators_momo: {
                $first:
                  "$total_income_from_collaborators_momo"
              },
              total_expenses_for_collaborators: {
                $first:
                  "$total_expenses_for_collaborators"
              },
              total_expenses_for_collaborators_bank: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        "$detailed_total_expenses_for_collaborators.payment_method",
                        "bank"
                      ]
                    },
                    "$detailed_total_expenses_for_collaborators.money",
                    0
                  ]
                }
              }
            }
          },
          // Tính tổng hết lại
          {
            $group: {
              _id: null,
              total_income_from_collaborators: {
                $sum: "$total_income_from_collaborators"
              },
              total_income_from_collaborators_bank: {
                $sum: "$total_income_from_collaborators_bank"
              },
              total_income_from_collaborators_momo: {
                $sum: "$total_income_from_collaborators_momo"
              },
              total_expenses_for_collaborators: {
                $sum: "$total_expenses_for_collaborators"
              },
              total_expenses_for_collaborators_bank: {
                $sum: "$total_expenses_for_collaborators_bank"
              }
            }
          }
        ]);

      const count = await this.reportRepositoryService.countDataByCondition(query)

      const result = {
          start: iPage.start,
          length: iPage.length,
          data: getReportCashBook || [],
          total: count || 0,
          totalItem: totalItem || []
      };
      return result;
    } catch (err) {
        throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }

  // Báo cáo thu chi khách hàng
  async getReportCashBookCustomer(lang, iPage) {
    try {
      let query: any = {
          $and: [
                  { is_delete: false },
                  { 
                    time_start_report: {$gte: iPage.start_date}
                  },
                  { 
                    time_end_report: {$lte: iPage.end_date}
                  },
              ]
          }

      const getReportCashBookCustomer = await this.reportRepositoryService.aggregateQuery(
        [
          {
            $match: query
          },
          {
            $addFields: {
              tempDate: {
                $toDate: "$time_start_report"
              }
            }
          },
          {
            $unwind:
              "$detailed_total_income_from_customers"
          },
          // Tính tổng thu, tổng chi, và tổng của từng phương thức giao dịch thu
          {
            $group: {
              _id: "$_id",
              tempDate: { $first: "$tempDate" },
              detailed_total_expenses_for_customers: {
                $first:
                  "$detailed_total_expenses_for_customers"
              },
              total_income_from_customers: {
                $first: "$total_income_from_customers"
              },
              total_income_from_customers_vnpay: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        "$detailed_total_income_from_customers.payment_method",
                        "vnpay"
                      ]
                    },
                    "$detailed_total_income_from_customers.money",
                    0
                  ]
                }
              },
              total_income_from_customers_vnbank: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        "$detailed_total_income_from_customers.payment_method",
                        "vnbank"
                      ]
                    },
                    "$detailed_total_income_from_customers.money",
                    0
                  ]
                }
              },
              total_income_from_customers_intcard: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        "$detailed_total_income_from_customers.payment_method",
                        "intcard"
                      ]
                    },
                    "$detailed_total_income_from_customers.money",
                    0
                  ]
                }
              },
              total_income_from_customers_momo: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        "$detailed_total_income_from_customers.payment_method",
                        "momo"
                      ]
                    },
                    "$detailed_total_income_from_customers.money",
                    0
                  ]
                }
              },
              total_expenses_for_customers: {
                $first:
                  "$total_expenses_for_customers"
              }
            }
          },
          {
            $unwind:
              "$detailed_total_expenses_for_customers"
          },
          // Giữ nguyên các giá trị hiện tại và tính tổng của từng phương thức giao dịch chi
          {
            $group: {
              _id: "$_id",
              tempDate: { $first: "$tempDate" },
              total_income_from_customers: {
                $first: "$total_income_from_customers"
              },
              total_income_from_customers_vnpay: {
                $first:
                  "$total_income_from_customers_vnpay"
              },
              total_income_from_customers_vnbank: {
                $first:
                  "$total_income_from_customers_vnbank"
              },
              total_income_from_customers_intcard: {
                $first:
                  "$total_income_from_customers_intcard"
              },
              total_income_from_customers_momo: {
                $first:
                  "$total_income_from_customers_momo"
              },
              total_expenses_for_customers: {
                $first:
                  "$total_expenses_for_customers"
              },
              total_expenses_for_customers_bank: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        "$detailed_total_expenses_for_customers.payment_method",
                        "bank"
                      ]
                    },
                    "$detailed_total_expenses_for_customers.money",
                    0
                  ]
                }
              }
            }
          },
          // Tính tổng hết lại
          {
            $group: {
              _id: {
                $dateToString: {
                  format: "%d-%m-%Y",
                  timezone: "Asia/Ho_Chi_Minh",
                  date: "$tempDate"
                }
              },
        
              total_income_from_customers: {
                $sum: "$total_income_from_customers"
              },
              total_income_from_customers_vnpay: {
                $sum: "$total_income_from_customers_vnpay"
              },
              total_income_from_customers_vnbank: {
                $sum: "$total_income_from_customers_vnbank"
              },
              total_income_from_customers_intcard: {
                $sum: "$total_income_from_customers_intcard"
              },
              total_income_from_customers_bank: {
                $sum: "$total_income_from_customers_bank"
              },
              total_income_from_customers_momo: {
                $sum: "$total_income_from_customers_momo"
              },
              total_expenses_for_customers: {
                $sum: "$total_expenses_for_customers"
              },
              total_expenses_for_customers_bank: {
                $sum: "$total_expenses_for_customers_bank"
              },
              sort_date_start_record: {
                $first: "$tempDate"
              }
            }
          },
          { $sort: { sort_date_start_record: -1 } },
          { $skip: Number(iPage.start) },
          { $limit: Number(iPage.length) }
        ]
      );

      const totalItem = await this.reportRepositoryService.aggregateQuery([
        {
          $match: query
        },
        {
          $unwind:
            "$detailed_total_income_from_customers"
        },
        // Tính tổng thu, tổng chi, và tổng của từng phương thức giao dịch thu
        {
          $group: {
            _id: "$_id",
            detailed_total_expenses_for_customers: {
              $first:
                "$detailed_total_expenses_for_customers"
            },
            total_income_from_customers: {
              $first: "$total_income_from_customers"
            },
            total_income_from_customers_vnpay: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$detailed_total_income_from_customers.payment_method",
                      "vnpay"
                    ]
                  },
                  "$detailed_total_income_from_customers.money",
                  0
                ]
              }
            },
            total_income_from_customers_vnbank: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$detailed_total_income_from_customers.payment_method",
                      "vnbank"
                    ]
                  },
                  "$detailed_total_income_from_customers.money",
                  0
                ]
              }
            },
            total_income_from_customers_intcard: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$detailed_total_income_from_customers.payment_method",
                      "intcard"
                    ]
                  },
                  "$detailed_total_income_from_customers.money",
                  0
                ]
              }
            },
            total_income_from_customers_momo: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$detailed_total_income_from_customers.payment_method",
                      "momo"
                    ]
                  },
                  "$detailed_total_income_from_customers.money",
                  0
                ]
              }
            },
            total_expenses_for_customers: {
              $first:
                "$total_expenses_for_customers"
            }
          }
        },
        {
          $unwind:
            "$detailed_total_expenses_for_customers"
        },
        // Giữ nguyên các giá trị hiện tại và tính tổng của từng phương thức giao dịch chi
        {
          $group: {
            _id: "$_id",
            total_income_from_customers: {
              $first: "$total_income_from_customers"
            },
            total_income_from_customers_vnpay: {
              $first:
                "$total_income_from_customers_vnpay"
            },
            total_income_from_customers_vnbank: {
              $first:
                "$total_income_from_customers_vnbank"
            },
            total_income_from_customers_intcard: {
              $first:
                "$total_income_from_customers_intcard"
            },
            total_income_from_customers_momo: {
              $first:
                "$total_income_from_customers_momo"
            },
            total_expenses_for_customers: {
              $first:
                "$total_expenses_for_customers"
            },
            total_expenses_for_customers_bank: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$detailed_total_expenses_for_customers.payment_method",
                      "bank"
                    ]
                  },
                  "$detailed_total_expenses_for_customers.money",
                  0
                ]
              }
            }
          }
        },
        // Tính tổng hết lại
        {
          $group: {
            _id: null,
            total_income_from_customers: {
              $sum: "$total_income_from_customers"
            },
            total_income_from_customers_vnpay: {
              $sum: "$total_income_from_customers_vnpay"
            },
            total_income_from_customers_vnbank: {
              $sum: "$total_income_from_customers_vnbank"
            },
            total_income_from_customers_intcard: {
              $sum: "$total_income_from_customers_intcard"
            },
            total_income_from_customers_momo: {
              $sum: "$total_income_from_customers_momo"
            },
            total_expenses_for_customers: {
              $sum: "$total_expenses_for_customers"
            },
            total_expenses_for_customers_bank: {
              $sum: "$total_expenses_for_customers_bank"
            }
          }
        }
      ]);

      const count = await this.reportRepositoryService.aggregateQuery([
        {
            $match: query
        },
        {
          $addFields: {
            tempDate: {
              $toDate: "$time_start_report"
            }
          }
        },
        {
          $group: {
            _id: { "$dateToString": { "format": "%d-%m-%Y", "timezone": "Asia/Ho_Chi_Minh", "date": "$tempDate" } },
          }
        },
        { $count: 'total' },
      ])

      const result = {
          start: iPage.start,
          length: iPage.length,
          data: getReportCashBookCustomer || [],
          total: count[0].total || 0,
          totalItem: totalItem || []
      };
      return result;
    } catch (err) {
        throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }

  // Báo cáo chi tiết thu chi khách hàng
  async getDetailReportCashBookCustomer(lang, iPage) {
    try {
      let query: any = {
          $and: [
                  { is_delete: false },
                  { 
                    time_start_report: {$gte: iPage.start_date}
                  },
                  { 
                    time_end_report: {$lte: iPage.end_date}
                  },

              ]
          }

      const getReportCashBook = await this.reportRepositoryService.aggregateQuery([
          {
              $match: query
          },
          { $skip: Number(iPage.start) },
          { $limit: Number(iPage.length) }
      ]);

      const totalItem = await this.reportRepositoryService.aggregateQuery([
          {
            $match: query
          },
          {
            $unwind:
              "$detailed_total_income_from_customers"
          },
          // Tính tổng thu, tổng chi, và tổng của từng phương thức giao dịch thu
          {
            $group: {
              _id: "$_id",
              detailed_total_expenses_for_customers: {
                $first:
                  "$detailed_total_expenses_for_customers"
              },
              total_income_from_customers: {
                $first: "$total_income_from_customers"
              },
              total_income_from_customers_vnpay: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        "$detailed_total_income_from_customers.payment_method",
                        "vnpay"
                      ]
                    },
                    "$detailed_total_income_from_customers.money",
                    0
                  ]
                }
              },
              total_income_from_customers_vnbank: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        "$detailed_total_income_from_customers.payment_method",
                        "vnbank"
                      ]
                    },
                    "$detailed_total_income_from_customers.money",
                    0
                  ]
                }
              },
              total_income_from_customers_intcard: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        "$detailed_total_income_from_customers.payment_method",
                        "intcard"
                      ]
                    },
                    "$detailed_total_income_from_customers.money",
                    0
                  ]
                }
              },
              total_income_from_customers_momo: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        "$detailed_total_income_from_customers.payment_method",
                        "momo"
                      ]
                    },
                    "$detailed_total_income_from_customers.money",
                    0
                  ]
                }
              },
              total_expenses_for_customers: {
                $first:
                  "$total_expenses_for_customers"
              }
            }
          },
          {
            $unwind:
              "$detailed_total_expenses_for_customers"
          },
          // Giữ nguyên các giá trị hiện tại và tính tổng của từng phương thức giao dịch chi
          {
            $group: {
              _id: "$_id",
              total_income_from_customers: {
                $first: "$total_income_from_customers"
              },
              total_income_from_customers_vnpay: {
                $first:
                  "$total_income_from_customers_vnpay"
              },
              total_income_from_customers_vnbank: {
                $first:
                  "$total_income_from_customers_vnbank"
              },
              total_income_from_customers_intcard: {
                $first:
                  "$total_income_from_customers_intcard"
              },
              total_income_from_customers_momo: {
                $first:
                  "$total_income_from_customers_momo"
              },
              total_expenses_for_customers: {
                $first:
                  "$total_expenses_for_customers"
              },
              total_expenses_for_customers_bank: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        "$detailed_total_expenses_for_customers.payment_method",
                        "bank"
                      ]
                    },
                    "$detailed_total_expenses_for_customers.money",
                    0
                  ]
                }
              }
            }
          },
          // Tính tổng hết lại
          {
            $group: {
              _id: null,
              total_income_from_customers: {
                $sum: "$total_income_from_customers"
              },
              total_income_from_customers_vnpay: {
                $sum: "$total_income_from_customers_vnpay"
              },
              total_income_from_customers_vnbank: {
                $sum: "$total_income_from_customers_vnbank"
              },
              total_income_from_customers_intcard: {
                $sum: "$total_income_from_customers_intcard"
              },
              total_income_from_customers_momo: {
                $sum: "$total_income_from_customers_momo"
              },
              total_expenses_for_customers: {
                $sum: "$total_expenses_for_customers"
              },
              total_expenses_for_customers_bank: {
                $sum: "$total_expenses_for_customers_bank"
              }
            }
          }
      ]);

      const count = await this.reportRepositoryService.countDataByCondition(query)

      const result = {
          start: iPage.start,
          length: iPage.length,
          data: getReportCashBook || [],
          total: count || 0,
          totalItem: totalItem || []
      };
      return result;
    } catch (err) {
        throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }

  // Báo cáo hoạt động đơn hàng
  async getReportOrderActivity(lang, iPage) {
    try {
      let query: any = {
        $and: [
                { is_delete: false },
                { 
                  time_start_report: {$gte: iPage.start_date}
                },
                { 
                  time_end_report: {$lte: iPage.end_date}
                },
            ]
      }
      const getReportOrderActivityData = await this.reportRepositoryService.aggregateQuery(
        [
          {
            $match: query
          },
          {
            $addFields: {
              tempDate: {
                $toDate: "$time_start_report"
              }
            }
          },
          {
            $unwind: "$detailed_total_money_created"
          },
          {
            $group: {
              _id: "$_id",
              // Tổng đơn được tạo ra trong ngày (tất cả loại đơn)
              total_orders_created: {
                $first: "$total_orders_created"
              },
              // Tổng giá trị giao dịch (total_gmv_done là chỉ tính đơn hoàn thành)
              total_gmv: {
                $first: "$total_gmv"
              },
              // Tổng thu hộ dịch dự kiến
              total_projected_service_collection_amount: {
                $first:
                  "$total_projected_service_collection_amount"
              },
              // Tổng doanh thu dự kiến
              total_projected_revenue: {
                $first: "$total_projected_revenue"
              },
              // Tổng tiền giảm giá dự kiến
              total_projected_discount: {
                $first: "$total_projected_discount"
              },
              // Tổng tiền doanh thu thuần dự kiến
              total_projected_net_revenue: {
                $first: "$total_projected_net_revenue"
              },
              // Tổng tiền hóa đơn dự kiến
              total_projected_invoice: {
                $first: "$total_projected_invoice"
              },
              // Tổng phí áp dụng dự kiến
              total_projected_applied_fees: {
                $first: "$total_projected_applied_fees"
              },
              // Tổng tiền thuế dự kiến
              total_projected_value_added_tax: {
                $first: "$total_projected_value_added_tax"
              },
              // Tổng lợi nhuận dự kiến
              total_projected_profit: {
                $first: "$total_projected_profit"
              },
              // Tổng lợi nhuận sau thuế dự kiến
              total_projected_profit_after_tax: {
                $first:
                  "$total_projected_profit_after_tax"
              },
              // Tiền hoàn lại
              total_money_canceled: {
                $first: "$total_money_canceled"
              },
              // Tổng hóa đơn được tạo bởi ngân hàng
              total_money_payment_method_from_bank: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        "$detailed_total_money_created.payment_method",
                        "bank"
                      ]
                    },
                    "$detailed_total_money_created.money",
                    0
                  ]
                }
              },
              // Tổng hóa đơn được tạo bởi vnpay
              total_money_payment_method_from_vnpay: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        "$detailed_total_money_created.payment_method",
                        "vnpay"
                      ]
                    },
                    "$detailed_total_money_created.money",
                    0
                  ]
                }
              },
              // Tổng hóa đơn được tạo bởi vnbank
              total_money_payment_method_from_vnbank: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        "$detailed_total_money_created.payment_method",
                        "vnbank"
                      ]
                    },
                    "$detailed_total_money_created.money",
                    0
                  ]
                }
              },
              // Tổng hóa đơn được tạo bởi intcard
              total_money_payment_method_from_intcard: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        "$detailed_total_money_created.payment_method",
                        "intcard"
                      ]
                    },
                    "$detailed_total_money_created.money",
                    0
                  ]
                }
              },
              // Tổng hóa đơn được tạo bởi momo
              total_money_payment_method_from_momo: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        "$detailed_total_money_created.payment_method",
                        "momo"
                      ]
                    },
                    "$detailed_total_money_created.money",
                    0
                  ]
                }
              },
              // Tổng hóa đơn được tạo bởi cash
              total_money_payment_method_from_cash: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        "$detailed_total_money_created.payment_method",
                        "cash"
                      ]
                    },
                    "$detailed_total_money_created.money",
                    0
                  ]
                }
              },
              // Tổng hóa đơn được tạo bởi point
              total_money_payment_method_from_point: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        "$detailed_total_money_created.payment_method",
                        "point"
                      ]
                    },
                    "$detailed_total_money_created.money",
                    0
                  ]
                }
              },
              sort_date_start_record: {
                $first: "$tempDate"
              }
            }
          },   
          {
            $group: {
              _id: {
                $dateToString: {
                  format: "%d-%m-%Y",
                  timezone: "Asia/Ho_Chi_Minh",
                  date: "$sort_date_start_record"
                }
              },
              // Tổng đơn được tạo ra trong ngày (tất cả loại đơn)
              total_orders_created: {
                $sum: "$total_orders_created"
              },
              // Tổng giá trị giao dịch (total_gmv_done là chỉ tính đơn hoàn thành)
              total_gmv: {
                $sum: "$total_gmv"
              },
              // Tổng thu hộ dịch dự kiến
              total_projected_service_collection_amount: {
                $sum: "$total_projected_service_collection_amount"
              },
              // Tổng doanh thu dự kiến
              total_projected_revenue: {
                $sum: "$total_projected_revenue"
              },
              // Tổng tiền giảm giá dự kiến
              total_projected_discount: {
                $sum: "$total_projected_discount"
              },
              // Tổng tiền doanh thu thuần dự kiến
              total_projected_net_revenue: {
                $sum: "$total_projected_net_revenue"
              },
              // Tổng tiền hóa đơn dự kiến
              total_projected_invoice: {
                $sum: "$total_projected_invoice"
              },
              // Tổng phí áp dụng dự kiến
              total_projected_applied_fees: {
                $sum: "$total_projected_applied_fees"
              },
              // Tổng tiền thuế dự kiến
              total_projected_value_added_tax: {
                $sum: "$total_projected_value_added_tax"
              },
              // Tổng lợi nhuận dự kiến
              total_projected_profit: {
                $sum: "$total_projected_profit"
              },
              // Tổng lợi nhuận sau thuế dự kiến
              total_projected_profit_after_tax: {
                $sum: "$total_projected_profit_after_tax"
              },
              // Tiền hoàn lại
              total_money_canceled: {
                $sum: "$total_money_canceled"
              },
              // Tổng hóa đơn được tạo bởi ngân hàng
              total_money_payment_method_from_bank: {
                $sum: "$total_money_payment_method_from_bank"
              },
              // Tổng hóa đơn được tạo bởi vnpay
              total_money_payment_method_from_vnpay: {
                $sum: "$total_money_payment_method_from_vnpay"
              },
              // Tổng hóa đơn được tạo bởi vnbank
              total_money_payment_method_from_vnbank: {
                $sum: "$total_money_payment_method_from_vnbank"
              },
              // Tổng hóa đơn được tạo bởi intcard
              total_money_payment_method_from_intcard: {
                $sum: "$total_money_payment_method_from_intcard"
              },
              // Tổng hóa đơn được tạo bởi momo
              total_money_payment_method_from_momo: {
                $sum: "$total_money_payment_method_from_momo"
              },
              // Tổng hóa đơn được tạo bởi cash
              total_money_payment_method_from_cash: {
                $sum: "$total_money_payment_method_from_cash"
              },
              // Tổng hóa đơn được tạo bởi point
              total_money_payment_method_from_point: {
                $sum: "$total_money_payment_method_from_point"
              },
              sort_date_start_record: {
                $first: "$sort_date_start_record"
              }
            }
          },
          // % Lợi nhuận
          {
            $addFields: {
              profit_percentage_done: {
                $cond: {
                  if: { $eq: ["$total_projected_profit", 0] },
                  then: 0,
                  else: {
                    $round: [
                      {
                        $multiply: [
                          {
                            $divide: [
                              "$total_projected_profit_after_tax",
                              "$total_projected_profit"
                            ]
                          },
                          100
                        ]
                      },
                      2
                    ]
                  }
                }
              }
            }
          },
          { $sort: { sort_date_start_record: -1 } },
          { $skip: Number(iPage.start) },
          { $limit: Number(iPage.length) }
        ]
      );

      const totalItem = await this.reportRepositoryService.aggregateQuery(
        [
          {
            $match: query
          },
          {
            $unwind: "$detailed_total_money_created"
          },
          {
            $group: {
              _id: "$_id",
              // Tổng đơn được tạo ra trong ngày (tất cả loại đơn)
              total_orders_created: {
                $first: "$total_orders_created"
              },
              // Tổng giá trị giao dịch (total_gmv_done là chỉ tính đơn hoàn thành)
              total_gmv: {
                $first: "$total_gmv"
              },
              // Tổng thu hộ dịch dự kiến
              total_projected_service_collection_amount: {
                $first:
                  "$total_projected_service_collection_amount"
              },
              // Tổng doanh thu dự kiến
              total_projected_revenue: {
                $first: "$total_projected_revenue"
              },
              // Tổng tiền giảm giá dự kiến
              total_projected_discount: {
                $first: "$total_projected_discount"
              },
              // Tổng tiền doanh thu thuần dự kiến
              total_projected_net_revenue: {
                $first: "$total_projected_net_revenue"
              },
              // Tổng tiền hóa đơn dự kiến
              total_projected_invoice: {
                $first: "$total_projected_invoice"
              },
              // Tổng phí áp dụng dự kiến
              total_projected_applied_fees: {
                $first: "$total_projected_applied_fees"
              },
              // Tổng tiền thuế dự kiến
              total_projected_value_added_tax: {
                $first: "$total_projected_value_added_tax"
              },
              // Tổng lợi nhuận dự kiến
              total_projected_profit: {
                $first: "$total_projected_profit"
              },
              // Tổng lợi nhuận sau thuế dự kiến
              total_projected_profit_after_tax: {
                $first:
                  "$total_projected_profit_after_tax"
              },
              // Tiền hoàn lại
              total_money_canceled: {
                $first: "$total_money_canceled"
              },
              // Tổng hóa đơn được tạo bởi ngân hàng
              total_money_payment_method_from_bank: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        "$detailed_total_money_created.payment_method",
                        "bank"
                      ]
                    },
                    "$detailed_total_money_created.money",
                    0
                  ]
                }
              },
              // Tổng hóa đơn được tạo bởi vnpay
              total_money_payment_method_from_vnpay: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        "$detailed_total_money_created.payment_method",
                        "vnpay"
                      ]
                    },
                    "$detailed_total_money_created.money",
                    0
                  ]
                }
              },
              // Tổng hóa đơn được tạo bởi vnbank
              total_money_payment_method_from_vnbank: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        "$detailed_total_money_created.payment_method",
                        "vnbank"
                      ]
                    },
                    "$detailed_total_money_created.money",
                    0
                  ]
                }
              },
              // Tổng hóa đơn được tạo bởi intcard
              total_money_payment_method_from_intcard: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        "$detailed_total_money_created.payment_method",
                        "intcard"
                      ]
                    },
                    "$detailed_total_money_created.money",
                    0
                  ]
                }
              },
              // Tổng hóa đơn được tạo bởi momo
              total_money_payment_method_from_momo: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        "$detailed_total_money_created.payment_method",
                        "momo"
                      ]
                    },
                    "$detailed_total_money_created.money",
                    0
                  ]
                }
              },
              // Tổng hóa đơn được tạo bởi cash
              total_money_payment_method_from_cash: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        "$detailed_total_money_created.payment_method",
                        "cash"
                      ]
                    },
                    "$detailed_total_money_created.money",
                    0
                  ]
                }
              },
              // Tổng hóa đơn được tạo bởi point
              total_money_payment_method_from_point: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        "$detailed_total_money_created.payment_method",
                        "point"
                      ]
                    },
                    "$detailed_total_money_created.money",
                    0
                  ]
                }
              }
            }
          },   
          {
            $group: {
              _id: {},
              // Tổng đơn được tạo ra trong ngày (tất cả loại đơn)
              total_orders_created: {
                $sum: "$total_orders_created"
              },
              // Tổng giá trị giao dịch (total_gmv_done là chỉ tính đơn hoàn thành)
              total_gmv: {
                $sum: "$total_gmv"
              },
              // Tổng thu hộ dịch dự kiến
              total_projected_service_collection_amount: {
                $sum: "$total_projected_service_collection_amount"
              },
              // Tổng doanh thu dự kiến
              total_projected_revenue: {
                $sum: "$total_projected_revenue"
              },
              // Tổng tiền giảm giá dự kiến
              total_projected_discount: {
                $sum: "$total_projected_discount"
              },
              // Tổng tiền doanh thu thuần dự kiến
              total_projected_net_revenue: {
                $sum: "$total_projected_net_revenue"
              },
              // Tổng tiền hóa đơn dự kiến
              total_projected_invoice: {
                $sum: "$total_projected_invoice"
              },
              // Tổng phí áp dụng dự kiến
              total_projected_applied_fees: {
                $sum: "$total_projected_applied_fees"
              },
              // Tổng tiền thuế dự kiến
              total_projected_value_added_tax: {
                $sum: "$total_projected_value_added_tax"
              },
              // Tổng lợi nhuận dự kiến
              total_projected_profit: {
                $sum: "$total_projected_profit"
              },
              // Tổng lợi nhuận sau thuế dự kiến
              total_projected_profit_after_tax: {
                $sum: "$total_projected_profit_after_tax"
              },
              // Tiền hoàn lại
              total_money_canceled: {
                $sum: "$total_money_canceled"
              },
              // Tổng hóa đơn được tạo bởi ngân hàng
              total_money_payment_method_from_bank: {
                $sum: "$total_money_payment_method_from_bank"
              },
              // Tổng hóa đơn được tạo bởi vnpay
              total_money_payment_method_from_vnpay: {
                $sum: "$total_money_payment_method_from_vnpay"
              },
              // Tổng hóa đơn được tạo bởi vnbank
              total_money_payment_method_from_vnbank: {
                $sum: "$total_money_payment_method_from_vnbank"
              },
              // Tổng hóa đơn được tạo bởi intcard
              total_money_payment_method_from_intcard: {
                $sum: "$total_money_payment_method_from_intcard"
              },
              // Tổng hóa đơn được tạo bởi momo
              total_money_payment_method_from_momo: {
                $sum: "$total_money_payment_method_from_momo"
              },
              // Tổng hóa đơn được tạo bởi cash
              total_money_payment_method_from_cash: {
                $sum: "$total_money_payment_method_from_cash"
              },
              // Tổng hóa đơn được tạo bởi point
              total_money_payment_method_from_point: {
                $sum: "$total_money_payment_method_from_point"
              }
            }
          }
        ]
      );

      const count = await this.reportRepositoryService.aggregateQuery([
        {
            $match: query
        },
        {
          $addFields: {
            tempDate: {
              $toDate: "$time_start_report"
            }
          }
        },
        {
          $group: {
            _id: { "$dateToString": { "format": "%d-%m-%Y", "timezone": "Asia/Ho_Chi_Minh", "date": "$tempDate" } },
          }
        },
        { $count: 'total' },
      ])

      const result = {
          start: iPage.start,
          length: iPage.length,
          data: getReportOrderActivityData || [],
          totalItem: totalItem || [],
          total: count[0].total || 0,
      };
      return result;

    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
  }
  }

  // Báo cáo chi tiết hoạt động đơn hàng

  // Code cũ (Báo cáo chi tiết hoạt động đơn hàng theo từng khung giờ, chỉ lấy từ bảng report)
  // async getDetailReportOrderActivity(lang, iPage) {
  //   try {
      // let query: any = {
      //   $and: [
      //           { is_delete: false },
      //           { 
      //             time_start_report: {$gte: iPage.start_date}
      //           },
      //           { 
      //             time_end_report: {$lte: iPage.end_date}
      //           },
      //       ]
      // }
  //     const getDetailReportOrderActivityData = await this.reportRepositoryService.aggregateQuery(
  //       [
  //         {
  //           $match: query
  //         },
  //         { $skip: Number(iPage.start) },
  //         { $limit: Number(iPage.length) }
  //       ]
  //     );

  //     const totalItem = await this.reportRepositoryService.aggregateQuery(
  //       [
  //         {
  //           $match: query
  //         },
  //         {
  //           $unwind: "$detailed_total_money_created"
  //         },
  //         {
  //           $group: {
  //             _id: "$_id",
  //             // Tổng đơn được tạo ra trong ngày (tất cả loại đơn)
  //             total_orders_created: {
  //               $first: "$total_orders_created"
  //             },
  //             // Tổng giá trị giao dịch (total_gmv_done là chỉ tính đơn hoàn thành)
  //             total_gmv: {
  //               $first: "$total_gmv"
  //             },
  //             // Tổng thu hộ dịch dự kiến
  //             total_projected_service_collection_amount: {
  //               $first:
  //                 "$total_projected_service_collection_amount"
  //             },
  //             // Tổng doanh thu dự kiến
  //             total_projected_revenue: {
  //               $first: "$total_projected_revenue"
  //             },
  //             // Tổng tiền giảm giá dự kiến
  //             total_projected_discount: {
  //               $first: "$total_projected_discount"
  //             },
        
  //             // Tổng tiền doanh thu thuần dự kiến
  //             total_projected_net_revenue: {
  //               $first: "$total_projected_net_revenue"
  //             },
  //             // Tổng tiền hóa đơn dự kiến
  //             total_projected_invoice: {
  //               $first: "$total_projected_invoice"
  //             },
  //             // Tổng phí áp dụng dự kiến
  //             total_projected_applied_fees: {
  //               $first: "$total_projected_applied_fees"
  //             },
  //             // Tổng tiền thuế dự kiến
  //             total_projected_value_added_tax: {
  //               $first: "$total_projected_value_added_tax"
  //             },
  //             // Tổng lợi nhuận dự kiến
  //             total_projected_profit: {
  //               $first: "$total_projected_profit"
  //             },
  //             // Tổng lợi nhuận sau thuế dự kiến
  //             total_projected_profit_after_tax: {
  //               $first:
  //                 "$total_projected_profit_after_tax"
  //             },
  //             // Tiền hoàn lại
  //             total_money_canceled: {
  //               $first: "$total_money_canceled"
  //             },
  //             // Tổng hóa đơn được tạo bởi ngân hàng
  //             total_money_payment_method_from_bank: {
  //               $sum: {
  //                 $cond: [
  //                   {
  //                     $eq: [
  //                       "$detailed_total_money_created.payment_method",
  //                       "bank"
  //                     ]
  //                   },
  //                   "$detailed_total_money_created.money",
  //                   0
  //                 ]
  //               }
  //             },
  //             // Tổng hóa đơn được tạo bởi vnpay
  //             total_money_payment_method_from_vnpay: {
  //               $sum: {
  //                 $cond: [
  //                   {
  //                     $eq: [
  //                       "$detailed_total_money_created.payment_method",
  //                       "vnpay"
  //                     ]
  //                   },
  //                   "$detailed_total_money_created.money",
  //                   0
  //                 ]
  //               }
  //             },
  //             // Tổng hóa đơn được tạo bởi vnbank
  //             total_money_payment_method_from_vnbank: {
  //               $sum: {
  //                 $cond: [
  //                   {
  //                     $eq: [
  //                       "$detailed_total_money_created.payment_method",
  //                       "vnbank"
  //                     ]
  //                   },
  //                   "$detailed_total_money_created.money",
  //                   0
  //                 ]
  //               }
  //             },
  //             // Tổng hóa đơn được tạo bởi intcard
  //             total_money_payment_method_from_intcard: {
  //               $sum: {
  //                 $cond: [
  //                   {
  //                     $eq: [
  //                       "$detailed_total_money_created.payment_method",
  //                       "intcard"
  //                     ]
  //                   },
  //                   "$detailed_total_money_created.money",
  //                   0
  //                 ]
  //               }
  //             },
  //             // Tổng hóa đơn được tạo bởi momo
  //             total_money_payment_method_from_momo: {
  //               $sum: {
  //                 $cond: [
  //                   {
  //                     $eq: [
  //                       "$detailed_total_money_created.payment_method",
  //                       "momo"
  //                     ]
  //                   },
  //                   "$detailed_total_money_created.money",
  //                   0
  //                 ]
  //               }
  //             },
  //             // Tổng hóa đơn được tạo bởi cash
  //             total_money_payment_method_from_cash: {
  //               $sum: {
  //                 $cond: [
  //                   {
  //                     $eq: [
  //                       "$detailed_total_money_created.payment_method",
  //                       "cash"
  //                     ]
  //                   },
  //                   "$detailed_total_money_created.money",
  //                   0
  //                 ]
  //               }
  //             },
  //             // Tổng hóa đơn được tạo bởi point
  //             total_money_payment_method_from_point: {
  //               $sum: {
  //                 $cond: [
  //                   {
  //                     $eq: [
  //                       "$detailed_total_money_created.payment_method",
  //                       "point"
  //                     ]
  //                   },
  //                   "$detailed_total_money_created.money",
  //                   0
  //                 ]
  //               }
  //             }
  //           }
  //         },
  //         {
  //           $group: {
  //             _id: {},
  //             // Tổng đơn được tạo ra trong ngày (tất cả loại đơn)
  //             total_orders_created: {
  //               $sum: "$total_orders_created"
  //             },
  //             // Tổng giá trị giao dịch (total_gmv_done là chỉ tính đơn hoàn thành)
  //             total_gmv: {
  //               $sum: "$total_gmv"
  //             },
  //             // Tổng thu hộ dịch dự kiến
  //             total_projected_service_collection_amount: {
  //               $sum: "$total_projected_service_collection_amount"
  //             },
  //             // Tổng doanh thu dự kiến
  //             total_projected_revenue: {
  //               $sum: "$total_projected_revenue"
  //             },
  //             // Tổng tiền giảm giá dự kiến
  //             total_projected_discount: {
  //               $sum: "$total_projected_discount"
  //             },
        
  //             // Tổng tiền doanh thu thuần dự kiến
  //             total_projected_net_revenue: {
  //               $sum: "$total_projected_net_revenue"
  //             },
  //             // Tổng tiền hóa đơn dự kiến
  //             total_projected_invoice: {
  //               $sum: "$total_projected_invoice"
  //             },
  //             // Tổng phí áp dụng dự kiến
  //             total_projected_applied_fees: {
  //               $sum: "$total_projected_applied_fees"
  //             },
  //             // Tổng tiền thuế dự kiến
  //             total_projected_value_added_tax: {
  //               $sum: "$total_projected_value_added_tax"
  //             },
  //             // Tổng lợi nhuận dự kiến
  //             total_projected_profit: {
  //               $sum: "$total_projected_profit"
  //             },
  //             // Tổng lợi nhuận sau thuế dự kiến
  //             total_projected_profit_after_tax: {
  //               $sum: "$total_projected_profit_after_tax"
  //             },
  //             // Tiền hoàn lại
  //             total_money_canceled: {
  //               $sum: "$total_money_canceled"
  //             },
  //             // Tổng hóa đơn được tạo bởi ngân hàng
  //             total_money_payment_method_from_bank: {
  //               $sum: "$total_money_payment_method_from_bank"
  //             },
  //             // Tổng hóa đơn được tạo bởi vnpay
  //             total_money_payment_method_from_vnpay: {
  //               $sum: "$total_money_payment_method_from_vnpay"
  //             },
  //             // Tổng hóa đơn được tạo bởi vnbank
  //             total_money_payment_method_from_vnbank: {
  //               $sum: "$total_money_payment_method_from_vnbank"
  //             },
  //             // Tổng hóa đơn được tạo bởi intcard
  //             total_money_payment_method_from_intcard: {
  //               $sum: "$total_money_payment_method_from_intcard"
  //             },
  //             // Tổng hóa đơn được tạo bởi momo
  //             total_money_payment_method_from_momo: {
  //               $sum: "$total_money_payment_method_from_momo"
  //             },
  //             // Tổng hóa đơn được tạo bởi cash
  //             total_money_payment_method_from_cash: {
  //               $sum: "$total_money_payment_method_from_cash"
  //             },
  //             // Tổng hóa đơn được tạo bởi point
  //             total_money_payment_method_from_point: {
  //               $sum: "$total_money_payment_method_from_point"
  //             }
  //           }
  //         }
  //       ]
  //     );

      // const count = await this.reportRepositoryService.aggregateQuery([
      //   {
      //       $match: query
      //   },
      //   { $count: 'total' },
      // ])

  //     const result = {
  //         start: iPage.start,
  //         length: iPage.length,
  //         data: getDetailReportOrderActivityData || [],
  //         totalItem: totalItem || [],
  //         total: count[0].total || 0,
  //     };
  //     return result;

  //   } catch (err) {
  //     throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
  //   }
  // }

  async getDetailReportOrderActivity(lang, iPage) {
    try {
      let query: any = {
        $and: [
                { is_delete: false },
                { 
                  date_work: {
                    $gte: iPage.start_date,
                    $lte: iPage.end_date
                  }
                },
                {
                  is_duplicate: false
                }
            ]
      }
      if (iPage.status) {
        query.$and.push({ status: iPage.status });
      }
      const getDetailReportOrderActivityData = await this.orderRepositoryService.aggregateQuery(
        [
          {
            $match: query
          },
          {
            $addFields: {
              tempServiceFee: {
                $sum: { $sum: "$service_fee.fee" }
              }
            }
          },
          {
            $group: {
              _id: "$_id",
              date_work: { $first: "$date_work" },
              id_view: { $first: "$id_view" },
              status: { $first: "$status" },
              // Giá trị giao dịch
              total_gmv: { $sum: "$total_fee" },
              // Thu hộ dịch vụ
              total_projected_service_collection_amount: {
                $sum: "$net_income"
              },
              // Giảm giá
              total_projected_discount: {
                $sum: "$total_discount"
              },
              // Phí áp dụng
              total_projected_applied_fees: {
                $sum: "$tempServiceFee"
              },
              // Thuế
              total_projected_value_added_tax: {
                $sum: "$value_added_tax"
              },

              total_money_payment_method_from_bank: {
                $sum: {
                  $cond: {
                    if: {
                      $eq: ["$payment_method", "bank"]
                    },
                    then: "$final_fee",
                    else: 0
                  }
                }
              },
              total_money_payment_method_from_vnpay: {
                $sum: {
                  $cond: {
                    if: {
                      $eq: ["$payment_method", "vnpay"]
                    },
                    then: "$final_fee",
                    else: 0
                  }
                }
              },
              total_money_payment_method_from_vnbank: {
                $sum: {
                  $cond: {
                    if: {
                      $eq: ["$payment_method", "vnbank"]
                    },
                    then: "$final_fee",
                    else: 0
                  }
                }
              },
              total_money_payment_method_from_intcard: {
                $sum: {
                  $cond: {
                    if: {
                      $eq: ["$payment_method", "intcard"]
                    },
                    then: "$final_fee",
                    else: 0
                  }
                }
              },
              total_money_payment_method_from_momo: {
                $sum: {
                  $cond: {
                    if: {
                      $eq: ["$payment_method", "momo"]
                    },
                    then: "$final_fee",
                    else: 0
                  }
                }
              },
              total_money_payment_method_from_cash: {
                $sum: {
                  $cond: {
                    if: {
                      $eq: ["$payment_method", "cash"]
                    },
                    then: "$final_fee",
                    else: 0
                  }
                }
              },
              total_money_payment_method_from_point: {
                $sum: {
                  $cond: {
                    if: {
                      $eq: ["$payment_method", "point"]
                    },
                    then: "$final_fee",
                    else: 0
                  }
                }
              }
            }
          },
          // Doanh thu
          {
            $addFields: {
              total_projected_revenue: {
                $subtract: [
                  "$total_gmv",
                  "$total_projected_service_collection_amount"
                ]
              }
            }
          },
          // Doanh thu thuan
          {
            $addFields: {
              total_projected_net_revenue: {
                $subtract: [
                  "$total_projected_revenue",
                  "$total_projected_discount"
                ]
              }
            }
          },
          // Hóa đơn dự kiến
          {
            $addFields: {
              total_projected_invoice: {
                $subtract: [
                  "$total_gmv",
                  "$total_projected_discount"
                ]
              }
            }
          },
          // Lợi nhuận
          {
            $addFields: {
              total_projected_profit: {
                $subtract: [
                  "$total_projected_revenue",
                  "$total_projected_discount"
                ]
              }
            }
          },
          // Lợi nhuận sau thuế
          {
            $addFields: {
              total_projected_profit_after_tax: {
                $subtract: [
                  "$total_projected_profit",
                  "$total_projected_value_added_tax"
                ]
              }
            }
          },
          // Lợi nhuận sau thuế
          {
            $addFields: {
              total_projected_profit_after_tax: {
                $subtract: [
                  "$total_projected_profit",
                  "$total_projected_value_added_tax"
                ]
              }
            }
          },
          // % lợi nhuận
          {
            $addFields: {
              profit_percentage_done: {
                $cond: {
                  if: {
                    $eq: ["$total_projected_profit", 0]
                  },
                  then: 0,
                  else: {
                    $round: [
                      {
                        $multiply: [
                          {
                            $divide: [
                              "$total_projected_profit_after_tax",
                              "$total_projected_profit"
                            ]
                          },
                          100
                        ]
                      },
                      2
                    ]
                  }
                }
              }
            }
          },
          // Tiền hoàn lại
          {
            $addFields: {
              total_money_canceled: {
                $cond: {
                  if: {
                    $eq: ["$status", "cancel"]
                  },
                  then: "$total_projected_invoice",
                  else: 0
                }
              }
            }
          },
          {
            $sort: {
              date_work: -1
            }
          },
          { $skip: Number(iPage.start) },
          { $limit: Number(iPage.length) }
        ]
      );

      const totalItem = await this.orderRepositoryService.aggregateQuery(
        [
          {
            $match:query
          },
          {
            $addFields: {
              tempServiceFee: {
                $sum: { $sum: "$service_fee.fee" }
              }
            }
          },
          {
            $group: {
              _id: "$_id",
              date_work: { $first: "$date_work" },
              id_view: { $first: "$id_view" },
              status: { $first: "$status" },
              // Giá trị giao dịch
              total_gmv: { $sum: "$total_fee" },
              // Thu hộ dịch vụ
              total_projected_service_collection_amount: {
                $sum: "$net_income"
              },
              // Giảm giá
              total_projected_discount: {
                $sum: "$total_discount"
              },
              // Phí áp dụng
              total_projected_applied_fees: {
                $sum: "$tempServiceFee"
              },
              // Thuế
              total_projected_value_added_tax: {
                $sum: "$value_added_tax"
              },

              total_money_payment_method_from_bank: {
                $sum: {
                  $cond: {
                    if: {
                      $eq: ["$payment_method", "bank"]
                    },
                    then: "$final_fee",
                    else: 0
                  }
                }
              },
              total_money_payment_method_from_vnpay: {
                $sum: {
                  $cond: {
                    if: {
                      $eq: ["$payment_method", "vnpay"]
                    },
                    then: "$final_fee",
                    else: 0
                  }
                }
              },
              total_money_payment_method_from_vnbank: {
                $sum: {
                  $cond: {
                    if: {
                      $eq: ["$payment_method", "vnbank"]
                    },
                    then: "$final_fee",
                    else: 0
                  }
                }
              },
              total_money_payment_method_from_intcard: {
                $sum: {
                  $cond: {
                    if: {
                      $eq: ["$payment_method", "intcard"]
                    },
                    then: "$final_fee",
                    else: 0
                  }
                }
              },
              total_money_payment_method_from_momo: {
                $sum: {
                  $cond: {
                    if: {
                      $eq: ["$payment_method", "momo"]
                    },
                    then: "$final_fee",
                    else: 0
                  }
                }
              },
              total_money_payment_method_from_cash: {
                $sum: {
                  $cond: {
                    if: {
                      $eq: ["$payment_method", "cash"]
                    },
                    then: "$final_fee",
                    else: 0
                  }
                }
              },
              total_money_payment_method_from_point: {
                $sum: {
                  $cond: {
                    if: {
                      $eq: ["$payment_method", "point"]
                    },
                    then: "$final_fee",
                    else: 0
                  }
                }
              }
            }
          },
          // Doanh thu
          {
            $addFields: {
              total_projected_revenue: {
                $subtract: [
                  "$total_gmv",
                  "$total_projected_service_collection_amount"
                ]
              }
            }
          },
          // Doanh thu thuan
          {
            $addFields: {
              total_projected_net_revenue: {
                $subtract: [
                  "$total_projected_revenue",
                  "$total_projected_discount"
                ]
              }
            }
          },
          // Hóa đơn dự kiến
          {
            $addFields: {
              total_projected_invoice: {
                $subtract: [
                  "$total_gmv",
                  "$total_projected_discount"
                ]
              }
            }
          },
          // Lợi nhuận
          {
            $addFields: {
              total_projected_profit: {
                $subtract: [
                  "$total_projected_revenue",
                  "$total_projected_discount"
                ]
              }
            }
          },
          // Lợi nhuận sau thuế
          {
            $addFields: {
              total_projected_profit_after_tax: {
                $subtract: [
                  "$total_projected_profit",
                  "$total_projected_value_added_tax"
                ]
              }
            }
          },
          // Lợi nhuận sau thuế
          {
            $addFields: {
              total_projected_profit_after_tax: {
                $subtract: [
                  "$total_projected_profit",
                  "$total_projected_value_added_tax"
                ]
              }
            }
          },
          // % lợi nhuận
          {
            $addFields: {
              profit_percentage_done: {
                $cond: {
                  if: {
                    $eq: ["$total_projected_profit", 0]
                  },
                  then: 0,
                  else: {
                    $round: [
                      {
                        $multiply: [
                          {
                            $divide: [
                              "$total_projected_profit_after_tax",
                              "$total_projected_profit"
                            ]
                          },
                          100
                        ]
                      },
                      2
                    ]
                  }
                }
              }
            }
          },
          // Tiền hoàn lại
          {
            $addFields: {
              total_money_canceled: {
                $cond: {
                  if: {
                    $eq: ["$status", "cancel"]
                  },
                  then: "$total_projected_invoice",
                  else: 0
                }
              }
            }
          },
          {
            $group: {
              _id: {},
              total_gmv: {
                $sum: "$total_gmv"
              },
              // Tổng thu hộ dịch dự kiến
              total_projected_service_collection_amount: {
                $sum: "$total_projected_service_collection_amount"
              },
              // Tổng doanh thu dự kiến
              total_projected_revenue: {
                $sum: "$total_projected_revenue"
              },
              // Tổng tiền giảm giá dự kiến
              total_projected_discount: {
                $sum: "$total_projected_discount"
              },
              // Tổng tiền doanh thu thuần dự kiến
              total_projected_net_revenue: {
                $sum: "$total_projected_net_revenue"
              },
              // Tổng tiền hóa đơn dự kiến
              total_projected_invoice: {
                $sum: "$total_projected_invoice"
              },
              // Tổng phí áp dụng dự kiến
              total_projected_applied_fees: {
                $sum: "$total_projected_applied_fees"
              },
              // Tổng tiền thuế dự kiến
              total_projected_value_added_tax: {
                $sum: "$total_projected_value_added_tax"
              },
              // Tổng lợi nhuận dự kiến
              total_projected_profit: {
                $sum: "$total_projected_profit"
              },
              // Tổng lợi nhuận sau thuế dự kiến
              total_projected_profit_after_tax: {
                $sum: "$total_projected_profit_after_tax"
              },
              // Tiền hoàn lại
              total_money_canceled: {
                $sum: "$total_money_canceled"
              },
              // Tổng hóa đơn được tạo bởi ngân hàng
              total_money_payment_method_from_bank: {
                $sum: "$total_money_payment_method_from_bank"
              },
              // Tổng hóa đơn được tạo bởi vnpay
              total_money_payment_method_from_vnpay: {
                $sum: "$total_money_payment_method_from_vnpay"
              },
              // Tổng hóa đơn được tạo bởi vnbank
              total_money_payment_method_from_vnbank: {
                $sum: "$total_money_payment_method_from_vnbank"
              },
              // Tổng hóa đơn được tạo bởi intcard
              total_money_payment_method_from_intcard: {
                $sum: "$total_money_payment_method_from_intcard"
              },
              // Tổng hóa đơn được tạo bởi momo
              total_money_payment_method_from_momo: {
                $sum: "$total_money_payment_method_from_momo"
              },
              // Tổng hóa đơn được tạo bởi cash
              total_money_payment_method_from_cash: {
                $sum: "$total_money_payment_method_from_cash"
              },
              // Tổng hóa đơn được tạo bởi point
              total_money_payment_method_from_point: {
                $sum: "$total_money_payment_method_from_point"
              }
            }
          }
        ]
      );

      const count = await this.orderRepositoryService.aggregateQuery([
        {
            $match: query
        },
        { $count: 'total' },
      ])

      const result = {
        start: iPage.start,
        length: iPage.length,
        data: getDetailReportOrderActivityData || [],
        total: count[0]?.total || 0,
        totalItem: totalItem || [],
      }

      return result;
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
