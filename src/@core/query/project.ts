export const PROJECT_ADMIN_VERIFY = {
    'id_admin_verify.password': 0, 'id_admin_verify.salt': 0,
    'id_admin_verify.date_create': 0
}

export const PROJECT_COLLABORATOR = {
    'id_collaborator.password': 0, 'id_collaborator.salt': 0,
    'id_collaborator.date_create': 0, 'id_collaborator.permanent_address': 0, 'id_collaborator.religion': 0,
    'id_collaborator.folk': 0,
    'id_collaborator.temporary_address': 0, 'id_collaborator.identity_date': 0,
    'id_collaborator.identity_place': 0, 'id_collaborator.identity_number': 0, 'id_collaborator.edu_level': 0,
    'id_collaborator.password_default': 0,
    'id_collaborator.token': 0, 'id_collaborator.is_delete_trans': 0,
    'id_collaborator.is_delete': 0, 'id_collaborator.is_active': 0, 'id_collaborator.account_number': 0,
    'id_collaborator.default_address': 0, 'id_collaborator.personal_infor_image': 0,
    'id_collaborator.is_personal_infor': 0, 'id_collaborator.identity_backside': 0,
    'id_collaborator.is_identity': 0, 'id_collaborator.is_corporation': 0,
    'id_collaborator.bank_name': 0, 'id_collaborator.account_name': 0,
    'id_collaborator.total_discount': 0, 'id_collaborator.total_job': 0,
    'id_collaborator.is_document_code': 0, 'id_collaborator.document_code': 0,
    'id_collaborator.behaviour_image': 0, 'id_collaborator.is_behaviour': 0,
    'id_collaborator.household_book_image': 0, 'id_collaborator.is_household_book': 0,
    'id_collaborator.total_collaborator_fee': 0, 'id_collaborator.percent_income': 0,
    'id_collaborator.total_net_income_of_business': 0, 'id_collaborator.total_service_fee': 0,
    'id_collaborator.total_net_income': 0, 'id_collaborator.identity_frontside': 0,
    'id_collaborator.is_added_gift_remainder': 0, 'id_collaborator.__v': 0,
    'id_collaborator.is_contacted': 0, 'id_collaborator.type': 0,
    'id_collaborator.service_apply': 0, 'id_collaborator.level': 0,
    'id_collaborator.client_id': 0, 'id_collaborator.client_idreward_received': 0,
    'id_collaborator.ordinal_number': 0, 'id_collaborator.total_review': 0,
    'id_collaborator.total_star': 0, 'id_collaborator.is_lock_time': 0,
    'id_collaborator.district': 0, 'id_collaborator.city': 0,
    'id_collaborator.month_birthday': 0, 'id_collaborator.lock_time': 0,
}

export const PROJECT_ORDER = {
    'id_order.service': 0, 'id_order.location': 0, 'id_order.net_income_collaborator': 0, 'id_order.final_fee': 0,
    'id_order.platform_fee': 0, 'id_order.refurn_fee': 0,
    'id_order.lat': 0, 'id_order.lng': 0,
    'id_order.service_fee': 0, 'id_order.ordinal_number': 0,
    'id_order.id_favourite_collaborator': 0, 'id_order.id_block_collaborator': 0,
    'id_order.is_system_review': 0, 'id_order.active_quick_review': 0,
    'id_order.id_cancel_collaborator': 0, 'id_order.group_id_collaborator_second': 0,
    'id_order.id_group_order': 0, 'id_order.refund_money': 0,
    'id_order.pending_money': 0, 'id_order.gross_income_collaborator': 0,
    'id_order.initial_fee': 0, 'id_order.id_cancel_customer': 0,
    'id_order.is_duplicate': 0, 'id_order.note_address': 0,
    'id_order.type_address_work': 0, 'id_order.__v': 0,
    'id_order.is_hide': 0, 'id_order.is_check_admin': 0,
    'id_order.id_promotion': 0, 'id_order.district': 0,
    'id_order.city': 0, 'id_order.note_admin': 0,
}

export const PROJECT_GET_LIST = {
    ...PROJECT_ADMIN_VERIFY, ...PROJECT_COLLABORATOR, ...PROJECT_ORDER
}

export const PROJECT_CUSTOMER = {
    'id_customer.password': 0, 'id_customer.salt': 0, 'id_customer.date_create': 0,
    'id_customer.id_group_customer': 0, 'id_customer.total_price': 0, 'id_customer.is_lock_time': 0,
    'id_customer.__v': 0, 'id_customer.id_inviter': 0, 'id_customer.invite_code': 0,
    'id_customer.my_promotion': 0, 'id_customer.client_id': 0, 'id_customer.reputation_score': 0,
    'id_customer.ordinal_number': 0, 'id_customer.invalid_password': 0, 'id_customer.month_birthday': 0,
}