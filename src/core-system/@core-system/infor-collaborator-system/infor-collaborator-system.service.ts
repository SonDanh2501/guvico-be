import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { OrderOopSystemService } from 'src/core-system/@oop-system/order-oop-system/order-oop-system.service';
@Injectable()
export class InforCollaboratorSystemService {
    constructor(
        private orderOopSystemService: OrderOopSystemService,
    ) { }
    async getInforReviews(iPage, idCollab) {
        try {

            const getList = await this.orderOopSystemService.getListOderByCollab(iPage, idCollab);

            return getList;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}
