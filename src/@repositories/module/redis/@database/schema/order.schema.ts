import { Schema } from 'redis-om'

export const orderRedisSchema = new Schema("orders", {
    _id: {type: 'string'},
    detail_item: {type: 'string'}
  },
  {
    dataStructure: 'JSON'
  })
