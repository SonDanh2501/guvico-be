export enum TYPE_SUBJECT_ACTION {
    collaborator = 'collaborator',
    customer = 'customer',
    admin = 'admin',
    system = 'system'
}

/** Xep hang diem khach hang */
export enum TYPE_RANK_CUSTOMER {
    member = 'member',
    silver = 'silver',
    gold = 'gold',
    platinum = 'platinum',
}

export enum TYPE_USER_OBJECT {
    collaborator = 'collaborator',
    customer = 'customer',
    admin = 'admin',
    system = 'system'
}

export enum TYPE_SERVER_GATEWAY {
    collaborator = 'collaborator',
    customer = 'customer',
    admin = 'admin'
}

export enum TYPE_REFERRAL_CODE {
    promotional = 'p', // Gui ma giam gia cho nguoi duoc gioi thieu
    discount = 'd' // Nhan chiet khau tu don dau tien
}

export enum STATUS_SEND_FIREBASE {
    none = 'none',    
    done = 'done',   
    fail = 'fail',   
}

export enum STATUS_TRANSACTION {
    create = 'create',
    pending = 'pending',
    holding = "holding",
    done = "done",
    cancel = "cancel",
    transferred = "transferred",
    refund = 'refund',
    processing = 'processing'
}

export enum NOTIFICATION_SOUND {
    duplicatesoundguvi = 'duplicatesoundguvi',    
    soundguvi = 'soundguvi',
    default = 'default',
}

export enum TYPE_LINK_ADVERTISEMENT {
    deep_link = 'deep_link',
    web_link = 'web_link',
    in_app = 'in_app',
}

export enum TYPE_ACTION {
    confirm_job = 'confirm_job',
    other = 'other',
}

export enum TYPE_SHIFT_DEPOSIT {
    platform_fee = 'platform_fee',
    final_fee = 'final_fee',
}

export enum USER_TYPE {
    collaborator = 'collaborator',
    customer = 'customer'
}

export enum PHONE_OTP_TYPE {
    sms = 'sms',
    zns = 'zns',
    etelecom = 'etelecom',
}

export enum LEADER_BOARD_TYPE {
    week = 'week',
    month = 'month',
}