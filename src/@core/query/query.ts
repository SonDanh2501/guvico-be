export const TEMP_SERVICE_FEE = {
    tempServiceFee: {
        $sum: { $sum: "$service_fee.fee" }
    }
}

export const TEMP_DISCOUNT = {
    tempDiscount: {
        $sum: {
            $add: [
                { $sum: "$event_promotion.discount" },
                {
                    $cond: {
                        if: {
                            $ne: ["$code_promotion", null],
                        },
                        then: "$code_promotion.discount",
                        else: 0,
                    },
                },
            ],
        },
    },
}

export const TEMP_TRANSACTION_PUNISH = {
    tempPunish: {
        $sum: { $sum: "$transactions_punish.money" }
    }
}

export const TEMP_PUNISH_TICKET = {
    tempPunish: {
        $sum: { $sum: "$punish_ticket.punish_money" }
    }
}

export const TEMP_PUNISH = {
    tempPunish: {
        $sum: { $sum: "$punish.money" }
    }
}

export const TOTAL_EVENTS = {
    $sum: { $sum: "$event_promotion.discount" }
}

export const TOTAL_CODE = {
    $sum: {
        $cond: {
            if: {
                $ne: ["$code_promotion", null],
            },
            then: "$code_promotion.discount",
            else: 0,
        }
    }
}
export const TOTAL_ORDER_FEE = { $sum: "$final_fee" }

export const TOTAL_ORDER_TAX = { $sum: "$value_added_tax" }

// export const TOTAL_ORDER_FEE = {
//     $sum: {
//         $switch: {
//             branches: [
//                 {
//                     case: { $or: [
//                         { $eq: ['$status', 'pending'] },
//                         { $eq: ['$status', 'cancel'] }
//                     ] },
//                     then: 0
//                 }
//             ],
//             default: "$final_fee"
//         }
//     }
// }


export const TOTAL_INCOME = {
    $sum: {
        $add: [
            {
                $subtract: [
                    "$initial_fee",
                    "$net_income_collaborator"
                ],
            },
            "$tempServiceFee"
        ]
    },
}



// export const TOTAL_INCOME = {
//     $sum: {
//         $switch: {
//             branches: [
//                 {
//                     case: {
//                         $or: [
//                             { $eq: ['$status', 'pending'] },
//                             { $eq: ['$status', 'cancel'] }
//                         ]
//                     },
//                     then: 0
//                 }
//             ],
//             default: {
//                 $add: [
//                     {
//                         $subtract: [
//                             "$initial_fee",
//                             "$net_income_collaborator"
//                         ],
//                     },
//                     "$tempServiceFee"
//                 ]
//             }
//         }
//     }
// }

export const TOTAL_SERVICE_FEE = {
    $sum: "$tempServiceFee"
}

export const TOTAL_SERVICE_FEE_NEW = {
    
}
// export const TOTAL_SERVICE_FEE = {
//     $sum: {
//         $switch: {
//             branches: [
//                 {
//                     case: { $or: [
//                         { $eq: ['$status', 'pending'] },
//                         { $eq: ['$status', 'cancel'] }
//                     ] },
//                     then: 0
//                 }
//             ],
//             default: "$tempServiceFee"
//         }
//     }
// }



export const TOTAL_COLLABORATOR_FEE = {
    $sum: {
        $add: [
            '$net_income_collaborator', '$tip_collaborator'
        ]
    }// do tiền tip là loại tiền đặc biệt nên không thể cộng trực tiếp vào giá gốc
    // chỉ có ở phần báo cáo mới tạm tính là vào giá gốc để cho các công thức tính toán chính xác
}

// export const NET_INCOME = {
//     $sum: "$net_income"
// }

export const NET_INCOME = {
    $sum: {
      $reduce: {
        input: {
          $filter: {
            input: "$info_linked_collaborator",
            as: "collaborator",
            cond: { $eq: ["$$collaborator.status", "done"] }
          }
        },
        initialValue: 0,
        in: {
          $add: ["$$value", "$net_income"]
        }
      }
    }
  }
  
  

// export const TOTAL_COLLABORATOR_FEE = {
//     $sum: {
//         $switch: {
//             branches: [
//                 {
//                     case: {
//                         $or: [
//                             { $eq: ['$status', 'pending'] },
//                             { $eq: ['$status', 'cancel'] }
//                         ]
//                     },
//                     then: 0
//                 }
//             ],
//             default: {
//                 $add: [
//                     '$net_income_collaborator', '$tip_collaborator'
//                 ]
//             }
//         }
//     }
//     // do tiền tip là loại tiền đặc biệt nên không thể cộng trực tiếp vào giá gốc
//     // chỉ có ở phần báo cáo mới tạm tính là vào giá gốc để cho các công thức tính toán chính xác
// }





