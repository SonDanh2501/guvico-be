import { Schema } from 'redis-om'

export const userSystemRedisSchema = new Schema("usersystems", {
    _id: {type: 'string'},
    phone: { type: 'string'},
    code_phone_area: { type: 'string' },
    email: { type: 'string' },
    full_name: { type: 'string' },
    detail_item: {type: 'string'}
  },
  {
    dataStructure: 'JSON'
  })
