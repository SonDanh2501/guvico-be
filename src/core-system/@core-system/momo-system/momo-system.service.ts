import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { MomoService } from 'src/@share-module/@momo/momo.service'
import { CustomerOopSystemService } from 'src/core-system/@oop-system/customer-oop-system/customer-oop-system.service'

@Injectable()
export class MomoSystemService {
    constructor(
        private customerOopSystemService: CustomerOopSystemService,
        private momoService: MomoService,
    ) { }

    async handleMomoIpnLink(lang, payload) {
        try {
            const token = this.momoService.getRecurringToken(lang, payload)
            const idCustomer = payload.partnerClientId
            // console.log('token', token)
            const result = await this.customerOopSystemService.updateDataMomoCustomer(lang, token, idCustomer);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


}