export const TOTAL_GROSS_INCOME = {
    $sum: { $add: ["$initial_fee", '$tip_collaborator', '$tempServiceFee'] }
}

// export const TOTAL_GROSS_INCOME = {
//     $sum: {
//         $switch: {
//             branches: [
//                 {
//                     case: { $or: [
//                         { $eq: ['$status', 'pending'] },
//                         { $eq: ['$status', 'cancel'] }
//                     ] },
//                     then: 0
//                 }
//             ],
//             default: { $add: ["$initial_fee", '$tip_collaborator', '$tempServiceFee'] }
//         }
//     }
// }
export const TOTAL_DISCOUNT = { $sum: "$tempDiscount" }
// export const TOTAL_DISCOUNT = { 
//     $sum: {
//         $switch: {
//             branches: [
//                 {
//                     case: { $or: [
//                         { $eq: ['$status', 'pending'] },
//                         { $eq: ['$status', 'cancel'] }
//                     ] },
//                     then: 0
//                 }
//             ],
//             default: "$tempDiscount"
//         }
//     }
//  }


export const SORT_DATE_CREATE = { $first: "$date_create" }

export const SORT_DATE_WORK = { $first: "$date_work" }

export const TOTAL_NET_INCOME = {
    $sum: {
        $add: [
            {
                $subtract: [
                    {
                        $subtract: [
                            "$initial_fee",
                            "$net_income_collaborator",
                        ],
                    },
                    "$tempDiscount",
                ],
            },
            "$tempServiceFee"
        ]
    },
}

// export const TOTAL_NET_INCOME = {
//     $sum: {
//         $switch: {
//             branches: [
//                 {
//                     case: {
//                         $or: [
//                             { $eq: ['$status', 'pending'] },
//                             { $eq: ['$status', 'cancel'] }
//                         ]
//                     },
//                     then: 0
//                 }
//             ],
//             default: {
//                 $add: [
//                     {
//                         $subtract: [
//                             {
//                                 $subtract: [
//                                     "$initial_fee",
//                                     "$net_income_collaborator",
//                                 ],
//                             },
//                             "$tempDiscount",
//                         ],
//                     },F
//                     "$tempServiceFee"
//                 ]
//             }
//         }
//     }
// }

export const TOTAL_NET_INCOME_BUSINESS = {
    $sum: {
        $add: [
            {
                $subtract: [
                    {
                        $subtract: [
                            "$initial_fee",
                            "$net_income_collaborator",
                        ],
                    },
                    "$tempDiscount",
                ],
            },
            "$tempServiceFee",
            "$tempPunish"
        ],
    },
}

// export const TOTAL_NET_INCOME_BUSINESS = {
//     $sum: {
//         $switch: {
//             branches: [
//                 {
//                     case: {
//                         $or: [
//                             { $eq: ['$status', 'pending'] },
//                             { $eq: ['$status', 'cancel'] }
//                         ]
//                     },
//                     then: "$tempPunish"
//                 }
//             ],
//             default: {
//                 $add: [
//                     {
//                         $subtract: [
//                             {
//                                 $subtract: [
//                                     "$initial_fee",
//                                     "$net_income_collaborator",
//                                 ],
//                             },
//                             "$tempDiscount",
//                         ],
//                     },
//                     "$tempServiceFee",
//                     "$tempPunish"
//                 ],
//             }
//         }
//     }
// }




export const PERCENT_INCOME = {
    percent_income: {
        $round: [
            {
                $multiply: [
                    {
                        $divide:
                            ['$total_net_income_business', "$total_income"]
                    }, 100
                ]
            }, 2
        ]
    }
}



export const PERCENT_INCOME_ENVENUE = {
    percent_income_envenue: {
        $round: [
            {
                $multiply: [
                    {
                        $divide: [
                           "$profit_after_tax",
                            "$net_revenue"
                        ]
                    }, 100
                ]
            }, 2
        ]
    }
}


// export const PERCENT_INCOME = {
//     percent_income: {

//         $switch: {
//             branches: [
//                 {
//                     case: {
//                         $or: [
//                             { $eq: ['$total_income', 0] },
//                         ]
//                     },
//                     then: 100
//                 }
//             ],
//             default: {
//                 $round: [
//                     {
//                         $multiply: [
//                             {
//                                 $divide:
//                                     ['$total_net_income_business', "$total_income"]
//                             }, 100
//                         ]
//                     }, 2
//                 ]
//             }
//         }
//     }
// }

