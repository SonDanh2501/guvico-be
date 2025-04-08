import { Schema } from 'redis-om'

export const customerRedisSchema = new Schema("customers", {
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
