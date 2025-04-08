export const POP_CUSTOMER_CITY = { path: 'id_customer', select: { city: 1 } }

export const POP_CUSTOMER_ADDRESS = { path: 'default_address', select: { name: 1, address: 1, _id: 1 } }

export const POP_CUSTOMER_INFO = { path: 'id_customer', select: {_id: 1, full_name: 1, phone: 1, avatar: 1, id_view: 1, code_phone_area: 1, email: 1, city: 1, rank_point: 1, rank: 1, id_favourite_collaborator: 1, id_block_collaborator: 1 } }

export const POP_COLLABORATOR_INFO = { path: 'id_collaborator', select: { _id: 1, full_name: 1, avatar: 1, id_view: 1, phone: 1, code_phone: 1, level: 1, star: 1, id_business: 1 } }

export const POP_SERVICE_TITLE = { path: 'service._id', select: { title: 1 } }
export const POP_SERVICE = { path: 'service._id', select: { title: 1, kind: 1 } }
export const POP_ORDER_IN_GROUP_ORDER = {path: 'id_order', select: { _id: 1, id_view: 1, star: 1, date_work: 1 }}


export const POP_ROLE_ADMIN = {
    path: 'id_role_admin', select: {
        _id: 1, type_role: 1, name_role: 1, is_active: 1,
        area_manager_level_0: 1, area_manager_level_1: 1, area_manager_level_2: 1,
        id_key_api: 1, is_area_manager: 1, is_permission: 1
    }
}

export const POP_USER_SYSTEM = (path) => {
  return {
    path: path, select: { full_name: 1 }
  } 
}