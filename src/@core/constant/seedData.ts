export const AREA_FEE_HOUR_1 = [
  {
    is_active: true,
    area_lv_1: 79,
    platform_fee: 25,
    price_type_increase: "amount",
    price: 86000,
    price_option_rush_day: [
      {
        rush_days: [1, 2, 3, 4, 5, 6, 0],
        start_time: "17:00:00.000Z",
        end_time: "23:59:59.999Z",
        time_zone_apply: 7,
        price_type_increase: "percent_accumulate",
        price: 14
      },
      {
        rush_days: [1, 2, 3, 4, 5, 6, 0],
        start_time: "07:00:00.000Z",
        end_time: "07:30:00.000Z",
        time_zone_apply: 7,
        price_type_increase: "percent_accumulate",
        price: 14
      },
      {
        rush_days: [6, 0],
        start_time: "00:00:00.000Z",
        end_time: "23:59:59.999Z",
        time_zone_apply: 7,
        price_type_increase: "percent_accumulate",
        price: 10
      }
    ],
    price_option_holiday: [
      {
        time_start: "2023-08-31T17:00:00.000Z",
        time_end: "2023-09-01T16:59:59.999Z",
        price_type_increase: "percent_accumulate",
        price: 50
      },
      {
        time_start: "2023-09-01T17:00:00.000Z",
        time_end: "2023-09-02T16:59:59.999Z",
        price_type_increase: "percent_accumulate",
        price: 50
      },
    ],
    area_lv_2: [
      {
        is_active: true,
        area_lv_2: [773, 775, 778, 776, 772, 761, 777, 764, 766, 767],
        price: 82000,
        is_platform_fee: false,
        platform_fee: 25
      },
      {
        is_active: true,
        area_lv_2: [760, 770, 774, 771, 768, 769],
        price: 84000,
        is_platform_fee: false,
        platform_fee: 25
      },
      {
        is_active: true,
        area_lv_2: [779, 780, 765],
        price: 86000,
        is_platform_fee: false,
        platform_fee: 25
      }
    ]
  },
  {
    is_active: true,
    area_lv_1: 74,
    platform_fee: 25,
    price_type_increase: "amount",
    price: 82000,
    price_option_rush_day: [
      {
        rush_days: [1, 2, 3, 4, 5, 6, 0],
        start_time: "17:00:00.000Z",
        end_time: "23:59:59.999Z",
        time_zone_apply: 7,
        price_type_increase: "percent_accumulate"
      },
      {
        rush_days: [1, 2, 3, 4, 5, 6, 0],
        start_time: "07:00:00.000Z",
        end_time: "08:30:00.000Z",
        time_zone_apply: 7,
        price_type_increase: "percent_accumulate"
      },
      {
        rush_days: [6, 0],
        start_time: "00:00:00.000Z",
        end_time: "23:59:59.999Z",
        time_zone_apply: 7,
        price_type_increase: "percent_accumulate"
      }
    ],
    price_option_holiday: [
      {
        time_start: "2023-06-04T17:00:00.000Z",
        time_end: "2023-06-05T16:59:59.999Z",
        price_type_increase: "percent_accumulate"
      },
      {
        time_start: "2023-04-29T17:00:00.000Z",
        time_end: "2023-04-30T16:59:59.999Z",
        price_type_increase: "percent_accumulate"
      },
      {
        time_start: "2023-04-30T17:00:00.000Z",
        time_end: "2023-05-01T16:59:59.999Z",
        price_type_increase: "percent_accumulate",
      },
      {
        time_start: "2023-05-01T17:00:00.000Z",
        time_end: "2023-05-02T16:59:59.999Z",
        price_type_increase: "percent_accumulate"
      }
    ],
    area_lv_2: [
      {
        is_active: true,
        area_lv_2: [724],
        price: 82000,
        is_platform_fee: false,
        platform_fee: 25
      },
      {
        is_active: true,
        area_lv_2: [718, 719, 720, 721, 722, 723, 725, 726],
        price: 82000,
        is_platform_fee: false,
        platform_fee: 25
      }
    ]
  }
]

