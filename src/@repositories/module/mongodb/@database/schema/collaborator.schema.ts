import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { Document } from 'mongoose'
import { BaseEntity } from '../entity'
import { Address } from './address.schema'
import { UserSystem } from './user_system.schema'
// import { TranferMoneyDTO } from '../../dto/collaborator.dto'

export type CollaboratorDocument = Collaborator & Document;

@Schema()
export class Collaborator extends BaseEntity {
  
  @Prop({ default: "" }) // Họ và tên của CTV
  full_name: string;

  @Prop({ required: true, default: null }) // Số điện thoại của CTV
  phone: string;

  @Prop({ default: "" }) // Email của CTV
  email: string;

  @Prop({ default: "" }) // CCCD/CMND của CTV
  identity_number: string;

  @Prop({ default: null }) // Ngày sinh của CTV
  birthday: string;

  @Prop({ default: "" }) // Nơi cấp CCCD/CMND của CTV
  identity_place: string;

  @Prop({ default: "" }) // Ngày cấp CCCD/CMND của CTV
  identity_date: string;

  @Prop({ default: "other", enum: ["male", "female", "other"] }) // Giới tính của CTV
  gender: string;

  @Prop({ default: null }) // Quốc tịch của CTV (mới)
  country: string;

  @Prop({ default: null }) // Quê quán của CTV (mới)
  home_town: string;

  @Prop({ default: -1 }) // Tỉnh/Thành phố thường trú của CTV (mới)
  province_live: number;

  @Prop({ default: -1 }) // Quận/Huyện thường trú của CTV (mới)
  district_live: number;

  @Prop({ default: "" }) // Số nhà, tên đường của CTV (mới)
  address_live: string;

  @Prop({ default: -1 }) // Tỉnh/Thành phố tạm trú của CTV (mới)
  province_temp: number;

  @Prop({ default: -1 }) // Quận/Huyện tạm trú của CTV (mới)
  district_temp: number;

  @Prop({ default: "" }) // Số nhà, tên đường tạm trú của CTV (mới)
  address_temp: string;
  
  @Prop({ default: "" }) // Dân tộc của CTV
  folk: string;

  @Prop({ default: "" }) // Tôn giáo của CTV
  religion: string;

  @Prop({ default: "" }) // Trình độ học vấn của CTV
  edu_level: string;

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Service', default: [] }) // Loại dịch vụ thực hiện của CTV
  service_apply: string[];

  @Prop({ default: [] }) // Kỹ năng của cộng tác viên (Mới)
  skills_list: number[];

  @Prop({ default: [] }) // Ngôn ngữ cộng tác viên có thể giao tiếp (Mới)
  languages_list: number[];

  @Prop({ default: -1 }) // Tỉnh/Thành phố làm việc của CTV (mới, thay cho city)
  province_work: number;

  @Prop({ default: -1 }) 
  city: number;
  
  @Prop({ default: [] }) // Quận/Huyện làm việc của CTV (mới, thay cho district)
  district_work: number[];

  @Prop({ default: [] })
  district: number[];

