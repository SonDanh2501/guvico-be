// go live
export const BASEPOINT_DB = "mongodb://guvi2022:Guvi2022@database.guvico.com/guvico"
// database test
// export const BASEPOINT_DB = "mongodb://guvi:guvi0123789@database.guvico.com/guvico-test"
// database develop
// export const BASEPOINT_DB = "mongodb://guvidev:guvi0123789@database.guvico.com/guvico-dev"




// export const CURRENT_SERVER_URL = 'http://localhost:5000';
export const CURRENT_SERVER_URL = 'https://server.guvico.com';
// export const CURRENT_SERVER_URL = 'https://guvico-be-develop.up.railway.app';
// export const CURRENT_SERVER_URL = 'https://server-test.guvico.com';
// export const CURRENT_SERVER_URL = 'https://server-dev.guvico.com';


// export const CURRENT_SERVER_GATEWAY = 'http://localhost:4000'
// export const CURRENT_SERVER_GATEWAY = 'http://45.251.112.75:5003'
// export const CURRENT_SERVER_GATEWAY = 'http://45.251.112.75:5001'
export const CURRENT_SERVER_GATEWAY = 'http://45.251.112.75:5000'


export const NUMBERIC_HOST = '45.251.112.75'
// export const NUMBERIC_HOST = '127.0.0.'

// // config redis
// export const CONFIG_REDIS = {
//   host: "server.guvico.com",
//   port: 6379
// }
// config redis dev
export const CONFIG_REDIS = {
  host: "server.guvico.com",
  port: 6377
}
// // config redis test
// export const CONFIG_REDIS = {
//   host: "server.guvico.com",
//   port: 6378
// }



export const ASSET_FILE = 'public'

export const ROLES = {
  ADMIN: 'admin',
  COLLABORATOR_MANAGE: 'collaborator_manage',
  CUSTOMER_MANAGE: 'customer_manage',
};

export const TYPE_COMPONENT = [
  "select_horizontal_no_thumbnail",
  "select_horizontal_thumbnail",
  "multi_select_horizontal_thumbnail",
  "option_toggle_switch",
  "select_flex_row_warp_no_thumbnail",
  "radio_button_horizontal",
  "toggle_switch_vertical",
  "single_select_horizontal_thumbnail",
  "multi_select_count_ac",
  "multi_select_count_sofa",
  "multi_select_count_wm"

]

export const TIMEZONE = [
  'Asia/Jakarta'
]

export const TYPE_PROMOTION = [
  "sale_off_total_fee",
  "sale_off_percent_total_fee",
  "free_ship_fee",
  "free_ship_percent_fee",
  "sale_off_percent_ship_fee",
]

