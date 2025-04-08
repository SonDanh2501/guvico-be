import { Injectable, Logger } from '@nestjs/common'
// import { GroupOrderService } from 'src/customer/group-order/group-order.service'
// import { OrderService } from 'src/customer/order/order.service'
// import { ServiceService } from 'src/customer/service/service.service'
@Injectable()
export class CustomerSchedulerService {
  constructor(
    // private groupOrderService: GroupOrderService,
    // private orderService: OrderService,
    // private serviceService: ServiceService,
  ) { }

  private readonly logger = new Logger(CustomerSchedulerService.name);

  // @Cron('1 * * * * *')
  // async handleCron() {
  //   //  xu ly order tim CTV
  //   this.processOrderSingle();
  //   this.logger.debug('processOrderSingle Called when the second is 1');
  //   this.processLoopOrder();
  //   this.logger.debug(' processLoopOrder Called when the second is 1');
  //   this.processScheduleOrder();
  //   this.logger.debug(' processScheduleOrder Called when the second is 1');
  // }

  // async processOrderSingle() {
  //   const iPage = {
  //     start: 0,
  //     length: 100,
  //     type: "single",
  //     id_order: []
  //   }
  //   const getGroupOrder = await this.groupOrderService.getAll("vi", iPage);
  //   console.log(getGroupOrder, 'getGroupOrder');

  //   for (const item of getGroupOrder.data) {
  //     console.log(item.code_promotion["discount"], 'item.code_promotion["discount"] ');

  //     const discount_code = (item.code_promotion) ? Number(item.code_promotion["discount"]) : 0;

  //     const final_fee = Number(item.initial_fee) - Number(discount_code);

  //     const payload: createOrderDTO = {
  //       id_customer: item.id_customer.toString(),
  //       id_collaborator: null,
  //       lat: item.lat.toString(),
  //       lng: item.lng.toString(),
  //       address: item.address,
  //       date_create: new Date(Date.now()).toISOString(),
  //       initial_fee: item.initial_fee,
  //       final_fee: final_fee,
  //       service: item.service,
  //       date_work: item.next_time,
  //       status: "pending"
  //     }
  //     const result = await this.orderService.createItem("vi", payload);
  //     const update = {
  //       id_order: result._id
  //     }
  //     await this.groupOrderService.editItem("vi", item._id, update);
  //   }
  // }


  // async processLoopOrder() {
  //   const iPage = {
  //     start: 0,
  //     length: 100,
  //     type: "loop",
  //     id_order: [],
  //     is_auto_order: true
  //   }
  //   const iPageDoneOrder = {
  //     start: 0,
  //     length: 100,
  //     status: "done"
  //   }


  //   const getGroupOrder = await this.groupOrderService.getAllLoop("vi", iPage);
  //   // console.log(getGroupOrder.data, 'check getGroupOrder dataaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');

  //   for (const item of getGroupOrder.data) {
  //     // console.log(item.code_promotion["discount"], 'item.code_promotion["discount"] ');

  //     const discount_code = (item.code_promotion) ? Number(item.code_promotion["discount"]) : 0;
  //     // console.log(discount_code, 'discount_code');

  //     const final_fee = Number(item.initial_fee) - Number(discount_code);
  //     // console.log(final_fee, 'final_fee');

  //     const getDoneOrder = await this.orderService.getDoneOrder("vi", iPageDoneOrder);
  //     for (const itemOrder of getDoneOrder.data) {
  //       // console.log(itemOrder.date_work, 'check date work');
  //       const serivceOrder = await this.serviceService.getSerivceOrder("vi")
  //       for (const itemService of serivceOrder) {
  //         // console.log(itemService.type_loop_or_schedule, 'check type_loop_or_schedule');
  //         // console.log(itemService.time_repeat, 'check time_repeat');
  //         if (itemService.type_loop_or_schedule === "week") {
  //           item.next_time = (new Date(new Date(itemOrder.date_work).setDate(new Date(itemOrder.date_work).getDate() + 7 * itemService.time_repeat))).toISOString();
  //           // console.log(item.next_time, 'check next time for week item')
  //         }
  //         // if (itemService.type_loop_or_schedule === "month") {
  //         //   estimate_time = (new Date(new Date(itemOrder.date_work).setDate(new Date(itemOrder.date_work).getDate() + 30))).toISOString();
  //         // }

