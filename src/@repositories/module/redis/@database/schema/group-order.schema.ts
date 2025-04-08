import { Schema } from 'redis-om'

export const groupOrderRedisSchema = new Schema("grouporders", {
    _id: {type: 'string'},
    detail_item: {type: 'string'}
  },
  {
    dataStructure: 'JSON'
  })