export const TYPE_ACTIVITY = [
  "system_holding_money_user",
  "admin_give_back_money_user",
  "give_back_money_collaborator",
  "cancel_transfer_collaborator",
  "collaborator_holding",
  "verify_user",
  "refund",
  "payment_method_cash",
  "payment_method_pay_point",
  "verify_top_up",
  "verify_refund",
  "verify_punish",
  "verify_reward",
  "verify_pay_service",
  "verify_withdraw",
  "system_verify_punish",
  "receive_done_order",
  "refund_platform_fee_cancel_order",
  "minus_platform_fee",
  "refund_collaborator_fee",
  "receive_extra_collaborator_fee",

  "customer_create_new_account",
  "customer_edit_personal_infor",
  "customer_delete_account",
  "customer_create_group_order",
  "customer_cancel_group_order",
  "customer_cancel_order",
  "customer_collect_points_order",
  "customer_exchange_points_promotion",
  "customer_request_top_up",
  "customer_refund_pay_point",
  // "customer_paid_pay_point",
  "customer_set_default_address",
  "customer_set_is_default_address",
  "customer_delete_default_address",
  "customer_edit_default_address",
  "customer_create_new_feedback",
  "customer_apply_invite_code",
  "customer_review_collaborator",
  "customer_success_top_up_pay_point",
  "customer_fail_top_up_pay_point",
  "customer_payment_pay_point_service",
  "customer_payment_point_service",
  "customer_payment_momo_service",
  "customer_payment_vnpay_service",
  "customer_refund_pay_point_service",
  "customer_request_service",
  "customer_inviter_code_was_applied",
  "customer_accept_policy",
  "customer_punished_ticket",
  "customer_create_bank_account",
  "customer_request_withdraw_affiliate",
  "customer_cancel_withdraw_affiliate",
  "customer_update_referral_code",

  "collaborator_cancel_group_order",
  "collaborator_confirm_order",
  "collaborator_doing_order",
  "collaborator_done_order",
  "collaborator_cancel_order_over_60_min",
  "collaborator_cancel_order_over_30_min",
  "collaborator_cancel_order_below_30_min",
  "collaborator_top_up",
  "collaborator_confirm_top_up",
  "collaborator_withdraw",
  "collaborator_minus_collaborator_fee",
  "collaborator_minus_platform_fee",
  "collaborator_minus_pending_money",
  "collaborator_refund_platform_fee",
  "collaborator_refund_pending_money",
  "collaborator_receive_platform_fee",
  "collaborator_receive_refund_money",
  "collaborator_penalty_cancel_job",
  "collaborator_cancel_tranfer",

  "collaborator_edit_address",
  "collaborator_delete_address",
  "collaborator_set_default_address",
  "collaborator_create_new_address",
  "collaborator_create_new_account",
  "collaborator_edit_personal_infor",
  "collaborator_delete_account",
  "collaborator_edit_profile",
  "collaborator_update_aministrativ",
  "collaborator_submit_test",
  "collaborator_punished_by_ticket",

  "system_cancel_order",
  "system_cancel_transaction",
  "system_cancel_order_confirm",
  "system_give_pay_point_customer",
  "system_balance_money",

  "system_change_punish_ticket_status",
  "punish_ticket_standby_to_waiting",
  "punish_ticket_waiting_to_doing",
  "punish_ticket_doing_to_done",

  "admin_create_banner",
  "admin_edit_banner",
  "admin_delete_banner",
  "admin_create_collaborator_bonus",
  "admin_active_collaborator_bonus",
  "admin_edit_collaborator_bonus",
  "admin_delete_collaborator_bonus",
  "admin_delete_question",
  "admin_delete_info_test",
  "admin_submit_info_test",
  "admin_edit_question",
  "admin_active_banner",
  "admin_active_question",
  "admin_edit_user",
  "admin_edit_punish",
  "admin_delete_user",
  "admin_acti_user",
  "admin_create_user",
  "admin_verify_user",
  "admin_lock_user",
  "admin_top_up_user",
  "admin_withdraw_user",
  "admin_edit_transfer_user",
  "admin_cancel_transfer_user",
  "admin_delete_transfer_user",
  "admin_create_extend_optional",
  "admin_acti_extend_optional",
  "admin_edit_extend_optional",
  "admin_delete_extend_optional",
  "admin_create_reward",
  "admin_active_reward",
  "admin_edit_reward",
  "admin_delete_reward",
  "admin_create_feed_back",
  "admin_edit_feed_back",
  "admin_delete_feed_back",
  "admin_processed_feed_back",
  "admin_create_group_customer",
  "admin_edit_group_customer",
  "admin_delete_group_customer",
  "admin_acti_group_customer",
  "admin_create_group_service",
  "admin_acti_group_service",
  "admin_edit_group_service",
  "admin_delete_group_service",
  "admin_create_news",
  "admin_acti_news",
  "admin_edit_news",
  "admin_delete_news",
  "admin_create_optional_service",
  "admin_acti_optional_service",
  "admin_edit_optional_service",
  "admin_delete_optional_service",
  "admin_create_promotion",
  "admin_acti_promotion",
  "admin_edit_promotion",
  "admin_delete_promotion",
  "admin_create_push_notification",
  "admin_acti_push_notification",
  "admin_edit_push_notification",
  "admin_delete_push_notification",
  "admin_create_reason_cancel",
  "admin_acti_reason_cancel",
  "admin_edit_reason_cancel",
  "admin_delete_reason_cancel",
  "admin_create_reason_punish",
  "admin_acti_reason_punish",
  "admin_edit_reason_punish",
  "admin_delete_reason_punish",
  "admin_create_service",
  "admin_acti_service",
  "admin_edit_service",
  "admin_delete_service",
  "admin_create_user_system",
  "admin_edit_user_system",
  "admin_acti_user_system",
  "admin_delete_user_system",
  "admin_add_collaborator_to_order",
  "admin_change_status_to_order",
  "admin_change_status_to_punish",
  "admin_edit_point_of_customer",
  "admin_edit_rank_point_of_customer",
  "admin_change_account_bank",
  "admin_delete_group_order",
  "admin_delete_punish",
  "admin_change_status_feedback",
  "admin_change_status",
  "admin_cancel_group_order",
  "admin_contacted_collaborator",
  "admin_monetary_fine_collaborator",
  "admin_assign_collaborator",
  "system_monetary_fine_collaborator",
  "admin_create_notification_schedule",
  "admin_delete_notification_schedule",
  "system_change_money_from_work_to_collaborator",

  "admin_create_popup",
  "admin_acti_popup",
  "admin_edit_popup",
  "admin_delete_popup",
  "admin_change_status_popup",
  "admin_contact_customer_request",
  "admin_change_status_customer_request",
  "admin_delete_customer_request",
  "admin_create_group_order",
  "admin_create_question",
  "admin_edit_group_order",
  "admin_revoke_punish_ticket",
  "refund_money_revoke_punish_ticket",
  "system_given_money",
  "system_create_loop_group_order",

  "admin_confirm_order",
  "admin_allow_confirming_duplicate_order",
  "admin_doing_order",
  "admin_done_order",

  "admin_top_up_transition_point_customer",
  "admin_top_up_money_customer",
  'admin_withdraw_money_customer',
  "admin_verify_transition_point_customer",
  "admin_cancel_transition_point_customer",
  "admin_delete_transition_point_customer",
  "system_create_promotion",
  "admin_change_collaborator",
  "admin_change_date_work",
  "admin_cancel_order",
  "admin_check_review",
  "system_auto_check_review",
  "collaborator_receive_bonus_money",
  "customer_tip_collaborator",

  "admin_create_info_reward_collaborator",
  "admin_active_info_reward_collaborator",
  "admin_edit_info_reward_collaborator",
  "admin_delete_info_reward_collaborator",
  "admin_cancel_info_reward_collaborator",
  "admin_verify_info_reward_collaborator",
  "admin_update_address_for_order",


  "system_create_info_reward_collaborator",
  "system_active_info_reward_collaborator",
  "system_edit_info_reward_collaborator",
  "system_delete_info_reward_collaborator",
  "system_create_transaction",
  "system_verify_transaction",
  "system_punish_late_collaborator",
  "system_add_point",
  "system_update_is_created_notification_schedule",
  "system_receive_discount",
  "system_change_money_from_work_to_collaborator",


  "admin_cancel_punish", // hoàn tiền cho ctv từ lệnh phạt hoàn thành
  ////// admin với bài kiểm tra
  "admin_create_training_lesson",
  "admin_active_training_lesson",
  "admin_edit_training_lesson",
  "admin_delete_training_lesson",
  ////// admin với nhóm khuyến mãi
  "admin_create_group_promotion",
  "admin_edit_group_promotion",
  "admin_delete_group_promotion",
  "admin_acti_group_promotion",

  "admin_create_business",
  "admin_edit_business",
  "admin_delete_business",
  "admin_acti_business",

  "admin_set_is_staff",
  "admin_unset_is_staff",
  "collaborator_started_order",
  "collaborator_change_money_wallet",
  "admin_support_change_money_wallet",

  "auto_change_money_from_work_to_collaborator",

  "admin_update_status_collaborator",
  "admin_update_note_admin_collaborator",

  "system_auto_unlock_collaborator",

  "admin_punish_user",
  "admin_create_ticket_income",
  "admin_create_ticket_expense",

  //Punish, reward policy
  'admin_create_punish_policy',
  'admin_edit_punish_policy',
  'admin_delete_punish_policy',
  'admin_create_reward_policy',
  'admin_edit_reward_policy',
  'admin_delete_reward_policy',
  //Punish, reward ticket
  'admin_create_punish_ticket',
  'system_create_punish_ticket',
  'admin_delete_punish_ticket',
  'admin_cancel_punish_ticket',
  'admin_edit_punish_ticket_status',
  'admin_verify_punish_ticket',
  'admin_create_reward_ticket',
  'admin_delete_reward_ticket',
  'admin_edit_reward_ticket',
  'admin_verify_reward_ticket',
  'customer_create_transaction',
  'create_transaction',
  'cancel_transaction',

  "create_punish_ticket",
  "verify_punish_ticket",
  "cancel_punish_ticket",
  "revoke_punish_ticket",
  "delete_punish_ticket",


  "system_punish",
  "punish_collaborator",
  "verify_transaction_punish_ticket",
  "verify_transaction_top_up",
  "verify_transaction_punish_ticket",
  "verify_transaction_withdraw",
  "verify_transaction_punish",
  "verify_transaction_reward",
  "verify_transaction_refund_punish_ticket",
  "verify_transaction_payment_service",
  "verify_transaction_refund_payment_service",
  "change_punish_ticket_status",


  "admin_unassign_collaborator",
  "cancel_order",
  "customer_cancel_order",
  "collaborator_cancel_order",
  "admin_cancel_order",
  "system_cancel_order",
  'customer_cancel_group_order',
  'collaborator_cancel_group_order',
  'admin_cancel_group_order',
  'system_cancel_group_order',

  "collaborator_refund_money",
  "customer_refund_money",
  "unassign_order_collaborator",
  "unassign_group_order_collaborator",
  "system_punish_collaborator",

  "system_minus_platform_fee",
  "system_minus_new_platform_fee",
  "system_minus_remaining_shift_deposit",
  "admin_revoke_punish_money",
  "admin_verify_transaction",
  "system_verify_transaction",
  "admin_request_withdraw_affiliate",
  "admin_cancel_withdraw_affiliate",
  "admin_verify_transaction",
  "admin_restore_account_for_collaborator",
<<<<<<< HEAD
  "system_error_group_order_and_order"
=======
  "system_error_group_order_and_order",
  "admin_create_punish_policy",
  "admin_revoke_reward_money",
  "admin_revoke_reward_point",
  "system_add_reward_point",
  "system_add_reward_money",
  "system_log_violation_and_fine",
  "system_log_violation",
  "system_reset_reward_point",
  "system_reset_monthly_reward_point",
  "admin_update_punish_policy",
  "admin_update_reward_policy",
  "admin_create_content_notification",
  "admin_update_content_notification",
  "admin_create_content_history_activity",
  "admin_update_content_history_activity",
>>>>>>> son
]