export const AREA_FEE_HOUR_1_5 = [
  {
    is_active: true,
    area_lv_1: 79,
    platform_fee: 25,
    price_type_increase: "amount",
    price: 160000,
    price_option_rush_day: [
      {
        rush_days: [1, 2, 3, 4, 5, 6, 0],
        start_time: "17:00:00.000Z",
        end_time: "23:59:59.999Z",
        time_zone_apply: 7,
        price_type_increase: "percent_accumulate",
        price: 15
      },
      {
        rush_days: [1, 2, 3, 4, 5, 6, 0],
        start_time: "07:00:00.000Z",
        end_time: "08:30:00.000Z",
        time_zone_apply: 7,
        price_type_increase: "percent_accumulate",
        price: 15
      },
      {
        rush_days: [6, 0],
        start_time: "00:00:00.000Z",
        end_time: "23:59:59.999Z",
        time_zone_apply: 7,
        price_type_increase: "percent_accumulate",
        price: 10
      }
    ],
    price_option_holiday: [
      {
        time_start: "2023-08-31T17:00:00.000Z",
        time_end: "2023-09-01T16:59:59.999Z",
        price_type_increase: "percent_accumulate",
        price: 50
      },
      {
        time_start: "2023-09-01T17:00:00.000Z",
        time_end: "2023-09-02T16:59:59.999Z",
        price_type_increase: "percent_accumulate",
        price: 50
      },
    ],
    area_lv_2: [
      {
        is_active: true,
        area_lv_2: [773, 775, 778, 776, 772, 761, 777, 764, 766, 767],
        price: 160000,
        is_platform_fee: false,
        platform_fee: 25
      },
      {
        is_active: true,
        area_lv_2: [760, 770, 774, 771, 768, 769],
        price: 164000,
        is_platform_fee: false,
        platform_fee: 25
      },
      {
        is_active: true,
        area_lv_2: [779, 780, 765],
        price: 172000,
        is_platform_fee: false,
        platform_fee: 25
      }
    ]
  },
  {
    is_active: true,
    area_lv_1: 74,
    platform_fee: 25,
    price_type_increase: "amount",
    price: 164000,
    price_option_rush_day: [
      {
        rush_days: [1, 2, 3, 4, 5, 6, 0],
        start_time: "17:00:00.000Z",
        end_time: "23:59:59.999Z",
        time_zone_apply: 7,
        price_type_increase: "percent_accumulate"
      },
      {
        rush_days: [1, 2, 3, 4, 5, 6, 0],
        start_time: "07:00:00.000Z",
        end_time: "08:30:00.000Z",
        time_zone_apply: 7,
        price_type_increase: "percent_accumulate"
      },
      {
        rush_days: [6, 0],
        start_time: "00:00:00.000Z",
        end_time: "23:59:59.999Z",
        time_zone_apply: 7,
        price_type_increase: "percent_accumulate"
      }
    ],
    price_option_holiday: [
      {
        time_start: "2023-06-04T17:00:00.000Z",
        time_end: "2023-06-05T16:59:59.999Z",
        price_type_increase: "percent_accumulate"
      },
      {
        time_start: "2023-04-29T17:00:00.000Z",
        time_end: "2023-04-30T16:59:59.999Z",
        price_type_increase: "percent_accumulate"
      },
      {
        time_start: "2023-04-30T17:00:00.000Z",
        time_end: "2023-05-01T16:59:59.999Z",
        price_type_increase: "percent_accumulate",
      },
      {
        time_start: "2023-05-01T17:00:00.000Z",
        time_end: "2023-05-02T16:59:59.999Z",
        price_type_increase: "percent_accumulate"
      }
    ],
    area_lv_2: [
      {
        is_active: true,
        area_lv_2: [724],
        price: 164000,
        is_platform_fee: false,
        platform_fee: 25
      },
      {
        is_active: true,
        area_lv_2: [718, 719, 720, 721, 722, 723, 725, 726],
        price: 160000,
        is_platform_fee: false,
        platform_fee: 25
      }
    ]
  }
]

