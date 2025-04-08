export enum USER_APPLY{
    collaborator='collaborator',
    customer = 'customer'
}

export enum PUNISH_MONEY_TYPE{
    amount='amount',
    percent_of_initial_fee_order='percent_of_initial_fee_order'
}

export enum ACTION_LOCK{
    lock_create_order='lock_create_order',
    lock_pending_to_confirm='lock_pending_to_confirm',
    lock_login='lock_login',
    unset='unset'
}

export enum PUNISH_LOCK_TIME_TYPE{
    minute='minute',
    lifetime='lifetime',
    hours='hours',
    unset='unset'
}

export enum STATUS{
    standby='standby',
    doing="doing",
    pause="pause"
}

export enum PUNISH_TYPE  {
    reminder = 'reminder',
    punish = 'punish',
}

export enum PUNISH_VALUE_TYPE {
    money = 'money',
    percent = 'percent',
    none = 'none',
}

export enum DEPENDENCY_ORDER_VALUE {
    initial_fee = 'initial_fee',
    final_fee = 'final_fee',
    subtotal_fee = 'subtotal_fee',
    total_estimate = 'total_estimate',
    none = 'none'
}

export enum PUNISH_FUNCTION_TYPE {
    lock_login = 'lock_login',
    lock_confirm_order = 'lock_confirm_order',
    none = 'none',
}

export enum CYCLE_TIME_TYPE {
    year = 'year',
    month = 'month',
    week = 'week',
    day = 'day',
    hour = 'hour'
}

export enum REWARD_VALUE_TYPE {
    money = 'money',
    percent = 'percent',
    point = 'point',
    none = 'none',
}

export enum REWARD_POLICY_TYPE {
    reward_milestone = 'reward_milestone',
    reward = 'reward'
}

export enum REWARD_WALLET_TYPE {
    collaborator_wallet = 'collaborator_wallet',
    work_wallet = 'work_wallet',
    reward_point = 'reward_point',
    none = 'none',
}

export enum PUNISH_POLICY_TYPE {
    punish_milestone = 'punish_milestone',
    punish = 'punish'
}