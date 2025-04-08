export enum SUBJECT_ENUM {
    collaborator = 'collaborator',
    customer = 'customer',
    other = 'other',
}

export enum KIND_TRANSFER {
    income = 'income',
    expense = 'expense',
    transfer = 'transfer'
}

export enum TYPE_TRANSACTION_TICKET {
    income = 'income',
    expense = 'expense',
    transfer = 'transfer'
}

export enum TYPE_TRANSFER {
    withdraw = 'withdraw',
    top_up = 'top_up',
    pay_service = 'pay_service',
    refund_service = 'refund_service',
    reward = "reward",
    punish = "punish",
    other = 'other',
    change = "change",
    confirm_payment = "confirm_payment", // xac nhan lien ket vi lan dau
    order_payment = "order_payment",
    withdraw_affiliate = 'withdraw_affiliate' // Rút tiền từ chương trình affiliate 
}

export enum TYPE_BANK {
    bank = 'bank',
    vnpay = 'vnpay',
    momo = 'momo',
    viettel_money = 'viettel_money',
}

/** Phuong thuc thanh toan */
export enum PAYMENT_METHOD {
    bank = 'bank',
    vnpay = 'vnpay',
    vnbank = 'vnbank',
    intcard = 'intcard',
    momo = 'momo',
    viettel_money = 'viettel_money',
    cash = 'cash',
    point = 'point'
}


export enum PAYMENT_ENUM {
    bank = 'bank',
    vnpay = 'vnpay',
    vnbank = 'vnbank',
    intcard = 'intcard',
    momo = 'momo',
    viettel_money = 'viettel_money',
    work_wallet = 'work_wallet',
    collaborator_wallet = 'collaborator_wallet',
    pay_point = 'pay_point',
    other = 'other',
    cash_book = 'cash_book',
    cash = 'cash',
    bank_com = 'bank_com',
    vnpay_com = 'vnpay_com',
    momo_com = 'momo_com',
    custom = 'custom',
    a_pay = 'a_pay',
    bank_guvi = 'bank_guvi'
}

export enum TYPE_WALLET {
    work_wallet = 'work_wallet',
    collaborator_wallet = 'collaborator_wallet',
    pay_point = 'pay_point',
    a_pay = 'a_pay',
    other = 'other',
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

export enum PAYMENT_LINK_TYPE {
    top_up = 'top_up',
    order_payment = 'order_payment',
}