export const AREA_FEE_HOUR_2 = [
  {
    is_active: true,
    area_lv_1: 79,
    platform_fee: 25,
    price_type_increase: "amount",
    price: 184000,
    price_option_rush_day: [
      {
        rush_days: [1, 2, 3, 4, 5, 6, 0],
        start_time: "17:00:00.000Z",
        end_time: "23:59:59.999Z",
        time_zone_apply: 7,
        price_type_increase: "percent_accumulate",
        price: 15
      },
      {
        rush_days: [1, 2, 3, 4, 5, 6, 0],
        start_time: "07:00:00.000Z",
        end_time: "08:30:00.000Z",
        time_zone_apply: 7,
        price_type_increase: "percent_accumulate",
        price: 15
      },
      {
        rush_days: [6, 0],
        start_time: "00:00:00.000Z",
        end_time: "23:59:59.999Z",
        time_zone_apply: 7,
        price_type_increase: "percent_accumulate",
        price: 10
      }
    ],
    price_option_holiday: [
      {
        time_start: "2023-08-31T17:00:00.000Z",
        time_end: "2023-09-01T16:59:59.999Z",
        price_type_increase: "percent_accumulate",
        price: 50
      },
      {
        time_start: "2023-09-01T17:00:00.000Z",
        time_end: "2023-09-02T16:59:59.999Z",
        price_type_increase: "percent_accumulate",
        price: 50
      },
    ],
    area_lv_2: [
      {
        is_active: true,
        area_lv_2: [773, 775, 778, 776, 772, 761, 777, 764, 766, 767],
        price: 168000,
        is_platform_fee: false,
        platform_fee: 25
      },
      {
        is_active: true,
        area_lv_2: [760, 770, 774, 771, 768, 769],
        price: 172000,
        is_platform_fee: false,
        platform_fee: 25
      },
      {
        is_active: true,
        area_lv_2: [779, 780, 765],
        price: 184000,
        is_platform_fee: false,
        platform_fee: 25
      }
    ]
  },
  {
    is_active: true,
    area_lv_1: 74,
    platform_fee: 25,
    price_type_increase: "amount",
    price: 164000,
    price_option_rush_day: [
      {
        rush_days: [1, 2, 3, 4, 5, 6, 0],
        start_time: "17:00:00.000Z",
        end_time: "23:59:59.999Z",
        time_zone_apply: 7,
        price_type_increase: "percent_accumulate"
      },
      {
        rush_days: [1, 2, 3, 4, 5, 6, 0],
        start_time: "07:00:00.000Z",
        end_time: "08:30:00.000Z",
        time_zone_apply: 7,
        price_type_increase: "percent_accumulate"
      },
      {
        rush_days: [6, 0],
        start_time: "00:00:00.000Z",
        end_time: "23:59:59.999Z",
        time_zone_apply: 7,
        price_type_increase: "percent_accumulate"
      }
    ],
    price_option_holiday: [
      {
        time_start: "2023-06-04T17:00:00.000Z",
        time_end: "2023-06-05T16:59:59.999Z",
        price_type_increase: "percent_accumulate"
      },
      {
        time_start: "2023-04-29T17:00:00.000Z",
        time_end: "2023-04-30T16:59:59.999Z",
        price_type_increase: "percent_accumulate"
      },
      {
        time_start: "2023-04-30T17:00:00.000Z",
        time_end: "2023-05-01T16:59:59.999Z",
        price_type_increase: "percent_accumulate",
      },
      {
        time_start: "2023-05-01T17:00:00.000Z",
        time_end: "2023-05-02T16:59:59.999Z",
        price_type_increase: "percent_accumulate"
      }
    ],
    area_lv_2: [
      {
        is_active: true,
        area_lv_2: [724],
        price: 164000,
        is_platform_fee: false,
        platform_fee: 25
      },
      {
        is_active: true,
        area_lv_2: [718, 719, 720, 721, 722, 723, 725, 726],
        price: 160000,
        is_platform_fee: false,
        platform_fee: 25
      }
    ]
  }
]