export const KIND_GROUP_CUSTOMER = [
  {
    name: "Ngày tạo",
    kind: "date_create"
  },
  {
    name: "Ngày sinh",
    kind: "birthday"
  },
  {
    name: "Khu vực",
    kind: "sector"
  },
  {
    name: "Thời gian sử dụng",
    kind: "date_use"
  },
  {
    name: "Giới tính",
    kind: "gender"
  }
]

export const SERVICE_APPLY = [
  "all_service",
]

export enum LANGUAGE {
  VI = 'vi',
  EN = 'en',
}

export const KIND_GROUP_SERVICE = ["giup_viec_co_dinh", "giup_viec_theo_gio", 've_sinh_may_lanh', 'tong_ve_sinh', '']

export const DEFAULT_LANG: LANGUAGE = LANGUAGE.VI;

export const SALT_OF_ROUNDS = 10;

export const PASSWORD_KEY_ENCRYPTION = 'sondanh2501#';

export const STATUS_ORDER = {
  PENDING: 'pending',
  CONFIRM: 'confirm',
  DOING: 'doing',
  DONE: 'done',
  CANCLE: 'cancel',
}

export const STATUS_GROUP_ORDER = {
  DOING: 'doing',
  DONE: 'done',
  CANCEL: 'cancel'
}

