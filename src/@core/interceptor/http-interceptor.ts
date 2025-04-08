import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { AutomationSystemService } from 'src/core-system/@core-system/automation-system/automation-system.service'
import { CollaboratorSystemService } from 'src/core-system/collaborator-system/collaborator-system.service'
import { GroupCustomerSystemService } from 'src/core-system/group-customer-system/group-customer-system.service'
import { OrderSystemService } from 'src/core-system/order-system/order-system.service'

@Injectable()
export class HttpInterceptor implements NestInterceptor {
  constructor(
    private readonly groupCustomerSystemService: GroupCustomerSystemService,
    private readonly collaboratorSystemService: CollaboratorSystemService,
    private readonly orderSystemService: OrderSystemService,

    private readonly automationSystemService: AutomationSystemService
    //private 
    //@InjectModel(Order.name) private orderModel: Model<OrderDocument>
  ) { }
  // private readonly logger = new Logger(HttpInterceptor.name);

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const dataReq2 = context.switchToHttp().getRequest();
    return next.handle().pipe(
      map(async data => {
        const dataReq = context.switchToHttp().getRequest();
        

        if (TRIGGER_ORDER.indexOf(dataReq.routeConfig.url) > -1) {
          
          this.groupCustomerSystemService.upateGroupCustomerByIdOrder(dataReq.params.id);
          // Tự động cân bằng tiền giữa 2 ví 
          const order = await this.orderSystemService.getOrderById(dataReq.params.id);
          const id_collaborator = order.id_collaborator;
          if(id_collaborator !== null){
            this.collaboratorSystemService.balanceMoney("vi",id_collaborator.toString());
          }
        }

        if(TRIGGER_ORDER_COLLABORATOR.indexOf(dataReq.routeConfig.url) > -1){
          this.groupCustomerSystemService.upateGroupCustomerByIdOrder(dataReq.params.id);
          const id_collaborator = context.switchToHttp().getRequest().user.data._id;
          const collab = await this.collaboratorSystemService.findCollaboratorById(id_collaborator);
          if(collab !== null){
            this.collaboratorSystemService.balanceMoney("vi",collab._id.toString());
          }
        }
        
        if (TRIGGER_GROUP_CUSTOMER.indexOf(dataReq.routeConfig.url) > -1) {
          this.groupCustomerSystemService.updateAllCustomer();
        }

        
        // console.log(dataReq.routeConfig, 'dataReq.routeConfig');
        // console.log(dataReq.user, 'dataReq.user');
        // console.log(dataReq.params, 'dataReq.params');
        // console.log(dataReq.body, 'dataReq.body');



        

        // // run automation 
        // const payloadAutomation = {
        //   url: dataReq.routeConfig.url,
        //   id_user_token: (dataReq.user !== undefined) ? dataReq.user._id : null,
        //   id_params: (dataReq.params.id !== undefined) ? dataReq.params.id : null,
        //   body: dataReq.body || null
        // }
        
        // this.automationSystemService.getAutomationForTrigger('collaborator_doing_order',)

        return data;
      }),
    );
  }
}

const TRIGGER_ORDER = [
  "/admin/order_manager/change_status_order/:id",
]

const TRIGGER_ORDER_COLLABORATOR =[
  "/collaborator/job/doing_to_done/:id",
  "/collaborator/job/cancel_job/:id"
]

const TRIGGER_GROUP_CUSTOMER = [
  "admin/group_customer_mamager/create_item",
  "dmin/group_customer_mamager/edit_item/:id"
]

// const TRIGGER_COLLABORATOR_BALANCE_MONEY = [
//   "/collaborator/job/doing_to_done/:id",
//   "/admin/order_manager/change_status_order/:id"
// ]
// const TRIGGER_PROMOTION = [

// ]

// const TRIGGER_CUSTOMER = [

// ]

// export const TRIGGER_ORDER = [
//   '/admin/order_manager/change_status_order',
//   '/collaborator/job/doing_to_done/:id',
// ]