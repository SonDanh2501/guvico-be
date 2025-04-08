export enum PROMOTION_TYPE {
    code = 'code',
    event = 'event'
}

export enum DISCOUNT_UNIT {
    percent = 'percent',
    amount = 'amount',
    same_price = 'same_price'
}

export enum DISCOUNT_TYPE {
    order = 'order',
    same_price = 'same_price',
    discount_service_fee = 'discount_service_fee',
    partner_promotion = 'partner_promotion'
}

export enum PROMOTION_STATUS {
    doing = 'doing',
    upcoming = 'upcoming',
    out_of_stock = 'out_of_stock',
    out_of_date = 'out_of_date',
    done = 'done',
}

export enum PROMOTION_ACTION_TYPE {
    use_in_app = 'use_in_app',
    exchange = 'exchange',
    info = 'info',
}