export const TYPE_GROUP_ORDER = {
  SINGLE: 'single',
  LOOP: 'loop',
  SCHEDULE: 'schedule'
}

export const GUVI_BANKING_INFOR = [
  {
    account_number: "67628888",
    account_name: "Trần Thị Thanh Tâm",
    bank_full_name: "Ngân hàng TMCP Á Châu",
    bank_name: "ACB",
    image: "https://lh3.googleusercontent.com/c2yH-8sEe4QrJe2B64RgYciDORxpJnE0VHshW1rxeG_kVjBy3Ieiw8boHWFqpAC5-00"
  }
]






export const TYPE_FEEDBACK = [
  {
    type: "app",
    name: {
      en: "App Guvi",
      vi: "Ứng dụng Guvi"
    },
    thumbnail: "https://res.cloudinary.com/dbxnp5vc0/image/upload/v1669089676/guvi/icon/Vector_9_d6ylpu.png"
  },
  {
    type: "customers_care",
    name: {
      en: "Customers care",
      vi: "Chăm sóc khách hàng"
    },
    thumbnail: "https://res.cloudinary.com/dbxnp5vc0/image/upload/v1669090664/guvi/icon/Group_4_l7p7gj.png"
  },
  {
    type: "service",
    name: {
      en: "Service",
      vi: "Dịch vụ"
    },
    thumbnail: "https://res.cloudinary.com/dbxnp5vc0/image/upload/v1669090412/guvi/icon/Group_3_qny9ag.png"
  },
  {
    type: "payment_method",
    name: {
      en: "Payment method",
      vi: "Hình thức thanh toán"
    },
    thumbnail: "https://res.cloudinary.com/dbxnp5vc0/image/upload/v1669090411/guvi/icon/Group_2_tpwgih.png"
  },
  {
    type: "emplyee_collaborator",
    name: {
      en: "Employee/Collaborator",
      vi: "Nhân viên/Cộng tác viên"
    },
    thumbnail: "https://res.cloudinary.com/dbxnp5vc0/image/upload/v1669089676/guvi/icon/Vector_9_d6ylpu.png"
  },
  {
    type: "other",
    name: {
      en: "Other",
      vi: "Vấn đề khác"
    },
    thumbnail: "https://res.cloudinary.com/dbxnp5vc0/image/upload/v1669090411/guvi/icon/Group_1_cjiguu.png"
  }
]

