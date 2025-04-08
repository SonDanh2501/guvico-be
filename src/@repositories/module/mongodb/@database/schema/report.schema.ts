import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { BaseEntity } from '../entity/base.entity'

export type ReportDocument = Report & Document;

@Schema()
export class Report extends BaseEntity {
  @Prop({ default: new Date(Date.now()).toISOString() })
  date_create: string;

  @Prop({ required: true, default: null })
  time_start_report: string;

  @Prop({ required: true, default: null })
  time_end_report: string;
  
  @Prop({ default: 0 })
  year: number;
  
  @Prop({ default: 0 })
  month: number;
  
  @Prop({ default: 0 })
  day: number;
  
  @Prop({ default: 0 })
  hour: number;
  
  @Prop({ default: 0 })
  total_gmv: number; // Doanh thu các đơn hàng

  @Prop({
    type: [{
      payment_method: { type: String, default: null },
      money: { type: Number, default: 0 }
    }], 
    default: []
  })
  detailed_total_money_created: object[]; // Chi tiết doanh thu các đơn hàng
  
  @Prop({ default: 0 })
  total_gmv_done: number; // Tổng doanh thu các đơn hàng hoàn thành
  
  @Prop({ default: 0 })
  total_service_collection_amount_done: number; // Tổng số tiền thu hộ dịch vụ
  
  @Prop({ default: 0 })
  total_revenue_done: number; // Tổng doanh thu = Tổng doanh thu các đơn hàng hoàn thành (total_gmv_done) - Tổng số tiền thu hộ dịch vụ (total_service_collection_amount_done)
  
  @Prop({ default: 0 })
  total_discount_done: number; // Tổng số tiền giảm giá cho đơn hàng hoàn thành

  @Prop({ default: 0 })
  total_net_revenue_done: number; // Tổng doanh thu thuần = Tổng doanh thu (total_revenue_done) - Tổng số tiền giảm giá cho đơn hàng hoàn thành (total_discount_done)
  
  @Prop({ default: 0 })
  total_invoice_done: number; // Tổng hóa đơn
  
  @Prop({ default: 0 })
  total_applied_fees_done: number; // Tổng phí áp dụng
  
  @Prop({ default: 0 })
  total_value_added_tax: number; // Tổng thuế
  
  @Prop({ default: 0 })
  total_profit_done: number; // Tổng lợi nhuận = Tổng doanh thu thuần (total_net_revenue_done)

  @Prop({ default: 0 })
  total_profit_after_tax_done: number; // Tổng lợi nhuận sau thuế = Tổng lợi nhuận (total_profit_done) - tổng thuế (total_value_added_tax)

  @Prop({ default: 0 })
  total_orders_created: number; // Tổng số đơn hàng tạo

  @Prop({ default: 0 })
  total_orders_done: number; // Tổng số đơn hàng hoàn thành
  
  @Prop({ default: 0 })
  total_cancelled_orders: number; // Tổng số đơn hàng hủy
  
  @Prop({ default: 0 })
  total_money_canceled: number; // Tổng số tiền từ các đơn hủy
  
  @Prop({ default: 0 })
  total_punish_tickets_created: number; // Tổng phiếu phạt được tạo ra

  @Prop({ default: 0 })
  total_punish_tickets_revoked: number; // Tổng phiếu phạt được thu hồi

  @Prop({ default: 0 })
  total_punish_tickets_money: number; // Tổng tiền phạt

  @Prop({ default: 0 })
  total_punish_tickets_refunded: number; // Tổng tiền phạt được hoàn

  @Prop({ default: 0 })
  total_income_transactions: number; // Tổng số giao dịch thu

  @Prop({ default: 0 })
  total_expenses_transactions: number; // Tổng số giao dịch chi

  @Prop({ default: 0 })
  total_income: number; // Tổng thu trong sổ quỹ

  @Prop({ default: 0 })
  total_expenses: number; // Tổng chi trong sổ quỹ

  @Prop({ default: 0 })
  total_income_from_customers: number; // Tổng thu từ khách hàng trong sổ quỹ

  @Prop({ default: 0 })
  total_expenses_for_customers: number; // Tổng chi cho khách hàng trong sổ quỹ

  @Prop({ default: 0 })
  total_income_from_collaborators: number; // Tổng thu từ đối tác trong sổ quỹ

  @Prop({ default: 0 })
  total_expenses_for_collaborators: number; // Tổng chi cho đối tác trong sổ quỹ

  @Prop({
    type: [{
      payment_method: { type: String, default: null },
      money: { type: Number, default: 0 }
    }], 
    default: []
  })
  detailed_total_income_from_customers: object[]; // Chi tiết tổng thu từ khách hàng trong sổ quỹ

  @Prop({
    type: [{
      payment_method: { type: String, default: null },
      money: { type: Number, default: 0 }
    }], 
    default: []
  })
  detailed_total_expenses_for_customers: object[]; // Chi tiết tổng chi cho khách hàng trong sổ quỹ

  @Prop({
    type: [{
      payment_method: { type: String, default: null },
      money: { type: Number, default: 0 }
    }], 
    default: []
  })
  detailed_total_income_from_collaborators: object[]; // Chi tiết tổng thu từ đối tác trong sổ quỹ

  @Prop({
    type: [{
      payment_method: { type: String, default: null },
      money: { type: Number, default: 0 }
    }], 
    default: []
  })
  detailed_total_expenses_for_collaborators: object[]; // Chi tiết tổng chi cho đối tác trong sổ quỹ

  @Prop({ default: 0 })
  total_projected_service_collection_amount: number; // Tổng số tiền thu hộ dịch vụ dự kiến

  @Prop({ default: 0 })
  total_projected_revenue: number; // Tổng doanh thu dự kiến = Tổng doanh thu dự kiến (total_gmv) - Tổng số tiền thu hộ dịch vụ (total_projected_service_collection_amount)

  @Prop({ default: 0 })
  total_projected_discount: number; // Tổng số tiền giảm giá dự kiến

  @Prop({ default: 0 })
  total_projected_net_revenue: number; // Tổng doanh thu thuần dự kiến = Tổng doanh thu (total_projected_revenue) - Tổng số tiền giảm giá dự kiến (total_projected_discount)

  @Prop({ default: 0 })
  total_projected_invoice: number; // Tổng hóa đơn dự kiến

  @Prop({ default: 0 })
  total_projected_applied_fees: number; // Tổng phí áp dụng dự kiến

  @Prop({ default: 0 })
  total_projected_value_added_tax: number; // Tổng thuế dự kiến

  @Prop({ default: 0 })
  total_projected_profit: number; // Tổng lợi nhuận dự kiến = Tổng doanh thu thuần dự kiến (total_projected_net_revenue)

  @Prop({ default: 0 })
  total_projected_profit_after_tax: number; // Tổng lợi nhuận sau thuế dự kiến = Tổng lợi nhuận dự kiến (total_projected_profit) - Tổng thuế dự kiến (total_projected_value_added_tax)

  @Prop({ default: 0 })
  total_zns_spending: number; // Tổng chi tiêu ZNS

  @Prop({ default: 0 })
  total_sent_zns: number; // Tổng ZNS đã gửi

  @Prop({ default: 0 })
  total_chargeable_zns: number; // Tổng ZNS tính

  @Prop({ default: 0 })
  total_non_chargeable_zns: number; // Tổng ZNS không tính phí

  @Prop({ default: 0 })
  total_successful_zns: number; // Tổng ZNS thành công

  @Prop({ default: 0 })
  total_failed_zns: number; // Tổng ZNS thất bại
}

export const reportSchema = SchemaFactory.createForClass(Report);