export const TOTAL_ORDER = {
    $sum: 1
}



export const TOTAL_ORDER_CONFIRM = {
    $sum: {
        $switch: {
            branches: [
                {
                    case: { $eq: ['$status', 'confirm'] },
                    then: 1
                }
            ],
            default: 0
        }
    }
}

export const TOTAL_ORDER_DOING = {
    $sum: {
        $switch: {
            branches: [
                {
                    case: { $eq: ['$status', 'doing'] },
                    then: 1
                }
            ],
            default: 0
        }
    }
}

export const TOTAL_ORDER_DONE = {
    $sum: {
        $switch: {
            branches: [
                {
                    case: { $eq: ['$status', 'done'] },
                    then: 1
                }
            ],
            default: 0
        }
    }
}

export const TOTAL_HOUR = {
    $sum: "$total_estimate"
}

export const TOTAL_FINAL_FEE = {
    $sum: "$final_fee"
}

export const TEMP_DATE_WORK = {
    tempDate: {
        $toDate: "$date_work"
    }
}

export const TEMP_DATE_CREATE = {
    tempDate: {
        $toDate: "$date_create"
    }
}

export const TEMP_CREATED_AT = {
    tempDate: {
        $toDate: "$created_at"
    }
}

// export const ID_ORDER_DAILY = { "$dateToString": { "format": "%d-%m-%Y", "date": "$tempDate" } }
export const ID_ORDER_DAILY = { "$dateToString": { "format": "%d-%m-%Y", "timezone": "Asia/Ho_Chi_Minh", "date": "$tempDate" } }
// export const ID_ORDER_DAILY = { "$dateToString": { "format": "%d-%m-%Y", "timezone": "Asia/Ho_Chi_Minh", "date": "$tempDate" } }



// export const GROUP_BY_DATE_CREATE = { "$dateToString": { "format": "%d-%m-%Y", "date": "$tempDate" } }
// export const GROUP_BY_DATE_WORK = { "$dateToString": { "format": "%d-%m-%Y", "date": "$tempDate" } }


export const AVG_ORDER_STAR = {
    $avg: {
        $cond: {
            if: {
                $gt: ["$star", 0],
            },
            then: "$star",
            else: 5,
        },
    }
}

export const ORDER_STAR = {
    $push: {
        $cond: {
            if: { $eq: ["$star", 0] }, then: 5, else: "$star"
        }
    }
}
export const AVG_COLLABORATOR_STAR = {
    $first: "$id_collaborator.star"
}
export const ID_ORDER = {
    $push: "$_id"
}

export const TOTAL_LATE_START = {
    $sum: {
        $cond: {
            if: { $gte: ["$timeDifferent", 15] }, then: 1, else: 0
        }
    }
}

export const TEMP_COLLABORATOR_DATE_START = {
    collaboratorStartDateWork: {
        $dateFromString: {
            dateString: "$collaborator_start_date_work"
        }
    }
}

export const TEMP_COLLABORATOR_DATE_END = {

}
export const TEMP_ORDER_DATE_WORK = {
    startDateWork: {
        $dateFromString: {
            dateString: "$date_work"
        }
    }
}

export const TEMP_ORDER_END_DATE_WORK = {

}

export const TIME_DIFFERRENT = {
    timeDifferent:
    {
        $dateDiff:
        {
            startDate: "$startDateWork",
            endDate: "$collaboratorStartDateWork",
            unit: "minute"
        }
    },
}

export const TOTAL_GIFT_REMAINDER = {
    $sum: '$remainder'
}

export const TOTAL_REMAINDER = {
    $sum: '$gift_remainder'
}

export const TOTAL_PAY_POINT = {
    $sum: '$pay_point'
}
export const TOTAL_PUNISH_MONEY = {
    $sum: '$money'
}

export const TOTAL_TRANS_MONEY = {
    $sum: '$money'
}
export const TOTAL_GIVEN_PAY_POINT = {
    $sum: '$payment_discount'
}

export const TOTAL_REWARD_MONEY = {
    $sum: '$money'
}

export const TOTAL_ORDER_PAY_POINT_FEE = { $sum: "$final_fee" }

export const TOTAL_PROMOTION_FEE = {
    $sum:
    {
        $cond: {
            if: {
                $ne: ["$code_promotion", null],
            },
            then: "$code_promotion.discount",
            else: 0,
        },
    }
}

export const TOTAL_EVENTS_FEE = {
    $sum: { $sum: "$event_promotion.discount" },

}

export const TOTAL_TIP_COLLABORATOR = {
    $sum: '$tip_collaborator',
}

export const TOTAL_PUNISH = { $sum: "$tempPunish" }
// export const TOTAL_PUNISH = { $sum: "$tempPunish" }