export const AREA_FEE_HOUR_2_5 = [
  {
    is_active: true,
    area_lv_1: 79,
    platform_fee: 25,
    price_type_increase: "amount",
    price: 160000,
    price_option_rush_day: [
      {
        rush_days: [1, 2, 3, 4, 5, 6, 0],
        start_time: "17:00:00.000Z",
        end_time: "23:59:59.999Z",
        time_zone_apply: 7,
        price_type_increase: "percent_accumulate",
        price: 15
      },
      {
        rush_days: [1, 2, 3, 4, 5, 6, 0],
        start_time: "07:00:00.000Z",
        end_time: "08:30:00.000Z",
        time_zone_apply: 7,
        price_type_increase: "percent_accumulate",
        price: 15
      },
      {
        rush_days: [6, 0],
        start_time: "00:00:00.000Z",
        end_time: "23:59:59.999Z",
        time_zone_apply: 7,
        price_type_increase: "percent_accumulate",
        price: 10
      }
    ],
    price_option_holiday: [
      {
        time_start: "2023-08-31T17:00:00.000Z",
        time_end: "2023-09-01T16:59:59.999Z",
        price_type_increase: "percent_accumulate",
        price: 50
      },
      {
        time_start: "2023-09-01T17:00:00.000Z",
        time_end: "2023-09-02T16:59:59.999Z",
        price_type_increase: "percent_accumulate",
        price: 50
      },
    ],
    area_lv_2: [
      {
        is_active: true,
        area_lv_2: [773, 775, 778, 776, 772, 761, 777, 764, 766, 767],
        price: 160000,
        is_platform_fee: false,
        platform_fee: 25
      },
      {
        is_active: true,
        area_lv_2: [760, 770, 774, 771, 768, 769],
        price: 164000,
        is_platform_fee: false,
        platform_fee: 25
      },
      {
        is_active: true,
        area_lv_2: [779, 780, 765],
        price: 172000,
        is_platform_fee: false,
        platform_fee: 25
      }
    ]
  },
  {
    is_active: true,
    area_lv_1: 74,
    platform_fee: 25,
    price_type_increase: "amount",
    price: 164000,
    price_option_rush_day: [
      {
        rush_days: [1, 2, 3, 4, 5, 6, 0],
        start_time: "17:00:00.000Z",
        end_time: "23:59:59.999Z",
        time_zone_apply: 7,
        price_type_increase: "percent_accumulate"
      },
      {
        rush_days: [1, 2, 3, 4, 5, 6, 0],
        start_time: "07:00:00.000Z",
        end_time: "08:30:00.000Z",
        time_zone_apply: 7,
        price_type_increase: "percent_accumulate"
      },
      {
        rush_days: [6, 0],
        start_time: "00:00:00.000Z",
        end_time: "23:59:59.999Z",
        time_zone_apply: 7,
        price_type_increase: "percent_accumulate"
      }
    ],
    price_option_holiday: [
      {
        time_start: "2023-06-04T17:00:00.000Z",
        time_end: "2023-06-05T16:59:59.999Z",
        price_type_increase: "percent_accumulate"
      },
      {
        time_start: "2023-04-29T17:00:00.000Z",
        time_end: "2023-04-30T16:59:59.999Z",
        price_type_increase: "percent_accumulate"
      },
      {
        time_start: "2023-04-30T17:00:00.000Z",
        time_end: "2023-05-01T16:59:59.999Z",
        price_type_increase: "percent_accumulate",
      },
      {
        time_start: "2023-05-01T17:00:00.000Z",
        time_end: "2023-05-02T16:59:59.999Z",
        price_type_increase: "percent_accumulate"
      }
    ],
    area_lv_2: [
      {
        is_active: true,
        area_lv_2: [724],
        price: 164000,
        is_platform_fee: false,
        platform_fee: 25
      },
      {
        is_active: true,
        area_lv_2: [718, 719, 720, 721, 722, 723, 725, 726],
        price: 160000,
        is_platform_fee: false,
        platform_fee: 25
      }
    ]
  }
]