export const SERVICE_FEE = [
  // {
  //     title: {
  //         en: "Fee of transport",
  //         vi: "Phí di chuyển"
  //     },
  //     description: {
  //         en: "Includes: basic delivery fee (based on Google Maps route) and other necessary surcharges for collaborators (e.g. parking fee,...).",
  //         vi: `Bao gồm: phí giao cơ bản (dựa trên lộ trình của Google Maps) và các phụ phí cần thiết khác cho cộng tác viên (ví dụ: phí gửi xe,...).\n`
  //     },
  //     fee: 10000,
  //     fee_for: "collaborator"
  // },

  {
    title: {
      en: "System fee",
      vi: "Phí hệ thống"
    },
    description: {
      en: "This system fee is used to reinvest in improving service and technology, partially supporting promotions, in order to continuously improve the experience for users and partners.",
      vi: "Phí hệ thống này được sử dụng để tái đầu tư vào việc cải tiến dịch vụ, kỹ thuật, hỗ trợ một phần các chương trình khuyến mãi, nhằm không ngừng nâng cao trải nghiệm dành cho người dùng, đối tác."
    },
    fee: 2000,
    fee_for: "system"
  },
]

export const GENERAL_SETTING = {
  VERSION_COLLABORATOR: '1.0.0',
  VERSION_CUSTOMER: '1.0.0',
}
// @Prop({ default: "", enum: ["app", "service", "payment_method", "customers_care", "emplyee_collaborator", "other"] })
// type: string;

