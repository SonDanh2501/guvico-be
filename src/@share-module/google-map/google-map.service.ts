import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CustomExceptionService } from '../custom-exception/custom-exception.service';

@Injectable()
export class GoogleMapService {
    constructor(
        private customExceptionService: CustomExceptionService,
        private readonly httpService: HttpService
        // @InjectModel(Address.name) private addressModel: Model<AddressDocument>,
        ) {}


        public async autoComplete(input, idUser) {
            try {
                console.log(input,"input")
                const temp = encodeURI(input);
                // const url = `https://rsapi.goong.io/Place/AutoComplete?api_key=jdJrm5CpvV0FpLQaxvWeXngFu02W3jW3npPrQ1R5&input=${temp}`
                const url = `https://rsapi.goong.io/Place/AutoComplete?api_key=no_secret_key&input=${temp}`

                const result = await this.httpService.axiosRef.get(url);
                return result.data;
            } catch (err) {
                throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
            }
        }

        public async placeDetail(id, idUser) {
            try {
                // const url = `https://rsapi.goong.io/Place/Detail?place_id=${id}&api_key=jdJrm5CpvV0FpLQaxvWeXngFu02W3jW3npPrQ1R5`
                const url = `https://rsapi.goong.io/Place/Detail?place_id=${id}&api_key=no_secret_key`

                const result = await this.httpService.axiosRef.get(url);
                return result.data;
            } catch (err) {
                throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
            }
        }

        public async geocode(latlng, idUser) {
            try {
                const split = latlng.split(",");
                // const url = `https://rsapi.goong.io/Geocode?latlng=${split[0]},${split[1]}&api_key=jdJrm5CpvV0FpLQaxvWeXngFu02W3jW3npPrQ1R5`
                const url = `https://rsapi.goong.io/Geocode?latlng=${split[0]},${split[1]}&api_key=no_secret_key`

                const result = await this.httpService.axiosRef.get(url);
                return result.data;
            } catch (err) {
                throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
            }
        }
        // 
}