export const AREA_FEE_HOUR_3 = [
  {
    is_active: true,
    area_lv_1: 79,
    platform_fee: 25,
    price_type_increase: "amount",
    price: 276000,
    price_option_rush_day: [
      {
        rush_days: [1, 2, 3, 4, 5, 6, 0],
        start_time: "17:00:00.000Z",
        end_time: "23:59:59.999Z",
        time_zone_apply: 7,
        price_type_increase: "percent_accumulate",
        price: 15
      },
      {
        rush_days: [1, 2, 3, 4, 5, 6, 0],
        start_time: "07:00:00.000Z",
        end_time: "08:30:00.000Z",
        time_zone_apply: 7,
        price_type_increase: "percent_accumulate",
        price: 15
      },
      {
        rush_days: [6, 0],
        start_time: "00:00:00.000Z",
        end_time: "23:59:59.999Z",
        time_zone_apply: 7,
        price_type_increase: "percent_accumulate",
        price: 10
      }
    ],
    price_option_holiday: [
      {
        time_start: "2023-08-31T17:00:00.000Z",
        time_end: "2023-09-01T16:59:59.999Z",
        price_type_increase: "percent_accumulate",
        price: 50
      },
      {
        time_start: "2023-09-01T17:00:00.000Z",
        time_end: "2023-09-02T16:59:59.999Z",
        price_type_increase: "percent_accumulate",
        price: 50
      },
    ],
    area_lv_2: [
      {
        is_active: true,
        area_lv_2: [773, 775, 778, 776, 772, 761, 777, 764, 766, 767],
        price: 246000,
        is_platform_fee: false,
        platform_fee: 25
      },
      {
        is_active: true,
        area_lv_2: [760, 770, 774, 771, 768, 769],
        price: 252000,
        is_platform_fee: false,
        platform_fee: 25
      },
      {
        is_active: true,
        area_lv_2: [779, 780, 765],
        price: 276000,
        is_platform_fee: false,
        platform_fee: 25
      }
    ]
  },
  {
    is_active: true,
    area_lv_1: 74,
    platform_fee: 25,
    price_type_increase: "amount",
    price: 240000,
    price_option_rush_day: [
      {
        rush_days: [1, 2, 3, 4, 5, 6, 0],
        start_time: "17:00:00.000Z",
        end_time: "23:59:59.999Z",
        time_zone_apply: 7,
        price_type_increase: "percent_accumulate"
      },
      {
        rush_days: [1, 2, 3, 4, 5, 6, 0],
        start_time: "07:00:00.000Z",
        end_time: "08:30:00.000Z",
        time_zone_apply: 7,
        price_type_increase: "percent_accumulate"
      },
      {
        rush_days: [6, 0],
        start_time: "00:00:00.000Z",
        end_time: "23:59:59.999Z",
        time_zone_apply: 7,
        price_type_increase: "percent_accumulate"
      }
    ],
    price_option_holiday: [
      {
        time_start: "2023-06-04T17:00:00.000Z",
        time_end: "2023-06-05T16:59:59.999Z",
        price_type_increase: "percent_accumulate"
      },
      {
        time_start: "2023-04-29T17:00:00.000Z",
        time_end: "2023-04-30T16:59:59.999Z",
        price_type_increase: "percent_accumulate"
      },
      {
        time_start: "2023-04-30T17:00:00.000Z",
        time_end: "2023-05-01T16:59:59.999Z",
        price_type_increase: "percent_accumulate",
      },
      {
        time_start: "2023-05-01T17:00:00.000Z",
        time_end: "2023-05-02T16:59:59.999Z",
        price_type_increase: "percent_accumulate"
      }
    ],
    area_lv_2: [
      {
        is_active: true,
        area_lv_2: [724],
        price: 240000,
        is_platform_fee: false,
        platform_fee: 25
      },
      {
        is_active: true,
        area_lv_2: [718, 719, 720, 721, 722, 723, 725, 726],
        price: 240000,
        is_platform_fee: false,
        platform_fee: 25
      }
    ]
  }
]

export const AREA_FEE_HOUR_4 = [
  {
    is_active: true,
    area_lv_1: 79,
    platform_fee: 25,
    price_type_increase: "amount",
    price: 352000,
    price_option_rush_day: [
      {
        rush_days: [1, 2, 3, 4, 5, 6, 0],
        start_time: "17:00:00.000Z",
        end_time: "23:59:59.999Z",
        time_zone_apply: 7,
        price_type_increase: "percent_accumulate",
        price: 15
      },
      {
        rush_days: [1, 2, 3, 4, 5, 6, 0],
        start_time: "07:00:00.000Z",
        end_time: "08:30:00.000Z",
        time_zone_apply: 7,
        price_type_increase: "percent_accumulate",
        price: 15
      },
      {
        rush_days: [6, 0],
        start_time: "00:00:00.000Z",
        end_time: "23:59:59.999Z",
        time_zone_apply: 7,
        price_type_increase: "percent_accumulate",
        price: 10
      }
    ],
    price_option_holiday: [
      {
        time_start: "2023-08-31T17:00:00.000Z",
        time_end: "2023-09-01T16:59:59.999Z",
        price_type_increase: "percent_accumulate",
        price: 50
      },
      {
        time_start: "2023-09-01T17:00:00.000Z",
        time_end: "2023-09-02T16:59:59.999Z",
        price_type_increase: "percent_accumulate",
        price: 50
      },
    ],
    area_lv_2: [
      {
        is_active: true,
        area_lv_2: [773, 775, 778, 776, 772, 761, 777, 764, 766, 767],
        price: 320000,
        is_platform_fee: false,
        platform_fee: 25
      },
      {
        is_active: true,
        area_lv_2: [760, 770, 774, 771, 768, 769],
        price: 328000,
        is_platform_fee: false,
        platform_fee: 25
      },
      {
        is_active: true,
        area_lv_2: [779, 780, 765],
        price: 352000,
        is_platform_fee: false,
        platform_fee: 25
      }
    ]
  },
  {
    is_active: true,
    area_lv_1: 74,
    platform_fee: 25,
    price_type_increase: "amount",
    price: 320000,
    price_option_rush_day: [
      {
        rush_days: [1, 2, 3, 4, 5, 6, 0],
        start_time: "17:00:00.000Z",
        end_time: "23:59:59.999Z",
        time_zone_apply: 7,
        price_type_increase: "percent_accumulate"
      },
      {
        rush_days: [1, 2, 3, 4, 5, 6, 0],
        start_time: "07:00:00.000Z",
        end_time: "08:30:00.000Z",
        time_zone_apply: 7,
        price_type_increase: "percent_accumulate"
      },
      {
        rush_days: [6, 0],
        start_time: "00:00:00.000Z",
        end_time: "23:59:59.999Z",
        time_zone_apply: 7,
        price_type_increase: "percent_accumulate"
      }
    ],
    price_option_holiday: [
      {
        time_start: "2023-06-04T17:00:00.000Z",
        time_end: "2023-06-05T16:59:59.999Z",
        price_type_increase: "percent_accumulate"
      },
      {
        time_start: "2023-04-29T17:00:00.000Z",
        time_end: "2023-04-30T16:59:59.999Z",
        price_type_increase: "percent_accumulate"
      },
      {
        time_start: "2023-04-30T17:00:00.000Z",
        time_end: "2023-05-01T16:59:59.999Z",
        price_type_increase: "percent_accumulate",
      },
      {
        time_start: "2023-05-01T17:00:00.000Z",
        time_end: "2023-05-02T16:59:59.999Z",
        price_type_increase: "percent_accumulate"
      }
    ],
    area_lv_2: [
      {
        is_active: true,
        area_lv_2: [724],
        price: 320000,
        is_platform_fee: false,
        platform_fee: 25
      },
      {
        is_active: true,
        area_lv_2: [718, 719, 720, 721, 722, 723, 725, 726],
        price: 320000,
        is_platform_fee: false,
        platform_fee: 25
      }
    ]
  }
]