// @Prop({ type: { vi: String, en: String }, required: true })
// name: languageDTO;

// @Prop({ default: "" })
// thumbnail: string;

export const REASON_CANCEL = [
  {
    title: {
      vi: "Công việc đã quá thời gian làm",
      en: "Job is out date"
    },
    description: {
      vi: "Công việc đã quá thời gian làm",
      en: "Job is out date"
    },
    punish_type: "cash",
    punish: 0,
    apply_user: "system_out_date",
    punish_time: [
      {
        is_active: true,
        max_time: 0,
        min_time: 0,
        value: 0,
      }
    ],
    punish_cash: [
      {
        is_active: true,
        max_time: 0,
        min_time: 0,
        value: 0,
      }
    ]
  },
  {
    title: {
      vi: "CTV không xác nhận làm việc",
      en: "Collaborator does not confirm working"
    },
    description: {
      vi: "CTV không xác nhận làm việc",
      en: "Collaborator does not confirm working"
    },
    punish_type: "cash",
    punish: 0,
    apply_user: "system_out_confirm",
    punish_time: [
      {
        is_active: true,
        max_time: 0,
        min_time: 0,
        value: 0,
      }
    ],
    punish_cash: [
      {
        is_active: true,
        max_time: 0,
        min_time: 0,
        value: 0,
      }
    ]
  }
]

export const GROUP_CUSTOMER = [
  {
    name: "Khách hàng mới",
    description: "",
    condition_in: {
      type_condition: "and",
      condition_level_1: [
        {
          type_condition: "and",
          condition: [
            {
              kind: "total_order",
              value: 0,
              operator: "=="
            }
          ]
        }
      ]
    },
    condition_out: {
      type_condition: "and",
      condition_level_1: [
        {
          type_condition: "and",
          condition: [
            {
              kind: "total_order",
              value: 0,
              operator: ">"
            }
          ]
        }
      ]
    }
  },
  {
    name: "Khách hàng Thành Viên",
    description: "",
    condition_in: {
      type_condition: "and",
      condition_level_1: [
        {
          type_condition: "and",
          condition: [
            {
              kind: "rank_point",
              value: 100,
              operator: "<"
            }
          ]
        }
      ]
    },
    condition_out: {
      type_condition: "and",
      condition_level_1: [
        {
          type_condition: "and",
          condition: [
            {
              kind: "rank_point",
              value: 100,
              operator: ">="
            }
          ]
        }
      ]
    }
  },
  {
    name: "Khách hàng hạng Bạc",
    description: "",
    condition_in: {
      type_condition: "and",
      condition_level_1: [
        {
          type_condition: "and",
          condition: [
            {
              kind: "rank_point",
              value: 100,
              operator: ">="
            }
          ]
        }
      ]
    },
    condition_out: {
      type_condition: "and",
      condition_level_1: [
        {
          type_condition: "and",
          condition: [
            {
              kind: "rank_point",
              value: 300,
              operator: "<"
            }
          ]
        }
      ]
    }
  },
  {
    name: "Khách hàng hạng Vàng",
    description: "",
    condition_in: {
      type_condition: "and",
      condition_level_1: [
        {
          type_condition: "and",
          condition: [
            {
              kind: "rank_point",
              value: 300,
              operator: ">="
            }
          ]
        }
      ]
    },
    condition_out: {
      type_condition: "and",
      condition_level_1: [
        {
          type_condition: "and",
          condition: [
            {
              kind: "rank_point",
              value: 1500,
              operator: "<"
            }
          ]
        }
      ]
    }
  },
  {
    name: "Khách hàng hạng Bạch Kim",
    description: "",
    condition_in: {
      type_condition: "and",
      condition_level_1: [
        {
          type_condition: "and",
          condition: [
            {
              kind: "rank_point",
              value: 1500,
              operator: ">="
            }
          ]
        }
      ]
    },
    condition_out: {
      type_condition: "and",
      condition_level_1: []
    }
  }
]

