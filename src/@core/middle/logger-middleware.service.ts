import { Injectable, NestMiddleware } from '@nestjs/common';

import { FastifyRequest, FastifyReply } from 'fastify';
@Injectable()
export class LoggerMiddleWareService implements NestMiddleware {
  constructor(
) { }
    use(req: FastifyRequest, res: FastifyReply, next: () => void) {



        // console.log(req.body, 'Request...');
        // console.log(req.res, 'Request...');
        // this.groupCustomerSystemService.updateConditionIn(findGroupOrder.id_customer)
        // this.groupCustomerSystemService.updateConditionOut(findGroupOrder.id_customer)
      // this.groupCustomerSystemService.updateConditionIn();
      // const temp = JSON.parse(res);
        // console.log(res, 'Response...');
      //   console.log(  res.ServerResponse, 'Response...');
        next();
      }
}
