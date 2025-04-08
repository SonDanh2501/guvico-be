import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { ZNS_SERVICE_FEE } from 'src/@core'
import { PAYMENT_METHOD, STATUS_ORDER, TICKET_STATUS } from 'src/@repositories/module/mongodb/@database/enum'
import { EtelecomService } from 'src/@share-module/etelecom/etelecom.service'
import { OrderOopSystemService } from 'src/core-system/@oop-system/order-oop-system/order-oop-system.service'
import { PunishTicketOopSystemService } from 'src/core-system/@oop-system/punish-ticket-oop-system/punish-ticket-oop-system.service'
import { ReportOopSystemService } from 'src/core-system/@oop-system/report-oop-system/report-oop-system.service'
import { TransactionOopSystemService } from 'src/core-system/@oop-system/transaction-oop-system/transaction-oop-system.service'

@Injectable()
export class ReportSystemService {
    constructor (
        private orderOopSystemService: OrderOopSystemService,
        private reportOopSystemService: ReportOopSystemService,
        private punishTicketOopSystemService: PunishTicketOopSystemService,
        private transactionOopSystemService: TransactionOopSystemService,
        private etelecomService: EtelecomService,
    ) {}

    async reportOrderByCustomer(lang, iPage) {
        try {
            const result = await this.orderOopSystemService.reportOrderByTypeCustomer(lang, iPage)
            return result
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async reportFirstOrderByCustomer(lang, iPage) {
        try {
            const result = await this.orderOopSystemService.reportFirstOrderByTypeCustomer(lang, iPage)
            return result
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async reportTotalOrderByCustomer(lang, iPage) {
        try {
            const result = await this.orderOopSystemService.reportTotalOrderByCustomer(lang, iPage)
            return result
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async reportTotalFirstOrderByCustomer(lang, iPage) {
        try {
            const result = await this.orderOopSystemService.reportTotalFirstOrderByCustomer(lang, iPage)
            return result
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Báo cáo thu chi 
    async reportCashBook(lang, iPage) {
        try {
            const result = await this.reportOopSystemService.getReportCashBook(lang, iPage)
            return result
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
    }
    
    // Báo cáo thu chi của đối tác
    async reportCashBookCollaborator(lang, iPage) {
        try {
            const result = await this.reportOopSystemService.getReportCashBookCollaborator(lang, iPage)
            return result
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // Báo cáo thu chi của khách hàng
    async reportCashBookCustomer(lang, iPage) {
        try {
            const result = await this.reportOopSystemService.getReportCashBookCustomer(lang, iPage)
            return result
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Báo cáo chi tiết thu chi 
    async detailReportCashBook(lang, iPage) {
        try {
            const result = await this.reportOopSystemService.getDetailReportCashBook(lang, iPage)
            return result
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
    }

    // Báo cáo chi tiết thu chi của đối tác
    async detailReportCashBookByCollaborator(lang, iPage) {
        try {
            const result = await this.reportOopSystemService.getDetailReportCashBookCollaborator(lang, iPage)
            return result
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
    }

    // Báo cáo chi tiết thu chi của khách hàng
    async detailReportCashBookByCustomer(lang, iPage) {
        try {
            const result = await this.reportOopSystemService.getDetailReportCashBookCustomer(lang, iPage)
            return result
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
    }

    async generateCustomerSatisfactionReport(startDate, endDate) {
        try {
            return await this.orderOopSystemService.generateCustomerSatisfactionReport(startDate, endDate)
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    async createReportAtMidnight() {
        try {
            const numberOfHours = 24
            const yesterday = new Date(new Date().setDate(new Date().getDate() - 1))
            const year = yesterday.getFullYear()
            const month = yesterday.getMonth()
            const date = yesterday.getDate()
            const lstDataCreate = []
            const lstPaymentMethodCreated = Object.values(PAYMENT_METHOD)
            const lstPaymentMethod = Object.values(PAYMENT_METHOD).filter((e) => e !== PAYMENT_METHOD.cash && e !== PAYMENT_METHOD.point && e !== PAYMENT_METHOD.viettel_money)
            const lstPaymentMethodForCollaborator = ['bank', 'momo']
            for(let i = 0; i < numberOfHours; i++) {
                const startTime = new Date(yesterday.setHours(i, 0, 0, 0)).toISOString()
                const endTime = new Date(yesterday.setHours(i, 59, 59, 999)).toISOString()
                const hour = new Date(yesterday.setHours(i, 0, 0, 0)).getHours()
                const [getListOrderCreated, getListOrderDone, getListOrderCancelled, getListOrderHasPunishTicket, getListIncomeTransactionForCollaborator, getListExpensesTransactionForCollaborator, getListIncomeTransactionForCustomer, getListExpensesTransactionForCustomer] = await Promise.all([
                    this.orderOopSystemService.getListOrderCreatedByTimeFrame(startTime, endTime),
                    this.orderOopSystemService.getListOrderDoneByTimeFrame(startTime, endTime),
                    this.orderOopSystemService.getListOrderCancelledByTimeFrame(startTime, endTime),
                    this.orderOopSystemService.getListOrderHasPunishTicketByTimeFrame(startTime, endTime),
                    this.transactionOopSystemService.getListIncomeTransactionForCollaboratorByTimeFrame(startTime, endTime),
                    this.transactionOopSystemService.getListExpensesTransactionForCollaboratorByTimeFrame(startTime, endTime),
                    this.transactionOopSystemService.getListIncomeTransactionForCustomerByTimeFrame(startTime, endTime),
                    this.transactionOopSystemService.getListExpensesTransactionForCustomerByTimeFrame(startTime, endTime)
                ])

                const lstIdOrder = getListOrderHasPunishTicket.map((e) => e._id)
                const getLstPunishTicket = await this.punishTicketOopSystemService.getListItemByListIdOrder(lstIdOrder)

                let iPage:any = {
                    start_date: startTime,
                    end_date: endTime,
                    length: 100,
                }
                let lstMessageEtelecom = []
                let getListMessage = await this.etelecomService.getListMessages(iPage)
                do {
                    if(getListMessage.messages.length > 0) {
                        lstMessageEtelecom = [...lstMessageEtelecom, ...getListMessage.messages]
                        iPage['after'] = getListMessage.paging['next']
                        getListMessage = await this.etelecomService.getListMessages(iPage)
                    }
                } while(getListMessage.messages.length > 0)

                let totalGMV = 0
                let detailedTotalMoneyCreated = []
                let totalGMVDone = 0
                let totalServiceCollectionAmountDone = 0
                let totalRevenueDone = 0
                let totalDiscountDone = 0
                let totalNetRevenueDone = 0
                let totalInvoiceDone = 0
                let totalApplidFeesDone = 0
                let totalValueAddedTax = 0
                let totalProfitDone = 0
                let totalProfitAfterTaxDone = 0
                let totalOrdersCreated = 0
                let totalOrdersDone = 0
                let totalCancelledOrders = 0
                let totalMoneyCanceled = 0
                let totalPunishTicketsCreated = 0
                let totalPunishTicketsRevoked = 0 // Tổng số phiếu phạt được thu hồi
                let totalPunishTicketsMoney = 0
                let totalPunishTicketsRefunded = 0
                let totalIncome = 0
                let totalExpenses = 0
                let totalIncomeTransactions = 0
                let totalExpensesTransactions = 0
                let totalIncomeFromCustomers = 0
                let totalExpensesForCustomers = 0
                let totalIncomeFromCollaborators = 0
                let totalExpensesForCollaborators = 0
                let detailTotalIncomeFromCustomers:any = []
                let detailTotalExpensesForCustomers:any = []
                let detailTotalIncomeFromCollaborators:any = []
                let detailTotalExpensesForCollaborators:any = []
                let totalProjectedServiceCollectionAmount = 0
                let totalProjectedRevenue = 0
                let totalProjectedDiscount = 0
                let totalProjectedNetRevenue = 0
                let totalProjectedInvoice = 0
                let totalProjectedAppliedFees = 0
                let totalProjectedValueAddedTax = 0
                let totalProjectedProfit = 0
                let totalProjectedProfitAfterTax = 0
                let totalZNSSpending = 0
                let totalSentZNS = 0
                let totalChargeableZNS = 0
                let totalNonChargeableZNS = 0
                let totalSuccessfullZNS = 0
                let totalFailedZNS = 0
                
                // Đơn hàng tạo
                for(let j = 0; j < getListOrderCreated.length; j++) {
                    if(new Date(getListOrderCreated[j].date_create).getHours() === i) {
                        totalGMV += getListOrderCreated[j].total_fee
                        totalOrdersCreated++
                        totalProjectedServiceCollectionAmount += getListOrderCreated[j].net_income
                        let projected_revenue = getListOrderCreated[j].total_fee - getListOrderCreated[j].net_income
                        let projected_net_revenue = projected_revenue - getListOrderCreated[j].total_discount
                        totalProjectedRevenue += projected_revenue
                        totalProjectedDiscount += getListOrderCreated[j].total_discount
                        totalProjectedNetRevenue += projected_net_revenue
                        totalProjectedInvoice += (getListOrderCreated[j].total_fee - getListOrderCreated[j].total_discount)
                        totalProjectedAppliedFees +=  (getListOrderCreated[j].service_fee[0]?.fee || 0)
                        totalProjectedValueAddedTax += getListOrderCreated[j].value_added_tax
                        totalProjectedProfit += projected_net_revenue
                        totalProjectedProfitAfterTax += (projected_net_revenue - getListOrderCreated[j].value_added_tax)
                    }
                }
                // Đơn hàng hoàn thành
                for(let j = 0; j < getListOrderDone.length; j++) {
                    if(new Date(getListOrderDone[j].completion_date).getHours() === i && getListOrderDone[j].status === STATUS_ORDER.done) {
                        totalOrdersDone++
                        totalGMVDone += getListOrderDone[j].total_fee
                        totalServiceCollectionAmountDone += getListOrderDone[j].net_income
                        let revenue_done = getListOrderDone[j].total_fee - getListOrderDone[j].net_income
                        let net_revenue_done = revenue_done - getListOrderDone[j].total_discount
                        totalRevenueDone += revenue_done
                        totalDiscountDone += getListOrderDone[j].total_discount
                        totalNetRevenueDone += net_revenue_done
                        totalInvoiceDone += (getListOrderDone[j].total_fee - getListOrderDone[j].total_discount)
                        totalApplidFeesDone +=  (getListOrderDone[j].service_fee[0]?.fee || 0)
                        totalValueAddedTax += getListOrderDone[j].value_added_tax
                        totalProfitDone += net_revenue_done
                        totalProfitAfterTaxDone += (net_revenue_done - getListOrderDone[j].value_added_tax)
                    }
                }
                // Đơn hàng hủy
                for(let j = 0; j < getListOrderCancelled.length; j++) {
                    if(new Date(getListOrderCancelled[j].cancellation_date).getHours() === i) {
                        totalCancelledOrders++
                        totalMoneyCanceled += getListOrderCancelled[j].final_fee
                    }
                }
                // Đơn hàng có phiếu phạt
                for(let j = 0; j < getListOrderHasPunishTicket.length; j++) {
                    // Phiếu phạt
                    const listPunishTicketByOrder = getLstPunishTicket.filter((e) => e.id_order.toString() === getListOrderHasPunishTicket[j]._id.toString()) 

                    for(let m = 0; m < listPunishTicketByOrder.length; m++) {
                        if(new Date(listPunishTicketByOrder[m].date_create).getHours() === i) {
                            totalPunishTicketsCreated++
                            totalPunishTicketsMoney += listPunishTicketByOrder[m].punish_money
                        }

                        if(listPunishTicketByOrder[m].status === TICKET_STATUS.revoke && new Date(listPunishTicketByOrder[m]?.revocation_date).getHours() === i) {
                            totalPunishTicketsRevoked++
                            totalPunishTicketsRefunded += listPunishTicketByOrder[m].punish_money
                        }
                    }
                }

                // Tổng tiền các đơn hàng tạo mới theo từng phương thức
                for(let paymentMethod of lstPaymentMethodCreated) {
                    const item:any = {}
                    item.payment_method = paymentMethod
                    item.money = 0
                    for(let m = 0; m < getListOrderCreated.length; m++) {
                        if(new Date(getListOrderCreated[m].date_create).getHours() === i && getListOrderCreated[m].payment_method === paymentMethod){                   
                            item.money += getListOrderCreated[m].final_fee
                        }
                    }
                    detailedTotalMoneyCreated.push(item)
                }

                // Thu chi
                // Khách hàng
                for(let paymentMethod of lstPaymentMethod) {
                    const item:any = {}
                    item.payment_method = paymentMethod
                    item.money = 0
                    for(let m = 0; m < getListIncomeTransactionForCustomer.length; m++) {
                        if(getListIncomeTransactionForCustomer[m].payment_out === paymentMethod) {
                            item.money += getListIncomeTransactionForCustomer[m].money
                            totalIncomeTransactions++
                            totalIncome += getListIncomeTransactionForCustomer[m].money
                            totalIncomeFromCustomers += getListIncomeTransactionForCustomer[m].money
                        }
                    }
                    detailTotalIncomeFromCustomers.push(item)
                }

                for(let m = 0; m < getListExpensesTransactionForCustomer.length; m++) {
                    totalExpensesTransactions++
                    totalExpenses += getListExpensesTransactionForCustomer[m].money
                    totalExpensesForCustomers += getListExpensesTransactionForCustomer[m].money
                }
                detailTotalExpensesForCustomers.push({ payment_method: 'bank', money: totalExpensesForCustomers })

                // Đối tác
                for(let paymentMethod of lstPaymentMethodForCollaborator) {
                    const item:any = {}
                    item.payment_method = paymentMethod
                    item.money = 0
                    for(let n = 0; n < getListIncomeTransactionForCollaborator.length; n++) {
                        if(getListIncomeTransactionForCollaborator[n].payment_out === paymentMethod) {
                            item.money += getListIncomeTransactionForCollaborator[n].money
                        }
                        totalIncomeTransactions++
                        totalIncome += getListIncomeTransactionForCollaborator[n].money
                        totalIncomeFromCollaborators += getListIncomeTransactionForCollaborator[n].money
                    }
                    detailTotalIncomeFromCollaborators.push(item)
                }

                for(let m = 0; m < getListExpensesTransactionForCollaborator.length; m++) {
                    totalExpensesTransactions++
                    totalExpenses += getListExpensesTransactionForCollaborator[m].money
                    totalExpensesForCollaborators += getListExpensesTransactionForCollaborator[m].money
                }
                detailTotalExpensesForCollaborators.push({ payment_method: 'bank', money: totalExpensesForCollaborators })

                // ZNS
                totalSentZNS = lstMessageEtelecom.length
                for(let j = 0; j < lstMessageEtelecom.length; j++) {
                    if(lstMessageEtelecom[j].error_code === 0) {
                        totalSuccessfullZNS++
                    }
                    if(lstMessageEtelecom[j].error_code !== 0) {
                        totalFailedZNS++
                    }
                    if(lstMessageEtelecom[j].is_charged === true) {
                        totalChargeableZNS++
                    }
                    if(lstMessageEtelecom[j].error_code === 0 && lstMessageEtelecom[j].is_charged === false) {
                        totalNonChargeableZNS++
                    }
                }

                totalZNSSpending = totalChargeableZNS * ZNS_SERVICE_FEE

                const payloadCreate = {
                    date_create: new Date(Date.now()).toISOString(),
                    time_start_report: startTime,
                    time_end_report: endTime,
                    year: year,
                    month: month,
                    day: date,
                    hour: hour,
                    total_gmv: totalGMV,
                    detailed_total_money_created: detailedTotalMoneyCreated,
                    total_gmv_done: totalGMVDone,
                    total_service_collection_amount_done: totalServiceCollectionAmountDone,
                    total_revenue_done: totalRevenueDone,
                    total_discount_done: totalDiscountDone,
                    total_net_revenue_done: totalNetRevenueDone,
                    total_invoice_done: totalInvoiceDone,
                    total_applied_fees_done: totalApplidFeesDone,
                    total_value_added_tax: totalValueAddedTax,
                    total_profit_done: totalProfitDone,
                    total_profit_after_tax_done: totalProfitAfterTaxDone,
                    total_orders_created: totalOrdersCreated,
                    total_orders_done: totalOrdersDone,
                    total_cancelled_orders: totalCancelledOrders,
                    total_money_canceled: totalMoneyCanceled,
                    total_punish_tickets_created: totalPunishTicketsCreated,
                    total_punish_tickets_revoked: totalPunishTicketsRevoked,
                    total_punish_tickets_money: totalPunishTicketsMoney,
                    total_punish_tickets_refunded: totalPunishTicketsRefunded,
                    total_income_transactions: totalIncomeTransactions,
                    total_expenses_transactions: totalExpensesTransactions,
                    total_income: totalIncome,
                    total_expenses: totalExpenses,
                    total_income_from_customers: totalIncomeFromCustomers,
                    total_expenses_for_customers: totalExpensesForCustomers,
                    total_income_from_collaborators: totalIncomeFromCollaborators,
                    total_expenses_for_collaborators: totalExpensesForCollaborators,
                    detailed_total_income_from_customers: detailTotalIncomeFromCustomers,
                    detailed_total_expenses_for_customers: detailTotalExpensesForCustomers,
                    detailed_total_income_from_collaborators: detailTotalIncomeFromCollaborators,
                    detailed_total_expenses_for_collaborators: detailTotalExpensesForCollaborators,
                    total_projected_service_collection_amount: totalServiceCollectionAmountDone,
                    total_projected_revenue: totalRevenueDone,
                    total_projected_discount: totalDiscountDone,
                    total_projected_net_revenue: totalNetRevenueDone,
                    total_projected_invoice: totalInvoiceDone,
                    total_projected_applied_fees: totalApplidFeesDone,
                    total_projected_value_added_tax: totalValueAddedTax,
                    total_projected_profit: totalProfitDone,
                    total_projected_profit_after_tax: totalProfitAfterTaxDone,
                    total_zns_spending: totalZNSSpending,
                    total_sent_zns: totalSentZNS,
                    total_chargeable_zns: totalChargeableZNS,
                    total_non_chargeable_zns: totalNonChargeableZNS,
                    total_successful_zns: totalSuccessfullZNS,
                    total_failed_zns: totalFailedZNS
                }

                lstDataCreate.push(payloadCreate)
            }

            await this.reportOopSystemService.createManyItems(lstDataCreate)

            console.log('createReportAtMidnight is done');

            return true
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async createReportAtMidnightByCallApi() {
        try {
            const lstDate = []
            const lstPaymentMethodCreated = Object.values(PAYMENT_METHOD).filter((e) => e !== PAYMENT_METHOD.viettel_money)
            const lstPaymentMethod = Object.values(PAYMENT_METHOD).filter((e) => e !== PAYMENT_METHOD.cash && e !== PAYMENT_METHOD.point && e !== PAYMENT_METHOD.viettel_money)
            
            const lstPaymentMethodForCollaborator = ['bank', 'momo']
            // let date1 = '2025-02-16T17:00:00.000Z'
            // let date1 = '2023-01-20T00:00:00.000Z'
            let date1 = '2022-12-20T17:00:27.880Z' // Ngày đẩu tiên bắt đầu hoạt động
            lstDate.push(date1)
            do {
                date1 = new Date(new Date(date1).setDate(new Date(date1).getDate() + 1)).toISOString()
                lstDate.push(date1)
            } while(new Date(date1).getTime() < Date.now())

            // console.log(lstDate);
            
            for(let k = 0; k < lstDate.length; k++) {
                const lstTask:any = []
                const lstDataCreate = []
                const numberOfHours = 24
                const yesterday = new Date(lstDate[k])
                // const yesterday = new Date(new Date().setDate(new Date().getDate() - 1))
                const year = yesterday.getFullYear()
                const month = yesterday.getMonth()
                const date = yesterday.getDate()
                for(let i = 0; i < numberOfHours; i++) {
                    const startTime = new Date(yesterday.setHours(i, 0, 0, 0)).toISOString()
                    const endTime = new Date(yesterday.setHours(i, 59, 59, 999)).toISOString()
                    console.log('startTime', startTime);
                    console.log('endTime', endTime);
                    
                    const hour = new Date(yesterday.setHours(i, 0, 0, 0)).getHours()
                    const [getListOrderCreated, getListOrderDone, getListOrderCancelled, getListOrderHasPunishTicket, getListIncomeTransactionForCollaborator, getListExpensesTransactionForCollaborator, getListIncomeTransactionForCustomer, getListExpensesTransactionForCustomer] = await Promise.all([
                        this.orderOopSystemService.getListOrderCreatedByTimeFrame(startTime, endTime),
                        this.orderOopSystemService.getListOrderDoneByTimeFrame(startTime, endTime),
                        this.orderOopSystemService.getListOrderCancelledByTimeFrame(startTime, endTime),
                        this.orderOopSystemService.getListOrderHasPunishTicketByTimeFrame(startTime, endTime),
                        this.transactionOopSystemService.getListIncomeTransactionForCollaboratorByTimeFrame(startTime, endTime),
                        this.transactionOopSystemService.getListExpensesTransactionForCollaboratorByTimeFrame(startTime, endTime),
                        this.transactionOopSystemService.getListIncomeTransactionForCustomerByTimeFrame(startTime, endTime),
                        this.transactionOopSystemService.getListExpensesTransactionForCustomerByTimeFrame(startTime, endTime)
                    ])
                    const lstIdOrder = getListOrderHasPunishTicket.map((e) => e._id)
                    const getLstPunishTicket = await this.punishTicketOopSystemService.getListItemByListIdOrder(lstIdOrder)
    
                    let iPage:any = {
                        start_date: startTime,
                        end_date: endTime,
                        length: 100,
                    }
                    let lstMessageEtelecom = []
                    let getListMessage = await this.etelecomService.getListMessages(iPage)
                    do {
                        if(getListMessage.messages.length > 0) {
                            lstMessageEtelecom = [...lstMessageEtelecom, ...getListMessage.messages]
                            iPage['after'] = getListMessage.paging['next']
                            getListMessage = await this.etelecomService.getListMessages(iPage)
                        }
                    } while(getListMessage.messages.length > 0)

                    let totalGMV = 0
                    let detailedTotalMoneyCreated = []
                    let totalGMVDone = 0
                    let totalServiceCollectionAmountDone = 0
                    let totalRevenueDone = 0
                    let totalDiscountDone = 0
                    let totalNetRevenueDone = 0
                    let totalInvoiceDone = 0
                    let totalApplidFeesDone = 0
                    let totalValueAddedTax = 0
                    let totalProfitDone = 0
                    let totalProfitAfterTaxDone = 0
                    let totalOrdersCreated = 0
                    let totalOrdersDone = 0
                    let totalCancelledOrders = 0
                    let totalMoneyCanceled = 0
                    let totalPunishTicketsCreated = 0
                    let totalPunishTicketsRevoked = 0 // Tổng số phiếu phạt được thu hồi
                    let totalPunishTicketsMoney = 0
                    let totalPunishTicketsRefunded = 0
                    let totalIncome = 0
                    let totalExpenses = 0
                    let totalIncomeTransactions = 0
                    let totalExpensesTransactions = 0
                    let totalIncomeFromCustomers = 0
                    let totalExpensesForCustomers = 0
                    let totalIncomeFromCollaborators = 0
                    let totalExpensesForCollaborators = 0
                    let detailTotalIncomeFromCustomers:any = []
                    let detailTotalExpensesForCustomers:any = []
                    let detailTotalIncomeFromCollaborators:any = []
                    let detailTotalExpensesForCollaborators:any = []
                    let totalProjectedServiceCollectionAmount = 0
                    let totalProjectedRevenue = 0
                    let totalProjectedDiscount = 0
                    let totalProjectedNetRevenue = 0
                    let totalProjectedInvoice = 0
                    let totalProjectedAppliedFees = 0
                    let totalProjectedValueAddedTax = 0
                    let totalProjectedProfit = 0
                    let totalProjectedProfitAfterTax = 0
                    let totalZNSSpending = 0
                    let totalSentZNS = 0
                    let totalChargeableZNS = 0
                    let totalNonChargeableZNS = 0
                    let totalSuccessfullZNS = 0
                    let totalFailedZNS = 0
                    
                    // Đơn hàng tạo
                    for(let j = 0; j < getListOrderCreated.length; j++) {
                        if(new Date(getListOrderCreated[j].date_create).getHours() === i) {
                            totalGMV += getListOrderCreated[j].total_fee
                            totalOrdersCreated++
                            totalProjectedServiceCollectionAmount += getListOrderCreated[j].net_income
                            let projected_revenue = getListOrderCreated[j].total_fee - getListOrderCreated[j].net_income
                            let projected_net_revenue = projected_revenue - getListOrderCreated[j].total_discount
                            totalProjectedRevenue += projected_revenue
                            totalProjectedDiscount += getListOrderCreated[j].total_discount
                            totalProjectedNetRevenue += projected_net_revenue
                            totalProjectedInvoice += (getListOrderCreated[j].total_fee - getListOrderCreated[j].total_discount)
                            totalProjectedAppliedFees +=  (getListOrderCreated[j].service_fee[0]?.fee || 0)
                            totalProjectedValueAddedTax += getListOrderCreated[j].value_added_tax
                            totalProjectedProfit += projected_net_revenue
                            totalProjectedProfitAfterTax += (projected_net_revenue - getListOrderCreated[j].value_added_tax)
                        }
                    }
                    // Đơn hàng hoàn thành
                    for(let j = 0; j < getListOrderDone.length; j++) {
                        if(new Date(getListOrderDone[j].completion_date).getHours() === i && getListOrderDone[j].status === STATUS_ORDER.done) {
                            totalOrdersDone++
                            totalGMVDone += getListOrderDone[j].total_fee
                            totalServiceCollectionAmountDone += getListOrderDone[j].net_income
                            let revenue_done = getListOrderDone[j].total_fee - getListOrderDone[j].net_income
                            let net_revenue_done = revenue_done - getListOrderDone[j].total_discount
                            totalRevenueDone += revenue_done
                            totalDiscountDone += getListOrderDone[j].total_discount
                            totalNetRevenueDone += net_revenue_done
                            totalInvoiceDone += (getListOrderDone[j].total_fee - getListOrderDone[j].total_discount)
                            totalApplidFeesDone +=  (getListOrderDone[j].service_fee[0]?.fee || 0)
                            totalValueAddedTax += getListOrderDone[j].value_added_tax
                            totalProfitDone += net_revenue_done
                            totalProfitAfterTaxDone += (net_revenue_done - getListOrderDone[j].value_added_tax)
                        }
                    }
                    // Đơn hàng hủy
                    for(let j = 0; j < getListOrderCancelled.length; j++) {
                        if(new Date(getListOrderCancelled[j].cancellation_date).getHours() === i) {
                            totalCancelledOrders++
                            totalMoneyCanceled += getListOrderCancelled[j].final_fee
                        }
                    }
                    // Đơn hàng có phiếu phạt
                    for(let j = 0; j < getListOrderHasPunishTicket.length; j++) {
                        // Phiếu phạt
                        const listPunishTicketByOrder = getLstPunishTicket.filter((e) => e.id_order.toString() === getListOrderHasPunishTicket[j]._id.toString()) 

                        for(let m = 0; m < listPunishTicketByOrder.length; m++) {
                            if(new Date(listPunishTicketByOrder[m].date_create).getHours() === i) {
                                totalPunishTicketsCreated++
                                totalPunishTicketsMoney += listPunishTicketByOrder[m].punish_money
                            }

                            if(listPunishTicketByOrder[m].status === TICKET_STATUS.revoke && new Date(listPunishTicketByOrder[m]?.revocation_date).getHours() === i) {
                                totalPunishTicketsRevoked++
                                totalPunishTicketsRefunded += listPunishTicketByOrder[m].punish_money
                            }
                        }
                    }

                    // Tổng tiền các đơn hàng tạo mới theo từng phương thức
                    for(let paymentMethod of lstPaymentMethodCreated) {
                        const item:any = {}
                        item.payment_method = paymentMethod
                        item.money = 0
                        for(let m = 0; m < getListOrderCreated.length; m++) {
                            if(new Date(getListOrderCreated[m].date_create).getHours() === i && getListOrderCreated[m].payment_method === paymentMethod){                   
                                item.money += getListOrderCreated[m].final_fee
                            }
                        }
                        detailedTotalMoneyCreated.push(item)
                    }

                    // Thu chi
                    // Khách hàng
                    for(let paymentMethod of lstPaymentMethod) {
                        const item:any = {}
                        item.payment_method = paymentMethod
                        item.money = 0
                        for(let m = 0; m < getListIncomeTransactionForCustomer.length; m++) {
                            if(getListIncomeTransactionForCustomer[m].payment_out === paymentMethod) {
                                item.money += getListIncomeTransactionForCustomer[m].money
                                totalIncomeTransactions++
                                totalIncome += getListIncomeTransactionForCustomer[m].money
                                totalIncomeFromCustomers += getListIncomeTransactionForCustomer[m].money
                            }
                        }
                        detailTotalIncomeFromCustomers.push(item)
                    }

                    for(let m = 0; m < getListExpensesTransactionForCustomer.length; m++) {
                        totalExpensesTransactions++
                        totalExpenses += getListExpensesTransactionForCustomer[m].money
                        totalExpensesForCustomers += getListExpensesTransactionForCustomer[m].money
                    }
                    detailTotalExpensesForCustomers.push({ payment_method: 'bank', money: totalExpensesForCustomers })

                    // Đối tác
                    for(let paymentMethod of lstPaymentMethodForCollaborator) {
                        const item:any = {}
                        item.payment_method = paymentMethod
                        item.money = 0
                        for(let m = 0; m < getListIncomeTransactionForCollaborator.length; m++) {
                            if(getListIncomeTransactionForCollaborator[m].payment_out === paymentMethod) {
                                item.money += getListIncomeTransactionForCollaborator[m].money
                                totalIncomeTransactions++
                                totalIncome += getListIncomeTransactionForCollaborator[m].money
                                totalIncomeFromCollaborators += getListIncomeTransactionForCollaborator[m].money
                            }
                        }
                        detailTotalIncomeFromCollaborators.push(item)
                    }

                    for(let m = 0; m < getListExpensesTransactionForCollaborator.length; m++) {
                        totalExpensesTransactions++
                        totalExpenses += getListExpensesTransactionForCollaborator[m].money
                        totalExpensesForCollaborators += getListExpensesTransactionForCollaborator[m].money
                    }
                    detailTotalExpensesForCollaborators.push({ payment_method: 'bank', money: totalExpensesForCollaborators })

                    // ZNS
                    totalSentZNS = lstMessageEtelecom.length
                    for(let j = 0; j < lstMessageEtelecom.length; j++) {
                        if(lstMessageEtelecom[j].error_code === 0) {
                            totalSuccessfullZNS++
                        }
                        if(lstMessageEtelecom[j].error_code !== 0) {
                            totalFailedZNS++
                        }
                        if(lstMessageEtelecom[j].is_charged === true) {
                            totalChargeableZNS++
                        }
                        if(lstMessageEtelecom[j].error_code === 0 && lstMessageEtelecom[j].is_charged === false) {
                            totalNonChargeableZNS++
                        }
                    }

                    totalZNSSpending = totalChargeableZNS * ZNS_SERVICE_FEE

                    const getReport = await this.reportOopSystemService.getReportByTimeFrame(startTime, endTime)
    

                    if(getReport) {
                        getReport.year = year
                        getReport.month = month
                        getReport.day = date
                        getReport.hour = hour
                        getReport.total_gmv = totalGMV
                        getReport.detailed_total_money_created = detailedTotalMoneyCreated
                        getReport.total_gmv_done = totalGMVDone
                        getReport.total_service_collection_amount_done = totalServiceCollectionAmountDone
                        getReport.total_revenue_done = totalRevenueDone
                        getReport.total_discount_done = totalDiscountDone
                        getReport.total_net_revenue_done = totalNetRevenueDone
                        getReport.total_invoice_done = totalInvoiceDone
                        getReport.total_applied_fees_done = totalApplidFeesDone
                        getReport.total_value_added_tax = totalValueAddedTax
                        getReport.total_profit_done = totalProfitDone
                        getReport.total_profit_after_tax_done = totalProfitAfterTaxDone
                        getReport.total_orders_created = totalOrdersCreated
                        getReport.total_orders_done = totalOrdersDone
                        getReport.total_cancelled_orders = totalCancelledOrders
                        getReport.total_money_canceled = totalMoneyCanceled
                        getReport.total_punish_tickets_created = totalPunishTicketsCreated
                        getReport.total_punish_tickets_revoked = totalPunishTicketsRevoked
                        getReport.total_punish_tickets_money = totalPunishTicketsMoney
                        getReport.total_punish_tickets_refunded = totalPunishTicketsRefunded
                        getReport.total_income_transactions = totalIncomeTransactions
                        getReport.total_expenses_transactions = totalExpensesTransactions
                        getReport.total_income = totalIncome
                        getReport.total_expenses = totalExpenses
                        getReport.total_income_from_customers = totalIncomeFromCustomers
                        getReport.total_expenses_for_customers = totalExpensesForCustomers
                        getReport.total_income_from_collaborators = totalIncomeFromCollaborators
                        getReport.total_expenses_for_collaborators = totalExpensesForCollaborators
                        getReport.detailed_total_income_from_customers = detailTotalIncomeFromCustomers
                        getReport.detailed_total_expenses_for_customers = detailTotalExpensesForCustomers
                        getReport.detailed_total_income_from_collaborators = detailTotalIncomeFromCollaborators
                        getReport.detailed_total_expenses_for_collaborators = detailTotalExpensesForCollaborators
                        getReport.total_projected_service_collection_amount = totalServiceCollectionAmountDone
                        getReport.total_projected_revenue = totalRevenueDone
                        getReport.total_projected_discount = totalDiscountDone
                        getReport.total_projected_net_revenue = totalNetRevenueDone
                        getReport.total_projected_invoice = totalInvoiceDone
                        getReport.total_projected_applied_fees = totalApplidFeesDone
                        getReport.total_projected_value_added_tax = totalValueAddedTax
                        getReport.total_projected_profit = totalProfitDone
                        getReport.total_projected_profit_after_tax = totalProfitAfterTaxDone
                        getReport.total_zns_spending = totalZNSSpending
                        getReport.total_sent_zns = totalSentZNS
                        getReport.total_chargeable_zns = totalChargeableZNS
                        getReport.total_non_chargeable_zns = totalNonChargeableZNS
                        getReport.total_successful_zns = totalSuccessfullZNS
                        getReport.total_failed_zns = totalFailedZNS

                        lstTask.push(this.reportOopSystemService.updateReport('vi', getReport))
                    } else {
                        const payloadCreate = {
                            date_create: new Date(Date.now()).toISOString(),
                            time_start_report: startTime,
                            time_end_report: endTime,
                            year: year,
                            month: month,
                            day: date,
                            hour: hour,
                            total_gmv: totalGMV,
                            detailed_total_money_created: detailedTotalMoneyCreated,
                            total_gmv_done: totalGMVDone,
                            total_service_collection_amount_done: totalServiceCollectionAmountDone,
                            total_revenue_done: totalRevenueDone,
                            total_discount_done: totalDiscountDone,
                            total_net_revenue_done: totalNetRevenueDone,
                            total_invoice_done: totalInvoiceDone,
                            total_applied_fees_done: totalApplidFeesDone,
                            total_value_added_tax: totalValueAddedTax,
                            total_profit_done: totalProfitDone,
                            total_profit_after_tax_done: totalProfitAfterTaxDone,
                            total_orders_created: totalOrdersCreated,
                            total_orders_done: totalOrdersDone,
                            total_cancelled_orders: totalCancelledOrders,
                            total_money_canceled: totalMoneyCanceled,
                            total_punish_tickets_created: totalPunishTicketsCreated,
                            total_punish_tickets_revoked: totalPunishTicketsRevoked,
                            total_punish_tickets_money: totalPunishTicketsMoney,
                            total_punish_tickets_refunded: totalPunishTicketsRefunded,
                            total_income_transactions: totalIncomeTransactions,
                            total_expenses_transactions: totalExpensesTransactions,
                            total_income: totalIncome,
                            total_expenses: totalExpenses,
                            total_income_from_customers: totalIncomeFromCustomers,
                            total_expenses_for_customers: totalExpensesForCustomers,
                            total_income_from_collaborators: totalIncomeFromCollaborators,
                            total_expenses_for_collaborators: totalExpensesForCollaborators,
                            detailed_total_income_from_customers: detailTotalIncomeFromCustomers,
                            detailed_total_expenses_for_customers: detailTotalExpensesForCustomers,
                            detailed_total_income_from_collaborators: detailTotalIncomeFromCollaborators,
                            detailed_total_expenses_for_collaborators: detailTotalExpensesForCollaborators,
                            total_projected_service_collection_amount: totalServiceCollectionAmountDone,
                            total_projected_revenue: totalRevenueDone,
                            total_projected_discount: totalDiscountDone,
                            total_projected_net_revenue: totalNetRevenueDone,
                            total_projected_invoice: totalInvoiceDone,
                            total_projected_applied_fees: totalApplidFeesDone,
                            total_projected_value_added_tax: totalValueAddedTax,
                            total_projected_profit: totalProfitDone,
                            total_projected_profit_after_tax: totalProfitAfterTaxDone,
                            total_zns_spending: totalZNSSpending,
                            total_sent_zns: totalSentZNS,
                            total_chargeable_zns: totalChargeableZNS,
                            total_non_chargeable_zns: totalNonChargeableZNS,
                            total_successful_zns: totalSuccessfullZNS,
                            total_failed_zns: totalFailedZNS
                        }
        
                        lstDataCreate.push(payloadCreate)
                    }
                }
    
                await this.reportOopSystemService.createManyItems(lstDataCreate)
                await Promise.all(lstTask)
            }


            return true
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    async getReportByTimeFrame(startTime, endTime) {
        try {
            return await this.reportOopSystemService.getReportByTimeFrame(startTime, endTime)
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);

        }
    }

    // Báo cáo hoạt động đơn hàng
    async reportOrderActivity(lang, iPage) {
        try {
            const result = await this.reportOopSystemService.getReportOrderActivity(lang, iPage)
            return result
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Báo cáo chi tiết hoạt động đơn hàng
    async reportDetailOrderActivity(lang, iPage) {
        try {
            const result = await this.reportOopSystemService.getDetailReportOrderActivity(lang, iPage)
            return result
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}