import { Schema } from 'redis-om'

export const serviceRedisSchema = new Schema("services", {
    _id: {type: 'string'},
    detail_item: {type: 'string'}
  },
  {
    dataStructure: 'JSON'
  })
