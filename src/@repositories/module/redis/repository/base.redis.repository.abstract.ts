import { Repository } from "redis-om";
import { createClient } from "redis";
import { OnModuleDestroy } from "@nestjs/common";
import { collaboratorRedisSchema } from "../@database";
import { BaseRedisRepositoryInterface } from "../interface/base.redis.interface";
import { CONFIG_REDIS } from "../configRedis";
// import { CONFIG_REDIS } from "src/@core";

let connect = false;

export abstract class BaseRedisRepositoryAbstract implements BaseRedisRepositoryInterface<any>, OnModuleDestroy
{
    private repository: any
    private redis: any
    protected constructor(
        private readonly schema: any
    ) {
        this.schema = schema
        this.redis = createClient({ url: `redis://${CONFIG_REDIS.host}:${CONFIG_REDIS.port}` })
        // this.redis.on('error', (error) => {
        //     connect = false;
        //     console.error(error)
        // } )
        // await this.redis.connect().then(data => connect = true)
        // connect = true;
        // if(connect)

        // this.repository = new Repository(this.schema, this.redis)
        // this.repository.createIndex()
        this.connectToRedis();
        this.handleStatusConnect();
    }

    private handleStatusConnect() {
        this.redis.on('error', (error) => {
            if(connect === true) {
                console.log(error, "error connect redis");
            }
            connect = false;
        } )
        // this.redis.on('connect', (data) => {
        //     // connect = false;
        //     console.log(data, 'connect')
        // } )
        this.redis.on('ready', () => {
            connect = true;
            console.log("ready connect redis");
        } )
        // this.redis.on('reconnecting', (data) => {
        //     // connect = false;
        //     console.log(data, 'reconnecting')
        // })
    }

    private async connectToRedis() {
        try {
            await this.redis.connect().then()
            this.repository = new Repository(this.schema, this.redis)
            this.repository.createIndex()
            return true;
        } catch (err) {
            console.error(err, 'exception connect redis')
            connect = false;
        }
    }



    returnIsReadyConnect() {
        return connect;
    }


    async findOneById(id: string): Promise<any> {
        const item = await this.repository.fetch(id);
        if(item._id && item.detail_item) return JSON.parse(item?.detail_item) || null;
        else return null;
    }

    async saveItem(payload):  Promise<any> {
        let tempPayload = {}

        for(let i = 0 ; i < this.schema.fields.length ; i++) {
            switch(this.schema.fields[i].name) {
                case "_id": {
                    tempPayload[this.schema.fields[i].name] = payload[this.schema.fields[i].name].toString()
                    break;
                }
                case "detail_item": {
                    tempPayload[this.schema.fields[i].name] = JSON.stringify(payload)
                    break;
                }
                default: {
                    tempPayload[this.schema.fields[i].name] = payload[this.schema.fields[i].name]
                    break;
                }
            }
        }
        
        const item = await this.repository.save(payload._id.toString(), tempPayload);
        
        return item;


        // let tempPayload = {}
        // for(let i = 0 ; i < this.schema.fields.length ; i++) {
        //     if(collaboratorRedisSchema.fields[i].name === "_id") tempPayload[collaboratorRedisSchema.fields[i].name] = payload[collaboratorRedisSchema.fields[i].name].toString()
        //     else tempPayload[collaboratorRedisSchema.fields[i].name] = payload[collaboratorRedisSchema.fields[i].name]
        // }
        // const item = await this.repository.save(payload._id.toString(), tempPayload);
        // return item;
    }

    async findByIdAndUpdate(id, payload: Object): Promise<any> {
        // this.cacheManager.set(id, payload);
        let tempPayload = {}
        for(let i = 0 ; i < this.schema.fields.length ; i++) {
            switch(this.schema.fields[i].name) {
                case "_id": {
                    tempPayload[this.schema.fields[i].name] = payload[this.schema.fields[i].name].toString()
                    break;
                }
                case "detail_item": {
                    tempPayload[this.schema.fields[i].name] = JSON.stringify(payload)
                    break;
                }
                default: {
                    tempPayload[this.schema.fields[i].name] = payload[this.schema.fields[i].name]
                    break;
                }
            }
        }
        const item = await this.repository.save(id, tempPayload);
        return true;
    }

    async findByIdAndDelete(id: string): Promise<any> {
        // this.cacheManager.del(id);
        return true;
    }
    
    // async search()

    // async deleteItem()


    async onModuleDestroy() {
        this.redis.quit()
    }
}