  @Prop({ default: null }) // Không rõ => để nguyên, id nguoi gioi thieu, truong du lieu cu
  id_inviter: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null })
  id_customer_inviter: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Collaborator', default: null })
  id_collaborator_inviter: string;


  @Prop({ default: [] }) // Người liên hệ của CTV (mới)
  contact_persons: string[];

  @Prop({ default: "https://res.cloudinary.com/dbxnp5vc0/image/upload/v1667204262/guvi/htbwmbolam1uh18vjle4.png" }) // Avatar của CTV
  avatar: string;

  @Prop({ default: ["collaborator"] })
  type: string[];

  @Prop({ required: true, default: '+84' })
  code_phone_area: string;

  @Prop({ default: [] })
  index_search: string[]

  @Prop({ default: "" })
  permanent_address: string;

  @Prop({ default: "" })
  temporary_address: string;

  @Prop({ default: "unknow" })
  name: string;

  @Prop({ default: null })
  month_birthday: string;

  @Prop({ required: true, default: null })
  password: string;

  @Prop({ default: null })
  password_default: string;

  @Prop({ required: true, default: null })
  salt: string;

  @Prop({ default: new Date(Date.now()).toISOString() })
  date_create: string;

  @Prop({ default: true })
  is_active: boolean;

  // @Prop({ default: false })
  // is_delete: boolean;

  @Prop({ default: false })
  is_delete_trans: boolean;

  @Prop({ default: "" })
  token: string;

  @Prop({ default: 0 })
  remainder: number;

  @Prop({ default: 0 })
  gift_remainder: number;

  @Prop({ default: 0 }) // ví này không có khả năng rút
  work_wallet: number;

  @Prop({ default: 0 }) // ví này năng rút tiền ra
  collaborator_wallet: number;

  @Prop({ default: 0 })
  point: number;

  @Prop({ default: false })
  is_verify: boolean;

  @Prop()
  invite_code: string;

  @Prop({ default: false })
  is_added_gift_remainder: boolean;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Address', default: null })
  default_address: Address | null;

  @Prop({ default: false })
  is_lock_time: boolean;

  @Prop({ default: null })
  lock_time: string;

  @Prop({ default: null })
  account_number: string;

  @Prop({ default: null })
  account_name: string;

  @Prop({ default: null })
  bank_name: string;

  @Prop({ default: null })
  bank_brand: string;

  @Prop({ default: false })
  is_corporation: boolean; // bo

  @Prop({ default: false })
  is_identity: boolean;

  @Prop({ default: "" })
  identity_frontside: string;

  @Prop({ default: "" })
  identity_backside: string;

  @Prop({ default: false })
  is_personal_infor: boolean;

  @Prop({ default: [] })
  personal_infor_image: string[];//so yeu li lich

  @Prop({ default: false })
  is_household_book: boolean;

  @Prop({ default: [] })
  household_book_image: string[];

  @Prop({ default: false })
  is_behaviour: boolean;

  @Prop({ default: [] })
  behaviour_image: string[];//giay xac nhan hanh kiem

  @Prop({ default: "" })
  document_code: string;

  @Prop({ default: false })
  is_document_code: boolean;

  @Prop({ default: 0 })
  total_job: number;

  @Prop({ default: 0 })
  total_discount: number;

  @Prop({ default: 0 })
  total_net_income: number;

  @Prop({ default: 0 })
  total_gross_income: number;

  @Prop({ default: 0 })
  total_service_fee: number;

  @Prop({ default: 0 })
  total_net_income_of_business: number;

  @Prop({ default: 0 })
  percent_income: number;

  @Prop({ default: 0 })
  total_collaborator_fee: number;

  @Prop({ default: null })
  id_view: string;

  @Prop({ default: 0 })
  ordinal_number: number;

  @Prop({ default: 0 })
  total_star: number;

  @Prop({ default: 0 })
  total_review: number;

  @Prop({ default: false })
  is_locked: boolean;

  @Prop({ default: null })
  date_lock: string;

  @Prop({ default: false })
  is_contacted: boolean;

  @Prop({ default: 5, max: 5 })
  star: number;

  @Prop({ enum: [0, 1, 2, 3, 4, 5], default: 0 })
  level: number;

  @Prop({ default: null })
  client_id: string;

  @Prop({
    type: [
      {
        date_create: { type: String, default: new Date(Date.now()).toISOString() },
        id_reward_collaborator: { type: String, default: null },
        count: Number,
      }]
    , default: []
  })
  reward_received: object[]

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Business', default: null })
  id_business: string;

  @Prop({ default: [] })
  language: string[];

  @Prop({ default: false })
  is_auto_change_money: boolean;

  @Prop({ default: '' })
  desire_service: string;

  // trang thai tai khoan cua CTV
  @Prop({ type: String, enum: ["pending", "test_complete", "contacted", "interview", "pass_interview", "actived", "discontinued", "locked", "reject", "appropriate"], default: "pending" })
  status: string;

  // // trang thai xu ly thong tin cho CTV dang cho duyet
  // @Prop({ type: String, enum: ["pending", "processing", "not_contact", "done"], default: "pending" })
  // status_handle: string;

  @Prop({ default: '' })
  note_handle_admin: string;

  @Prop({type: mongoose.Schema.Types.ObjectId, ref: "UserSystem", default: null})
  id_user_system_handle: UserSystem;

  // @Prop({ type: [{
  //     id_user_system_handle: {type: mongoose.Schema.Types.ObjectId, ref: "UserSystem", default: null},
  //     status: { type: String, default: null },
  //     note_handle_admin: {type: String, default: ""},
  //     date_create: { type: String, default: new Date(Date.now()).toISOString() }
  // }], default: [] })
  // history_user_system_handle: any[];

  // ngay vao lam
  @Prop({ default: null })
  date_actived: string;

  @Prop({ default: null })
  session_socket: string;

  @Prop({ default: false })
  is_online: boolean;
  
  @Prop({ default: 0 })
  reward_point: number; // Số điểm tích lũy trong tuần (Số điểm này sẽ được đặt lại khi bắt đầu tuần mới)

  @Prop({ default: 0 })
  number_of_violation: number; // Số lỗi vi phạm trong tuần (Số lỗi này sẽ được đặt lại khi bắt đầu mới)

  @Prop({ default: 0 })
  top1_count: number; // Số lần đạt top 1

  @Prop({ default: 0 })
  top2_count: number; // Số lần đạt top 2

  @Prop({ default: 0 })
  top3_count: number; // Số lần đạt top 3

  @Prop({ default: null })
  last_point_updated_at: string; // Thời gian cập nhật điểm lần cuối

  @Prop({ default: null })
  lock_start_time: string; // Thời gian bắt đầu khóa

  @Prop({ default: null })
  lock_end_time: string; // Thời gian kết thúc khóa

  @Prop({ default: 0 })
  monthly_reward_point: number; // Số điểm tích lũy trong tháng (Số điểm này sẽ được đặt lại khi bắt đầu tháng mới)

  @Prop({ default: 0 })
  monthly_number_of_violation: number; // Số lỗi vi phạm trong tháng (Số lỗi này sẽ được đặt lại khi bắt đầu tháng mới)

  @Prop({ default: 0 })
  monthly_top1_count: number; // Số lần đạt top 1 theo tháng

  @Prop({ default: 0 })
  monthly_top2_count: number; // Số lần đạt top 2 theo tháng

  @Prop({ default: 0 })
  monthly_top3_count: number; // Số lần đạt top 3 theo tháng

  @Prop({ default: null })
  monthly_last_point_updated_at: string; // Thời gian cập nhật điểm lần cuối theo tháng
  
  @Prop({ default: false })
  is_not_received_reward: boolean; // Không nhận được thưởng khi cờ này bật lên (khi vi phạm lỗi nghiêm trọng hoặc vi phạm từ 3 lỗi bình thường trở lên)
}

export const collaboratorSchema = SchemaFactory.createForClass(Collaborator);