export const AREA_FEE_SCHEDULE_2 = [
  {
    is_active: true,
    area_lv_1: 79,
    platform_fee: 25,
    price_type_increase: "amount",
    price: 172000,
    price_option_rush_day: [
      {
        rush_days: [1, 2, 3, 4, 5, 6, 0],
        start_time: "17:00:00.000Z",
        end_time: "23:59:59.999Z",
        time_zone_apply: 7,
        price_type_increase: "percent_accumulate",
        price: 15
      },
      {
        rush_days: [1, 2, 3, 4, 5, 6, 0],
        start_time: "07:00:00.000Z",
        end_time: "08:30:00.000Z",
        time_zone_apply: 7,
        price_type_increase: "percent_accumulate",
        price: 15
      },
      {
        rush_days: [6, 0],
        start_time: "00:00:00.000Z",
        end_time: "23:59:59.999Z",
        time_zone_apply: 7,
        price_type_increase: "percent_accumulate",
        price: 10
      }
    ],
    price_option_holiday: [
      {
        time_start: "2023-08-31T17:00:00.000Z",
        time_end: "2023-09-01T16:59:59.999Z",
        price_type_increase: "percent_accumulate",
        price: 50
      },
      {
        time_start: "2023-09-01T17:00:00.000Z",
        time_end: "2023-09-02T16:59:59.999Z",
        price_type_increase: "percent_accumulate",
        price: 50
      },
    ],
    area_lv_2: [
      {
        is_active: true,
        area_lv_2: [773, 775, 778, 776, 772, 761, 777, 764, 766, 767],
        price: 160000,
        is_platform_fee: false,
        platform_fee: 25
      },
      {
        is_active: true,
        area_lv_2: [760, 770, 774, 771, 768, 769],
        price: 164000,
        is_platform_fee: false,
        platform_fee: 25
      },
      {
        is_active: true,
        area_lv_2: [779, 780, 765],
        price: 172000,
        is_platform_fee: false,
        platform_fee: 25
      }
    ]
  },
  {
    is_active: true,
    area_lv_1: 74,
    platform_fee: 25,
    price_type_increase: "amount",
    price: 164000,
    price_option_rush_day: [
      {
        rush_days: [1, 2, 3, 4, 5, 6, 0],
        start_time: "17:00:00.000Z",
        end_time: "23:59:59.999Z",
        time_zone_apply: 7,
        price_type_increase: "percent_accumulate"
      },
      {
        rush_days: [1, 2, 3, 4, 5, 6, 0],
        start_time: "07:00:00.000Z",
        end_time: "08:30:00.000Z",
        time_zone_apply: 7,
        price_type_increase: "percent_accumulate"
      },
      {
        rush_days: [6, 0],
        start_time: "00:00:00.000Z",
        end_time: "23:59:59.999Z",
        time_zone_apply: 7,
        price_type_increase: "percent_accumulate"
      }
    ],
    price_option_holiday: [
      {
        time_start: "2023-06-04T17:00:00.000Z",
        time_end: "2023-06-05T16:59:59.999Z",
        price_type_increase: "percent_accumulate"
      },
      {
        time_start: "2023-04-29T17:00:00.000Z",
        time_end: "2023-04-30T16:59:59.999Z",
        price_type_increase: "percent_accumulate"
      },
      {
        time_start: "2023-04-30T17:00:00.000Z",
        time_end: "2023-05-01T16:59:59.999Z",
        price_type_increase: "percent_accumulate",
      },
      {
        time_start: "2023-05-01T17:00:00.000Z",
        time_end: "2023-05-02T16:59:59.999Z",
        price_type_increase: "percent_accumulate"
      }
    ],
    area_lv_2: [
      {
        is_active: true,
        area_lv_2: [724],
        price: 164000,
        is_platform_fee: false,
        platform_fee: 25
      },
      {
        is_active: true,
        area_lv_2: [718, 719, 720, 721, 722, 723, 725, 726],
        price: 160000,
        is_platform_fee: false,
        platform_fee: 25
      }
    ]
  }
]

