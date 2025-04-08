import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager'
import { API_CACHING_COMPONENT } from './config';

let arrApiKey = []
for(const item of API_CACHING_COMPONENT) {
    arrApiKey = [...arrApiKey, ...item.key]
}

@Injectable()
export class CachingRedisService {
    constructor (
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) {}

    async get(key) {
        try {
            // console.log(key, 'key');
            
            // const temp = await this.cacheManager
            console.log();
            


            key = await this.filterKey(key);

            const data = await this.cacheManager.get(key);
            return data;
        } catch (err) {
            console.log(err, "error caching");
        }
    }

    async set(key, value) {
        try {

            key = await this.filterKey(key);

            await this.cacheManager.set(key, value, 150000);
            return true;
        } catch (err) {
            console.log(err, "error caching");
            
        }
    }

    async del(key) {
        try {
            await this.cacheManager.del(key);
            return true;
        } catch (err) {
            console.log(err, "error caching");
        }
    }

    private filterKey(payloadKey) {
        try {

            // cac api co tien to nay se duoc tinh la goi chung, khong 
            const api = [
                'collaborator/setting',
                'customer/setting',
                'admin/report_mananger'
            ]
            console.log(payloadKey, 'payloadKey');
            


            for(let i = 0 ; i < api.length ; i++){
                const index = payloadKey.indexOf(i);
                if(index > -1) {
                    payloadKey = payloadKey.split("@")[0]
                }
            }
            payloadKey = payloadKey.replace('undefined', '');
            console.log(payloadKey, 'payloadKey');

            return payloadKey;
        } catch (err) {
            console.log(err, "error filterKey caching");
        }
    }
}