export const KIND_CODITION = [
  {
    name: "Tổng giá trị đơn hàng",
    kind: "total_order",
    type_value: "number"
  },
  {
    name: "Giá trị đơn hàng 1 lần đặt",
    kind: "order",
    type_value: "number"
  },
  // {
  //   name: "Có tháng sinh",
  //   kind: "month_birthday",
  //   type_value: "number"
  // },
  {
    name: "Ngày hoạt động",
    kind: "date_active",
    type_value: "number"
  },
  {
    name: "Điểm tích luỹ",
    kind: "rank_point",
    type_value: "number"
  },
  {
    name: "Giới tính",
    kind: "gender",
    type_value: "string"
  }
]

export const PAYMENT_METHOD = [
  "cash",
  "visa",
  "momo",
  "point",
  "vnpay"
]

export const TYEP_SCHEDULE = [
  "single",
  "loop",
  "scheduled",
]

export const TYPE_USER_ACTION = {
  enum: ["admin", "system", "customer"]
}

export const IMAGE_HIDE_AVATAR = "https://res.cloudinary.com/dbxnp5vc0/image/upload/v1667204262/guvi/htbwmbolam1uh18vjle4.png"

export const IP_VNPAY_TEST = ["113.160.92.202"]
export const IP_VNPAY = [
  "113.52.45.78",
  "116.97.245.130",
  "42.118.107.252",
  "113.20.97.250",
  "203.171.19.146",
  "103.220.87.4",
  "103.220.86.4"]



export const POPULATE_ID_CUSTOMER = {
  password: 0, __v: 0, id_promotion: 0, default_address: 0, name: 0, email: 0,
  satl: 0, date_create: 0, point: 0, birthday: 0,
  birth_date: 0, is_delete: 0, is_active: 0, pay_point: 0, cash: 0, total_price: 0,
  invite_code: 0, ordinal_number: 0, city: 0, district: 0, my_promotion: 0,
  is_lock_time: 0, lock_time: 0, month_birthday: 0, invalid_password: 0, id_view: 0, id_inviter: 0,
  id_group_customer: 0, rank_point: 0, salt: 0,
}

export const POPULATE_SERVICE = {
  _id: 0,
  __v: 0,
  kind: 0,
  max_estimate: 0,
  minimum_time_order: 0, type_page: 0, time_schedule: 0, time_repeat: 0,
  type_loop_or_schedule: 0, type: 0, is_delete: 0, potision: 0, id_group_service: 0
  , address: 0, thumbnail: 0, description: 0, is_active: 0, price_option_area: 0,
  price_option_rush_hour: 0, price_option_peak_hour: 0, price_option_holiday: 0, is_auto_order: 0,
  platform_fee: 0, note: 0, position: 0
}

export const POPULATE_ID_GROUP_ORDER = {
  _id: 0,
  __v: 0,
  id_customer: 0, id_collaborator: 0, id_order: 0, lat: 0, lng: 0, address: 0, date_create: 0,
  next_time: 0, status: 0, service: 0, service_fee: 0, max_collaborator: 0, is_delete: 0,
  code_promotion: 0, event_promotion: 0, payment_method: 0, id_cancel_user_system: 0,
  id_cancel_system: 0, id_cancel_customer: 0, district: 0, city: 0,
  collaborator_version: 0, id_favourite_collaborator: 0, id_block_collaborator: 0, customer_version: 0,
}

export const TYPE_COLLABORATOR = [
  "collaborator_house_cleaning", "collaborator_waiter"
]

export const SUPPORT_LANGUAGE = [
  {
    value: "vi",
    value_view: "Vietnamese"
  },
  {
    value: "en",
    value_view: "English"
  },
  {
    value: "jp",
    value_view: "Japan"
  }
]

export const MILLISECOND_IN_HOUR = 3600000