export const AREA_FEE_SCHEDULE_3 = [
  {
    is_active: true,
    area_lv_1: 79,
    platform_fee: 25,
    price_type_increase: "amount",
    price: 258000,
    price_option_rush_day: [
      {
        rush_days: [1, 2, 3, 4, 5, 6, 0],
        start_time: "17:00:00.000Z",
        end_time: "23:59:59.999Z",
        time_zone_apply: 7,
        price_type_increase: "percent_accumulate",
        price: 15
      },
      {
        rush_days: [1, 2, 3, 4, 5, 6, 0],
        start_time: "07:00:00.000Z",
        end_time: "08:30:00.000Z",
        time_zone_apply: 7,
        price_type_increase: "percent_accumulate",
        price: 15
      },
      {
        rush_days: [6, 0],
        start_time: "00:00:00.000Z",
        end_time: "23:59:59.999Z",
        time_zone_apply: 7,
        price_type_increase: "percent_accumulate",
        price: 10
      }
    ],
    price_option_holiday: [
      {
        time_start: "2023-08-31T17:00:00.000Z",
        time_end: "2023-09-01T16:59:59.999Z",
        price_type_increase: "percent_accumulate",
        price: 50
      },
      {
        time_start: "2023-09-01T17:00:00.000Z",
        time_end: "2023-09-02T16:59:59.999Z",
        price_type_increase: "percent_accumulate",
        price: 50
      },
    ],
    area_lv_2: [
      {
        is_active: true,
        area_lv_2: [773, 775, 778, 776, 772, 761, 777, 764, 766, 767],
        price: 240000,
        is_platform_fee: false,
        platform_fee: 25
      },
      {
        is_active: true,
        area_lv_2: [760, 770, 774, 771, 768, 769],
        price: 2460000,
        is_platform_fee: false,
        platform_fee: 25
      },
      {
        is_active: true,
        area_lv_2: [779, 780, 765],
        price: 258000,
        is_platform_fee: false,
        platform_fee: 25
      }
    ]
  },
  {
    is_active: true,
    area_lv_1: 74,
    platform_fee: 25,
    price_type_increase: "amount",
    price: 240000,
    price_option_rush_day: [
      {
        rush_days: [1, 2, 3, 4, 5, 6, 0],
        start_time: "17:00:00.000Z",
        end_time: "23:59:59.999Z",
        time_zone_apply: 7,
        price_type_increase: "percent_accumulate"
      },
      {
        rush_days: [1, 2, 3, 4, 5, 6, 0],
        start_time: "07:00:00.000Z",
        end_time: "08:30:00.000Z",
        time_zone_apply: 7,
        price_type_increase: "percent_accumulate"
      },
      {
        rush_days: [6, 0],
        start_time: "00:00:00.000Z",
        end_time: "23:59:59.999Z",
        time_zone_apply: 7,
        price_type_increase: "percent_accumulate"
      }
    ],
    price_option_holiday: [
      {
        time_start: "2023-06-04T17:00:00.000Z",
        time_end: "2023-06-05T16:59:59.999Z",
        price_type_increase: "percent_accumulate"
      },
      {
        time_start: "2023-04-29T17:00:00.000Z",
        time_end: "2023-04-30T16:59:59.999Z",
        price_type_increase: "percent_accumulate"
      },
      {
        time_start: "2023-04-30T17:00:00.000Z",
        time_end: "2023-05-01T16:59:59.999Z",
        price_type_increase: "percent_accumulate",
      },
      {
        time_start: "2023-05-01T17:00:00.000Z",
        time_end: "2023-05-02T16:59:59.999Z",
        price_type_increase: "percent_accumulate"
      }
    ],
    area_lv_2: [
      {
        is_active: true,
        area_lv_2: [724],
        price: 240000,
        is_platform_fee: false,
        platform_fee: 25
      },
      {
        is_active: true,
        area_lv_2: [718, 719, 720, 721, 722, 723, 725, 726],
        price: 240000,
        is_platform_fee: false,
        platform_fee: 25
      }
    ]
  }
]

