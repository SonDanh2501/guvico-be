import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { Collaborator, CollaboratorDocument, DeviceToken, DeviceTokenDocument, Order, OrderDocument, TransitionCustomer, TransitionCustomerDocument, iPageDTO } from 'src/@core';
import { NotificationService } from 'src/notification/notification.service';
import { TransitionCollaborator, TransitionCollaboratorDocument } from 'src/@core/db/schema/transition_collaborator.schema';
import { log } from 'console';
import { TransactionRepositoryService } from 'src/@repositories/repository-service/transaction-repository/transaction-repository.service';

@Injectable()
export class TransitionSchedulerService {
  constructor(
    @InjectModel(Collaborator.name) private collaboratorModel: Model<CollaboratorDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(DeviceToken.name) private deviceTokenModel: Model<DeviceTokenDocument>,
    @InjectModel(TransitionCollaborator.name) private transitionCollaboratorModel: Model<TransitionCollaboratorDocument>,
    @InjectModel(TransitionCustomer.name) private transitionCustomerModel: Model<TransitionCustomerDocument>,



    private notificationService: NotificationService,
    private transactionRepositoryService: TransactionRepositoryService,

  ) { }


  @Cron('0 * * * * *')
  async handleCron() {
    this.processTransitionCustomer();
    this.processRemindTransferForCollaborator();
  }

  async processTransitionCustomer() {
    const dateNow = new Date().getTime();
    const dateNowSum15Minitue = new Date(dateNow - (25 * 60 * 1000)).toISOString();
    // const arrTransfer = await this.transitionCustomerModel
    //   .find({ status: "pending", method_transfer: { $in: ["vnpay", "momo"] }, type_transfer: "top_up", date_create: { $lte: dateNowSum15Minitue } });
    // for (const item of arrTransfer) {
    //   item.status = "cancel";
    //   await item.save();
    const iPage = {
      start: 0,
      length: 20
    }
    const query = {
      $and: [
        { status: "pending" },
        { payment_out: { $in: ["vnpay", "momo", "viettel_pay"] } },
        { date_create: { $lte: dateNowSum15Minitue } },
      ]
    }
    const arrTransaction = await this.transactionRepositoryService.getListPaginationDataByCondition(iPage, query);
    // console.log('arrTransaction ', arrTransaction);

    for (let item of arrTransaction.data) {
      item.status = "cancel";
      await this.transactionRepositoryService.findByIdAndUpdate(item._id, item);

    }
  }

  async processRemindTransferForCollaborator() {
    //const arrTransferCollaborator = await this.transitionCollaboratorModel.find({ status: "pending" })
    const arrTransferCollaborator = await this.transactionRepositoryService.getListDataByCondition({ status: 'pending', id_collaborator: { $ne: null }, is_delete: false });

    const dateNow = new Date(Date.now()).getTime();
    for (const item of arrTransferCollaborator) {
      const dateCreated = new Date(item.date_create).getTime();
      if (dateNow - dateCreated > 43200000) {
        item.status = "cancel"
        await this.transactionRepositoryService.findByIdAndUpdate(item._id, item);
        const getDeviceTokenCollaborator = await this.deviceTokenModel.findOne({ user_id: item.id_collaborator })
        if (getDeviceTokenCollaborator) {
          const playload = {
            title: "Giao dịch của bạn đã bị huỷ !!!",
            body: "Giao dịch của bạn đã bị huỷ vui lòng liên hệ cho bộ phận chăm sóc khách hàng để biết thêm chi tiết như nào.",
            token: [getDeviceTokenCollaborator.token]
          }
          this.notificationService.send(playload)
        }
      }
    }
  }
}