export const PUNISH_COLLABORATOR_ROLE = [
  {
    time: 8 * MILLISECOND_IN_HOUR,
    money: 20000
  },
  {
    time: 2 * MILLISECOND_IN_HOUR,
    money: 20000
  }
]



export const OPTIONS_SELECT_STATUS_COLLABORATOR = [
  {
    label: "Đang hoạt động",
    value: "actived",
  },
  {
    label: "Đã khoá",
    value: "locked",
  },
  {
    label: "Chưa xử lý",
    value: "pending",
  },
  {
    label: "Hoàn thành test",
    value: "test_complete",
  },
  {
    label: "Đã liên hệ",
    value: "contacted",
  },
  {
    label: "Phù hợp",
    value: "appropriate"
  },
  {
    label: "Hẹn phỏng vấn",
    value: "interview",
  },
  {
    label: "Hoàn thành",
    value: "pass_interview",
  },
  {
    label: "Từ chối",
    value: "reject",
  }
]


export const AFTER_ACTION = [
  {
    action_trigger: "collaborator_cancel_order",
    url: "/collaborator/job/cancel_job/:id"
  },
  {
    action_trigger: "customer_create_order",
    url: "/customer/group_order/create"
  }
]

export const HOLIDAY = [
  {
    location: "VN",
    time_zone: 7,
    holiday: [
      {
        day: "2/9/2024",
        percent_price_up: 20
      }
    ]
  }
]

/** Trang thai */
export const STATUS_COLLABORATOR_PROFILE = { 
  actived: {
    label: "Đang hoạt động",
    value: "actived",
  },
  locked: {
    label: "Đã khoá",
    value: "locked",
  },
  PENDING: {
    label: "Chưa xử lý",
    value: "pending",
  },
  test_complete: {
    label: "Hoàn thành test",
    value: "test_complete",
  },
  contacted: {
    label: "Đã liên hệ",
    value: "contacted",
  },
  appropriate: {
    label: "Phù hợp",
    value: "appropriate"
  },
  interview: {
    label: "Hẹn phỏng vấn",
    value: "interview",
  },
  pass_interview: {
    label: "Hoàn thành",
    value: "pass_interview",
  },
  reject: {
    label: "Từ chối",
    value: "reject",
  }
}


/** Khoang thoi gian duoc phep thuc hien/hoan thanh truoc gio bat dau/ket thuc cong viec */
export const ALLOWED_DURATION = 900000

/** So tien toi thieu phai co trong vi */
export const MINBALANCE = 100000

/** Tien tang cho nguoi gioi thieu  */
export const REFERRAL_MONEY = 50000

/** Tien thuong danh cho nguoi gioi thieu khi doi tac (nguoi duoc gioi thieu) 
 * hoan thanh it nhat 5 don hang va co 3 danh gia tot thi 4 sao tro len */
export const REFERRAL_GIFT = 200000

/** So luong device token duoc ban trong 1 lan */
export const LIMIT_DEVICE_TOKENS = 50

/** So luong nguoi duoc ban thong bao trong 1 lan */
export const LIMIT_USERS = 50

/** So luong thong bao duoc tao trong 1 lan */
export const LIMIT_NOTIFICATIONS = 100

/** Khoang thoi gian giua cac lan tao thong bao (giay) */
export const PERIOD_NOTIFICATION_GENERATE = 5

/** So giay */
export const NUMBER_OF_SECONDS = 15

/** Thoi gian het han cua firebase theo ngay */
export const FIRBASE_EXPIRATION_TIME = 30

/** Mat khau cho tai khoan tam thoi */
export const TEMPORARY_PASSWORD = 'Guvi@2022'

/** So luong ma gioi thieu duoc sinh ra */
export const NUMBER_REFERRAL_CODE = 200

/** So tien toi thieu trong vi a_pay de rut tien */
export const MINIMUM_AMOUNT_TO_WITHDRAW = 500000

/** Phí dịch vụ ZNS (đồng) */
export const ZNS_SERVICE_FEE = 300