export const AREA_FEE_SCHEDULE_4 = [
  {
    is_active: true,
    area_lv_1: 79,
    platform_fee: 25,
    price_type_increase: "amount",
    price: 34400,
    price_option_rush_day: [
      {
        rush_days: [1, 2, 3, 4, 5, 6, 0],
        start_time: "17:00:00.000Z",
        end_time: "23:59:59.999Z",
        time_zone_apply: 7,
        price_type_increase: "percent_accumulate",
        price: 15
      },
      {
        rush_days: [1, 2, 3, 4, 5, 6, 0],
        start_time: "07:00:00.000Z",
        end_time: "08:30:00.000Z",
        time_zone_apply: 7,
        price_type_increase: "percent_accumulate",
        price: 15
      },
      {
        rush_days: [6, 0],
        start_time: "00:00:00.000Z",
        end_time: "23:59:59.999Z",
        time_zone_apply: 7,
        price_type_increase: "percent_accumulate",
        price: 10
      }
    ],
    price_option_holiday: [
      {
        time_start: "2023-08-31T17:00:00.000Z",
        time_end: "2023-09-01T16:59:59.999Z",
        price_type_increase: "percent_accumulate",
        price: 50
      },
      {
        time_start: "2023-09-01T17:00:00.000Z",
        time_end: "2023-09-02T16:59:59.999Z",
        price_type_increase: "percent_accumulate",
        price: 50
      },
    ],
    area_lv_2: [
      {
        is_active: true,
        area_lv_2: [773, 775, 778, 776, 772, 761, 777, 764, 766, 767],
        price: 320000,
        is_platform_fee: false,
        platform_fee: 25
      },
      {
        is_active: true,
        area_lv_2: [760, 770, 774, 771, 768, 769],
        price: 328000,
        is_platform_fee: false,
        platform_fee: 25
      },
      {
        is_active: true,
        area_lv_2: [779, 780, 765],
        price: 34400,
        is_platform_fee: false,
        platform_fee: 25
      }
    ]
  },
  {
    is_active: true,
    area_lv_1: 74,
    platform_fee: 25,
    price_type_increase: "amount",
    price: 320000,
    price_option_rush_day: [
      {
        rush_days: [1, 2, 3, 4, 5, 6, 0],
        start_time: "17:00:00.000Z",
        end_time: "23:59:59.999Z",
        time_zone_apply: 7,
        price_type_increase: "percent_accumulate"
      },
      {
        rush_days: [1, 2, 3, 4, 5, 6, 0],
        start_time: "07:00:00.000Z",
        end_time: "08:30:00.000Z",
        time_zone_apply: 7,
        price_type_increase: "percent_accumulate"
      },
      {
        rush_days: [6, 0],
        start_time: "00:00:00.000Z",
        end_time: "23:59:59.999Z",
        time_zone_apply: 7,
        price_type_increase: "percent_accumulate"
      }
    ],
    price_option_holiday: [
      {
        time_start: "2023-06-04T17:00:00.000Z",
        time_end: "2023-06-05T16:59:59.999Z",
        price_type_increase: "percent_accumulate"
      },
      {
        time_start: "2023-04-29T17:00:00.000Z",
        time_end: "2023-04-30T16:59:59.999Z",
        price_type_increase: "percent_accumulate"
      },
      {
        time_start: "2023-04-30T17:00:00.000Z",
        time_end: "2023-05-01T16:59:59.999Z",
        price_type_increase: "percent_accumulate",
      },
      {
        time_start: "2023-05-01T17:00:00.000Z",
        time_end: "2023-05-02T16:59:59.999Z",
        price_type_increase: "percent_accumulate"
      }
    ],
    area_lv_2: [
      {
        is_active: true,
        area_lv_2: [724],
        price: 320000,
        is_platform_fee: false,
        platform_fee: 25
      },
      {
        is_active: true,
        area_lv_2: [718, 719, 720, 721, 722, 723, 725, 726],
        price: 320000,
        is_platform_fee: false,
        platform_fee: 25
      }
    ]
  }
]