  //         const payload: createOrderDTO = {
  //           id_customer: item.id_customer.toString(),
  //           id_collaborator: null,
  //           lat: item.lat.toString(),
  //           lng: item.lng.toString(),
  //           address: item.address,
  //           date_create: new Date(Date.now()).toISOString(),
  //           initial_fee: item.initial_fee,
  //           final_fee: final_fee,
  //           service: item.service,
  //           date_work: item.next_time,
  //           status: "pending"
  //         }
  //         const result = await this.orderService.createItem("vi", payload);
  //         const update = {
  //           id_order: result._id
  //         }
  //         await this.groupOrderService.editItem("vi", item._id, update);
  //       }
  //     }
  //   }
  // }


  // async processScheduleOrder() {
  //   const iPage = {
  //     start: 0,
  //     length: 100,
  //     type: "schedule",
  //     id_order: []
  //   }
  //   const getGroupOrder = await this.groupOrderService.getAllSchedule("vi", iPage);
  //   // console.log(getGroupOrder, 'getGroupOrder scheduleeeeeeeeeeeeeeeeeeeeeeeeeeee');
  //   for (const item of getGroupOrder.data) {
  //     // console.log(item.code_promotion["discount"], 'item.code_promotion["discount"] scheduleeeeeeeeeeeeeeeeeeeeeeeeeeee');
  //     const discount_code = (item.code_promotion) ? Number(item.code_promotion["discount"]) : 0;
  //     const final_fee = Number(item.initial_fee) - Number(discount_code);
  //     // console.log(final_fee, 'check final_fee scheduleeeeeeeeeeeeeeeeeeee');
  //     // console.log('check group data scheduleeeeeeeeeeeeeeeeeeeeeeeeeeee', getGroupOrder.data);
  //     // console.log('check length scheduleeeeeeeeeeeeeeeeeeeeeeeee', item.date_work_schedule.length);
  //     // console.log('check date_work_schedule scheduleeeeeeeeeeeeeeeeeeeeeeeee', item.date_work_schedule);

  //     for (let i = 0; i < item.date_work_schedule.length; i++) {
  //       // if (item.date_work_schedule[i].status === "pending") {
  //       //  let next_date_work_schedule = item.date_work_schedule[i+1].date;
  //       // item.next_time = item.date_work_schedule[i].date;
  //       // console.log('check item.next_time scheduleeeeeeeeeeeeeeeeeeeeeeeeeeee', item.next_time);
  //       // console.log('check item.date_work_schedule scheduleeeeeeeeeeeeeeeeeeeee by item', item.date_work_schedule[i])


  //       const payload: createOrderDTO = {
  //         id_customer: item.id_customer.toString(),
  //         id_collaborator: null,
  //         lat: item.lat.toString(),
  //         lng: item.lng.toString(),
  //         address: item.address,
  //         date_create: new Date(Date.now()).toISOString(),
  //         initial_fee: item.initial_fee,
  //         final_fee: final_fee,
  //         service: item.service,
  //         date_work: item.date_work_schedule[i].date,
  //         status: "pending"
  //       }
  //       const result = await this.orderService.createItem("vi", payload);
  //       // console.log('check result Orderrrrrrrrrrrrrrrrrrrrrrrrr', result);
  //       const update = {
  //         id_order: result._id
  //       }
  //       await this.groupOrderService.editItem("vi", item._id, update);
  //     }


  //   }

  //   // }
  // }



  // async checkJobHaveNotCollaborator() {
  //   const iPage = {
  //     start: 0,
  //     length: 100,
  //     type: "single",
  //     id_order: []
  //   }
  //   const getGroupOrder = await this.OrderService.getAll("vi", iPage);
  //   console.log(getGroupOrder,'getGroupOrder');

  //   for (const item of getGroupOrder.data) {
  //     console.log(item.code_promotion["discount"] , 'item.code_promotion["discount"] ');

  //     const discount_code = (item.code_promotion) ? Number(item.code_promotion["discount"]) : 0;

  //     const final_fee = Number(item.initial_fee) - Number(discount_code);

  //     const payload: createOrderDTO = {
  //       id_customer: item.id_customer.toString(),
  //       id_collaborator: null,
  //       lat: item.lat.toString(),
  //       lng: item.lng.toString(),
  //       address: item.address,
  //       date_create: new Date(Date.now()).toISOString(),
  //       initial_fee: item.initial_fee,
  //       final_fee: final_fee,
  //       service: item.service,
  //       date_work: item.next_time
  //     }
  //     const result = await this.orderService.createItem("vi", payload);
  //     const update = {
  //       id_order: result._id
  //     }
  //      await this.groupOrderService.editItem("vi", item._id, update);
  //   }
  // }



  //     @Cron('30 * * * * *')
  //     handleCron() {
  // // xu ly order thay the CTV
  //         // this.groupOrderService.createItem(lang, payload);


  //       this.logger.debug('Called when the second is 1');
  //     }
}