export const HISTORY_ACTIVITY_WALLET = [
    { type: "receive_done_order" },
    { type: "refund_platform_fee_cancel_order" },
    { type: "minus_platform_fee" },
    { type: "collaborator_minus_collaborator_fee" },
    { type: "refund_collaborator_fee" },
    { type: "receive_extra_collaborator_fee" },
    { type: "refund" },
    { type: "collaborator_penalty_cancel_job" },
    { type: "verify_top_up" },
    { type: "verify_withdraw" },
    { type: "collaborator_receive_platform_fee" },
    { type: "collaborator_receive_refund_money" },
    { type: "collaborator_refund_platform_fee" },
    { type: "verify_punish" },
    { type: "system_verify_punish" },
    { type: "verify_transaction_punish_ticket" },
    { type: "collaborator_receive_bonus_money" },
    { type: "admin_verify_info_reward_collaborator" },
    { type: "system_verify_info_reward_collaborator" },
    { type: "admin_cancel_punish" },
    { type: "auto_change_money_from_work_to_collaborator" },
    { type: "collaborator_change_money_wallet" },
    { type: "admin_support_change_money_wallet" },
    { type: "system_given_money" },
    { type: "system_balance_money" },
    { type: "system_holding_money_user" },
    { type: "admin_give_back_money_user" },
    // { type: "admin_revoke_punish_ticket" },
    { type: "refund_money_revoke_punish_ticket" },
    { type: "system_holding_money_user" },
    { type: "collaborator_holding" },
    { type: "system_punish_late_collaborator" },
    { type: "punish_collaborator" },
    { type: "verify_transaction_withdraw" },
    { type: "verify_transaction_top_up" },
    { type: "verify_transaction_refund_punish_ticket" },
    { type: "give_back_money_collaborator" },
    { type: "collaborator_refund_money" },
    { type: "collaborator_minus_platform_fee"},
    { type: "system_punish_collaborator"},
    { type: "admin_revoke_punish_money"},
    { type: "system_minus_platform_fee" },
    { type: "system_change_money_from_work_to_collaborator" },
    { type: "system_minus_new_platform_fee" },
    { type: "system_minus_remaining_shift_deposit" },
    { type: "system_add_reward_money" },
    { type: "system_log_violation_and_fine" },
];


// "cancel_order",
// "customer_cancel_order",
// "collaborator_cancel_order",
// "admin_cancel_order",
// "system_cancel_order",
// 'customer_cancel_group_order',
// 'collaborator_cancel_group_order',
// 'admin_cancel_group_order',
// 'system_cancel_group_order',

// "collaborator_refund_money",
// "customer_refund_money",
// "unassign_order_collaborator",
// "unassign_group_order_collaborator",
// "system_punish_collaborator"

export const HISTORY_ACTIVITY_WALLET_PUNISH = [
    { type: "admin_cancel_punish" },
    { type: "admin_cancel_punish_ticket" },
    { type: "refund_money_revoke_punish_ticket" },
    { type: "verify_punish" },
    { type: "system_verify_punish" },
    { type: "system_punish_late_collaborator" },
    { type: "punish_collaborator" },
    { type: "verify_transaction_refund_punish_ticket" },
]


export const TOTAL_REVIEW = {
    $sum: {
        $switch: {
            branches: [
                {
                    case: { $eq: ['$is_system_review', false] },
                    then: 1
                }
            ],
            default: 0
        }
    }
}

export const STAR_ORDER = (star: number) => {
    return {
        $sum: {
            $switch: {
                branches: [
                    {
                        case: {
                            $or: [
                                { $eq: ['$star', star] },
                                { $eq: ['$is_system_review', false] }
                            ]
                        },
                        then: 1
                    },
                ],
                default: 0
            }
        }
    }
}

export const INFO_LINKED_ONE_COLLABORATOR = (idCollaborator) => {
    return {$filter: { 
        input: "$info_linked_collaborator", 
        as: "collaborator", 
        cond: { 
            $eq: ["$$collaborator.id_collaborator", idCollaborator] } } }
}

// export const STAR_ORDER = {
//         $sum: {
//             $switch: {
//                 branches: [
//                     {
//                         case: { $eq: ['$star', 1] },
//                         then: 1
//                     },
//                 ],
//                 default: 0
//             }
//         }
// }



export const TOTAL_ORDER_BY_SERVICE = (idService) => {
    return {
        $sum: {
            $switch: {
                branches: [
                    {
                        case: { $eq: ['$service._id', idService] },
                        then: 1
                    }
                ],
                default: 0
            }
        }
    }
}

