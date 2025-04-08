import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CONFIG } from './config';

@Injectable()
export class VietmapService {
    constructor(
        private readonly httpService: HttpService
        // @InjectModel(Address.name) private addressModel: Model<AddressDocument>,
        ) {}

        async autoComplete(input) {
            try {
                // const url = `https://maps.vietmap.vn/api/autocomplete/v3?apikey=${CONFIG.api_key}&cityId={cityId}&text={text}&circle_center={circle_center}&circle_radius={circle_radius}&layers={layers}`
                const url = `https://maps.vietmap.vn/api/autocomplete/v3?apikey=${CONFIG.api_key}&text=${input}`
                const result = await this.httpService.axiosRef.get(url);
                return result;
            } catch (err) {
                throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }

        async placeDetail(place_id) {
            try {
                const url = `https://maps.vietmap.vn/api/place/v3?apikey=${CONFIG.api_key}&lng=${place_id}`
                const result = await this.httpService.axiosRef.get(url);
                return result;
            } catch (err) {
                throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }

        // async geocode(latlng) {
        //     try {
        //         const split = latlng.split(",");
        //         // const url = `https://maps.vietmap.vn/api/search/v3?apikey={your-apikey}&text={text}&focus={lat,long}&layers={Layers}`
        //         const url = `https://maps.vietmap.vn/api/search/v3?apikey=${CONFIG.api_key}&text={text}&focus={lat,long}&layers={Layers}`

        //         const result = await this.httpService.axiosRef.get(url);
        //         return result;
        //     } catch (err) {
        //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        //     }
        // }

        async reverse(latlng) {
            try {
                const split = latlng.split(",");
                const url = `https://maps.vietmap.vn/api/reverse/v3?apikey=${CONFIG.api_key}&lng=${split[1]}&lat=${split[0]}`
                const result = await this.httpService.axiosRef.get(url);
                return result;
            } catch (err) {
                throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }


        // public async autoComplete(input, idUser) {
        //     try {
        //         console.log(input,"input")
        //         const temp = encodeURI(input);
        //         // const url = `https://rsapi.goong.io/Place/AutoComplete?api_key=jdJrm5CpvV0FpLQaxvWeXngFu02W3jW3npPrQ1R5&input=${temp}`
        //         const url = `https://rsapi.goong.io/Place/AutoComplete?api_key=K6YbCtlzCGyTBd08hwWlzLCuuyTinXVRdMYDb8qJ&input=${temp}`

        //         const result = await this.httpService.axiosRef.get(url);
        //         return result.data;
        //     } catch (err) {
        //         throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        //     }
        // }

        // public async placeDetail(id, idUser) {
        //     try {
        //         // const url = `https://rsapi.goong.io/Place/Detail?place_id=${id}&api_key=jdJrm5CpvV0FpLQaxvWeXngFu02W3jW3npPrQ1R5`
        //         const url = `https://rsapi.goong.io/Place/Detail?place_id=${id}&api_key=K6YbCtlzCGyTBd08hwWlzLCuuyTinXVRdMYDb8qJ`

        //         const result = await this.httpService.axiosRef.get(url);
        //         return result.data;
        //     } catch (err) {
        //         throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        //     }
        // }

        // public async geocode(latlng, idUser) {
        //     try {
        //         const split = latlng.split(",");
        //         // const url = `https://rsapi.goong.io/Geocode?latlng=${split[0]},${split[1]}&api_key=jdJrm5CpvV0FpLQaxvWeXngFu02W3jW3npPrQ1R5`
        //         const url = `https://rsapi.goong.io/Geocode?latlng=${split[0]},${split[1]}&api_key=K6YbCtlzCGyTBd08hwWlzLCuuyTinXVRdMYDb8qJ`

        //         const result = await this.httpService.axiosRef.get(url);
        //         return result.data;
        //     } catch (err) {
        //         throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        //     }
        // }
}
