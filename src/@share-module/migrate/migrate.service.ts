import {
  HttpException,
  HttpStatus,
  Injectable,
  OnApplicationBootstrap,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import * as bcrypt from 'bcrypt'
import { ObjectId } from 'bson'
import { Model, Types } from 'mongoose'
import {
  BannerDocument,
  Collaborator,
  CollaboratorDocument,
  Customer,
  CustomerDocument,
  DeviceToken,
  DeviceTokenDocument,
  ExtendOptional,
  ExtendOptionalDocument,
  GROUP_CUSTOMER,
  GroupCustomer,
  GroupService,
  GroupServiceDocument,
  HISTORY_ACTIVITY_WALLET,
  News,
  NewsDocument,
  OptionalService,
  OptionalServiceDocument,
  Order,
  OrderDocument,
  PERMISSION_ADMIN,
  previousBalanceCollaboratorDTO,
  Promotion,
  PromotionDocument,
  queryWithinRangeDate,
  REASON_CANCEL,
  Service,
  SERVICE_FEE,
  ServiceDocument,
  STATUS_ORDER,
  TransitionCustomer,
  TransitionCustomerDocument,
  UserSystem,
  UserSystemDocument,
} from 'src/@core'
import * as AministrativeDivision from 'src/@core/constant/provincesVN.json'
import {
  CollaboratorSetting,
  CollaboratorSettingDocument,
} from 'src/@core/db/schema/collaborator_setting.schema'
import { CustomerRequest, CustomerRequestDocument } from 'src/@core/db/schema/customer_request.schema'
import { CustomerSetting, CustomerSettingDocument } from 'src/@core/db/schema/customer_setting.schema'
import { ExamTest, ExamTestDocument } from 'src/@core/db/schema/examtest_collaborator.schema'
import {
  FeedBack,
  FeedBackDocument,
} from 'src/@core/db/schema/feedback.schema'
import {
  GroupOrder,
  GroupOrderDocument,
} from 'src/@core/db/schema/group_order.schema'
import { GroupPromotion, GroupPromotionDocument } from 'src/@core/db/schema/group_promotion.schema'
import {
  HistoryActivity,
  HistoryActivityDocument,
} from 'src/@core/db/schema/history_activity.schema'
import { InfoTestCollaborator, InfoTestCollaboratorDocument } from 'src/@core/db/schema/info_test_collaborator.schema'
import { KeyApi, KeyApiDocument } from 'src/@core/db/schema/key_api.schema'
import {
  Notification,
  NotificationDocument,
} from 'src/@core/db/schema/notification.schema'
import {
  PriceOption,
  PriceOptionDocument,
} from 'src/@core/db/schema/price_option.schema'
import { Punish, PunishDocument } from 'src/@core/db/schema/punish.schema'
import {
  ReasonCancel,
  ReasonCancelDocument,
} from 'src/@core/db/schema/reason_cancel.schema'
import {
  RoleAdmin,
  RoleAdminDocument,
} from 'src/@core/db/schema/role_admin.schema'
import {
  ServiceFee,
  ServiceFeeDocument,
} from 'src/@core/db/schema/service_fee.schema'
import { TrainingLesson, TrainingLessonDocument } from 'src/@core/db/schema/training_lesson.schema'
import {
  TypeFeedBack,
  TypeFeedBackDocument,
} from 'src/@core/db/schema/type_feedback.schema'
import { createTransactionDTO } from 'src/@core/dto/transaction.dto'
<<<<<<< HEAD
import { PhoneOTP, PhoneOTPDocument, PunishTicket, PunishTicketDocument, Report, ReportDocument, SystemSetting, SystemSettingDocument } from 'src/@repositories/module/mongodb/@database'
import { PROMOTION_ACTION_TYPE, STATUS_GROUP_ORDER } from 'src/@repositories/module/mongodb/@database/enum'
import { PHONE_OTP_TYPE, TYPE_SUBJECT_ACTION } from 'src/@repositories/module/mongodb/@database/enum/base.enum'
=======
import { PhoneOTP, PhoneOTPDocument, PunishPolicy, PunishPolicyDocument, PunishTicket, PunishTicketDocument, Report, ReportDocument, SystemSetting, SystemSettingDocument } from 'src/@repositories/module/mongodb/@database'
import { CYCLE_TIME_TYPE, DEPENDENCY_ORDER_VALUE, PROMOTION_ACTION_TYPE, PUNISH_FUNCTION_TYPE, PUNISH_LOCK_TIME_TYPE, PUNISH_POLICY_TYPE, PUNISH_TYPE, PUNISH_VALUE_TYPE, REWARD_POLICY_TYPE, REWARD_VALUE_TYPE, REWARD_WALLET_TYPE, STATUS_GROUP_ORDER } from 'src/@repositories/module/mongodb/@database/enum'
import { PHONE_OTP_TYPE, TYPE_LINK_ADVERTISEMENT, TYPE_SUBJECT_ACTION } from 'src/@repositories/module/mongodb/@database/enum/base.enum'
>>>>>>> son
import { SELECTION_TYPE, TYPE_OF_KIND_V2 } from 'src/@repositories/module/mongodb/@database/enum/extend_optional.enum'
import { NOTIFICATION_SOUND } from 'src/@repositories/module/mongodb/@database/enum/notification.enum'
import { CashBook, CashBookDocument } from 'src/@repositories/module/mongodb/@database/schema/cash_book.schema'
import { Transaction, TransactionDocument } from 'src/@repositories/module/mongodb/@database/schema/transaction.schema'
import { CollaboratorRepositoryService } from 'src/@repositories/repository-service/collaborator-repository/collaborator-repository.service'
import { CustomerRepositoryService } from 'src/@repositories/repository-service/customer-repository/customer-repository.service'
import { HistoryActivityRepositoryService } from 'src/@repositories/repository-service/history-activity-repository/history-activity-repository.service'
import { OrderRepositoryService } from 'src/@repositories/repository-service/order-repository/order-repository.service'
import { PunishPolicyRepositoryService } from 'src/@repositories/repository-service/punish-policy-repository/punish-policy-repository.service'
import { PunishTicketRepositoryService } from 'src/@repositories/repository-service/punish-ticket-repository/punish-ticket-repository.service'
import { TransactionRepositoryService } from 'src/@repositories/repository-service/transaction-repository/transaction-repository.service'
import { UserSystemRepositoryService } from 'src/@repositories/repository-service/user-system-repository/user-system-repository.service'
import { AuthSystemService } from 'src/core-system/@core-system/auth-system/auth-system.service'
import { CollaboratorOopSystemService } from 'src/core-system/@oop-system/collaborator-oop-system/collaborator-oop-system.service'
import { CustomerOopSystemService } from 'src/core-system/@oop-system/customer-oop-system/customer-oop-system.service'
import { HistoryActivityOopSystemService } from 'src/core-system/@oop-system/history-activity-oop-system/history-activity-oop-system.service'
import { PunishPolicyOopSystemService } from 'src/core-system/@oop-system/punish-policy-oop-system/punish-policy-oop-system.service'
import { PunishTicketOopSystemService } from 'src/core-system/@oop-system/punish-ticket-oop-system/punish-ticket-oop-system.service'
import { RewardPolicyOopSystemService } from 'src/core-system/@oop-system/reward-policy-oop-system/reward-policy-oop-system.service'
import { RewardTicketOopSystemService } from 'src/core-system/@oop-system/reward-ticket-oop-system/reward-ticket-oop-system.service'
import { UserSystemOoopSystemService } from 'src/core-system/@oop-system/user-system-ooop-system/user-system-ooop-system.service'
import { PunishTicketSystemService } from 'src/core-system/punish-ticket-system/punish-ticket-system.service'
import { TransactionSystemService } from 'src/core-system/transaction-system/transaction-system.service'
import { Address, AddressDocument } from '../../@core/db/schema/address.schema'
import { Banner } from '../../@core/db/schema/banner.schema'
import {
  LinkInvite,
  LinkInviteDocument,
} from '../../@core/db/schema/link_invite.schema'
import {
  TransitionCollaborator,
  TransitionCollaboratorDocument,
} from '../../@core/db/schema/transition_collaborator.schema'
import { CustomExceptionService } from '../custom-exception/custom-exception.service'
import { GeneralHandleService } from '../general-handle/general-handle.service'
const numCPUs = require('os').cpus().length;


@Injectable()
export class MigrateService implements OnApplicationBootstrap {
  constructor(
    private customExceptionService: CustomExceptionService,
    private generalHandleService: GeneralHandleService,
    private punishTicketRepositoryService: PunishTicketRepositoryService,
    private punishPolyciRepositoryService: PunishPolicyRepositoryService,
    private historyActivityRepositoryService: HistoryActivityRepositoryService,
    private punishTicketSystemService: PunishTicketSystemService,
    private punishPolicyRepositoryService: PunishPolicyRepositoryService,
    private orderRepositoryService: OrderRepositoryService,
    private transactionRepositoryService: TransactionRepositoryService,
    private transactionSystemService: TransactionSystemService,
    private userSystemRepositoryService: UserSystemRepositoryService,
    private collaboratorRepositoryService: CollaboratorRepositoryService,
    private customerRepositoryService: CustomerRepositoryService,
    private authSystemService: AuthSystemService,
    private historyActivityOopSystemService: HistoryActivityOopSystemService,
    private userSystemOoopSystemService: UserSystemOoopSystemService,
    private customerOoopSystemService: CustomerOopSystemService,
    private collaboratorOopSystemService: CollaboratorOopSystemService,
    private rewardPolicyOopSystemService: RewardPolicyOopSystemService,
    private punishPolicyOopSystemService: PunishPolicyOopSystemService,
    private rewardTicketOopSystemService: RewardTicketOopSystemService,
    private punishTicketOopSystemService: PunishTicketOopSystemService,

    @InjectModel(Promotion.name) private promotionModel: Model<PromotionDocument>,
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    @InjectModel(GroupOrder.name) private groupOrderModel: Model<GroupOrderDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(ExtendOptional.name) private extendOptionalModel: Model<ExtendOptionalDocument>,
    @InjectModel(Collaborator.name) private collaboratorModel: Model<CollaboratorDocument>,
    @InjectModel(TypeFeedBack.name) private typeFeedbackModel: Model<TypeFeedBackDocument>,
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    @InjectModel(ServiceFee.name) private serviceFeeModel: Model<ServiceFeeDocument>,
    @InjectModel(UserSystem.name) private userSystemModel: Model<UserSystemDocument>,
    @InjectModel(ReasonCancel.name) private reasonCancelModel: Model<ReasonCancelDocument>,
    @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
    @InjectModel(HistoryActivity.name) private historyActivityModel: Model<HistoryActivityDocument>,
    @InjectModel(OptionalService.name) private optionalServiceModel: Model<OptionalServiceDocument>,
    @InjectModel(TransitionCustomer.name) private transitionCustomerModel: Model<TransitionCustomerDocument>,
    @InjectModel(TransitionCollaborator.name) private transitionCollaboratorModel: Model<TransitionCollaboratorDocument>,

    @InjectModel(FeedBack.name) private feedBackModel: Model<FeedBackDocument>,
    @InjectModel(GroupCustomer.name) private groupCustomerModel: Model<GroupOrderDocument>,
    @InjectModel(News.name) private newsModel: Model<NewsDocument>,
    @InjectModel(Banner.name) private bannerModel: Model<BannerDocument>,
    @InjectModel(Address.name) private addressModel: Model<AddressDocument>,
    @InjectModel(LinkInvite.name) private linkInviteModel: Model<LinkInviteDocument>,
    @InjectModel(DeviceToken.name) private deviceTokenModel: Model<DeviceTokenDocument>,
    @InjectModel(CollaboratorSetting.name) private collaboratorSettingModel: Model<CollaboratorSettingDocument>,
    @InjectModel(GroupService.name) private groupServiceModel: Model<GroupServiceDocument>,
    @InjectModel(KeyApi.name) private keyApiModel: Model<KeyApiDocument>,
    @InjectModel(PriceOption.name) private priceOptionModel: Model<PriceOptionDocument>,
    @InjectModel(RoleAdmin.name) private roleAdminModel: Model<RoleAdminDocument>,
    @InjectModel(CustomerSetting.name) private customerSettingModel: Model<CustomerSettingDocument>,
    @InjectModel(ExamTest.name) private examTestModel: Model<ExamTestDocument>,
    @InjectModel(Punish.name) private punishModel: Model<PunishDocument>,
    @InjectModel(InfoTestCollaborator.name) private infoTestCollaboratorModel: Model<InfoTestCollaboratorDocument>,
    @InjectModel(TrainingLesson.name) private trainingLessonModel: Model<TrainingLessonDocument>,
    @InjectModel(GroupPromotion.name) private groupPromotionModel: Model<GroupPromotionDocument>,
    @InjectModel(CustomerRequest.name) private customerRequestModel: Model<CustomerRequestDocument>,
    @InjectModel(Transaction.name) private transactionModel: Model<TransactionDocument>,
    @InjectModel(CashBook.name) private cashBookModel: Model<CashBookDocument>,
    @InjectModel(PunishTicket.name) private punishTicketModel: Model<PunishTicketDocument>,
    @InjectModel(Report.name) private reportModel: Model<ReportDocument>,
    @InjectModel(SystemSetting.name) private systemSettingModel: Model<SystemSettingDocument>,
    @InjectModel(PhoneOTP.name) private phoneOTPModel: Model<PhoneOTPDocument>,
    @InjectModel(PunishPolicy.name) private punishPolicyModel: Model<PunishPolicyDocument>,



  ) { }

  async onApplicationBootstrap(): Promise<any> {
    try {
      const numCPUs = require('os').cpus().length;
      // this.addMinMoneyBankToCollaboratorSetting
      // this.addMinMoneyMomoToCollaboratorSetting
      //await this.updateHistoryActivitiesType();
      //await this.updateHistoryActivitiesType2();
      //await this.updateHistoryActivitiesType3();
      //await this.updateHistoryActivitiesType4();
      //await this.updateHistoryActivitiesType5();
      //await this.updateHistoryActivitiesType6();
      //await this.updateHistoryActivitiesType7();

      // await this.addExamtestsSetting()
      //--------------------------------------------------------------------------------------
      // await this.seedDataAdmin()
      // await this.seedDataServiceFee()
      // await this.seedDataReasonCancel()
      // await this.seedGroupCustomer();

      // await this.seedPriceOption()
      // await this.seedDataPermision();

      // await this.updateReasonCancel()
      // await this.updateDeviceToken();
      // await this.updateNews();
      // await this.updateExamTest();
      // await this.updatePromotion();
      // await this.updatePriceOptionalService();
      // await this.updatePriceExtendOptional();
      // await this.updateHolidayPriceExtendOptional();

      // await this.updateExtendOptional();
      // await this.updateHistoryActivity()
      // await this.updateHistoryActivityAffiliate()
      // await this.updateOptionalService()
      // await this.updateGroupOrder()


      // await this.updateAdmin();
      // await this.updateCustomer()
      // await this.updateCollaborator() // run 
      // await this.updateOrder()
      // await this.updateNotification()
      // await this.deleteOrderError()

      // await this.updateNotification()
      // await this.updateInfoTestCollaborator()
      // await this.updateBanner()
      // await this.updateFeedback()
      // await this.deleteAll();
      // await this.updateIncome();
      // await this.updateGroupOrder();
      // await this.updateGroupService();

      // await this.updateTransition();
      // await this.updateTransitionCollaborator();

      // await updateGroupOrderLoop()
      // await this.updateAddress();
      // await this.updateUserSystem();
      // await this.updateRoleAdmin();
      // await this.updateLinkInvite();

      // await this.clearData(); 
      // await this.updatecustomerSetting();

      // await this.updateBalanceCollaborator();
      //  await this.updateCollaboratorSetting();

      // await this.updateGroupOrderAndOrder();


      // await this.converFile()

      // await this.changePhoneCollaborator("0705555757", "0933106298");

      // await this.updateCustomerRequest();

      // await this.updateWalletCollaborator(["642ef811bc019bb222fd1642"]);

      // await this.autoBalanceMoneyWallet(["642ef811bc019bb222fd1642"])
      // await this.autoBalanceMoneyWallet2()

      // await this.topUpFromCTVWalletToWorkWallet("657290404c1b60bed1842081", 33000)
      // await this.updatePunish()

      // await this.fixError();

      // await this.updateDate();

      // await this.setupData();
      // await this.updatePunishTicket();
      // await this.updateTransactionCollaborator();
      // await this.updateTransactionCustomer();
      // await this.updateTransactionCustomer();
      // await this.setTransaction();
      // await this.updateTransaction();
      // await this.calculatePayPointCustomer();
      // await this.addLimitAdressToCustomerSetting()
      // await this.addMinMoneyToCustomerSetting()
      // await this.addMinMoneyToCollaboratorSetting()
      // await this.addMomoToCustomer() // update nhieu thu cho socket, notification, momo

      // await this.fixTip()

      // await this.cloneDatabaseService.cloneData()

      // await this.updateIndexSearch()

      // await this.checkLog()

      // await this.checkCollaborator()

      // await this.updateCancelOrderAndGroupOrder()

      // await this.fixGroupCancel()


      // await this.kiemTraPayPoint()

      // await this.checkPayPointCustomer()



      // await this.changeDateORder();

      // await this.priceUp()

      // await this.fixFeeOrder()

      // await this.fixRefundOrder();

      // await this.runHistoryActivityBalance()

      // await this.updateHistoryAddPoint()

      // await this.addNewFieldFee() // them phi moi

      // await this.addThumbnailAndIsHideCollaborator()
      // await this.updatePaymentMethodDefault()
      // await this.updateGroupOrderWithCollaborator()
      // await this.updateNewFee()
      // await this.refundPayPointCustomer()
      // await this.orderSuccessfully()
      // await this.changStatusOrder()
      // await this.addLogForCompletingOrder()
      // await this.addNewFieldForOrder()
      // await this.addInfoLinkedCollaborator()
      // await this.plusMoneyForInviter()
      // await this.addNewFieldForBannerAndPromotion()
      // await this.addLogMinusMoneyWhenConfirmOrder()
      // await this.balanceMoneyForCollaborator()
      // await this.verifyPunishCollaboratorTransaction()
      // await this.addLogWhenPayingOrder()
      // await this.runOrdinalNumberAndIdViewForCustomer()
      // await this.updateDateCancelForOrder()
      // await this.updateDateCompleteForOrder()
      // await this.updateNewPunishTicket()
      // await this.renameFieldInReportCollection()
      // await this.addNewFieldInOrder()
      // await this.restoreAccountForCollaborator()
      // await this.updateDateVerifyForTransaction()
      // await this.newRefundMoney()
      // await this.updateSystemSetting()
      // await this.updatePhoneOTP()
      // await this.setUpRewardPolicy()
      // await this.setUpPunishPolicy()
      // await this.setUpRewardTicket()
      // await this.setUpPunishTicket()
      // await this.setUpHistoryAcitiviesForRewardTicket()
      // await this.setUpHistoryAcitiviesForPunishTicket()
      // await this.updatePunishPolicy()

    } catch (err) {
      console.error(err, 'err');
    }
  }


  async runHistoryActivityBalance() {
    try {

      const iPageCollaborator = {
        start: 0,
        length: 100
      }

      const queryOrder = {
        $and: [
          { date_work: { $gt: "2024-10-07T00:00:00.000Z" } },
          { date_work: { $lt: "2024-10-08T04:00:00.000Z" } },
        ]
      }

      const arrOrder = await this.orderModel.find(queryOrder);
      console.log(arrOrder.length, 'arrOrder');

      for (const item of arrOrder) {
        const queryHisotry = {
          $and: [
            { id_group_order: item.id_group_order },
            { date_work: { $gt: "2024-10-07T00:00:00.000Z" } },
            { date_work: { $lt: "2024-10-08T04:00:00.000Z" } },
          ]
        }
        const findHistoryActivity = await this.historyActivityModel.find(queryHisotry);
        const findDone = findHistoryActivity.filter(e => e.type === "collaborator_receive_refund_money")
        const findMinusConfirm = findHistoryActivity.filter(e => e.type === "system_minus_platform_fee" || e.type === "minus_platform_fee")
        const findConfirm = findHistoryActivity.filter(e => e.type == "collaborator_confirm_order")
        const findCollDone = findHistoryActivity.filter(e => e.type == "collaborator_done_order")


        if (findMinusConfirm.length === 0 && findConfirm.length > 0) {
          console.log(item.id_group_order, 'findMinusConfirm item.id_group_order');

          const getCollaborator = await this.collaboratorModel.findById(findConfirm[0].id_collaborator)


          const groupOrder = await this.groupOrderModel.findById(item.id_group_order);
          const payloadDependency = {
            order: item,
            group_order: groupOrder,
            collaborator: getCollaborator
          }

          const subjectAction = {
            type: TYPE_SUBJECT_ACTION.system,
            _id: null
          }

          const findConfirm2 = await this.historyActivityModel.findOne({
            $and: [
              // {id_group_order: item.id_group_order},
              { id_collaborator: item.id_collaborator },
              { date_create: { $lt: findConfirm[0].date_create } },
              { value: { $ne: 0 } }
            ]
          }).sort({ date_create: -1 })
          console.log(findConfirm[0].date_create, 'findConfirm[0].date_create');

          if (!findConfirm2) {
            console.log(item.id_collaborator, 'item.id_collaborator done');
            return true
          }
          console.log(findConfirm2, 'findConfirm2');

          const previousBalance = {
            work_wallet: findConfirm2.current_work_wallet,
            collaborator_wallet: findConfirm2.current_collaborator_wallet
          }

          getCollaborator.work_wallet = previousBalance.work_wallet - (item.platform_fee + item.pending_money)
          getCollaborator.collaborator_wallet = previousBalance.collaborator_wallet
          payloadDependency.collaborator = getCollaborator
          await this.minusPlatformFee(subjectAction, payloadDependency, item.platform_fee + item.pending_money, previousBalance, findConfirm2.date_create);

        }
        if (findDone.length === 0 && item.status === "done") {
          console.log(item.id_group_order, 'findDone item.id_group_order');
          console.log(item.id_collaborator, 'sss');


          const findOne = await this.historyActivityModel.findOne({
            $and: [
              // {id_group_order: item.id_group_order},
              { id_collaborator: item.id_collaborator },
              { date_create: { $lt: findCollDone[0].date_create } },
              { value: { $ne: 0 } }
            ]
          })

          if (!findOne) {
            console.log(item, 'item.id_collaborator done');
            return true
          }
          const previousBalance = {
            work_wallet: findOne.current_work_wallet,
            collaborator_wallet: findOne.current_collaborator_wallet
          }
          const getCollaborator = await this.collaboratorModel.findById(findOne.id_collaborator)
          getCollaborator.work_wallet = previousBalance.work_wallet
          getCollaborator.collaborator_wallet = (item.payment_method === "cash") ? previousBalance.collaborator_wallet + item.refund_money : previousBalance.collaborator_wallet + (item.final_fee + item.refund_money)
          const getService = await this.serviceModel.findById(item.service["_id"])
          // await this.receiveRefundMoney(getCollaborator, item.refund_money, item, getService, item.id_group_order, previousBalance, findConfirm[0].date_create)

        }
        // console.log(findHistoryActivity);

      }

      return true;

    } catch (err) {
      throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
    }
  }

  async minusPlatformFee(subjectAction, payloadDependency, money, previousBalance, dateCreate) {
    try {
      const order = payloadDependency.order;
      const collaborator = payloadDependency.collaborator;

      let title = {
        vi: `Thu phí dịch vụ ca làm ${order.id_view}`,
        en: `Collect shift service fees ${order.id_view}`
      }
      let titleAdmin = `Thu phí dịch vụ ca làm ${order.id_view}`

      const payload = {
        ...await this.fillPayloadDependency(title, title, titleAdmin, payloadDependency, subjectAction),
        type: "system_minus_platform_fee",
        value: -money,
        ...await this.fillStatusAccountBalance(collaborator, previousBalance),
        date_create: dateCreate
      }
      console.log(payload, 'payload');


      // await this.historyActivityRepositoryService.create({
      //     ...await this.fillPayloadDependency(title, title, titleAdmin, payloadDependency, subjectAction),
      //     type: "system_minus_platform_fee",
      //     value: -money,
      //     ...await this.fillStatusAccountBalance(collaborator, previousBalance)
      // })
      return true;
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async fillStatusAccountBalance(getCollaborator, previousBalance) {
    try {
      const payload = {
        current_collaborator_wallet: getCollaborator.collaborator_wallet,
        status_current_collaborator_wallet: (previousBalance.collaborator_wallet < getCollaborator.collaborator_wallet) ?
          "up" : (previousBalance.collaborator_wallet > getCollaborator.collaborator_wallet) ? "down" : "none",
        current_work_wallet: getCollaborator.work_wallet,
        status_current_work_wallet: (previousBalance.work_wallet < getCollaborator.work_wallet) ?
          "up" : (previousBalance.work_wallet > getCollaborator.work_wallet) ? "down" : "none",
      }
      return payload
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async receiveRefundMoney(collaborator, refundMoney, order, service, idGroupOrder, previousBalance: previousBalanceCollaboratorDTO, dateCreate) {
    try {
      const temp = {
        vi: `Nhận tiền từ công việc ${service.title.vi}`,
        en: `Get money from work ${service.title.en}`
      }
      const formatRefundMoney = await this.generalHandleService.formatMoney(refundMoney);
      const temp2 = `${collaborator._id} được nhận ${formatRefundMoney} từ đơn hàng ${order._id}`
      const newItem = new this.historyActivityModel({
        id_collaborator: collaborator._id,
        title: temp,
        title_admin: temp2,
        body: temp,
        type: "collaborator_receive_refund_money",
        date_create: dateCreate,
        value: refundMoney,
        id_order: order._id,
        id_group_order: idGroupOrder,
        current_remainder: collaborator.remainder,
        status_current_remainder: (previousBalance.remainder < collaborator.remainder) ?
          "up" : (previousBalance.remainder > collaborator.remainder) ? "down" : "none",
        current_gift_remainder: collaborator.gift_remainder,
        status_current_gift_remainder: (previousBalance.gift_remainder < collaborator.gift_remainder) ?
          "up" : (previousBalance.gift_remainder > collaborator.gift_remainder) ? "down" : "none",
        current_collaborator_wallet: collaborator.collaborator_wallet,
        status_current_collaborator_wallet: (previousBalance.collaborator_wallet < collaborator.collaborator_wallet) ?
          "up" : (previousBalance.collaborator_wallet > collaborator.collaborator_wallet) ? "down" : "none",
        current_work_wallet: collaborator.work_wallet,
        status_current_work_wallet: (previousBalance.work_wallet < collaborator.work_wallet) ?
          "up" : (previousBalance.work_wallet > collaborator.work_wallet) ? "down" : "none",
      })
      const description = {
        vi: `Nhận ${formatRefundMoney} từ công việc ${service.title.vi}`,
        en: `Get ${formatRefundMoney} from job ${service.title.vi}`
      }
      const payloadNotification = {
        title: temp,
        description: description,
        user_object: "collaborator",
        id_collaborator: collaborator._id,
        type_notification: "activity",
        related_id: order._id,
        id_order: order._id
      }
      console.log(newItem, 'newItem');

      // await newItem.save();
      return true;
    } catch (err) {
      // this.logger.error(err.response || err.toString());
      throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
    }
  }



  async fixRefundOrder() {
    try {


      // const findColl = await this.collaboratorModel.findOne({phone: "0368567727"})

      const queryGroupOrder = {
        $and: [
          { type: "schedule" },
          { date_create: { $gte: "2024-07-29T17:00:27.517Z" } },
          // {id_collaborator: findColl._id}
        ]
      }

      const arrGroupOrder = await this.groupOrderModel.find(queryGroupOrder);
      console.log(arrGroupOrder.length, "arrGroupOrder.length");

      for (const itemGroupOrder of arrGroupOrder) {
        const arrOrder = await this.orderModel.find({ id_group_order: itemGroupOrder._id });

        for (const itemOrder of arrOrder) {
          let newRefund = 0;
          if (itemOrder.code_promotion !== null) newRefund = itemOrder.code_promotion["discount"]
          for (const itemEventPromotion of itemOrder.event_promotion) {
            newRefund += itemEventPromotion["discount"];
          }
          // console.log(itemOrder._id);
          // console.log(newRefund, 'newRefund');
          // console.log(itemOrder.refund_money, 'itemOrder.refund_money');


          if (newRefund !== itemOrder.refund_money) {
            if (itemOrder.status === STATUS_ORDER.DONE) {
              const findCollaborator = await this.collaboratorModel.findById(itemOrder.id_collaborator)
              // if(findCollaborator.phone !== "0354935152") break;
              const findHistoryDoneOrder = await this.historyActivityModel.findOne({
                $and: [
                  { type: "collaborator_receive_refund_money" },
                  { id_collaborator: new ObjectId(findCollaborator._id) },
                  { id_order: itemOrder._id }
                ]
              })
              const queryHistory = {
                $and: [
                  {
                    $or: HISTORY_ACTIVITY_WALLET
                  },
                  { "id_collaborator": new ObjectId(findCollaborator._id) },
                  { date_create: { $gte: findHistoryDoneOrder.date_create } },
                ]
              }
              const arrHistory = await this.historyActivityModel.find(queryHistory).sort({ date_create: 1 })
              // console.log(arrHistory.length, 'arrHistory');

              const soDuTien = newRefund - itemOrder.refund_money;
              const queryHistoryPre = {
                $and: [
                  {
                    $or: HISTORY_ACTIVITY_WALLET
                  },
                  { id_collaborator: new ObjectId(findCollaborator._id) },
                  { date_create: { $lt: findHistoryDoneOrder.date_create } }
                ]
              }
              const findPreHis = await this.historyActivityModel.findOne(queryHistoryPre).sort({ date_create: -1 })
              console.log(findCollaborator._id, 'findCollaborator._id');

              let startCollWallet = 0
              if (findPreHis) {
                startCollWallet = findPreHis.current_collaborator_wallet;
              }
              startCollWallet += itemOrder.final_fee + newRefund;
              const tempValue = arrHistory[0].value
              console.log(tempValue, 'tempValue');

              arrHistory[0].title_admin = arrHistory[0].title_admin.replace(await this.generalHandleService.formatMoney(tempValue), await this.generalHandleService.formatMoney(itemOrder.final_fee + newRefund));
              arrHistory[0].value = itemOrder.final_fee + newRefund;
              const tienChenhLech = startCollWallet - arrHistory[0].current_collaborator_wallet
              arrHistory[0].current_collaborator_wallet = startCollWallet
              await arrHistory[0].save();

              console.log(arrHistory[0].current_collaborator_wallet, ' - ', arrHistory[0].title_admin, ' - ', arrHistory[0].value, ' - ', arrHistory[0].date_create, ' - ', 'itemHistory.current_collaborator_wallet');
              for (let i = 1; i < arrHistory.length; i++) {
                arrHistory[i].current_collaborator_wallet += tienChenhLech;
                await arrHistory[i].save();
                console.log(arrHistory[i].current_collaborator_wallet, ' - ', arrHistory[i].title_admin, ' - ', arrHistory[i].value, ' - ', arrHistory[i].date_create, ' - ', 'itemHistory.current_collaborator_wallet');
              }
              itemOrder.refund_money = newRefund;
              await itemOrder.save();
              findCollaborator.collaborator_wallet = arrHistory[arrHistory.length - 1].current_collaborator_wallet;
              await findCollaborator.save();
            } else {
              itemOrder.refund_money = newRefund;
              await itemOrder.save();
            }
          }
        }
      }

    } catch (err) {
      throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
    }
  }

  async fixGroupCancel() {
    try {

      const query = {
        $and: [
          { date_create: { $gte: "2024-06-31T11:00:00.000Z" } },
          { date_create: { $lte: "2024-08-05T11:00:00.000Z" } },
          { id_cancel_user_system: null },
          { id_cancel_customer: null },
          { id_cancel_system: null },
          { status: "cancel" },
        ]
      }
      const findGroupOrder = await this.groupOrderModel.find(query)
      for (const itemGroupOrder of findGroupOrder) {
        const queryOrder = {
          $and: [
            { id_group_order: itemGroupOrder._id },
            { status: "cancel" },
            {
              $or: [
                { id_cancel_user_system: { $ne: null } },
                { id_cancel_customer: { $ne: null } },
                { id_cancel_system: { $ne: null } }
              ]
            }
          ]
        }
        const findOrder = await this.orderModel.findOne(queryOrder)


        if (!findOrder) {
          if (itemGroupOrder._id.toString() === "6695f72a279db91ed447e4ff") {
            console.log('im in');
          }
          const queryHistory = {
            $and: [
              { id_group_order: itemGroupOrder._id },
              { type: "admin_cancel_group_order" }
            ]
          }
          const findHistory = await this.historyActivityModel.findOne(queryHistory);
          if (itemGroupOrder._id.toString() === "6695f72a279db91ed447e4ff") {
            console.log(findHistory, 'findHistory');
          }


          if (findHistory) {
            itemGroupOrder.id_cancel_user_system = {
              id_reason_cancel: findHistory.id_reason_cancel,
              id_user_system: findHistory.id_admin_action,
              date_create: findHistory.date_create
            }
            if (itemGroupOrder._id.toString() === "6695f72a279db91ed447e4ff") {
              console.log(itemGroupOrder.id_cancel_user_system, 'itemGroupOrder');
            }


            await this.groupOrderModel.findByIdAndUpdate(itemGroupOrder._id, { id_cancel_user_system: itemGroupOrder.id_cancel_user_system })
          }
        }

      }
      console.log(findGroupOrder.length, "findGroupOrder");


    } catch (err) {
      throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
    }
  }

  async fixFeeOrder() {
    try {
      const query = {
        $and: [
          { date_create: { $gte: "2024-07-31T11:00:00.000Z" } },
          { date_create: { $lte: "2024-08-05T11:00:00.000Z" } },
          { type: { $in: ["loop", "schedule"] } }
        ]
      }
      const findGroupOrder = await this.groupOrderModel.find(query);
      console.log(findGroupOrder.length, "findGroupOrder");

      for (const itemGroupOrder of findGroupOrder) {
        const arrOrder = await this.orderModel.find({ id_group_order: itemGroupOrder._id })

        for (const itemOder of arrOrder) {
          itemOder.net_income_collaborator = itemOder.initial_fee - itemOder.platform_fee
          // console.log();
          let totalDiscount = 0
          if (itemOder.code_promotion !== null) {
            totalDiscount += itemOder.code_promotion['discount']
          }
          if (itemOder.event_promotion.length > 0 && itemOder.event_promotion !== null) {
            for (const itemEvent of itemOder.event_promotion) {
              totalDiscount += itemEvent['discount']
            }
          }
          let fee = 0;
          if (itemOder.service_fee.length > 0 && itemOder.service_fee !== null) {
            for (const itemFee of itemOder.service_fee) {
              fee += itemFee['fee']
            }
          }

          itemOder.final_fee = itemOder.initial_fee - totalDiscount + fee;
          if (itemGroupOrder._id.toString() === "66ac3bd5ef700752512f9777") {
            console.log(itemOder.initial_fee, "itemOder.initial_fee");
            console.log(itemOder.final_fee, "itemOder.final_fee");

          }


          let logI = 0;
          let logY = 0;
          for (let i = 0; i < itemOder.service['optional_service'].length; i++) {
            for (let y = 0; y < itemOder.service['optional_service'][i].extend_optional.length; y++) {
              if (itemOder.service['optional_service'][i].extend_optional[y].price > 30000) {
                itemOder.service['optional_service'][i].extend_optional[y].price = itemOder.initial_fee;
                logI = i;
                logY = y
              } else {
                if (itemOder.service['optional_service'][i].extend_optional[y]._id.toString() === "63214b5a2bacd0aa86486586" ||
                  itemOder.service['optional_service'][i].extend_optional[y]._id.toString() === "65b760add8f4015f0db76e31") {
                  console.log(itemGroupOrder._id, "itemGroupOrder", itemGroupOrder.type);

                  itemOder.service['optional_service'][i].extend_optional[y].price = 30000
                  itemOder.service['optional_service'][logI].extend_optional[logY].price = itemOder.initial_fee - 30000;
                }
                if (itemOder.service['optional_service'][i].extend_optional[y]._id.toString() === "644f755679885bdd374f7de3" ||
                  itemOder.service['optional_service'][i].extend_optional[y]._id.toString() === "649b8f6f96e5f5f7fcb65e60" ||
                  itemOder.service['optional_service'][i].extend_optional[y]._id.toString() === "65b76452d8f4015f0db76e37") {
                  console.log(itemGroupOrder._id, "itemGroupOrder", itemGroupOrder.type);
                  itemOder.service['optional_service'][i].extend_optional[y].price = 20000
                  itemOder.service['optional_service'][logI].extend_optional[logY].price = itemOder.initial_fee - 20000;

                }
              }
              // if(itemOder.service['optional_service'][i].extend_optional[y].price === 30000 || itemOder.service['optional_service'][i].extend_optional[y].price === 20000) {

              // }

            }
          }
          await this.orderModel.findByIdAndUpdate(itemOder._id, {
            service: itemOder.service,
            final_fee: itemOder.final_fee,
            net_income_collaborator: itemOder.net_income_collaborator
          })
        }
      }

    } catch (err) {
      throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
    }
  }

  async updateCancelOrderAndGroupOrder(arrIdcustomer) {
    try {
      const findGroupOrder = await this.groupOrderModel.find({
        $and: [
          // {date_create: {$gte: "2024-07-01T11:00:00.000Z"}},
          // {status: {$ne: "cancel"} },
          { id_customer: arrIdcustomer }
        ]
      })
      // $and: [
      //   {_id: arrIdcustomer},
      //   // { phone: "0907959194" },
      //   { is_delete: false }
      // ]

      for (const itemGroupOrder of findGroupOrder) {
        const arrOrder = await this.orderModel.find({ id_group_order: itemGroupOrder._id })

        let timeLineCancel = []
        for (const itemOrder of arrOrder) {
          if (itemOrder.id_cancel_customer !== null) {
            // console.log(itemOrder.id_cancel_customer, 'itemOrder.id_cancel_customer');

            timeLineCancel.push({
              type: "id_cancel_customer",
              date_create: itemOrder.id_cancel_customer["date_create"],
              id_order: itemOrder._id
            })
          }
          if (itemOrder.id_cancel_user_system !== null) {
            // console.log(itemOrder.id_cancel_user_system, 'itemOrder.id_cancel_user_system');

            timeLineCancel.push({
              type: "id_cancel_user_system",
              date_create: itemOrder.id_cancel_user_system["date_create"],
              id_order: itemOrder._id
            })
          }
          if (itemOrder.id_cancel_system !== null) {
            // console.log(itemOrder.id_cancel_system, 'itemOrder.id_cancel_system');

            timeLineCancel.push({
              type: "id_cancel_system",
              date_create: itemOrder.id_cancel_system["date_create"],
              id_order: itemOrder._id
            })
          }

        }
        // console.log(arrOrder.length, "arrOrder.length");
        if (arrOrder.length === 0) continue;
        if (timeLineCancel.length === 0) continue;


        if (arrOrder.length > 1) {
          // console.log(timeLineCancel, "timeLineCancel");
          if (timeLineCancel.length > 2) {
            timeLineCancel = await this.generalHandleService.sortArrObject(timeLineCancel, "date_create", -1);
          }
          // if(itemGroupOrder._id.toString() === "667cc19a6585cda2511fa797") {
          //   console.log(itemGroupOrder._id, "itemGroupOrder");
          //   console.log(timeLineCancel.length, 'timeLineCancel.length');
          //   console.log(arrOrder.length, 'arrOrder.length');
          // } 


          // if(itemGroupOrder._id.toString() === "64800c90e00123047e4e29ef") {
          //   console.log(timeLineCancel.length, 'timeLineCancel.length');
          //   console.log(arrOrder.length, 'arrOrder.length');
          // }



          if (timeLineCancel.length < arrOrder.length) {
            // if(timeLineCancel.length === 0 )

          } else {
            const findIndexLastOrderCancel = arrOrder.findIndex(item => item._id.toString() === timeLineCancel[0].id_order.toString())

            if (findIndexLastOrderCancel > -1) {
              if (timeLineCancel[0].type === "id_cancel_user_system" && arrOrder[findIndexLastOrderCancel][timeLineCancel[0].type].id_user_system === undefined) {

                const queryHistory = {
                  $and: [
                    { type: { $in: ["cancel_order", "admin_cancel_group_order", "admin_cancel_order"] } },
                    { id_order: arrOrder[findIndexLastOrderCancel]._id }
                  ]
                }

                const history = await this.historyActivityModel.findOne(queryHistory)
                itemGroupOrder[timeLineCancel[0].type] = arrOrder[findIndexLastOrderCancel][timeLineCancel[0].type]
                // if(itemGroupOrder._id.toString() === "667cc19a6585cda2511fa797") {
                // console.log(arrOrder[findIndexLastOrderCancel][timeLineCancel[0].type], 'arrOrder[findIndexLastOrderCancel][timeLineCancel[0].type]');
                // console.log(itemGroupOrder[timeLineCancel[0].type], 'itemGroupOrder[timeLineCancel[0].type]');
                // console.log(history, 'history');

                // }
                if (history) {
                  itemGroupOrder[timeLineCancel[0].type].id_user_system = history.id_admin_action
                  for (const item of arrOrder) {
                    if (item[timeLineCancel[0].type] !== null) {
                      const findHistory = await this.historyActivityModel.findOne({
                        type: { $in: ["cancel_order", "admin_cancel_group_order", "admin_cancel_order"] },
                        id_order: item._id
                      })
                      if (findHistory) item[timeLineCancel[0].type]['id_user_system'] = findHistory.id_admin_action;
                      else item[timeLineCancel[0].type]['id_user_system'] = new Types.ObjectId("63a8730e6a5e979e0d637c4c");
                      item.save();
                    }
                  }
                } else {
                  // lay admin mac dinh
                  itemGroupOrder[timeLineCancel[0].type]['id_user_system'] = new Types.ObjectId("63a8730e6a5e979e0d637c4c")
                  for (const item of arrOrder) {
                    if (item[timeLineCancel[0].type] !== null) {
                      item[timeLineCancel[0].type]['id_user_system'] = new Types.ObjectId("63a8730e6a5e979e0d637c4c");
                      item.save();
                    }
                  }

                }
                itemGroupOrder.status = "cancel"
                itemGroupOrder.save();
              } else {
                itemGroupOrder[timeLineCancel[0].type] = arrOrder[findIndexLastOrderCancel][timeLineCancel[0].type]
                itemGroupOrder.status = "cancel"
                itemGroupOrder.save();
              }

            }
          }
        } else {
          itemGroupOrder[timeLineCancel[0].type] = arrOrder[0][timeLineCancel[0].type]
          itemGroupOrder.status = "cancel"
          itemGroupOrder.save();
        }



      }

    } catch (err) {
      throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
    }
  }

  async priceUp() {
    try {
      const arrExtend = await this.extendOptionalModel.find();
      for (const item of arrExtend) {

        for (let i = 0; i < item.area_fee.length; i++) {
          item.area_fee[i].price_option_holiday.push()
          await this.extendOptionalModel.findByIdAndUpdate(item._id, {})
        }
      }

    } catch (err) {
      throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
    }
  }

  // async changeDateORder() {
  //   try {
  //     const startChangDate = "2024-08-05T03:00:00.000Z";
  //     const endChangDate = "2024-08-05T05:00:00.000Z";

  //     const groupOrder = await this.groupOrderModel.findById("66ae2afcb105cc0caa3e18a3");
  //     console.log(groupOrder, 'groupOrder');

  //     const arrOrder = await this.orderModel.find({id_group_order: groupOrder._id}).sort({date_work: 1})

  //     let tempDateWork = ""
  //     let tempEndDateWork = "" 
  //     // let tempFinalFee = 0
  //     // let tempInitialFee = 0
  //     // let tempFinalFee = 
  //     // let tempFinalFee = 
  //     // let tempFinalFee = 
  //     // let tempCodePromotion = null
  //     // let tempEventPromotion = []
  //     // let tempServiceFee = []
  //     // let tempArrServiceFee = 0



  //     // let tempArr = []
  //     let tempOrder = []
  //     let tempNextOrder = null;

  //     for(let i = 0 ; i < arrOrder.length  ; i++) {
  //       if(i === 0 ){
  //         // tempOrder = {...arrOrder[i]['_doc']}
  //         tempOrder.push(arrOrder[i]['_doc']);

  //         tempDateWork = arrOrder[i].date_work
  //         tempEndDateWork = arrOrder[i].end_date_work
  //         arrOrder[i].date_work = startChangDate
  //         arrOrder[i].end_date_work = endChangDate
  //         console.log(arrOrder[i].date_work, " - ", i , " - ", "arrOrder[i]");
  //         console.log(arrOrder[i].end_date_work, " - ", i , " - ", "arrOrder[i]");
  //         console.log(arrOrder[i]._id, " - ", i , " - ", "arrOrder[i]");
  //         await this.orderModel.findByIdAndUpdate(arrOrder[i]._id, arrOrder[i])
  //         // tempArr.push()
  //       } 
  //       // else if (i === 1) {
  //       //   arrOrder[i].date_work = tempDateWork
  //       //   arrOrder[i].end_date_work = tempEndDateWork
  //       //   console.log(arrOrder[i], " - ", i , " - ", "arrOrder[i]");
  //       //   await this.orderModel.findByIdAndUpdate(arrOrder[i]._id, arrOrder[i])

  //       // }
  //       else {
  //         tempOrder.push(arrOrder[i]['_doc']);

  //         // console.log(temp, 'temp');

  //         // console.log(tempOrder.date_work, 'tempOrder.date_work');

  //         arrOrder[i].date_work = tempOrder[tempOrder.length - 2].date_work
  //         arrOrder[i].id_promotion = tempOrder[tempOrder.length - 2].id_promotion
  //         arrOrder[i].service = tempOrder[tempOrder.length - 2].service
  //         arrOrder[i].final_fee = tempOrder[tempOrder.length - 2].final_fee
  //         // arrOrder[i].collaborator_fee = tempOrder.collaborator_fee
  //         arrOrder[i].initial_fee = tempOrder[tempOrder.length - 2].initial_fee
  //         arrOrder[i].net_income_collaborator = tempOrder[tempOrder.length - 2].net_income_collaborator
  //         arrOrder[i].gross_income_collaborator = tempOrder[tempOrder.length - 2].gross_income_collaborator
  //         arrOrder[i].platform_fee = tempOrder[tempOrder.length - 2].platform_fee
  //         // arrOrder[i].change_money = tempOrder.change_money
  //         arrOrder[i].service_fee = tempOrder[tempOrder.length - 2].service_fee,
  //         arrOrder[i].code_promotion = tempOrder[tempOrder.length - 2].code_promotion,
  //         arrOrder[i].event_promotion = tempOrder[tempOrder.length - 2].event_promotion,
  //         arrOrder[i].pending_money = tempOrder[tempOrder.length - 2].pending_money,
  //         arrOrder[i].refund_money = tempOrder[tempOrder.length - 2].refund_money,
  //         arrOrder[i].id_view = tempOrder[tempOrder.length - 2].id_view,
  //         arrOrder[i].ordinal_number = tempOrder[tempOrder.length - 2].ordinal_number,
  //         arrOrder[i].end_date_work = tempOrder[tempOrder.length - 2].end_date_work

  //         // const payload = {
  //         //   date_work: tempOrder.date_work,
  //         //   id_promotion: tempOrder.id_promotion,
  //         //   service: tempOrder.service,
  //         //   final_fee: tempOrder.final_fee,
  //         //   collaborator_fee: tempOrder.collaborator_fee,
  //         //   initial_fee: tempOrder.initial_fee,
  //         //   net_income_collaborator: tempOrder.net_income_collaborator,
  //         //   gross_income_collaborator: tempOrder.gross_income_collaborator,
  //         //   platform_fee: tempOrder.platform_fee,
  //         //   change_money: tempOrder.change_money,
  //         //   service_fee: tempOrder.service_fee,
  //         //   code_promotion: tempOrder.code_promotion,
  //         //   event_promotion: tempOrder.event_promotion,
  //         //   pending_money: tempOrder.pending_money,
  //         //   refund_money: tempOrder.refund_money,
  //         //   id_view: tempOrder.id_view,
  //         //   ordinal_number: tempOrder.ordinal_number,
  //         //   end_date_work: tempOrder.end_date_work
  //         // }
  //         console.log(arrOrder[i].date_work, " - ", i , " - ", "arrOrder[i]");
  //         console.log(arrOrder[i].end_date_work, " - ", i , " - ", "arrOrder[i]");
  //         console.log(arrOrder[i]._id, " - ", i , " - ", "arrOrder[i]");
  //         // console.log(payload, 'payload');

  //         // arrOrder[i].save()
  //         await this.orderModel.findByIdAndUpdate(arrOrder[i]._id, arrOrder[i])



  //       }
  //     }

  //   } catch (err) {
  //     throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
  //   }
  // }

  async checkCollaborator() {
    try {

      const arrCollaborator = await this.collaboratorModel.find({ is_verify: true, is_locked: false });
      // const arrCollaborator = await this.collaboratorModel.find({_id: "6662ac1355b0b09f6fc63a05", is_verify: true, is_locked: false});


      const startDateTimeLine = "2024-06-27T17:00:00.000Z"

      const trutienWork = [
        "system_punish_collaborator",
        "collaborator_minus_platform_fee",
        "verify_transaction_withdraw",
        "punish_collaborator",
        "system_punish_late_collaborator",
        "system_holding_money_user",
        "minus_platform_fee",
        "verify_transaction_punish_ticket"
      ]

      const truTienColl = [
        "collaborator_holding"
      ]
      const congTienColl = [
        "give_back_money_collaborator",
        "refund_money_revoke_punish_ticket",
        "admin_give_back_money_user",
        "system_given_money",
        "collaborator_receive_refund_money"
      ]
      const congTienWork = [
        "collaborator_refund_money",
        "verify_transaction_top_up",
        "verify_transaction_refund_punish_ticket",
        "refund_platform_fee_cancel_order",
        "collaborator_refund_platform_fee"
      ]

      const canbang = [
        "system_balance_money",
        "collaborator_change_money_wallet"
      ]

      for (const itemCollaborator of arrCollaborator) {
        const queryHistory = {
          $and: [
            { date_create: { $gt: startDateTimeLine } },
            { id_collaborator: itemCollaborator._id },
            { value: { $ne: 0 } },
            {
              $or: HISTORY_ACTIVITY_WALLET
            },
          ]
        }

        const totalMoney = itemCollaborator.work_wallet + itemCollaborator.collaborator_wallet
        const workWallet = itemCollaborator.work_wallet
        const collaboratorkWallet = itemCollaborator.collaborator_wallet

        let arrHistory = await this.historyActivityModel.find(queryHistory).sort({ date_create: 1 });

        if (arrHistory.length > 0) {
          // console.log(arrHistory[0], 'arrHistory');

          itemCollaborator.work_wallet = arrHistory[0].current_work_wallet
          itemCollaborator.collaborator_wallet = arrHistory[0].current_collaborator_wallet

        }
        arrHistory.shift()
        // console.log(itemCollaborator.work_wallet, " ----- ", itemCollaborator.collaborator_wallet);
        for (const itemHistory of arrHistory) {
          // console.log(itemHistory.title_admin);
          // console.log(itemHistory.type);


          if (trutienWork.findIndex(a => a === itemHistory.type) > -1) {


            if (itemHistory.type === "minus_platform_fee") {

              if (itemHistory.title_admin.indexOf(".001") > -1) {
                itemCollaborator.work_wallet -= Math.abs(itemHistory.value)
              } else {
                // console.log(itemHistory._id, " ---- ",  itemHistory.id_order);

                const findOrder = await this.orderModel.findById(itemHistory.id_order);
                if (!findOrder) itemCollaborator.work_wallet -= Math.abs(itemHistory.value)
                else {
                  const findOrderTruocDo = await this.orderModel.findOne({ id_group_order: findOrder.id_group_order, date_work: { $lt: findOrder.date_work } }).sort({ date_work: -1 });
                  if (findOrderTruocDo && itemCollaborator._id.toString() === findOrderTruocDo.id_collaborator.toString()) {
                    if (findOrderTruocDo.status === "cancel") {
                      itemCollaborator.work_wallet -= Math.abs(itemHistory.value)
                    } else {
                      itemCollaborator.collaborator_wallet -= Math.abs(itemHistory.value)
                    }
                  } else {
                    itemCollaborator.work_wallet -= Math.abs(itemHistory.value)
                  }
                }

              }
            } else {
              itemCollaborator.work_wallet -= Math.abs(itemHistory.value)
            }

          }
          else if (truTienColl.findIndex(a => a === itemHistory.type) > -1) {
            itemCollaborator.collaborator_wallet -= Math.abs(itemHistory.value)
          }
          else if (congTienColl.findIndex(a => a === itemHistory.type) > -1) {
            itemCollaborator.collaborator_wallet += itemHistory.value
          }
          else if (congTienWork.findIndex(a => a === itemHistory.type) > -1) {
            // if(itemHistory.type === "refund_platform_fee_cancel_order") {
            //   console.log(itemHistory.value, 'itemHistory.value');
            // }
            if (itemHistory.type === "collaborator_refund_platform_fee" && itemHistory.id_order === null) {
              // console.log(itemHistory._id);
              // console.log(itemHistory.id_group_order);

              const checkGroupOrder = await this.groupOrderModel.findById(itemHistory.id_group_order);
              const arrOrder = await this.orderModel.find({ id_group_order: checkGroupOrder._id });
              // console.log(arrOrder.length, "arrOrder.length");

              if (arrOrder.length === 1) {
                itemHistory.id_order = arrOrder[0]._id,
                  itemHistory.title_admin = itemHistory.title_admin.replace(checkGroupOrder._id.toString(), arrOrder[0].id_view)
                await itemHistory.save();
              }
            }


            itemCollaborator.work_wallet += itemHistory.value
          }
          else if (canbang.findIndex(a => a === itemHistory.type) > -1) {
            itemCollaborator.work_wallet += itemHistory.value
            itemCollaborator.collaborator_wallet -= itemHistory.value
          }
          // console.log(itemCollaborator.work_wallet, " ----- ", itemCollaborator.collaborator_wallet);

        }



        // if(totalMoney)
        if (arrHistory.length > 0 && totalMoney !== itemCollaborator.work_wallet + itemCollaborator.collaborator_wallet) {
          console.log(itemCollaborator._id, " - ", itemCollaborator.full_name, " - ", itemCollaborator.phone);
          console.log("before: ", totalMoney, " - ", workWallet, " - ", collaboratorkWallet);
          console.log("-after: ", itemCollaborator.work_wallet + itemCollaborator.collaborator_wallet, " - ", itemCollaborator.work_wallet, " - ", itemCollaborator.collaborator_wallet);
          console.log("chenh lech: ", totalMoney - (itemCollaborator.work_wallet + itemCollaborator.collaborator_wallet));

        }


      }

    } catch (err) {
      throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
    }
  }

  async checkLog() {
    try {
      const startDateTimeLine = "2024-06-28T17:00:27.517Z"
      const query = {
        $and: [
          { date_create: { $gt: startDateTimeLine } }
        ]
      }

      let i = 0
      await this.customerModel.updateMany({}, { $set: { index_search: [] } })
      const iPageCustomer = {
        start: 0,
        length: 10000
      }
      let lengthCustomer = 0

      do {
        const arrCustomer = await this.customerModel.find({ phone: "0389888952" }).skip(iPageCustomer.start).limit(iPageCustomer.length)
        for (const customer of arrCustomer) {


          const arrOrder = await this.orderModel.find(query)
          const arrGroupOrder = await this.groupOrderModel.find(query)
          const arrTransaction = await this.transactionModel.find(query)
          const arrHistory = await this.historyActivityModel.find(query)


          let arrTimeline = []

          for (const item of arrOrder) {
            arrTimeline.push({
              date_create: item.date_create,
              _id: item._id,
              type: "order",
              id_order: item._id,
              id_group_order: item.id_group_order
            })
          }

          for (const item of arrGroupOrder) {
            arrTimeline.push({
              date_create: item.date_create,
              _id: item._id,
              type: "group_order",
              id_group_order: item._id
            })
          }

          for (const item of arrTransaction) {
            arrTimeline.push({
              date_create: item.date_create,
              _id: item._id,
              type: "transaction",
              id_transaction: item._id,
              id_order: item.id_order,
              id_group_order: item.id_group_order
            })
          }

          for (const item of arrHistory) {
            arrTimeline.push({
              date_create: item.date_create,
              _id: item._id,
              type: "history",
              id_transaction: item._id,
              id_order: item.id_order,
              id_group_order: item.id_group_order
            })
          }



          arrTimeline = await this.generalHandleService.sortArrObject(arrTimeline, 'date_create', 1);

          console.log(arrTimeline, 'arrTimeline');



        }


        iPageCustomer.start += iPageCustomer.length;
        lengthCustomer = arrCustomer.length
      } while (lengthCustomer === iPageCustomer.length)

      const findOrder = await this.orderModel.find(query);
    } catch (err) {
      throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
    }
  }

  async updateIndexSearch() {
    try {

      let i = 0;
      let lengthCustomer = 0
      await this.collaboratorModel.updateMany({}, { $set: { index_search: [] } })
      const findCollaborator = await this.collaboratorModel.find()
      for (const item of findCollaborator) {
        const lower = item.full_name.toLocaleLowerCase().trim()
        const nomark = await this.generalHandleService.cleanAccents(lower);
        item.index_search.push(item.phone)
        item.index_search.push(nomark)
        item.index_search.push(lower)
        console.log(item._id, "collaborator", " - ", i++);
        item.save();
      }

      i = 0
      await this.customerModel.updateMany({}, { $set: { index_search: [] } })
      const iPageCustomer = {
        start: 0,
        length: 10000
      }
      do {
        const arrCustomer = await this.customerModel.find().skip(iPageCustomer.start).limit(iPageCustomer.length)
        for (const item of arrCustomer) {
          const lower = item.full_name.toLocaleLowerCase().trim()
          const nomark = await this.generalHandleService.cleanAccents(lower);
          item.index_search.push(item.phone)
          item.index_search.push(nomark)
          item.index_search.push(lower)
          console.log(item._id, "customer", " - ", i++);
          item.save();
        }

        iPageCustomer.start += iPageCustomer.length;
        lengthCustomer = arrCustomer.length
      } while (lengthCustomer === iPageCustomer.length)


      // const itemArrCustomer = []
      // const itemArrCollaborator = []

      //   i = 0;
      //   await this.orderModel.updateMany({}, {$set: {index_search_collaborator: [], index_search_customer: []}})
      //   const iPageOrder = {
      //     start: 0,
      //     length: 10000
      //   }
      //   do {
      //     const arrOrder = await this.orderModel.find().skip(iPageOrder.start).limit(iPageOrder.length)
      //     for(const item of arrOrder) {
      //       if(item.id_collaborator !== null) {
      //         let findIndexCollaborator = itemArrCollaborator.findIndex(a => a._id.toString() === item.id_collaborator.toString());
      //         if(findIndexCollaborator > -1) {
      //           item.index_search_collaborator = itemArrCollaborator[findIndexCollaborator].index_search
      //         } else {
      //           const findCollaborator = await this.collaboratorModel.findById(item.id_collaborator).select({_id: 1, index_search: 1});
      //           // console.log(findCollaborator.index_search, 'findCollaborator.index_search');

      //           item.index_search_collaborator = findCollaborator.index_search
      //           itemArrCollaborator.push(findCollaborator)
      //         }
      //       }


      //       let findIndexCustomer = itemArrCustomer.findIndex(a => a._id.toString() === item.id_customer.toString());
      //       // console.log(findIndexCustomer, 'findIndexCustomer');

      //       if(findIndexCustomer > -1) {
      //         item.index_search_customer = itemArrCustomer[findIndexCustomer].index_search
      //       } else {
      //         const findCustomer = await this.customerModel.findById(item.id_customer).select({_id: 1, index_search: 1});
      //         item.index_search_customer = findCustomer.index_search
      //         itemArrCustomer.push(findCustomer)
      //       }
      //       // console.log(itemArrCustomer.length, "itemArrCustomer");
      //       console.log(item._id, "order", " - ", i++);
      //     if(item.end_date_work === null) {
      //       item.end_date_work = new Date(new Date(item.date_work).getTime() + (item.total_estimate * 60 * 60 * 1000)).toISOString()
      //     }
      //       item.save();
      //     }
      //     iPageOrder.start += iPageOrder.length;
      //     lengthCustomer = arrOrder.length
      //   } while (lengthCustomer === iPageOrder.length)


      //   i = 0;
      //   await this.groupOrderModel.updateMany({}, {$set: {index_search_collaborator: [], index_search_customer: []}})
      //   const iPageGroupOrder = {
      //     start: 0,
      //     length: 10000
      //   }
      //   do {
      //     const arrGroupOrder = await this.groupOrderModel.find().skip(iPageGroupOrder.start).limit(iPageGroupOrder.length)
      //     for(const item of arrGroupOrder) {

      //       if(item.id_collaborator !== null) {
      //         let findIndexCollaborator = itemArrCollaborator.findIndex(item => item._id === item.id_collaborator);
      //         if(findIndexCollaborator > -1) {
      //           item.index_search_collaborator = itemArrCollaborator[findIndexCollaborator].index_search
      //         } else {
      //           const findCollaborator = await this.collaboratorModel.findById(item.id_collaborator).select({_id: 1, index_search: 1});
      //           item.index_search_collaborator = findCollaborator.index_search
      //           itemArrCollaborator.push(findCollaborator)
      //         }
      //       }


      //       let findIndexCustomer = itemArrCollaborator.findIndex(item => item._id === item.id_collaborator);
      //       if(findIndexCustomer > -1) {
      //         item.index_search_customer = itemArrCustomer[findIndexCustomer].index_search
      //       } else {
      //         const findCustomer = await this.customerModel.findById(item.id_customer).select({_id: 1, index_search: 1});
      //         item.index_search_customer = findCustomer.index_search
      //         itemArrCustomer.push(findCustomer)
      //       }
      //       console.log(item._id, "group order", " - ", i++);
      //       item.save();

      //     }
      //     iPageGroupOrder.start += iPageGroupOrder.length;
      //     lengthCustomer = arrGroupOrder.length
      //   } while (lengthCustomer === iPageGroupOrder.length)

    } catch (err) {
      throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
    }
  }

  async fixTip() {
    try {
      const iPageGroupOrder = {
        start: 0,
        length: 10000
      }
      const query = {
        $and: [
          { tip_collaborator: { $ne: 0 } }
        ]
      }
      let lengthGroupOrder = 0
      do {
        const getGroupOrder = await this.groupOrderModel.find(query).sort({ date_create: -1 }).skip(iPageGroupOrder.start).limit(iPageGroupOrder.length);

        for (const item of getGroupOrder) {
          if (item.tip_collaborator > 0) {
            const queryOrder = {
              $and: [
                { id_group_order: item._id },
              ]
            }
            const getOrder = await this.orderModel.find(queryOrder);
            const lengthOrder = getOrder.length;
            // console.log(lengthOrder, 'lengthOrder');
            const perTip = item.tip_collaborator / lengthOrder;
            for (const itemOrder of getOrder) {
              // if(itemOrder.tip_collaborator === 0) {
              const tempOrder = itemOrder.final_fee;
              console.log(item._id, " - ", itemOrder.tip_collaborator, " - ", itemOrder.final_fee, " - item._iditem._id");
              itemOrder.tip_collaborator = perTip
              itemOrder.date_tip_collaborator = item.date_tip_collaborator,
                itemOrder.final_fee = (itemOrder.initial_fee + itemOrder.tip_collaborator)
              // console.log(itemOrder.event_promotion, 'itemOrder.event_promotion');
              if (itemOrder.code_promotion !== null) {
                console.log(itemOrder.code_promotion['discount'], 'itemOrder.code_promotion');

                itemOrder.final_fee -= itemOrder.code_promotion['discount'];
              }

              if (itemOrder.service_fee !== null && itemOrder.service_fee.length > 0) {
                for (const itemFee of itemOrder.service_fee) {
                  itemOrder.final_fee += itemFee['fee']
                }
              }

              if (itemOrder.event_promotion !== null) {
                for (const voucher of itemOrder.event_promotion) {
                  console.log(voucher['discount'], 'itemOrder.code_promotion');

                  itemOrder.final_fee -= voucher['discount']
                }
              }

              if (itemOrder.final_fee !== tempOrder) {
                console.log(item._id, " - ", itemOrder.tip_collaborator, " - ", itemOrder.final_fee, "change");
                itemOrder.save();

              }
              // }
            }
          }
        }

        lengthGroupOrder = getGroupOrder.length;
        iPageGroupOrder.start += iPageGroupOrder.length

      } while (lengthGroupOrder === iPageGroupOrder.length)
      // const queryGroupOrder = {
      //   $and: [
      //     {phone: "0964195520"},
      //     {is_delete: false}
      //   ]
      // }

    } catch (err) {
      throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
    }
  }


  async kiemTraPayPoint() {
    try {
      const queryCustomer = {
        $and: [
          { phone: "0903977545" },
          { is_delete: false }
        ]
      }

      const arrCustomer = await this.customerModel.find(queryCustomer).sort({ date_create: -1 })

      for (const itemCustomer of arrCustomer) {
        const arrGroupOrder = await this.groupOrderModel.find({ id_customer: itemCustomer._id, payment_method: "point" }).sort({ date_create: 1 })
        const arrTransaction = await this.transactionModel.find({ id_customer: itemCustomer._id, type_transfer: { $in: ["top_up", "withdraw"] } }).sort({ date_create: 1 })
        const arrNoti = await this.notificationModel.find({ id_customer: itemCustomer._id }).sort({ date_create: 1 })
        const arrOrder = await this.orderModel.find({ id_customer: itemCustomer._id, payment_method: "point" })
        // const findGivePoint = await this.historyActivityModel.find({id_customer: itemCustomer._id, type: "system_give_pay_point_customer"})


        let timeLine = []
        let currentPayPoint = 0
        for (const item of arrTransaction) {
          timeLine.push({
            date_create: item.date_verify || item.date_create,
            type: "transaction",
            data: item
          })
        }
        for (const item of arrGroupOrder) {
          timeLine.push({
            date_create: item.date_create,
            type: "group_order",
            data: item
          })
        }
        for (const item of arrOrder) {
          timeLine.push({
            date_create: item.date_create,
            type: "order",
            data: item
          })
        }

        timeLine = await this.generalHandleService.sortArrObject(timeLine, 'date_create', 1)

        for (const item of timeLine) {
          if (item.type === "group_order") {
            currentPayPoint -= item.data.final_fee
            console.log(currentPayPoint, " - ", item.data.final_fee, " - ", item.data.id_view, " - ", item.data._id);
          }
          if (item.type === "order" && item.data.status === "cancel") {
            currentPayPoint += item.data.final_fee
            console.log(currentPayPoint, " - ", item.data.final_fee, " - ", item.data.id_view, " - ", item.data._id);
          }
          if (item.type === "transaction" && item.data.status === "done") {
            if (item.data.type_transfer === "top_up") {
              currentPayPoint += item.data.money
            } else {
              currentPayPoint -= item.data.money
            }
            console.log(currentPayPoint, " - ", item.data.money, " - ", item.data.id_view);
          }

        }


        // if (item.data.type_transfer === "top_up") {
        //   currentPayPoint += item.data.money
        //   log = `${item.type} - ${item.data._id} - current: ${currentPayPoint} - ${item.data.money}`
        // } else {
        //   currentPayPoint -= item.data.money
        //   log = `${item.type} - ${item.data._id} - current: ${currentPayPoint} - ${item.data.money}`
        // }

        // for(const item of arrOrder) {
        //   if(item.status !== "cancel" && item.payment_method === "point") {
        //   currentPayPoint -= item.final_fee;
        //   }
        // }

        // for(const item of arrGroupOrder) {
        //   currentPayPoint - 
        // }

      }



    } catch (err) {
      throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
    }
  }

  async checkPayPointCustomer() {
    try {

      const findGroupOrder = await this.groupOrderModel.find({
        $and: [
          { date_create: { $gte: "2024-07-31T11:00:00.000Z" } },
          { date_create: { $lte: "2024-08-05T11:00:00.000Z" } },
          { payment_method: "point" }
        ]
      }).select({ id_customer: 1 })
      const arrIdcustomer = []
      for (const item of findGroupOrder) {
        arrIdcustomer.push(item.id_customer)
      }
      // const queryCustomer = {
      //   $and: [
      //     {_id: arrCustomer}
      //   ]
      // }
      const iPageCustomer = {
        start: 0,
        length: 10000
      }
      let lengthCustomer = 0;
      do {
        const queryCustomer = {
          $and: [
            // {_id: arrIdcustomer},
            { phone: "0392442694" },
            { is_delete: false }
          ]
        }
        const arrCustomer = await this.customerModel.find(queryCustomer).sort({ date_create: -1 }).skip(iPageCustomer.start).limit(iPageCustomer.length);
        // console.log(arrCustomer.length, 'arrCustomer.length');


        // await this.updateCancelOrderAndGroupOrder(arrIdcustomer)


        for (const itemCustomer of arrCustomer) {

          const arrGroupOrder = await this.groupOrderModel.find({ id_customer: itemCustomer._id, payment_method: "point" }).sort({ date_create: 1 })
          const arrTransaction = await this.transactionModel.find({ id_customer: itemCustomer._id, type_transfer: { $in: ["top_up", "withdraw"] } }).sort({ date_create: 1 })
          const arrNoti = await this.notificationModel.find({ id_customer: itemCustomer._id }).sort({ date_create: 1 })
          const arrOrder = await this.orderModel.find({ id_customer: itemCustomer._id, payment_method: "point" })
          const findGivePoint = await this.historyActivityModel.find({ id_customer: itemCustomer._id, type: "system_give_pay_point_customer" })

          // const temp = arrOrder[0]
          // console.log(temp["$__"], 'temp');
          // console.log(temp["$__"]["activePaths"]["states"], 'temp');
          // console.log(temp["$__"]["InternalCache"], 'temp');
          // console.log(temp["$__"]["InternalCache"]["activePaths"], 'temp');




          let timeLine = []
          for (const item of arrGroupOrder) {
            timeLine.push({
              date_create: item.date_create,
              type: "group_order",
              data: item
            })

            if (item.id_cancel_customer !== null || item.id_cancel_user_system !== null) {

              const findOrderCancel = arrOrder.findIndex(itemOrder =>
                itemOrder.id_group_order.toString() === item._id.toString()
                && itemOrder.status === "cancel"
                && (itemOrder.id_cancel_customer !== null || itemOrder.id_cancel_user_system !== null)
              )

              console.log(findOrderCancel, 'findOrderCancel');


              if (findOrderCancel < 0) {
                if (item.id_cancel_customer !== null) {
                  // console.log(item.id_cancel_customer, 'item.id_cancel_customer');

                  timeLine.push({
                    date_create: item.id_cancel_customer["date_create"],
                    type: "id_cancel_customer",
                    second_type: "group_order",
                    data: item
                  })
                }
                if (item.id_cancel_user_system !== null) {
                  // console.log(item.id_cancel_user_system, 'item.id_cancel_customer');

                  timeLine.push({
                    date_create: item.id_cancel_user_system["date_create"],
                    type: "id_cancel_user_system",
                    second_type: "group_order",
                    data: item
                  })
                }
              } else {
                const findOrder = arrOrder.filter(itemOrder =>
                  itemOrder.id_group_order.toString() === item._id.toString()
                  && itemOrder.status === "cancel"
                  && (itemOrder.id_cancel_customer === null && itemOrder.id_cancel_user_system === null && itemOrder.id_cancel_system === null)
                )
                // console.log(findOrderCancel, 'findOrderCancel');

                // console.log(findOrder.length, 'findOrder');


                let newFinal = 0;
                for (const item of findOrder) {
                  newFinal += item.final_fee;
                }
                // console.log(newFinal, 'newFinal');

                if (newFinal > 0) {
                  const newItem = { ...item['_doc'] };
                  newItem.final_fee = newFinal

                  if (item.id_cancel_customer !== null) {
                    // console.log(item.id_cancel_customer, 'item.id_cancel_customer');

                    timeLine.push({
                      date_create: item.id_cancel_customer["date_create"],
                      type: "id_cancel_customer",
                      second_type: "group_order",
                      data: newItem
                    })
                  }
                  if (item.id_cancel_user_system !== null) {
                    // console.log(item.id_cancel_user_system, 'item.id_cancel_customer');

                    timeLine.push({
                      date_create: item.id_cancel_user_system["date_create"],
                      type: "id_cancel_user_system",
                      second_type: "group_order",
                      data: newItem
                    })
                  }
                }


              }




            }
          }

          for (const item of arrTransaction) {

            if (item.date_create === null) {
              item.date_create = new Date(item["created_at"]).toISOString();
              await item.save();
            }

            timeLine.push({
              date_create: item.date_verify || item.date_create,
              type: "transaction",
              data: item
            })
          }

          for (const item of arrNoti) {
            timeLine.push({
              date_create: item.date_create,
              type: "notification",
              data: item
            })
          }

          for (const item of arrOrder) {
            timeLine.push({
              date_create: item.date_create,
              type: "order",
              data: item
            })

            if (item.id_cancel_customer !== null) {
              // console.log(item.id_cancel_customer, 'item.id_cancel_customer');
              timeLine.push({
                date_create: item.id_cancel_customer["date_create"],
                type: "id_cancel_customer",
                second_type: "order",
                data: item
              })
            }
            if (item.id_cancel_user_system !== null) {
              // console.log(item.id_cancel_user_system, 'item.id_cancel_user_system');

              timeLine.push({
                date_create: item.id_cancel_user_system["date_create"],
                type: "id_cancel_user_system",
                second_type: "order",
                data: item
              })
            }

            if (item.id_cancel_collaborator !== null) {

            }
            if (item.id_cancel_system !== null) {
              // console.log(item.id_cancel_system, 'item.id_cancel_system');

              timeLine.push({
                date_create: item.id_cancel_system["date_create"],
                type: "id_cancel_system",
                second_type: "order",
                data: item
              })
            }
          }
          for (const item of findGivePoint) {
            timeLine.push({
              date_create: item["date_create"],
              type: "history_give_point",
              second_type: "history_activity",
              data: item
            })
          }

          // console.log(timeLine.length, 'timeLine');
          // console.log(itemCustomer._id, 'itemcustomer');
          timeLine = await this.generalHandleService.sortArrObject(timeLine, "date_create", 1)
          // console.log(timeLine[0], 'timeLine');


          // console.log(timeLine[0].date_create);
          // console.log(timeLine[1].date_create);
          // console.log(timeLine[2].date_create);

          timeLine = timeLine.filter(item => new Date(item.date_create).getTime() > new Date("2024-05-12T06:20:43.878Z").getTime())
          console.log(timeLine[0], 'timeLine[0]');

          let currentPayPoint = -228000;

          for (const item of timeLine) {
            // console.log(item.type, 'item.type');
            // console.log(item.data._id, 'item.data._id');
            // console.log(item.date_create, 'item.date_create');
            // console.log(currentPayPoint, 'currentPayPoint');



            let payloadDependency = {
              customer: itemCustomer,
              order: null,
              group_order: null,
              reason_cancel: null,
              transaction: null,
              admin_action: null,
              money: 0,
              date_create: new Date().toISOString(),
              currentPayPoint: 0,
              statusPayPoint: "none"
            }

            let log = ""

            if (item.type === "transaction" && item.data.status === "done") {
              // console.log(item.data.type_transfer, 'item.data.type_transfer');
              if (item.data._id.toString() === "66569585f49b99a0bed81edb") {
                console.log("find66569585f49b99a0bed81edb");
                console.log(currentPayPoint, 'currentPayPoint');
              }
              if (item.data.type_transfer === "top_up") {
                currentPayPoint += item.data.money
                log = `${item.type} - ${item.data._id} - current: ${currentPayPoint} - ${item.data.money}`
              } else {
                currentPayPoint -= item.data.money
                log = `${item.type} - ${item.data._id} - current: ${currentPayPoint} - ${item.data.money}`
              }
              if (item.data._id.toString() === "66569585f49b99a0bed81edb") {
                console.log("find66569585f49b99a0bed81edb");
                console.log(currentPayPoint, 'currentPayPoint');
              }

              const query = {
                $and: [
                  { id_transaction: item.data._id },
                  { type: { $in: ["verify_transaction_withdraw", "verify_transaction_top_up", "customer_success_top_up_pay_point"] } }
                ]
              }
              let checkLogHistory = await this.historyActivityModel.findOne(query);
              if (checkLogHistory) {
                // console.log(item.data.money, "item.data.money");
                // console.log(currentPayPoint, "currentPayPoint");
                // console.log(checkLogHistory._id, "checkLogHistory._id");


                checkLogHistory.value = item.data.money;
                checkLogHistory.current_pay_point = currentPayPoint
                checkLogHistory.date_create = item.date_create

                await checkLogHistory.save();
                // console.log(checkLogHistory._id, " - ", checkLogHistory.title_admin, "log");
              } else {

                const checkTransitionCustomer = await this.transitionCustomerModel.findOne({ id_transaction: item.data._id });
                // console.log(checkTransitionCustomer, 'checkTransitionCustomer');

                if (checkTransitionCustomer) {
                  checkLogHistory = await this.historyActivityModel.findOne({ id_transistion_customer: checkTransitionCustomer._id })

                  if (checkLogHistory) {
                    checkLogHistory['id_transaction'] = item.data._id;
                    checkLogHistory.save()
                  } else {
                    const subjectAction = {
                      type: "customer",
                      _id: itemCustomer._id
                    }
                    // console.log(item.date_create, 'item.date_create');

                    payloadDependency.transaction = item.data
                    payloadDependency.statusPayPoint = "up"
                    payloadDependency.money = item.data.money
                    payloadDependency.currentPayPoint = currentPayPoint
                    payloadDependency.date_create = item.date_create
                    await this.runHistoryActivity("verify_transaction_top_up", subjectAction, payloadDependency)
                  }


                  // console.log(checkLogHistory._id, " - ", checkLogHistory.title_admin, "log");
                } else {
                  const subjectAction = {
                    type: "customer",
                    _id: itemCustomer._id
                  }
                  // console.log(item.date_create, 'item.date_create');

                  payloadDependency.transaction = item.data
                  payloadDependency.statusPayPoint = "up"
                  payloadDependency.money = item.data.money
                  payloadDependency.currentPayPoint = currentPayPoint
                  payloadDependency.date_create = item.date_create
                  await this.runHistoryActivity("verify_transaction_top_up", subjectAction, payloadDependency)
                  // console.log(item.data._id, " - ", "mat log");
                }
              }
            }
            else if (item.type === "group_order") {
              // console.log(currentPayPoint, 'currentPayPoint');

              currentPayPoint -= item.data.final_fee
              log = `${item.type} -  ${item.data._id} - current: ${currentPayPoint} - ${item.data.final_fee}`
              const query = {
                $and: [
                  { id_group_order: item.data._id },
                  { value: -item.data.final_fee }
                ]
              }
              const checkLogHistory = await this.historyActivityModel.findOne(query);
              if (checkLogHistory) {
                // if()
                checkLogHistory.value = -item.data.final_fee;
                checkLogHistory.current_pay_point = currentPayPoint
                checkLogHistory.date_create = item.date_create
                checkLogHistory.save();
              } else {
                // console.log(item.type, " - ", query, " - ", item.data._id);

                const subjectAction = {
                  type: "customer",
                  _id: itemCustomer._id
                }
                // console.log(item.date_create, 'item.date_create');

                payloadDependency.group_order = item.data
                payloadDependency.statusPayPoint = "down"
                payloadDependency.money = -item.data.final_fee
                payloadDependency.currentPayPoint = currentPayPoint
                payloadDependency.date_create = item.date_create
                await this.runHistoryActivity("customer_payment_pay_point_service", subjectAction, payloadDependency)
              }

            }
            else if (item.type.indexOf("cancel") > -1 && item.second_type === "order") {
              const findGroupOrder = await this.groupOrderModel.findById(item.data.id_group_order)
              // console.log(item.data._id, "item.data._id");

              const cancelGroupOrder = {
                id_reason_cancel: findGroupOrder[item.type]?.id_reason_cancel || null,
                type: [item.type]
              }

              const cancelOrder = {
                id_reason_cancel: item.data[item.type]?.id_reason_cancel || null,
                type: [item.type]
              }



              if (JSON.stringify(cancelGroupOrder) !== JSON.stringify(cancelOrder)) {
                currentPayPoint += item.data.final_fee
                // console.log(currentPayPoint, 'currentPayPoint');

                log = `${item.type} - ${item.second_type} -  ${item.data._id} - current: ${currentPayPoint} - ${item.data.final_fee}`
                // const query = {
                //   $and: [
                //     { id_order: item.data._id },
                //     { value: item.data.final_fee }
                //   ]
                // }

                const startDate = new Date(new Date(item.date_create).getTime() - 400).toISOString()
                const endDate = new Date(new Date(item.date_create).getTime() + 400).toISOString()
                const query = {
                  $and: [
                    { id_order: item.data._id },
                    { type: { $in: ["customer_refund_pay_point", "customer_refund_money", "customer_refund_pay_point_service"] } },
                    // {date_create: {$gte: startDate}},
                    // {date_create: {$lte: endDate}},
                  ]
                }


                const checkHistory = await this.historyActivityModel.findOne(query)
                if (checkHistory) {
                  checkHistory.value = item.data.final_fee;
                  checkHistory.current_pay_point = currentPayPoint
                  checkHistory.date_create = item.date_create
                  checkHistory.save();
                } else {
                  let subjectAction = {
                    type: "customer",
                    _id: itemCustomer._id
                  }
                  const tempTypeSubjectAction = item.type.split("_")
                  if (tempTypeSubjectAction.length === 4) {
                    subjectAction.type = 'admin'
                    const admin = await this.userSystemModel.findById(item.data[item.type].id_user_system)
                    subjectAction._id = admin._id;
                    payloadDependency.admin_action = admin
                  } else if (tempTypeSubjectAction[3] === "system") {
                    subjectAction.type = tempTypeSubjectAction[3]
                    subjectAction._id = null
                  }
                  // console.log(item.date_create, 'item.date_create');

                  payloadDependency.order = item.data
                  payloadDependency.statusPayPoint = "up"
                  payloadDependency.money = item.data.final_fee
                  payloadDependency.currentPayPoint = currentPayPoint
                  payloadDependency.date_create = item.date_create
                  await this.runHistoryActivity("customer_refund_money", subjectAction, payloadDependency)
                }



              } else {
                if (findGroupOrder.id_order.length > 1) {
                  // console.log(findGroupOrder._id, "findGroupOrder");

                  const dateCancelGroupOrder = new Date(findGroupOrder[item.type].date_create).getTime();
                  const dateCancelOrder = new Date(item.data[item.type].date_create).getTime();
                  if (item.data._id, "item.data[item.type]")
                    if (Math.abs(dateCancelGroupOrder - dateCancelOrder) > 600) {
                      // if(item.data._id, "item.data[item.type]")
                      currentPayPoint += item.data.final_fee
                      // console.log(currentPayPoint, 'currentPayPoint');

                      log = `${item.type} - ${item.second_type} -  ${item.data._id} - current: ${currentPayPoint} - ${item.data.final_fee}`
                      // const query = {
                      //   $and: [
                      //     { id_order: item.data._id },
                      //     { value: item.data.final_fee }
                      //   ]
                      // }

                      const startDate = new Date(new Date(item.date_create).getTime() - 400).toISOString()
                      const endDate = new Date(new Date(item.date_create).getTime() + 400).toISOString()
                      const query = {
                        $and: [
                          { id_order: item.data._id },
                          { type: { $in: ["customer_refund_pay_point", "customer_refund_money", "customer_refund_pay_point_service"] } },
                          { date_create: { $gte: startDate } },
                          { date_create: { $lte: endDate } },
                        ]
                      }
                      const checkHistory = await this.historyActivityModel.findOne(query)
                      if (checkHistory) {
                        checkHistory.value = item.data.final_fee;
                        checkHistory.current_pay_point = currentPayPoint
                        checkHistory.date_create = item.date_create
                        checkHistory.save();
                      } else {
                        let subjectAction = {
                          type: "system",
                          _id: null
                        }
                        const tempTypeSubjectAction = item.type.split("_")
                        if (tempTypeSubjectAction.length === 4) {
                          subjectAction.type = 'admin'
                          const admin = await this.userSystemModel.findById(item.data[item.type].id_user_system)
                          subjectAction._id = admin._id;
                          payloadDependency.admin_action = admin
                        } else if (tempTypeSubjectAction[3] === "system") {
                          subjectAction.type = tempTypeSubjectAction[3]
                          subjectAction._id = null
                        }
                        // console.log(item.date_create, 'item.date_create');

                        payloadDependency.order = item.data
                        payloadDependency.statusPayPoint = "up"
                        payloadDependency.money = item.data.final_fee
                        payloadDependency.currentPayPoint = currentPayPoint
                        payloadDependency.date_create = item.date_create
                        await this.runHistoryActivity("customer_refund_money", subjectAction, payloadDependency)
                      }
                    } else if (Math.abs(dateCancelGroupOrder - dateCancelOrder) === 0) {
                      const feild = `${item.type}.date_create`
                      // console.log(feild, 'feild');

                      const query = {
                        $and: [
                          { id_group_order: findGroupOrder._id },
                          { status: "cancel" },
                          { [feild]: { $gt: item.date_create } }
                        ]
                      }
                      // console.log(query, "checkin");

                      const arrOrder = await this.orderModel.find(query)
                      let tempRefund = item.data.final_fee
                      for (const itemOrder of arrOrder) {
                        tempRefund += itemOrder.final_fee
                      }
                      currentPayPoint += tempRefund;
                      log = `${item.type} -  ${item.data._id} - current: ${currentPayPoint} - ${item.data.money}`
                      // console.log(currentPayPoint, 'currentPayPoint');

                      let subjectAction = {
                        type: "system",
                        _id: null
                      }
                      const tempTypeSubjectAction = item.type.split("_")
                      if (tempTypeSubjectAction.length === 4) {
                        subjectAction.type = 'admin'
                        const admin = await this.userSystemModel.findById(item.data[item.type].id_user_system)

                        subjectAction._id = admin._id;
                        payloadDependency.admin_action = admin
                      } else if (tempTypeSubjectAction[3] === "system") {
                        subjectAction.type = tempTypeSubjectAction[3]
                        subjectAction._id = null
                      }


                      // const queryHistory = {
                      //   $and: [
                      //     { id_order: item.data._id },
                      //     { value: tempRefund }
                      //   ]
                      // }
                      const startDate = new Date(new Date(item.date_create).getTime() - 200).toISOString()
                      const endDate = new Date(new Date(item.date_create).getTime() + 200).toISOString()
                      const queryHistory = {
                        $and: [
                          { id_order: item.data._id },
                          { type: { $in: ["customer_refund_pay_point", "customer_refund_money", "customer_refund_pay_point_service"] } },
                          { date_create: { $gte: startDate } },
                          { date_create: { $lte: endDate } },
                        ]
                      }
                      const checkHistory = await this.historyActivityModel.findOne(queryHistory)
                      if (checkHistory) {
                        checkHistory.current_pay_point = currentPayPoint
                        checkHistory.value = tempRefund
                        checkHistory.date_create = item.date_create
                        checkHistory.save();
                      } else {
                        // console.log(item.date_create, 'item.date_create');

                        payloadDependency.order = item.data
                        payloadDependency.statusPayPoint = "up"
                        payloadDependency.money = tempRefund
                        payloadDependency.currentPayPoint = currentPayPoint
                        payloadDependency.date_create = item.date_create
                        await this.runHistoryActivity("customer_refund_money", subjectAction, payloadDependency)
                      }
                    } else if (Math.abs(dateCancelGroupOrder - dateCancelOrder) > 0 && Math.abs(dateCancelGroupOrder - dateCancelOrder) < 600) {

                      const tempField = `${item.type}.date_create`
                      const arrOrder = await this.orderModel.find({ id_group_order: item.data.id_group_order, [item.type]: { $ne: null } }).sort({ [tempField]: 1 });
                      const temp = arrOrder.filter(itemOrder => Math.abs(Number(new Date(itemOrder[item.type].date_create).getTime()) - dateCancelGroupOrder) < 600);

                      if (item.data._id.toString() === "66b86a40e300132395e82e26") {
                        // console.log("divaoday");
                        // console.log(temp.length, 'temp.length > 1');
                        // console.log(temp.length === findGroupOrder.id_order.length, 'temp.length === findGroupOrder.id_order.length');


                      }
                      if (temp.length > 1 && temp.length === findGroupOrder.id_order.length) {
                        // console.log(temp.length, 'sortArrOrder');
                        const sortArrOrder = temp;
                        // const sortArrOrder = await this.generalHandleService.sortArrObject(temp, `${item.type}.date_create`, 1);
                        if (sortArrOrder[0][item.type].date_create === item.date_create) {

                          currentPayPoint += findGroupOrder.final_fee;
                          const startDate = new Date(new Date(item.date_create).getTime() - 200).toISOString()
                          const endDate = new Date(new Date(item.date_create).getTime() + 200).toISOString()
                          const queryHistory = {
                            $and: [
                              { id_group_order: item.data.id_group_order },
                              { type: { $in: ["customer_refund_pay_point", "customer_refund_money", "customer_refund_pay_point_service"] } },
                              { date_create: { $gte: startDate } },
                              { date_create: { $lte: endDate } },
                            ]
                          }
                          // const startDate = new Date(new Date(item.date_create).getTime() - 200).toISOString()
                          // const endDate = new Date(new Date(item.date_create).getTime() + 200).toISOString()
                          // const queryHistory = {
                          //   $and: [
                          //     { id_order: item.data._id },
                          //     { type: "customer_refund_money"},
                          //     {date_create: {$gte: startDate}},
                          //     {date_create: {$lte: endDate}},
                          //   ]
                          // }
                          const checkLogHistory = await this.historyActivityModel.findOne(queryHistory)
                          if (checkLogHistory) {
                            // if()
                            checkLogHistory.value = findGroupOrder.final_fee;
                            checkLogHistory.current_pay_point = currentPayPoint
                            checkLogHistory.date_create = item.date_create
                            checkLogHistory.save();
                          } else {
                            const subjectAction = {
                              type: "system",
                              _id: null
                            }
                            payloadDependency.group_order = findGroupOrder
                            payloadDependency.statusPayPoint = "up"
                            payloadDependency.money = findGroupOrder.final_fee
                            payloadDependency.currentPayPoint = currentPayPoint
                            payloadDependency.date_create = item.date_create
                            await this.runHistoryActivity("customer_refund_money", subjectAction, payloadDependency)
                          }
                        }
                      } else {
                        currentPayPoint += item.data.final_fee;
                        const startDate = new Date(new Date(item.date_create).getTime() - 200).toISOString()
                        const endDate = new Date(new Date(item.date_create).getTime() + 200).toISOString()
                        const queryHistory = {
                          $and: [
                            { id_order: item.data._id },
                            { type: { $in: ["customer_refund_pay_point", "customer_refund_money", "customer_refund_pay_point_service"] } },
                            { date_create: { $gte: startDate } },
                            { date_create: { $lte: endDate } },
                          ]
                        }
                        const checkLogHistory = await this.historyActivityModel.findOne(queryHistory)
                        if (checkLogHistory) {
                          // if()
                          checkLogHistory.value = item.data.final_fee;
                          checkLogHistory.current_pay_point = currentPayPoint
                          checkLogHistory.date_create = item.date_create
                          checkLogHistory.save();
                        } else {
                          const subjectAction = {
                            type: "system",
                            _id: null
                          }
                          payloadDependency.group_order = findGroupOrder
                          payloadDependency.order = item.data
                          payloadDependency.statusPayPoint = "up"
                          payloadDependency.money = item.data.final_fee
                          payloadDependency.currentPayPoint = currentPayPoint
                          payloadDependency.date_create = item.date_create
                          await this.runHistoryActivity("customer_refund_money", subjectAction, payloadDependency)
                        }
                      }



                    }

                } else {
                  currentPayPoint += findGroupOrder.final_fee
                  // console.log(currentPayPoint, 'currentPayPoint');

                  log = `${item.type} - ${item.second_type} -  ${findGroupOrder._id} - current: ${currentPayPoint} - ${item.data.final_fee}`
                  const query = {
                    $and: [
                      { id_group_order: findGroupOrder._id },
                      { value: findGroupOrder.final_fee }
                    ]
                  }
                  const checkHistory = await this.historyActivityModel.findOne(query)
                  if (checkHistory) {
                    checkHistory.value = item.data.final_fee;
                    checkHistory.current_pay_point = currentPayPoint
                    checkHistory.date_create = item.date_create
                    checkHistory.save();
                  } else {
                    let subjectAction = {
                      type: "system",
                      _id: null
                    }
                    const tempTypeSubjectAction = item.type.split("_")
                    if (tempTypeSubjectAction.length === 4) {
                      subjectAction.type = 'admin'
                      // console.log(findGroupOrder[item.type].id_user_system, 'findGroupOrder[item.type].id_user_system');

                      const admin = await this.userSystemModel.findById(findGroupOrder[item.type].id_user_system)
                      // console.log(admin, 'admin');

                      subjectAction._id = admin._id;
                      payloadDependency.admin_action = admin
                    } else if (tempTypeSubjectAction[3] === "system") {
                      subjectAction.type = tempTypeSubjectAction[3]
                      subjectAction._id = null
                    }
                    // console.log(item.date_create, 'item.date_create');

                    payloadDependency.group_order = findGroupOrder
                    payloadDependency.statusPayPoint = "up"
                    payloadDependency.money = findGroupOrder.final_fee
                    payloadDependency.currentPayPoint = currentPayPoint
                    payloadDependency.date_create = item.date_create
                    await this.runHistoryActivity("customer_refund_money", subjectAction, payloadDependency)
                  }
                }
              }
            }
            else if (item.type.indexOf("cancel") > -1 && item.second_type === "group_order") {
              // console.log(currentPayPoint, 'currentPayPoint');
              // console.log(item.type, ' - ', item.second_type, 'second_type');

              currentPayPoint += item.data.final_fee
              log = `${item.type} -  ${item.data._id} - current: ${currentPayPoint} - ${item.data.final_fee}`
              const startDate = new Date(new Date(item.date_create).getTime() - 200).toISOString()
              const endDate = new Date(new Date(item.date_create).getTime() + 200).toISOString()

              const query = {
                $and: [
                  { id_group_order: item.data._id },
                  { type: { $in: ["customer_refund_pay_point", "customer_refund_money", "customer_refund_pay_point_service"] } },
                  { date_create: { $gte: startDate } },
                  { date_create: { $lte: endDate } },
                ]
              }
              const checkLogHistory = await this.historyActivityModel.findOne(query);
              // console.log(item.data, 'item.data._id');

              if (item.data._id.toString() === "66ac3bd5ef700752512f9777") {
                // console.log(checkLogHistory, 'checkLogHistory');

              }
              if (checkLogHistory) {
                // if()
                // console.log(checkLogHistory, 'checkLogHistory');
                // console.log(item.data.final_fee, 'item.data.final_fee');

                checkLogHistory.value = item.data.final_fee;
                checkLogHistory.current_pay_point = currentPayPoint
                checkLogHistory.date_create = item.date_create
                checkLogHistory.save();
              } else {
                // console.log(item.type, " - ", query, " - ", item.data._id);

                const subjectAction = {
                  type: "system",
                  _id: null
                }
                // console.log(item.date_create, 'item.date_create');

                payloadDependency.group_order = item.data
                payloadDependency.statusPayPoint = "up"
                payloadDependency.money = item.data.final_fee
                payloadDependency.currentPayPoint = currentPayPoint
                payloadDependency.date_create = item.date_create
                await this.runHistoryActivity("customer_refund_money", subjectAction, payloadDependency)
              }
            }
            else if (item.type === "history_give_point" && item.second_type == "history_activity") {
              currentPayPoint += item.data.value
              // console.log(currentPayPoint, 'currentPayPoint');

              log = `${item.type} -  ${item.data._id} - current: ${currentPayPoint} - ${item.data.final_fee}`
              const query = {
                $and: [
                  { _id: item.data._id },
                ]
              }
              const checkLogHistory = await this.historyActivityModel.findOne(query);
              if (checkLogHistory) {
                // if()
                checkLogHistory.value = item.data.value;
                checkLogHistory.current_pay_point = currentPayPoint
                checkLogHistory.date_create = item.date_create
                checkLogHistory.save();
              }
            }


            // console.log(currentPayPoint, ' - ', item.type, ' - ', item.data._id, ' - ', item.date_create, ' - ', item.data.final_fee);

            // else if (item.type === "notification") {
            //   const query = {
            //     $and: [
            //       { id_transaction: item.data._id }
            //     ]
            //   }
            //   const checkLogHistory = await this.historyActivityModel.find(query);
            //   if (checkLogHistory.length > 0) {

            //   } else {

            //   }
            // }

            if (log !== "") {
              console.log(log, "log");
            }


            // console.log(item.type, " - ", item.data._id, " - ", currentPayPoint);


          }


          itemCustomer.pay_point = currentPayPoint;
          await itemCustomer.save();
        }







        lengthCustomer = arrCustomer.length
        iPageCustomer.start += iPageCustomer.length
      } while (lengthCustomer === iPageCustomer.length)
    } catch (err) {
      throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
    }
  }

  async fillPayloadDependency(title, body, title_admin, payloadDependency, subjectAction) {
    try {
      const payload = {
        title,
        body,
        title_admin,
        id_user_action: (subjectAction.type === "admin") ? subjectAction._id : null,
        id_customer: payloadDependency.customer?._id || null,
        id_admin_action: payloadDependency.admin_action?._id || null,
        id_group_order: payloadDependency.group_order?._id || null,
        id_order: payloadDependency.order?._id || null,
        id_collaborator: payloadDependency.collaborator?._id || null,
        id_reason_cancel: payloadDependency.reason_cancel?._id || null,
        id_transaction: payloadDependency.transaction?._id || null
      }
      return payload;
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async runHistoryActivity(type, subjectAction, payloadDependency) {
    try {
      console.log(payloadDependency.date_create, "dsadasd");

      let formatMoney = "0đ";
      formatMoney = await this.generalHandleService.formatMoney(Math.abs(payloadDependency.money));
      let title = {
        vi: "",
        en: ""
      }
      let titleAdmin = ""
      let date_create = payloadDependency.date_create

      if (type === "customer_payment_pay_point_service") {
        title = {
          vi: "Thanh toán thành công",
          en: "Payment success"
        }
        titleAdmin = `Thanh toán thành công dịch vụ với số tiền ${formatMoney} cho đơn ${payloadDependency.group_order.id_view} !`
      }
      else if (type === "customer_refund_money") {
        title = {
          vi: "Hoàn tiền dịch vụ",
          en: "Refund service"
        }
        if (payloadDependency.order) {
          titleAdmin = `Hoàn tiền cho khách hàng từ đơn ${payloadDependency.order.id_view}`
        }
        if (payloadDependency.group_order) {
          titleAdmin = `Hoàn tiền cho khách hàng từ dịch vụ ${payloadDependency.group_order.id_view}`
        }
      } else if (type === "verify_transaction_top_up") {
        title = {
          vi: "Nạp thành công",
          en: "Top up successfully"
        }
        titleAdmin = `Duyệt lệnh nạp ${payloadDependency.transaction.id_view} của khách hàng ${payloadDependency.customer.full_name} thành công`
      }

      const newHistory = new this.historyActivityModel({
        ...await this.fillPayloadDependency(title, title, titleAdmin, payloadDependency, subjectAction),
        type: type,
        value: payloadDependency.money || 0,
        current_pay_point: payloadDependency.currentPayPoint,
        status_current_pay_point: payloadDependency.statusPayPoint,
        date_create
      })

      newHistory.save();

      // await this.historyActivityModel.

      //   await this.createItem({
      //     ...await this.fillPayloadDependency(title, title, titleAdmin, payloadDependency, subjectAction),
      //     type: "customer_payment_pay_point_service",
      //     value: -money || 0,
      //     current_pay_point: getCustomer.pay_point,
      //     status_current_pay_point: "down",
      // }) 

    } catch (err) {
      throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
    }
  }

  async calculatePayPointCustomer() {
    try {
      const idCustomer = new Types.ObjectId("65e024805d076736148f6046");
      const queryGroupOrder = {
        $and: [
          { id_customer: idCustomer }
        ]
      }
      const findGroupOrder = await this.groupOrderModel.find(queryGroupOrder).sort({ date_create: 1 })
      const findOrder = await this.groupOrderModel.find(queryGroupOrder).sort({ date_create: 1 })


      let totalRefund = 0;
      let totalpayment = 0;

      let totalPayPointCustomerOrder = 5066000;
      let totalPayPointCustomerGroupOrder = 5066000;

      for (const item of findOrder) {

        // if(item.status === "cancel" && item.payment_method === "point") {
        //   totalPayPointCustomerOrder += item.final_fee
        // }
        if (item.status !== "cancel" && item.payment_method === "point") {
          totalPayPointCustomerOrder -= item.final_fee
        }

      }


      for (const item of findGroupOrder) {
        // if(item.status === "cancel" && item.payment_method === "point") {
        //   totalPayPointCustomerGroupOrder += item.final_fee
        // } 
        if (item.status !== "cancel" && item.payment_method === "point") {
          totalPayPointCustomerGroupOrder -= item.final_fee
        }

      }

      console.log(totalPayPointCustomerGroupOrder, 'totalPayPointCustomer');
      console.log(totalPayPointCustomerOrder, 'totalPayPointCustomer');



      // for(const item of findGroupOrder) {
      //   const findOrder = await this.orderModel.findOne({id_group_order: item._id, status: {$ne: "cancel"}});
      //   if(findOrder) {
      //     if(item.payment_method === "point") {
      //       console.log(item._id, " - " , item.final_fee, " - ",  "refund");
      //       totalRefund += item.final_fee;
      //     }

      //   } else {
      //     item.status = "cancel"
      //     // item.save();
      //     if(item.payment_method === "point") {
      //     console.log(item._id, " - " , item.final_fee, " - ",  "payment");
      //     totalpayment += item.final_fee
      //     }
      //   }
      // }
      // 5.066.000
      console.log(totalRefund, "totalRefund");
      console.log(totalpayment, "totalpayment");




    } catch (err) {
      throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
    }
  }

  // đổi lại id_transaction và id_punish_ticket của history nào có type là create_punish_ticket
  async updateHistoryActivitiesType() {
    try {
      const query = {
        $and: [
          {
            $or: [
              { type: "create_punish_ticket" },
            ],
          },
          { id_punish_ticket: null }
        ]
      }
      const data = await this.historyActivityRepositoryService.getListDataByCondition(query);
      for (let i = 0; i <= data.length; i++) {
        const { _id, id_transaction, id_punish_ticket } = data[i];
        data[i].id_punish_ticket = id_transaction;
        data[i].id_transaction = id_punish_ticket;
        await this.historyActivityRepositoryService.findByIdAndUpdate(_id, data[i]);
      }
      console.log(data.length, 'length');

      console.log('done');

    } catch (err) {
      throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
    }
  }

  // update title của history nào có type là create_punish_ticket
  async updateHistoryActivitiesType2() {
    try {
      const query = {
        $and: [
          {
            // type với title chưa khớp cần check lại 
            $or: [
              { type: "create_punish_ticket" },
            ],
          }
        ]
      }
      const data = await this.historyActivityRepositoryService.getListDataByCondition(query);
      for (let i = 0; i <= data.length; i++) {
        const { _id, id_transaction, id_punish_ticket } = data[i];
        const getPunishTicket = await this.punishTicketRepositoryService.findOneById(data[i].id_punish_ticket);
        data[i].title_admin = `Tạo lệnh phạt thành công`;
        await this.historyActivityRepositoryService.findByIdAndUpdate(_id, data[i]);
      }

      console.log('done')
    } catch (err) {
      throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
    }
  }

  // Đổi type của các history activies bên dưới
  async updateHistoryActivitiesType3() {
    try {
      const query = {
        $and: [
          {
            $or: [
              { type: "system_verify_transaction" },
              { type: "verify_punish" },
              { type: "verify_withdraw" },
              { type: "verify_reward" },
              { type: "verify_top_up" },
            ],
          }
        ]
      }
      const data = await this.historyActivityRepositoryService.getListDataByCondition(query);
      for (let i = 0; i <= data.length; i++) {
        const { _id } = data[i];

        if ((data[i].type === "verify_punish" ||
          data[i].type === "system_verify_transaction") &&
          data[i].id_punish_ticket !== null &&
          data[i].id_transaction !== null) {
          data[i].type = "verify_transaction_punish_ticket"
        } else if (data[i].type === "verify_withdraw") {
          data[i].type = 'verify_transaction_withdraw'
        } else if (data[i].type === 'verify_reward') {
          data[i].type = 'verify_transaction_reward'
        } else if (data[i].type = "verify_top_up") {
          data[i].type = "verify_transaction_top_up"
        }
        await this.historyActivityRepositoryService.findByIdAndUpdate(_id, data[i]);
      }
      console.log(data.length, 'length');
      console.log("done");

    } catch (err) {
      throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
    }
  }

  // Đổi type của các history activies bên dưới 
  async updateHistoryActivitiesType4() {
    try {
      const query = {
        $and: [
          {
            $or: [
              { type: "admin_cancel_punish_ticket" }
            ],
          }
        ]
      }
      const data = await this.historyActivityRepositoryService.getListDataByCondition(query);
      for (let i = 0; i <= data.length; i++) {
        const { _id } = data[i];
        data[i].type = "cancel_punish_ticket";
        await this.historyActivityRepositoryService.findByIdAndUpdate(_id, data[i]);
      }
      console.log(data.length, 'length');
      console.log("done");
    } catch (err) {
      throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
    }
  }

  // Đổi type của các history activies bên dưới 
  async updateHistoryActivitiesType5() {
    try {
      const query = {
        $and: [
          {
            $or: [
              { type: "admin_verify_punish_ticket" },
              { type: "system_punish_ticket " }
            ],
          }
        ]
      }
      const data = await this.historyActivityRepositoryService.getListDataByCondition(query);
      for (let i = 0; i <= data.length; i++) {
        data[i].type = "verify_punish_ticket";
        await this.historyActivityRepositoryService.findByIdAndUpdate(data[i]._id, data[i]);
      }
      console.log(data.length);
      console.log('done');


    } catch (err) {
      throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
    }
  }

  // Đổi type của các history activies bên dưới 
  async updateHistoryActivitiesType6() {
    try {
      const query = {
        $and: [
          {
            $or: [
              { type: "system_create_transaction" },
              { type: "admin_top_up_user" },
              { type: "admin_withdraw_user" },
            ],
          }
        ]
      }
      const data = await this.historyActivityRepositoryService.getListDataByCondition(query);
      for (let i = 0; i <= data.length; i++) {
        data[i].type = "create_transaction";
        await this.historyActivityRepositoryService.findByIdAndUpdate(data[i]._id, data[i]);
      }
      console.log(data.length);
      console.log('done');


    } catch (err) {
      throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
    }
  }

  // Đổi type của các history activies bên dưới 
  async updateHistoryActivitiesType7() {
    try {
      const query = {
        $and: [
          {
            $or: [
              { type: "refund_money_revoke_punish_ticket" },
              { type: "admin_revoke_punish_ticket" },
            ],
          }
        ]
      }
      const data = await this.historyActivityRepositoryService.getListDataByCondition(query);
      for (let i = 0; i <= data.length; i++) {
        data[i].type = "revoke_punish_ticket";
        await this.historyActivityRepositoryService.findByIdAndUpdate(data[i]._id, data[i]);
      }
      console.log(data.length);
      console.log('done');


    } catch (err) {
      throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
    }
  }

  //Đổi type punish_collaborator có log lại số dư thành verify_transaction_punish_ticket

  /////////////////////////////////////////////////////////////////////////////////////////////
  async setTransaction() {
    await this.transactionModel.updateMany({
      $set: {
        type_wallet: 'other',
      }
    });
  }
  async updateTransaction() {
    try {


      await this.transactionModel.updateMany({}, {
        $set: {
          type_transaction_ticket: '$kind_transfer',
        }
      })

      await this.transactionModel.updateMany({}, {
        $set: {
          account_name_out: null,
          account_number_out: null,
          account_bank_out: null
        }
      })




      // const iPage = {
      //   start: 0,
      //   length: 300
      // }

      // const query = {
      //   $and: [
      //     { is_delete: false }
      //   ]
      // }
      // const count = await this.transactionRepositoryService.countDataByCondition({})
      // do {
      //   const arrTransaction = await this.transactionRepositoryService.getListPaginationDataByCondition(iPage, query);
      //   for (let item of arrTransaction.data) {
      //     if (item.type_transfer === TYPE_TRANSFER.top_up || item.type_transfer === TYPE_TRANSFER.withdraw) {
      //       item.type_wallet = item.payment_in;
      //       if (item.momo_transfer) {
      //         item.payment_in = PAYMENT_ENUM.momo;
      //         item.payment_out = PAYMENT_ENUM.momo;
      //       } else if (item.vnpay_transfer) {
      //         item.payment_in = PAYMENT_ENUM.vnpay;
      //         item.payment_out = PAYMENT_ENUM.vnpay;
      //       } else {
      //         item.payment_in = PAYMENT_ENUM.bank;
      //         item.payment_out = PAYMENT_ENUM.bank;
      //       }
      //     } else {
      //       item.type_wallet = 'other';
      //     }
      //     const a = await this.transactionRepositoryService.findByIdAndUpdate(item._id, item);
      //   }
      //   console.log('iPage ', iPage.start);

      //   iPage.start += 300;
      // } while (iPage.start < count)
    } catch (err) {
      throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
    }
  }
  async setupDate() {
    try {
      // await this.punishModel.updateMany({
      //   $set: {
      //     id_transaction: null,
      //     id_punish_ticket: null
      //   },
      // });

      // await this.transitionCollaboratorModel.updateMany({ // tạm set thêm trường mới để đánh dấu là đã migrate data chưa
      //   $set: { // chỉ chạy 1 lần
      //     id_transaction: null,
      //   }
      // });
      // await this.transitionCustomerModel.updateMany({
      //   $set: {
      //     id_transaction: null,
      //   }
      // });
    } catch (err) {
      throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);

    }
  }
  async updateExtendOptional() {
    try {


      // const getItem = await this.extendOptionalModel.find();
      // for(const item of getItem) {
      //   item.id_optional_service = new Types.ObjectId(item.id_optional_service);
      //   item.save();
      // }

      // await this.extendOptionalModel.updateMany({
      //   $set: {
      //     id_extend_optional: [],
      //   }
      // });


      // await this.extendOptionalModel.updateMany({
      //   $set: {
      //     area_fee: [],
      //     // platform_fee: 25
      //   }
      // });
      // const getExtend = await this.extendOptionalModel.find({ is_delete: false });



      // for (const item of getExtend) {
      //   const getOptionalService = await this.optionalServiceModel.findById(item.id_optional_service);


      //   for (let i = 0; i < item.price_option_area.length; i++) {
      //     let indexArea1 = item.area_fee.findIndex(x => x.area_lv_1 === item.price_option_area[i].city);

      //     if (indexArea1 < 0) {
      //       let payload = {
      //         is_active: true,
      //         area_lv_1: item.price_option_area[i].city,
      //         platform_fee: (item.is_platform_fee === true) ? item.platform_fee : getOptionalService.platform_fee,
      //         price_type_increase: "amount",
      //         price: item.price_option_area[i].value,
      //         price_option_rush_day: AREA_FEE_HOUR_1[0].price_option_rush_day,
      //         price_option_holiday: AREA_FEE_HOUR_1[0].price_option_holiday,
      //         area_lv_2: []
      //       }
      //       if (item.price_option_area[i].district.length > 0) {
      //         const area_lv2 = {
      //           is_active: true,
      //           area_lv_2: item.price_option_area[i].district,
      //           price: item.price_option_area[i].value,
      //           is_platform_fee: false,
      //           platform_fee: (item.is_platform_fee === true) ? item.platform_fee : getOptionalService.platform_fee
      //         }
      //         payload.area_lv_2.push(area_lv2)
      //       }
      //       item.area_fee.push(payload);
      //       await item.save();
      //     } else {

      //       const area_lv2 = {
      //         is_active: true,
      //         area_lv_2: item.price_option_area[i].district,
      //         price: item.price_option_area[i].value,
      //         is_platform_fee: false,
      //         platform_fee: 25
      //       }
      //       item.area_fee[indexArea1].area_lv_2.push(area_lv2)
      //       await item.save();
      //     }
      //   }
      //   await item.save();
      // }

      // Create new extend optional
      // const getExtendOptional = await this.extendOptionalModel.findOne({_id: new Types.ObjectId("63213e73c1c5585f8a45fe93")})
      // 674000da9f6459880764b449 
      // 67400839d4c6b28f3b23f8cd
      //   await this.extendOptionalModel.insertMany([{
      //     title: {
      //       vi: "150 - 180m2 tổng diện tích",
      //       en: "150 - 180m2 total area"
      //     },
      //     thumbnail: getExtendOptional.thumbnail,
      //     description: {
      //       vi: "150 - 180m2 tổng diện tích",
      //       en: "150 - 180m2 total area"
      //     },
      //     is_active: true,
      //     id_optional_service: "674000da9f6459880764b449",
      //     price: 400000,
      //     count: 1,
      //     estimate: 165,
      //     thumbnail_active: getExtendOptional.thumbnail_active,
      //     is_price_option_rush_hour: false,
      //     price_option_area: getExtendOptional.price_option_area,
      //     is_platform_fee: true,
      //     platform_fee: 28,
      //     area_fee: getExtendOptional.area_fee,
      //     id_extend_optional: [new Types.ObjectId("67400839d4c6b28f3b23f8cd")],
      //     is_show_in_app: true
      //   },
      //   {
      //     title: {
      //       vi: "Trên 180m2 tổng diện tích",
      //       en: "Over 180m2 total area"
      //     },
      //     thumbnail: getExtendOptional.thumbnail,
      //     description: {
      //       vi: "Trên 180m2 tổng diện tích",
      //       en: "Over 180m2 total area"
      //     },
      //     is_active: true,
      //     id_optional_service: "674000da9f6459880764b449",
      //     price: 450000,
      //     count: 1,
      //     estimate: 75,
      //     thumbnail_active: getExtendOptional.thumbnail_active,
      //     is_price_option_rush_hour: false,
      //     price_option_area: getExtendOptional.price_option_area,
      //     is_platform_fee: true,
      //     platform_fee: 28,
      //     area_fee: getExtendOptional.area_fee,
      //     id_extend_optional: [new Types.ObjectId("67400839d4c6b28f3b23f8cd")],
      //     is_show_in_app: true
      //   },
      // ])

      // await this.extendOptionalModel.updateMany(
      //   {
      //     id_optional_service: "674000da9f6459880764b449"
      //   },
      //   {
      //     $set:{
      //       id_extend_optional: [new Types.ObjectId("67400839d4c6b28f3b23f7d7"), new Types.ObjectId("67400839d4c6b28f3b23f852"), new Types.ObjectId("67400839d4c6b28f3b23f8cd")]
      //     }
      //   }
      // )

      /** Cập nhật trường mới */

      // await this.extendOptionalModel.updateMany(
      //   {},
      //   {
      //     $set: {
      //       selection_type: null,
      //       kind_v2: null,
      //       limit: null,
      //       select_value: false,
      //       is_locked: false
      //     }
      //   }
      // )


      // const lstExtendOptional = await this.extendOptionalModel.find({ id_optional_service: "654ddb5b8b3f1a21b709bc03", kind: "fabric" })

      // for (let i = 0; i < lstExtendOptional.length; i++) {
      //   lstExtendOptional[i].selection_type = {}
      //   lstExtendOptional[i].kind_v2 = {}
      //   lstExtendOptional[i].selection_type = {
      //     kind: SELECTION_TYPE.number,
      //     value: 0
      //   }
      
      //   lstExtendOptional[i].kind_v2['title'] = {
      //     vi: 'Sofa nỉ/ vải',
      //     en: 'Fabric sofa'
      //   }

      //   lstExtendOptional[i].kind_v2['kind'] = TYPE_OF_KIND_V2.multiple

      //   await lstExtendOptional[i].save()
      // }

      // const lstExtendOptional1 = await this.extendOptionalModel.find({ id_optional_service: "654ddb5b8b3f1a21b709bc03", kind: "leather" })
      // for (let i = 0; i < lstExtendOptional1.length; i++) {
      //   lstExtendOptional1[i].selection_type = {}
      //   lstExtendOptional1[i].kind_v2 = {}
      //   lstExtendOptional1[i].selection_type = {
      //     kind: SELECTION_TYPE.number,
      //     value: 0
      //   }

      //   lstExtendOptional1[i].kind_v2['title'] = {
      //     vi: 'Sofa da',
      //     en: 'Leather sofa'
      //   }

      //   lstExtendOptional1[i].kind_v2['kind'] = TYPE_OF_KIND_V2.multiple

      //   await lstExtendOptional1[i].save()
      // }

      // const lstExtendOptional2 = await this.extendOptionalModel.find({ id_optional_service: "654ddba48b3f1a21b70a10c7" })
      // for (let i = 0; i < lstExtendOptional2.length; i++) {
      //   lstExtendOptional2[i].selection_type = {}
      //   lstExtendOptional2[i].kind_v2 = {}
      //   lstExtendOptional2[i].selection_type = {
      //     kind: SELECTION_TYPE.number,
      //     value: 0
      //   }
      //   lstExtendOptional2[i].kind_v2['title'] = {
      //     vi: 'Thảm',
      //     en: 'Carpet'
      //   }
      //   lstExtendOptional2[i].kind_v2['kind'] = TYPE_OF_KIND_V2.multiple

      //   await lstExtendOptional2[i].save()
      // }

      // const lstExtendOptional3 = await this.extendOptionalModel.find({ id_optional_service: "654ddb858b3f1a21b709d100" })
      // for (let i = 0; i < lstExtendOptional3.length; i++) {
      //   lstExtendOptional3[i].selection_type = {}
      //   lstExtendOptional3[i].kind_v2 = {}
      //   lstExtendOptional3[i].selection_type = {
      //     kind: SELECTION_TYPE.number,
      //     value: 0
      //   }
      //   lstExtendOptional3[i].kind_v2['title'] = {
      //     vi: 'Nệm',
      //     en: 'Mattress'
      //   }

      //   lstExtendOptional3[i].kind_v2['kind'] = TYPE_OF_KIND_V2.multiple

      //   await lstExtendOptional3[i].save()
      // }

      const lstExtendOptional4 = await this.extendOptionalModel.find({ id_optional_service: "654ddbb28b3f1a21b70a1129" })
      for (let i = 0; i < lstExtendOptional4.length; i++) {
        lstExtendOptional4[i].selection_type = {}
        lstExtendOptional4[i].kind_v2 = {}
        if(lstExtendOptional4[i].position <= 3) {
          lstExtendOptional4[i].selection_type = {
            kind: SELECTION_TYPE.number,
            value: 0
          }

          lstExtendOptional4[i].kind_v2['kind'] = TYPE_OF_KIND_V2.multiple
        } else if (lstExtendOptional4[i].position === 5) {
          lstExtendOptional4[i].selection_type = {
            kind: SELECTION_TYPE.toggle,
            value: false,
          }

          lstExtendOptional4[i].kind_v2['kind'] = TYPE_OF_KIND_V2.single
        } else if (lstExtendOptional4[i].position === 6) {
          lstExtendOptional4[i].selection_type = {
            kind: SELECTION_TYPE.input,
            title: {
              vi: "Khối lượng cần giặt (kg)",
              en: "Weight to be washed (kg)"
            },
            description: {
              vi: "Ước tính tổng khối lượng rèm theo đơn vị (kg)",
              en: "Estimated total curtain weight in units (kg)"
            },
            value: null
          }

          lstExtendOptional4[i].limit = {
            name: { vi: "Khối lượng", en: 'Weight' },
            unit: 'kg',
            min_value: 0,
            max_value: 50,
          }
          lstExtendOptional4[i].kind_v2['kind'] = TYPE_OF_KIND_V2.single
        }
        lstExtendOptional4[i].kind_v2['title'] = {
          vi: 'Rèm cửa',
          en: 'Curtain'
        }

        await lstExtendOptional4[i].save()
      }

      for (let i = 0; i < lstExtendOptional4.length; i++) {
        lstExtendOptional4[i].selection_type = {}
        lstExtendOptional4[i].kind_v2 = {}
        if(lstExtendOptional4[i].position <= 3) {
          lstExtendOptional4[i].selection_type = {
            kind: SELECTION_TYPE.number,
            value: 0
          }

          lstExtendOptional4[i].kind_v2['kind'] = TYPE_OF_KIND_V2.multiple
        } else if (lstExtendOptional4[i].position === 5) {
          lstExtendOptional4[i].selection_type = {
            kind: SELECTION_TYPE.toggle,

            value: false,
          }

          lstExtendOptional4[i].kind_v2['kind'] = TYPE_OF_KIND_V2.single
        } else if (lstExtendOptional4[i].position === 6) {
          lstExtendOptional4[i].selection_type = {
            kind: SELECTION_TYPE.input,
            title: {
              vi: "Khối lượng cần giặt (kg)",
              en: "Weight to be washed (kg)"
            },
            description: {
              vi: "Ước tính tổng khối lượng rèm theo đơn vị (kg)",
              en: "Estimated total curtain weight in units (kg)"
            },
            value: null
          }

          lstExtendOptional4[i].limit = {
            name: { vi: "Khối lượng", en: 'Weight' },
            unit: 'kg',
            min_value: 0,
            max_value: 50,
          }
          lstExtendOptional4[i].kind_v2['kind'] = TYPE_OF_KIND_V2.single
        }
        lstExtendOptional4[i].kind_v2['title'] = {
          vi: 'Rèm cửa',
          en: 'Curtain'
        }

        await lstExtendOptional4[i].save()
      }

      for (let i = 0; i < lstExtendOptional4.length; i++) {
        if(lstExtendOptional4[i].position <= 3) {
          lstExtendOptional4[i].kind_v2['title'] = {
            vi: 'Rèm cửa (giặt khô)',
            en: 'Curtain (dry cleaning)'
          }
        } else if (lstExtendOptional4[i].position === 5) {
          lstExtendOptional4[i].kind_v2['title'] = {
            vi: 'Rèm cửa (giặt nước)',
            en: 'Curtain (water washing)'
          }
        } else if (lstExtendOptional4[i].position === 6) {
          lstExtendOptional4[i].kind_v2['title'] = {
            vi: 'Rèm cửa (giặt nước)',
            en: 'Curtain (water washing)'
          }
        }
        await lstExtendOptional4[i].save()
      }

      /** Cập nhật giá cho giúp việc theo giờ */

      const price = 30000
      // const platform_fee = 20
      // const lstExtendOptional = await this.extendOptionalModel.find({id_optional_service: "63204b79e59ef92c13e57fd0"})

      // for(const extendOptional of lstExtendOptional) {
      //   extendOptional.platform_fee = platform_fee

      //   for(const area_fee of extendOptional.area_fee) {
      //     area_fee.platform_fee = platform_fee

      //     for(const area_lv_2 of area_fee.area_lv_2) {
      //       area_lv_2.platform_fee = platform_fee
      //     }
      //   }


      //   await extendOptional.save()
      // }

      // for(const extendOptional of lstExtendOptional) {
      //   extendOptional.price += price

      //   for(const price_option_area of extendOptional.price_option_area) {
      //     price_option_area.value += price
      //   }
      //   for(const area_fee of extendOptional.area_fee) {
      //     area_fee.price += price

      //     for(const area_lv_2 of area_fee.area_lv_2) {
      //       area_lv_2.price += price
      //     }
      //   }
      //   await extendOptional.save()
      // }

      console.log("migrate extend optional")

      return true
    } catch (err) {
      throw new HttpException(
        err.response || err.toString(),
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async updateCollaboratorSetting() {
    try {
      await this.collaboratorSettingModel.updateMany({}, {
        $set: {
          // time_push_noti_collaborator: 3,
          // minimum_work_wallet: 200000,
          // minimum_collaborator_wallet: 100000,
          // minimum_withdrawal_money: 500000,
          otp_setting_in_30days: 20
        },
        // $unset: {
        //   mininum_work_wallet: "",
        //   mininum_collaborator_wallet: "",
        //   mininum_withdrawal_money: ""
        // }
      });

      console.log('update collaborator setting is done')
      return true
    } catch (err) {
      throw new HttpException(
        err.response || err.toString(),
        HttpStatus.FORBIDDEN,
      );
    }
  }
  async updateTransactionCollaborator() {
    try {

      const qr = {
        id_transaction: null
      }
      const countTransactionCollaborator = await this.transitionCollaboratorModel.count(qr);
      const iPage = {
        start: 0,
        length: 100
      }

      do {
        const collaboratorTransaction = await this.transitionCollaboratorModel.find(qr).skip(iPage.start).limit(iPage.length);
        console.log(collaboratorTransaction.length);

        for (let item of collaboratorTransaction) {
          // console.log('item', item);

          const getCollaborator = await this.collaboratorModel.findById(item.id_collaborator);
          let payment_in = item.type_wallet
          let kind_transfer = 'income' //income
          if (item.type_wallet === 'wallet') {
            payment_in = 'work_wallet'
          } else if (item.type_wallet === 'gift_wallet') {
            payment_in = 'collaborator_wallet'
          }
          let status = item.status;
          if (status === 'transfered') {
            status = 'transferred'
          }
          if (item.type_transfer === 'withdraw') {
            kind_transfer = 'expense'
          }
          // --------------------------- xử lý id view ------------------------------------- //

          const date = new Date(item.date_create)
          const year = date.getFullYear()
          const month = date.getMonth() + 1 > 9 ? `${date.getMonth() + 1}` : `0${date.getMonth() + 1}`;
          const day = date.getDate() > 9 ? `${date.getDate()}` : `0${date.getDate()}`;
          const tempRandomID = await this.generalHandleService.randomIDTransaction(6);
          let _id_view = `#${year}${month}${day}${tempRandomID}`;
          let checkDupTrans = await this.transactionRepositoryService.findOne({ id_view: _id_view });
          while (checkDupTrans) {
            const tempRandomID = await this.generalHandleService.randomIDTransaction(6);
            _id_view = `#${year}${month}${day}${tempRandomID}`;
            checkDupTrans = await this.transactionRepositoryService.findOne({ id_view: _id_view });
          }

          // --------------------------- kết thúc xử lý id view ----------------------------- //
          const dataCreateTransaction: createTransactionDTO = {
            id_collaborator: item.id_collaborator.toString(),
            id_view: _id_view,
            date_create: item.date_create,
            kind_transfer: kind_transfer,
            subject: 'collaborator',
            money: item.money,
            type_transfer: item.type_transfer,
            transfer_note: await this.transactionSystemService.generateRandomTransferNoteCollaborator(getCollaborator),
            status: status,
            payment_in: payment_in,
            payment_out: item.method_transfer === 'momo' ? 'momo' : 'other',
            momo_transfer: item.momo_payment_method,
            id_admin_verify: item.id_admin_verify,
            date_verify: item.date_verify_created,
            is_delete: item.is_delete
          }
          const transaction = await this.transactionRepositoryService.create(dataCreateTransaction);
          item.id_transaction = transaction._id;
          await item.save();
          // ---------------------------- update transition cũ------------------------------------ //
          const query = {
            $and: [
              { id_transistion_collaborator: item._id.toString() },
              { id_collaborator: item.id_collaborator.toString() },
            ]
          }
          const getHistory = await this.historyActivityRepositoryService.getListDataByCondition(query);
          for (let history of getHistory) {
            history.id_transaction = transaction._id;
            await this.historyActivityRepositoryService.findByIdAndUpdate(history._id, history);
          }
        }
        iPage.start += 100;
        console.log('this here', iPage.start);
      } while (iPage.start < countTransactionCollaborator)



    } catch (err) {
      throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
    }
  }

  // async updateTransactionCustomer() {
  //   try {
  //     const qr = {
  //       id_transaction: null
  //     }
  //     const countTransactionCustomer = await this.transitionCustomerModel.count(qr);
  //     const iPageTransactionCustomer = {
  //       start: 0,
  //       length: 100
  //     }
  //     do {
  //       const customerTransaction = await this.transitionCustomerModel.find(qr)
  //         .skip(iPageTransactionCustomer.start)
  //         .limit(iPageTransactionCustomer.length);
  //       console.log(customerTransaction.length);
  //       for (let item of customerTransaction) {
  //         // --------------------------- xử lý id view ------------------------------------- //
  //         const date = new Date(item.date_create)
  //         const year = date.getFullYear()
  //         const month = date.getMonth() + 1 > 9 ? `${date.getMonth() + 1}` : `0${date.getMonth() + 1}`;
  //         const day = date.getDate() > 9 ? `${date.getDate()}` : `0${date.getDate()}`;
  //         const tempRandomID = await this.generalHandleService.randomIDTransaction(6);
  //         let _id_view = `#${year}${month}${day}${tempRandomID}`;
  //         let checkDupTrans = await this.transactionRepositoryService.findOne({ id_view: _id_view });
  //         while (checkDupTrans) {
  //           const tempRandomID = await this.generalHandleService.randomIDTransaction(6);
  //           _id_view = `#${year}${month}${day}${tempRandomID}`;
  //           checkDupTrans = await this.transactionRepositoryService.findOne({ id_view: _id_view });
  //         }
  //         // --------------------------- kết thúc xử lý id view ----------------------------- //
  //         const getCustomer = await this.customerModel.findById(item.id_customer.toString());
  //         // if (!getCustomer) {
  //         //   console.log('skip 1');
  //         //   continue
  //         // }
  //         let payment_out = 'other'
  //         let payment_in = 'other'
  //         let status = item.status;
  //         let kind_transfer = 'expense' //income
  //         let type_transfer = item.type_transfer;
  //         let transfer_note = getCustomer ? await this.transactionSystemService.generateRandomTransferNoteCustomer(getCustomer) : item.transfer_note
  //         if (item.type_transfer === 'payment_service') {
  //           payment_in = 'cash_book';
  //           payment_out = 'pay_point';
  //           kind_transfer = 'income';
  //           type_transfer = 'pay_service'
  //         } else if (item.type_transfer === 'top_up') {
  //           payment_in = 'pay_point';
  //           payment_out = 'other';
  //           kind_transfer = 'income';
  //         } else if (item.type_transfer === 'withdraw') {
  //           payment_in = 'other';
  //           payment_out = 'pay_point';
  //         }
  //         else if (item.type_transfer === 'refund') {
  //           payment_in = 'pay_point';
  //           payment_out = 'cash_book';
  //           type_transfer = 'refund_service'
  //         }
  //         if (item.status === 'fail') {
  //           status = 'cancel'
  //         }
  //         const dataCreateTransaction: createTransactionDTO = {
  //           id_customer: item.id_customer.toString(),
  //           id_view: _id_view,
  //           date_create: item.date_create,
  //           kind_transfer: kind_transfer,
  //           subject: 'customer',
  //           money: item.money,
  //           type_transfer: type_transfer,
  //           transfer_note: transfer_note,
  //           status: status,
  //           payment_in: payment_in,
  //           payment_out: payment_out,
  //           momo_transfer: item.momo_payment_method,
  //           date_verify: item.date_verify_created,
  //           is_delete: item.is_delete,
  //           vnpay_transfer: item.rsp_query_vnpay.length > 0 ? item.rsp_query_vnpay[0] : null
  //         }
  //         console.log('to here');

  //         const transaction = await this.transactionRepositoryService.create(dataCreateTransaction);
  //         item.id_transaction = transaction._id;

  //         await item.save();
  //         // ---------------------------- update transition cũ------------------------------------ //
  //         const query = {
  //           $and: [
  //             { id_transistion_customer: item._id.toString() },
  //             { id_customer: item.id_customer.toString() }
  //           ]
  //         }
  //         const getHistory = await this.historyActivityRepositoryService.getListDataByCondition(query);
  //         for (let history of getHistory) {
  //           history.id_transaction = transaction._id;
  //           console.log('history ', history);

  //           await this.historyActivityRepositoryService.findByIdAndUpdate(history._id, history);
  //         }
  //       }
  //       iPageTransactionCustomer.start += 100;
  //     } while (iPageTransactionCustomer.start < countTransactionCustomer)
  //   } catch (err) {
  //     throw new HttpException(
  //       err.response || err.toString(),
  //       HttpStatus.FORBIDDEN,
  //     );
  //   }
  // }

  async updateDeviceToken() {
    try {
      // const mongoose = require('mongoose');


      // const findToken = await this.deviceTokenModel.find();
      // for (let i = 0; i < findToken.length; i++) {
      //   console.log(findToken[i]._id, "findToken[i]");

      //   findToken[i]['is_delete'] = false;
      //   await findToken[i].save()
      // }

      await this.deviceTokenModel.updateMany({
        $set: {
          is_delete: false
        }
      })



      // const arrPage =

      // const getDeviceToken = await this.deviceTokenModel.find({
      //   user_id: { $ne: null },
      // });
      // // const count = await this.deviceTokenModel.count();
      // for (let item of getDeviceToken) {
      //   const temp = item.user_id.toString();
      //   item.user_id = temp;
      //   console.log('temp ', typeof temp);

      //   await item.save();
      // }
      // console.log('getDeviceToken ', getDeviceToken.length);

      // for (let item of getDeviceToken) {
      //     const getCustomer = await this.customerModel.findById(item.user_id);

      //     if (getCustomer) {
      //         item.user_id = getCustomer._id;
      //         await item.save();
      //         console.log('>>> ', item);

      //     }

      // }
    } catch (err) {
      throw new HttpException(
        err.response || err.toString(),
        HttpStatus.FORBIDDEN,
      );
    }
  }
  async updateGroupService() {
    try {
      const groupServices = await this.groupServiceModel.find();
      for (let group of groupServices) {
        await group.save();
      }
    } catch (err) {
      throw new HttpException(
        err.response || err.toString(),
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async updatePunish() {
    try {
      await this.punishModel.updateMany({
        $set: {
          id_transaction: null,
          id_punish_ticket: null
        },
      });
    } catch (err) {
      throw new HttpException(
        err.response || err.toString(),
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async updatePunishTicket() {
    try {
      const iPage = {
        start: 0,
        length: 100
      };
      const qr = {
        $and: [
          { id_transaction: null },
          { id_punish_ticket: null },
        ]
      }
      const count = await this.punishModel.count(qr);
      console.log('count ', count);

      do {
        const arrPunish = await this.punishModel.find(qr).skip(iPage.start).limit(iPage.length);
        for (let item of arrPunish) {
          let id_punish_policy = ''
          console.log('item', item);

          switch (item.id_punish.toString()) {
            case '64630c6c86bc749798c0fb96':
              //  ctv ko dem lam 
              id_punish_policy = '6634b05ce956ffc6e4f38786'
              break;
            case '648a97f337e0397a646bdd32':
              // bat dau trc gio lam
              id_punish_policy = '6634b05ce956ffc6e4f38781'
              break;
            case '648a983137e0397a646d3173':
              // tu y thay doi nguoi lam 
              id_punish_policy = '6634b03be956ffc6e4f3876c'
              break;
            case '648a988237e0397a646ef97c':
              // khong mang cccd
              id_punish_policy = '6634ae49e956ffc6e4f386c4'
              break;
            case '648a98b037e0397a6470128c':
              // Đồng phục sai quy cách !
              id_punish_policy = '6634aea8e956ffc6e4f386ee'
              break;
            case '64955b796b3d08653178a7b3':
              // Hủy ca làm khi đã nhận ca
              id_punish_policy = '6634666f61c1079edc4cf0b6'
              break;
            case '64a377abcbb868c3aa1386ba':
              // Phạt không làm bài kiểm tra hàng tháng
              id_punish_policy = '6634afc2e956ffc6e4f38742'
              break;
            case '64a37768cbb868c3aa137f1b':
              // Phạt không đạt bài kiểm tra hàng tháng
              id_punish_policy = '6634afa2e956ffc6e4f3872d'
              break;
            case '6500121f534709c2b911ca30':
              // Phạt tiền vì cung cấp dịch vụ chưa tốt.
              id_punish_policy = '6634aff8e956ffc6e4f38757'
              break;
            case '6589455229a39ca6e48181cd':
              // Thái độ với khách hàng không tốt
              id_punish_policy = '6634af7be956ffc6e4f38718'
              break;
            case '6461ad0d42a6e5294b9fb516':
              // Phạt không kết thúc ca làm
              id_punish_policy = '6655be2f0b697125a352ed69'
              break;
            case '6461b39fc3993c7752770ef1':
              // Phạt không trễ ca lần 1
              id_punish_policy = '6625be2f0b697125a352ed41'
              if (item.money > 30000) {
                // Phạt không trễ ca lần 2
                id_punish_policy = '6625bf78fa879da5688fc572'
              }
              break;
            default:
              break;
          }

          console.log('id_punish_policy ', id_punish_policy);

          const getPolicy = await this.punishPolicyRepositoryService.findOneById(id_punish_policy)
          // const idView = await this.punishTicketSystemService.generateRandomIdViewPunishTicket();
          // ---------------------------------------------------------------- //
          const now = new Date(item.date_create);
          let _tempRandomID = await this.generalHandleService.randomIDTransaction(4);
          const _day = now.getDay() < 10 ? `0${now.getDay().toString()}` : now.getDay().toString();
          const _month = now.getMonth() < 10 ? `0${now.getMonth().toString()}` : now.getMonth().toString();
          const _year = now.getFullYear().toString()
          let idView = `#` + _year + _month + _day + _tempRandomID;
          let checkRandomID = await this.punishTicketRepositoryService.findOne({ id_view: idView });
          let a = 0;
          while (checkRandomID && a < 5) {
            _tempRandomID = await this.generalHandleService.randomIDTransaction(4);
            idView = `#` + _year + _month + _day + _tempRandomID;
            checkRandomID = await this.punishTicketRepositoryService.findOne({ id_view: idView });
            a += 1;
          }
          // ---------------------------------------------------------------- //
          console.log('this here 2');

          const getCollaborator = await this.collaboratorModel.findById(item.id_collaborator)
          const dataCreate = {
            id_collaborator: item.id_collaborator,
            id_order: item.id_order,
            id_admin_action: item.id_admin_action,
            date_create: item.date_create,
            title: getPolicy.title,
            user_apply: 'collaborator',
            status: "done",
            id_transaction: null,
            punish_lock_time: 0,
            current_total_time_process: 1,
            current_total_order_process: 1,
            id_punish_policy: id_punish_policy,
            time_end: item.date_verify_create,
            time_start: item.date_create,
            punish_money: item.money,
            id_view: idView,
            note_admin: item.note_admin,
            payment_out: 'work_wallet',
            payment_in: 'cash_book',
            action_lock: 'unset',
          }
          let punish_ticket;
          // --------------------------- xử lý id view ------------------------------------- //

          const date = new Date(item.date_create)
          const year = date.getFullYear()
          const month = date.getMonth() + 1 > 9 ? `${date.getMonth() + 1}` : `0${date.getMonth() + 1}`;
          const day = date.getDate() > 9 ? `${date.getDate()}` : `0${date.getDate()}`;
          const tempRandomID = await this.generalHandleService.randomIDTransaction(6);
          let _id_view = `#${year}${month}${day}${tempRandomID}`;
          let checkDupTrans = await this.transactionRepositoryService.findOne({ id_view: _id_view });
          while (checkDupTrans) {
            const tempRandomID = await this.generalHandleService.randomIDTransaction(6);
            _id_view = `#${year}${month}${day}${tempRandomID}`;
            checkDupTrans = await this.transactionRepositoryService.findOne({ id_view: _id_view });
          }

          // --------------------------- kết thúc xử lý id view ----------------------------- //
          const dataCreateTransaction: createTransactionDTO = {
            id_collaborator: item.id_collaborator,
            id_order: item.id_order,
            id_view: _id_view,
            id_punish_ticket: '',
            date_create: item.date_verify_create,
            kind_transfer: 'income',
            subject: 'collaborator',
            money: item.money,
            type_transfer: 'punish',
            transfer_note: await this.transactionSystemService.generateRandomTransferNoteCollaborator(getCollaborator),
            status: "done",
            payment_in: 'cash_book',
            payment_out: "work_wallet",
          }
          console.log('this here 3');

          if (item.status === 'pending') { //done
            // ------------------------------------- Bắt đầu phần tạo history activity cho lệnh phạt Pending ---------------------------------------------------- //
            dataCreate.status = 'standby'
            punish_ticket = await this.punishTicketRepositoryService.create(dataCreate);
            const query = {
              $and: [
                { type: 'admin_monetary_fine_collaborator' },
                { id_punish: item._id }
              ]
            }
            console.log('go her 1e');
            const oldHistoryActivity = await this.historyActivityRepositoryService.findOne(query);
            console.log('go here');

            punish_ticket = await this.punishTicketRepositoryService.create(dataCreate);
            const message = {
              en: `admin has create a punish ticket ${punish_ticket.id_view}`,
              vi: `admin đã tạo lệnh phạt ${punish_ticket.id_view}`,
            }
            const title_admin = `${item.id_admin_action} đã tạo lệnh phạt ${punish_ticket.id_view}`;
            this.historyActivityRepositoryService.create({
              id_admin_action: item.id_admin_action,
              title: message,
              body: message,
              title_admin: title_admin,
              type: 'admin_create_punish_ticket',
              date_create: oldHistoryActivity.date_create,
              id_punish_ticket: punish_ticket._id,
              id_collaborator: punish_ticket.id_collaborator
            })
            // ------------------------------------- Kết thúc phần tạo history activity cho lệnh phạt Pending ---------------------------------------------------- //
          } else if (item.status === 'done' || item.status === 'refund') {
            // ----------------------------------- Bắt đầu phần tạo history Activity cho lệnh phạt đã Done ------------------------------------------------------ //
            const beforeTime = new Date(new Date(item.date_verify_create).getTime() - 2500).toISOString()
            const afterTime = new Date(new Date(item.date_verify_create).getTime() + 2500).toISOString()
            dataCreate.status = 'done'
            const query1: any = queryWithinRangeDate('date_create', beforeTime, afterTime)
            const query2 = query1.$and.concat([
              { id_collaborator: item.id_collaborator.toString() },
              // { id_reason_punish: item.id_punish.toString() },
            ])
            console.log('query 1 ', query2);

            const oldHistoryActivity = await this.historyActivityRepositoryService.findOne({ $and: query2 });
            console.log('olh ', oldHistoryActivity);
            punish_ticket = await this.punishTicketRepositoryService.create(dataCreate); // Tạo vé phạt
            console.log('this here 4');

            dataCreateTransaction.id_punish_ticket = punish_ticket._id;
            const transaction = await this.transactionRepositoryService.create(dataCreateTransaction); // tạo lệnh phạt transaction
            punish_ticket.id_transaction = transaction._id.toString();
            await this.punishTicketRepositoryService.findByIdAndUpdate(punish_ticket._id, punish_ticket);
            transaction.id_punish_ticket = punish_ticket._id.toString();
            transaction.id_order = punish_ticket.id_order;
            await this.transactionRepositoryService.findByIdAndUpdate(transaction._id, transaction)
            const message = {
              vi: `Hệ thống tự động tạo giao dịch ${transaction.id_view}`,
              en: `System create transaction ${transaction.id_view}`
            }
            const payload = {
              id_transaction: transaction._id,
              id_collaborator: transaction.id_collaborator,
              id_customer: transaction.id_customer,
              id_punish_ticket: transaction.id_punish_ticket,
              id_order: transaction.id_order,
              title: message,
              body: message,
              title_admin: message.vi,
              type: "system_create_transaction",
              date_create: item.date_create
            }
            await this.historyActivityRepositoryService.create(payload); // log hệ thống tự tạo lệnh phạt
            const message2 = {
              vi: `Hệ thống tự động duyệt giao dịch ${transaction.id_view}`,
              en: `System verify transaction ${transaction.id_view}`
            }
            console.log('this here 5');


            const payload2 = {
              id_transaction: transaction._id,
              id_collaborator: transaction.id_collaborator,
              id_punish_ticket: transaction.id_punish_ticket,
              id_order: transaction.id_order,
              title: message2,
              body: message2,
              title_admin: message2.vi,
              type: "system_verify_transaction",
              date_create: item.date_verify_create,
              current_work_wallet: oldHistoryActivity.current_remainder > 0 ? oldHistoryActivity.current_remainder : oldHistoryActivity.current_work_wallet,
              status_current_work_wallet: oldHistoryActivity.status_current_remainder !== "none" ? oldHistoryActivity.status_current_remainder : oldHistoryActivity.status_current_work_wallet,

              status_current_collaborator_wallet: oldHistoryActivity.status_current_gift_remainder ? oldHistoryActivity.status_current_gift_remainder : oldHistoryActivity.status_current_collaborator_wallet,
              current_collaborator_wallet: oldHistoryActivity.current_gift_remainder > 0 ? oldHistoryActivity.current_gift_remainder : oldHistoryActivity.current_collaborator_wallet,
            }
            await this.historyActivityRepositoryService.create(payload2); // log hệ thống tự duyệt lệnh phạt
            if (item.id_admin_action) {
              const message = {
                en: `admin has create a punish ticket ${punish_ticket.id_view}`,
                vi: `admin đã tạo lệnh phạt ${punish_ticket.id_view}`,
              }
              const title_admin = `${item.id_admin_action} đã tạo vé phạt ${punish_ticket.id_view}`;
              await this.historyActivityRepositoryService.create({
                value: punish_ticket.punish_money,
                title: message,
                body: message,
                title_admin: title_admin,
                type: 'admin_create_punish_ticket',
                date_create: item.date_create,
                id_admin_action: item.id_admin_action,
                id_punish_ticket: punish_ticket._id,
                id_collaborator: punish_ticket.id_collaborator,
                id_order: punish_ticket.id_order,
              }) // log Admin tạo vé phạt

              const message2 = {
                en: `admin has verified a punish ticket ${punish_ticket.id_view}`,
                vi: `admin đã duyệt lệnh phạt ${punish_ticket.id_view}`,
              }
              const title_admin2 = `${item.id_admin_action} đã duyệt lệnh phạt ${punish_ticket.id_view}`;
              this.historyActivityRepositoryService.create({
                id_admin_action: item.id_admin_action,
                title: message2,
                body: message2,
                title_admin: title_admin2,
                type: 'admin_verify_punish_ticket',
                date_create: item.date_verify_create,
                id_punish_ticket: punish_ticket._id,
                id_collaborator: punish_ticket.id_collaborator,
              })
              //log Admin duyệt vé phạt
            } else {
              const message = {
                en: `Punish ticket ${punish_ticket.id_view} was created by system`,
                vi: `Hệ thống tự động tạo vé phạt ${punish_ticket.id_view}`,
              }
              const temp = `Hệ thống tự động tạo vé phạt ${punish_ticket.id_view}`;
              const payloadHistory = {
                id_transaction: punish_ticket._id,
                id_punish_ticket: punish_ticket.id_punish_ticket,
                id_customer: punish_ticket.id_customer,
                id_collaborator: punish_ticket.id_collaborator,
                title: message,
                body: message,
                title_admin: temp,
                value: punish_ticket.punish_money,
                type: 'create_punish_ticket',
                date_create: item.date_create
              }
              await this.historyActivityRepositoryService.create(payloadHistory); // log hệ thông tạo vé phạt
              // --------------------------------------------------- //
              const message3 = {
                en: `System changed punish ticket's status`,
                vi: `Hệ thống đã chuyển đổi trạng thái của vé phạt`,
              }
              const temp3 = `Hệ thống đã chuyển đổi trạng thái của vé phạt từ ${"Chờ duyệt"} sang Hoàn thành`;
              const payloadHistory2 = {
                id_admin_action: punish_ticket.id_admin_action,
                id_transaction: punish_ticket.id_transaction,
                id_punish_ticket: punish_ticket.id_punish_ticket,
                id_collaborator: punish_ticket.id_collaborator,
                id_order: punish_ticket.id_order,
                title: message3,
                body: message3,
                title_admin: temp3,
                type: 'system_change_punish_ticket_status',
              }
              await this.historyActivityRepositoryService.create(payloadHistory2); // log hệ thống hoàn thành vé phạt
            }
            // ----------------------------------- Kết thúc phần tạo history Activity cho lệnh phạt đã Done ------------------------------------------------------ //
            if (item.status === 'refund') {
              transaction.status = 'refund';
              await this.transactionRepositoryService.findByIdAndUpdate(transaction._id, transaction) // cập nhật lại trạng thái của lệnh giao dịch
              punish_ticket.status = 'revoke'
              punish_ticket.id_transaction = transaction._id.toString();
              await this.punishTicketRepositoryService.findByIdAndUpdate(punish_ticket._id, punish_ticket) // cập nhật lại vé phạt
              const getHistory = await this.historyActivityRepositoryService.findOne({
                $and: [
                  { id_punish: item._id },
                  { type: "admin_cancel_punish" }
                ]
              });//tìm kiếm log lịch sử cũ
              //
              // 
              console.log('getHistory', getHistory);

              console.log('this here 6');

              const message = {
                vi: `admin đã thu hồi vé phạt ${punish_ticket.id_view}`,
                en: `admin revoked ticket ${punish_ticket.id_view}`
              };
              const title_admin = `${getHistory.id_admin_action ? getHistory.id_admin_action : 'admin'} đã thu hồi vé phạt ${punish_ticket.id_view}`;
              await this.historyActivityRepositoryService.create({
                id_admin_action: getHistory.id_admin_action ? getHistory.id_admin_action : null,
                id_punish_ticket: punish_ticket._id,
                id_collaborator: punish_ticket.id_collaborator,
                id_order: punish_ticket.id_order,
                id_transaction: punish_ticket.id_transaction,
                title: message,
                body: message,
                value: punish_ticket.punish_money,
                title_admin: title_admin,
                type: 'admin_revoke_punish_ticket',
                date_create: getHistory.date_create,
              });
              console.log('punish tik', punish_ticket);

              const getTransaction = await this.transactionRepositoryService.findOneById(punish_ticket.id_transaction);
              console.log('getTRanas ', getTransaction);

              const message2 = {
                vi: `Lệnh phạt ${getTransaction.id_view} đã được thu hồi và hoàn tiền`,
                en: `The ${getTransaction.id_view} penalty has been revoked and refunded`
              }
              const temp = `Lệnh phạt ${getTransaction.id_view} đã được thu hồi và hoàn tiền bởi ${getHistory.id_admin_action}`;
              console.log('this here 7');

              await this.historyActivityRepositoryService.create({
                id_collaborator: punish_ticket.id_collaborator,
                id_transaction: punish_ticket.id_transaction,
                id_punish_ticket: punish_ticket._id,
                id_admin_action: getHistory.id_admin_action,
                value: punish_ticket.punish_money,
                date_create: getHistory.date_create,
                title: message2,
                body: message2,
                title_admin: temp,
                type: "refund_money_revoke_punish_ticket",
                current_work_wallet: getHistory.current_remainder > 0 ? getHistory.current_remainder : getHistory.current_work_wallet,
                status_current_work_wallet: getHistory.status_current_remainder !== "none" ? getHistory.status_current_remainder : getHistory.status_current_work_wallet,

                status_current_collaborator_wallet: getHistory.status_current_gift_remainder ? getHistory.status_current_gift_remainder : getHistory.status_current_collaborator_wallet,
                current_collaborator_wallet: getHistory.current_gift_remainder > 0 ? getHistory.current_gift_remainder : getHistory.current_collaborator_wallet,
              })
            }
          } else if (item.status === 'cancel') { // done
            // ------------------------------------------- Bắt đầu phần tạo history activity cho lệnh đã Cancel --------------------------------------- //
            dataCreate.status = 'cancel'
            dataCreateTransaction.status = 'refund'
            // Tìm kiếm thông tin historyactivity cũ
            const query = {
              $and: [
                { type: 'admin_change_status_to_punish' },
                { id_punish: item._id }
              ]
            }
            const oldHistoryActivity = await this.historyActivityRepositoryService.findOne(query)
            punish_ticket = await this.punishTicketRepositoryService.create(dataCreate);
            const message = {
              en: `admin has cancel a punish ticket`,
              vi: `admin đã huỷ vé phạt`,
            }
            const title_admin = `${item.id_admin_action} đã huỷ vé phạt ${punish_ticket.id_view}`;
            this.historyActivityRepositoryService.create({
              id_admin_action: item.id_admin_action,
              title: message,
              body: message,
              title_admin: title_admin,
              type: 'admin_cancel_punish_ticket',
              date_create: oldHistoryActivity.date_create,
              id_punish_ticket: punish_ticket._id,
              id_collaborator: punish_ticket.id_collaborator
            })
            // ------------------------------------------- Kết thúc phần tạo history activity cho lệnh đã Cancel --------------------------------------- //
          }
          let getOrder;
          if (item.id_order) {
            getOrder = await this.orderRepositoryService.findOneById(item.id_order);
            // if (!getOrder) continue;
          }
          if (getOrder) {
            getOrder.id_punish_ticket.push(punish_ticket._id.toString());
            await this.orderRepositoryService.findByIdAndUpdate(getOrder._id, getOrder);
          }
          console.log('1');
          item.id_punish_ticket = punish_ticket._id;
          item.id_transaction = punish_ticket.id_transaction;
          await item.save();
        }
        iPage.start += 100;
        console.log('iPage.start    ', iPage.start);

      } while (iPage.start < count)
    } catch (err) {
      throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN,);
    }
  }
  async clearData() {
    try {


      // // clear group customer invalid
      // const getCustomer = await this.customerModel.find().select({id_group_customer: 1});
      // for(const item of getCustomer) {
      //   console.log(item._id, 'item');

      //   const temp = [];
      //   for(const itemGroup of item.id_group_customer) {
      //     const checkGroupCustomer = await this.groupCustomerModel.findOne({_id: itemGroup, is_delete: false});
      //     if(checkGroupCustomer) temp.push(itemGroup)
      //   }
      //   item.id_group_customer = temp;
      //   item.save();
      // }
      // // clear group customer invalid






      // clear data 0389888952
      const collaborator = await this.collaboratorModel.findOne({
        phone: '0389888952',
      });
      if (!collaborator) return true;

      collaborator.work_wallet = 1000000;
      collaborator.collaborator_wallet = 0;
      await collaborator.save();
      await this.groupOrderModel.deleteMany({
        id_collaborator: collaborator._id,
      });
      await this.orderModel.deleteMany({ id_collaborator: collaborator._id });
      await this.notificationModel.deleteMany({ user_id: collaborator._id });
      await this.notificationModel.deleteMany({
        id_collaborator: collaborator._id,
      });
      await this.historyActivityModel.deleteMany({
        id_collaborator: collaborator._id,
      });
      await this.transitionCollaboratorModel.deleteMany({
        id_collaborator: collaborator._id,
      });

      const customer = await this.customerModel.findOne({
        phone: '0389888952',
      });
      if (!customer) return true;
      customer.pay_point = 20000000;
      await customer.save();
      await this.groupOrderModel.deleteMany({ id_customer: customer._id });
      await this.orderModel.deleteMany({ id_customer: customer._id });
      await this.historyActivityModel.deleteMany({ id_customer: customer._id });
      await this.notificationModel.deleteMany({ id_customer: customer._id });
      await this.notificationModel.deleteMany({ user_id: customer._id });
      await this.deviceTokenModel.deleteMany({ user_id: customer._id });
      await this.transitionCustomerModel.deleteMany({ id_customer: customer._id });
      // await this.customerRequestModel.deleteMany({id_customer: customer._id})
      // await this.customerRequestModel.deleteMany({})

      // const getTransitionCustomer = await this.transitionCustomerModel.find();
      // for (const item of getTransitionCustomer) {
      //   console.log(item._id, 's');
      //   await this.notificationModel.deleteMany({
      //     id_transistion_customer: item._id,
      //   });
      //   await this.historyActivityModel.deleteMany({
      //     id_transistion_customer: item._id,
      //   });
      //   await this.transitionCustomerModel.findOneAndDelete({ _id: item._id });
      // }
      // clear data 0389888952


      // // close all order pending
      // const getPendingGroupOrder = await this.groupCustomerModel.find({status: "pending"});
      // console.log(getPendingGroupOrder, 'getPendingGroupOrder');

      // for(const item of getPendingGroupOrder) {
      //   item.status = "cancel";
      //   await item.save();
      // }
      // const getOrder = await this.orderModel.find({status: "pending"});
      // for(const itemOrder of getOrder) {
      //   console.log(itemOrder._id, 'itemOrder');

      //   itemOrder.status = "cancel";
      //   await itemOrder.save();
      // }
      // console.log("");
      // // close all order pending

    } catch (err) {
      throw new HttpException(
        err.response || err.toString(),
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async updateAddress() { // 
    try {

      await this.addressModel.updateMany({ is_delete: { $exists: false } }, { $set: { is_delete: false } });
    } catch (err) {
      throw new HttpException(
        err.response || err.toString(),
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async updateLinkInvite() {
    try {
      await this.linkInviteModel.updateMany({
        $set: { is_delete: false, is_active: false },
      });
    } catch (err) {
      throw new HttpException(
        err.response || err.toString(),
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async updateUserSystem() {
    try {
      await this.userSystemModel.updateMany( // update phân quyền khu vực
        {
          $set: {
            area_manager_lv_0: 'viet_nam',
            area_manager_lv_1: [],
            area_manager_lv_2: [],
            id_service_manager: [],
          }
        }
      );
      // const getAdmin = await this.userSystemModel.find({ is_delete: false });
      // for( let admin of getAdmin){
      //     console.log('adm in ', admin);
      //     if(admin.id_role_admin === null){
      //         admin.id_role_admin = '642270cff772078b710b13f9'
      //         await admin.save();
      //     }
      // }
      // await this.userSystemModel.updateMany({
      //     $set: {
      //         area_manager_level_0: 'viet_nam',
      //         area_manager_level_1: [],
      //         area_manager_level_2: [],
      //         is_area_manager: true,
      //         is_permission: true
      //     },
      // })
      // console.log('miq qw');
    } catch (err) {
      throw new HttpException(
        err.response || err.toString(),
        HttpStatus.FORBIDDEN,
      );
    }
  }
  async updateRoleAdmin() {
    try {
      await this.roleAdminModel.updateMany({
        $set: {
          area_manager_level_0: 'viet_nam',
          area_manager_level_1: [],
          area_manager_level_2: [],
          is_area_manager: true,
          is_permission: true,
        },
      });
      console.log('miq qw');
    } catch (err) {
      throw new HttpException(
        err.response || err.toString(),
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async updateExamTest() {
    try {
      await this.examTestModel.updateMany({
        $set: {
          // type_exam: ['input']
          id_training_lesson: null
        }
      })
      console.log('migrate exam test');
    } catch (err) {
      throw new HttpException(
        err.response || err.toString(),
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async seedDataAdmin() {
    try {
      const checkAdminSeed = await this.userSystemRepositoryService.findOne({
        email: 'admin@gmail.com',
      });
      if (!checkAdminSeed) {
        const salt = await bcrypt.genSalt();
        const password = await bcrypt.hash('admin@123', salt);
        const newUser = await this.userSystemRepositoryService.create({
          email: 'admin@gmail.com',
          name: 'admin',
          password: password,
          salt: salt,
          role: ['admin'],
          date_create: Date.now(),
        });
        await newUser.save();
        console.log('seed data admin success');
      }
      return true;
    } catch (err) {
      throw new HttpException(
        err.response || err.toString(),
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async seedDataServiceFee() {
    try {
      const serviceFee = await this.serviceFeeModel.find();
      if (serviceFee.length === 0) {
        for (const item of SERVICE_FEE) {
          const newItem = new this.serviceFeeModel({
            title: item.title,
            description: item.description,
            fee: item.fee,
            fee_for: item.fee_for,
            is_service_apply: false,
            service_apply: [],
          });
          newItem.save();
        }
      }
      return true;
    } catch (err) {
      throw new HttpException(
        err.response || err.toString(),
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async seedDataReasonCancel() {
    try {
      const arrReasonCancel = await this.reasonCancelModel.find();
      if (arrReasonCancel.length === 0) {
        for (const item of REASON_CANCEL) {
          const newItem = new this.reasonCancelModel({
            title: item.title,
            description: item.description,
            punish_type: item.punish_type,
            punish: item.punish,
            apply_user: item.apply_user,
            punish_time: item.punish_time,
            punish_cash: item.punish_cash,
          });
          newItem.save();
        }
      }
      for (const item of arrReasonCancel) {
        if (!item.punish_time)
          this.reasonCancelModel.findByIdAndUpdate(item._id, {
            $set: { punish_time: [] },
          });
        if (!item.punish_cash)
          this.reasonCancelModel.findByIdAndUpdate(item._id, {
            $set: { punish_cash: [] },
          });
      }

      return true;
    } catch (err) {
      throw new HttpException(
        err.response || err.toString(),
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async updateReasonCancel() {
    try {
      const arrReasonCancel = await this.reasonCancelModel.find();
      for (const item of arrReasonCancel) {
        if (item.apply_user === 'system') {
          if ((item.title.vi = 'Công việc đã quá thời gian làm')) {
            item.apply_user = 'system_out_date';
          }
          if ((item.title.vi = 'CTV không xác nhận làm việc')) {
            item.apply_user = 'system_out_confirm';
          }
          await item.save();
        }
      }

      const find_system_out_date = await this.reasonCancelModel.findOne({
        apply_user: 'system_out_date',
      });
      const find_system_out_confirm = await this.reasonCancelModel.findOne({
        apply_user: 'system_out_confirm',
      });
      if (!find_system_out_date) {
        const newReason = new this.reasonCancelModel(REASON_CANCEL[0]);
        await newReason.save();
      }
      if (!find_system_out_confirm) {
        const newReason = new this.reasonCancelModel(REASON_CANCEL[1]);
        await newReason.save();
      }
      return true;
    } catch (err) {
      throw new HttpException(
        err.response || err.toString(),
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async updateCustomer() {
    try {
      // await this.customerModel.updateMany({
      //   $set: {
      //     is_staff: false
      //   }
      // })
      // await this.customerModel.updateMany(
      //   {
      //   $or:[
      //     { is_temporary: { $exists: false } },
      //     { is_temporary: false },
      //   ]
      // },
      // { 
      //   $set: {
      //     is_temporary: false
      //   }
      // })
      // const arrCustomer = await this.customerModel.find({
      //   id_group_customer: { $ne: [] },
      // });
      // // const arrCustomer = await this.customerModel.find({phone: "0389888952"});

      // for (const item of arrCustomer) {
      //   console.log(item._id, 'item');
      //   for (let i = 0; i < item.id_group_customer.length; i++) {
      //     console.log(item.id_group_customer[i], 'item.id_group_customer');

      //     var mongoose = require('mongoose');
      //     item.id_group_customer[i] = mongoose.Types.ObjectId(
      //       item.id_group_customer[i],
      //     );
      //   }
      //   // item.id_group_customer = await this.generalHandleService.removeDuplicateValueArr(item.toObject().id_group_customer);
      //   await item.save();
      // }

      // await this.customerModel.updateMany({
      //     $set: {
      //         default_address: null
      //     }
      // })

      // await this.customerModel.updateMany({ gender: { $exists: false } }, { $set: { gender: "other" } })

      // const query = {
      //     $and: [
      //         { is_delete: false },
      //         { default_address: { $ne: null } }
      //     ]
      // }
      // const arrCustomer = await this.customerModel.find(query);

      // for (let item of arrCustomer) {
      //     const getAddress = await this.addressModel.findById(item.default_address);
      //     if (getAddress) {
      //         const tempAddress = getAddress.address.split(",");
      //         const administrative = {
      //             city: tempAddress[tempAddress.length - 1],
      //             district: tempAddress[tempAddress.length - 2]
      //         }
      //         const callPromiseDistric = await this.generalHandleService.getCodeAdministrativeToString(administrative);

      //         const city: number = callPromiseDistric.city;
      //         const district: number = callPromiseDistric.district;
      //         item.city = city;
      //         item.district = district;
      //         console.log(' item  ', item.city, '   ', item.district, '   ', item._id);

      //         await item.save();
      //     }

      // }
      // for (const item of arrCustomer) {
      //     if (item.birthday === null) {
      //         item.birthday = new Date(Date.now()).toISOString();
      //     }
      //     if (item.birth_date === null) {
      //         item.birth_date = new Date(Date.now()).toISOString();
      //     }
      //     await item.save();
      // }

      // let a = 0;
      // let b = 0;
      // for (const item of arrCustomer) {
      //     const getAddress = await this.addressModel.find({
      //         id_user: item._id.toString(),
      //     })
      //     for (let address of getAddress) {
      //         console.log('>>><<<  ');

      //         if (address.is_default_address) {
      //             item.default_address = address._id;
      //             a += 1;
      //             console.log('aaaaaaaaaaaaaaaa>>>>> ', a);
      //             continue;
      //         }
      //     }
      //     if (item.default_address === null) {
      //         if (getAddress.length > 0) {
      //             item.default_address = getAddress[getAddress.length - 1]._id;
      //             getAddress[getAddress.length - 1].is_default_address = true;
      //             await getAddress[getAddress.length - 1].save();
      //         }
      //     }
      //     await item.save();
      // }

      // const arrCustomer = await this.customerModel.find();
      // for(const item of arrCustomer) {
      //     item.invite_code = item.phone;
      //     await item.save();
      // }

      // await this.customerModel.updateMany({
      //     $set: {
      //         id_block_collaborator: [],
      //         id_favourite_collaborator: [],
      //     }
      // })
      // const CODE_CUSTOMER = 'KH';
      // const CODE_CUSTOMER_ZERO = '00000000';
      // let tempCustomer = 1;
      // await this.customerModel.updateMany({
      //     $set: {
      //         id_view: '',
      //         ordinal_number: 1
      //     }
      // });
      // const arrCustomer = await this.customerModel.find().sort({ date_create: 1, _id: 1 });
      // for (let item of arrCustomer) {
      //     item.ordinal_number = tempCustomer;
      //     tempCustomer += 1;
      //     let tempIdView: string;
      //     tempIdView = CODE_CUSTOMER_ZERO.concat(item.ordinal_number.toString());
      //     tempIdView = tempIdView.slice(-8);
      //     tempIdView = CODE_CUSTOMER.concat(tempIdView);
      //     item.id_view = tempIdView;
      //     await item.save();
      // }
      // await this.customerModel.updateMany({ is_active: { $exists: false } }, { $set: { is_active: true } })
      // const arrCustomer = await this.customerModel.find();
      // for(const item of arrCustomer) {
      //     if(!item.rank) {
      //         item.rank = 'member';
      //         item.save();
      //     }
      // }
      // await this.customerModel.updateMany({
      //     $set: { invalid_password: 0 }
      // });
      // console.log('yeaahhhhhhhhhhhhhhhh');

      // fix promotion bi trung
      // for(const item of arrCustomer) {
      //     item.my_promotion = item.my_promotion.filter((value, index, self) =>
      //     index === self.findIndex((t) => (
      //       t["id_promotion"] === value["id_promotion"]
      //     ))
      //   )
      //   item.save();

      // }

      // for(const item of arrCustomer) {
      //     for(let i = 0 ; i < item.my_promotion.length ; i++) {
      //         if(item.my_promotion[i]["_id"] || item.my_promotion[i]["id_promotion"]) {
      //             const findPromotion = await this.promotionModel.findById(item.my_promotion[i]["_id"])
      //             // console.log(findPromotion, 'findPromotion')
      //             if(findPromotion) {
      //                 const expDate = new Date(new Date(item.my_promotion[i]["date_created"]).getTime() + findPromotion.exp_date_exchange * 24 * 60 * 60 * 1000)
      //                 const Object = {
      //                     exp_date: expDate.toISOString(),
      //                     id_promotion: findPromotion._id,
      //                     limit_count: findPromotion.limited_use || 1,
      //                     limit_used: item.my_promotion[i]["limit_used"] || 0,
      //                     date_created: item.my_promotion[i]["date_created"],
      //                     status: (item.my_promotion[i]["limit_used"] < findPromotion.limited_use) ? "exchanged" : "used"
      //                 }
      //                 console.log(Object, 'Object')
      //                 item.my_promotion[i] = Object
      //                 // item.my_promotion[i].save();
      //             } else {
      //                 delete item.my_promotion[i]
      //             }
      //         }
      //     }
      //     item.my_promotion = item.my_promotion.filter(promotion => promotion !== null)
      //     await this.customerModel.findByIdAndUpdate(item._id, {$set: {my_promotion: item.my_promotion}})
      // }

      /* Các bước chạy lại nhóm khách hàng
      1. Chạy lại nhóm khách hàng mới
      2. Chạy lại nhóm khách hàng thành viên
      3. Chạy lại nhóm khách hàng bạc
      4. Chạy lại nhóm khách hàng vàng
      5. Chạy lại nhóm khách hàng guvi => nếu là nv guvi thì thêm ($push) nhóm KH thứ 2 là nhóm nhân viên guvi
      6. Kiểm tra tay những khách hàng không thuộc tất cả những nhóm trên (trường hợp rất ít, chỉnh sửa thủ công nhóm kh cho kh đó)
      7. Nếu số lượng tổng cộng lại từ 5 nhóm: mới, thành viên, bạc, vàng, bạch kim bị nhỏ hơn tổng tất cả 
      thì ở đây sẽ có một vài trường hợp rất ít là khách hàng ko thuộc bất kì nhóm nào, chỉ cần thực hiện lại bước 5 là chắc chắn tổng cuối cùng sẽ đúng */
      // Khách hàng mới: 63a8730e6a5e979e0d637c63

      // const query_new_customer = {
      //   $and: [
      //     { total_price: {$eq: 0}},
      //     { rank_point: {$eq: 0}},
      //   ]
      // }
      // // Khách hàng thành viên: 63a8730e6a5e979e0d637c6d
      //   const query_member = {
      //     $and: [
      //       { rank_point: {$gt: 10, $lt: 100}},
      //     ]
      //   }
      // // Khách hàng bạc: 63a8730e6a5e979e0d637c77
      // const query_silver = {
      //   $and: [
      //     { rank_point: {$gte: 100, $lt: 300}},
      //   ]
      // }
      // // Khách hàng vàng: 63a8730e6a5e979e0d637c81
      // const query_gold = {
      //   $and: [
      //     { rank_point: {$gte: 300, $lt: 1500}},
      //   ]
      // }
      // // Khách hàng bạch kim: 63a8730e6a5e979e0d637c8b
      // const query_platium = {
      //   $and: [
      //     { rank_point: {$gte: 1500}},
      //   ]
      // }
      // // Khách hàng koong thuộc 5 loại trên (số rất ít, chịu khó chỉnh tay lại trong db)
      // const query_other_customers = {
      //   $and: [
      //     {
      //       $nor: [
      //         // Khách hàng mới
      //         {
      //           $and: [
      //             { total_price: { $eq: 0 } },
      //             { rank_point: { $eq: 0 } }
      //           ]
      //         },
      //         // Khách hàng thành viên
      //         {
      //           $and: [
      //             { rank_point: { $gt: 10, $lt: 100 } }
      //           ]
      //         },
      //         // Khách hàng bạc
      //         {
      //           $and: [
      //             { rank_point: { $gte: 100, $lt: 300 } }
      //           ]
      //         },
      //         // Khách hàng vàng
      //         {
      //           $and: [
      //             { rank_point: { $gte: 300, $lt: 1500 } }
      //           ]
      //         },
      //         // Khách hàng bạch kim
      //         {
      //           $and: [
      //             { rank_point: { $gte: 1500 } }
      //           ]
      //         }
      //       ]
      //     },
      //     {is_delete: false},
      //   ]
      // };
      // // Khách hàng là nhân vien guvi: 64f6a905b11ffb2fd961cf8c
      // const query_guvi_user = {
      //   $and: [
      //     { is_staff: true}
      //   ]
      // }

      // await this.customerModel.updateMany(query_platium, { $set: {id_group_customer: [new Types.ObjectId('63a8730e6a5e979e0d637c8b')]} } )
      // await this.customerModel.updateMany(query_guvi_user, { $push: {id_group_customer: [new Types.ObjectId('64f6a905b11ffb2fd961cf8c')]} } )


      /** Cap nhat id inviter */
      // await this.customerModel.updateMany({ id_customer_inviter: { $exists: false }, id_collaborator_inviter: { $exists: false } }, {$set: { id_customer_inviter: null, id_collaborator_inviter: null }})
      // await this.customerModel.updateMany({}, {$set: { id_customer_referrer: null, id_collaborator_referrer: null, a_pay: 0, get_voucher: false, referral_code: null, promotional_referral_code: null }})
      // const getListCustomer = await this.customerModel.find({ id_inviter: { $ne:null } }, {}, { sort: {date_create: 1} })

      // const lstIdInviter = getListCustomer.map((e) => new Types.ObjectId(e.id_inviter))

      // const query = {
      //   $and: [
      //     { _id: { $in: lstIdInviter } }
      //   ]
      // }
      // const lstCustomerInviter = await this.customerRepositoryService.getListDataByCondition(query)
      // const lstCollaboratorInviter = await this.collaboratorRepositoryService.getListDataByCondition(query)

      // for(let i = 0; i < lstCustomerInviter.length; i++) {
      //   const lstCustomer = getListCustomer.filter((e) => e.id_inviter !== null && e.id_inviter.toString() === lstCustomerInviter[i]._id.toString())
      //     if (lstCustomer.length > 0) {
      //       for(let j = 0; j < lstCustomer.length; j++) {
      //       lstCustomer[j].id_customer_inviter = lstCustomer[j].id_inviter
      //       lstCustomer[j].id_inviter = null

      //       await this.customerRepositoryService.findByIdAndUpdate(lstCustomer[j]._id, lstCustomer[j])
      //     }
      //   }

      // }

      // for(let i = 0; i < lstCollaboratorInviter.length; i++) {
      //   const lstCustomer = getListCustomer.filter((e) => e.id_inviter !== null && e.id_inviter.toString() === lstCollaboratorInviter[i]._id.toString())
      //   if(lstCustomer.length > 0) {
      //     for(let j = 0; j < lstCustomer.length; j++) {
      //       lstCustomer[j].id_collaborator_inviter = lstCustomer[j].id_inviter
      //       lstCustomer[j].id_inviter = null

      //       await this.customerRepositoryService.findByIdAndUpdate(lstCustomer[j]._id, lstCustomer[j])
      //     }
      //   }
      // }

      // await this.customerModel.updateOne({_id: new Types.ObjectId('64674a180334637c276c2c91')}, { $set: { id_customer_inviter: new Types.ObjectId('63f4387b6620b25991e9ad7c') } })

      /** Cap nhat referral code */
      // const getListCusotmer = await this.customerModel.find({ referral_code: null, promotional_referral_code: null })
      // console.log('getListCusotmer', getListCusotmer.length)

      // const lstTask = []

      // for (let i = 0; i < getListCusotmer.length; i++) {
      //   getListCusotmer[i].referral_code = `d${getListCusotmer[i].invite_code}`
      //   getListCusotmer[i].promotional_referral_code = `p${getListCusotmer[i].invite_code}`

      //   lstTask.push(this.customerRepositoryService.findByIdAndUpdate(getListCusotmer[i]._id, getListCusotmer[i]))
      // }

      // await Promise.all(lstTask)

      /** Cap nhat thong tin thanh toan */
      await this.customerModel.updateMany({
        payment_information: { $size: 0 }
      }, {
        $set: {
          payment_information: [
            {
              method: 'cash',
              information: []
            },
            {
              method: 'point',
              information: []
            },
            {
              method: 'momo',
              information: []
            },
            {
              method: 'vnpay',
              information: []
            },
            {
              method: 'vnbank',
              information: []
            },
            {
              method: 'intcard',
              information: []
            }
        ]
        }
      })

      /** Cap nhat tai khoan ngan hang */
      // await this.customerModel.updateMany({}, {
      //   $set: {
      //     bank_account: null
      //   }
      // })

      /** Cập nhật payment method default */
      await this.customerModel.updateMany(
        {
          payment_method_default: null
        },
        {
          payment_method_default: {
            title: { vi: 'Tiền mặt', en: 'Cash' },
            icon: 'IconDollars',
            titleIcon: 'IconDollars',
            method: 'cash',
            id_service_apply: [new Types.ObjectId('6321598ea6c81260452bf4f5'), new Types.ObjectId('654dd5598b3f1a21b7011e3f'), new Types.ObjectId('64be251b177d3dd356d5eae1')],
            allow_adding_card: false,
            is_activated: true,
            advertisement: null,
          }
        }
      )

      console.log('migrate customer done')

      return true;
    } catch (err) {
      throw new HttpException(
        err.response || err.toString(),
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async updateCollaborator() {
    try {

      // await this.collaboratorModel.updateMany({
      //   $set: {
      //     date_actived: null
      //   }
      // })

      // const getItem = await this.collaboratorModel.find({ is_verify: true });
      // for (const item of getItem) {
      //   const findActive = await this.historyActivityModel.findOne({ type: "admin_verify_user", id_collaborator: item._id })
      //   if (findActive) {
      //     item.date_actived = findActive.date_create;
      //     item.save();
      //   }
      // }

      /** Cap nhat ngay kich hoat cho doi tac */

      // const getList = await this.collaboratorModel.find({ status: "actived", is_delete: false, date_actived: null })
      // for (let i = 0; i < getList.length; i++) {
      //   const findActive = await this.historyActivityModel.findOne({ type: "admin_update_status_collaborator", id_collaborator: getList[i]._id, value_select: 'actived' })
      //   if (findActive) {
      //     getList[i].date_actived = findActive.date_create;
      //     getList[i].save();
      //   }
      // }


      // await this.collaboratorModel.updateMany({
      //   $set: {
      //     status: "pending",
      //     note_handle_admin: "",
      //     id_user_system_handle: null
      //   }
      // });

      // const getCollaborator = await this.collaboratorModel.find();
      // for(const item of getCollaborator) {
      //   if (item.is_locked === true) {
      //     item.status = "locked"
      //   } else if(item.is_verify === true) {
      //     item.status = "actived"
      //   } else if (item.is_contacted === true) {
      //     item.status = "contacted"
      //   } else {
      //     item.status = "pending"
      //   }
      //   await item.save();
      // }



      // const iPage = {
      //   start: 0,
      //   length: 300
      // }
      // const count = await this.collaboratorModel.count();
      // do {
      //   const getCollaborator = await this.collaboratorModel.find();
      //   for (let item of getCollaborator) {
      //     item.work_wallet = item.remainder;
      //     item.collaborator_wallet = item.gift_remainder;
      //     await item.save();
      //   }
      //   iPage.start += 300;
      //   console.log(iPage.start);

      // } while (iPage.start <= count)
      // await this.collaboratorModel.updateMany({
      //     $set: {
      //         service_apply: ['63215877a6c81260452bf4f0',
      //             '6321598ea6c81260452bf4f5',
      //         ],
      //     }
      // })
      // await this.collaboratorModel.updateMany({
      //   $set: {
      //     id_business: null,
      //   },
      // });
      // update lại số sao CTV
      // const getCollaborator = await this.collaboratorModel.find();
      // for (let collaborator of getCollaborator) {
      //     if (collaborator.total_review > 6) {
      //         collaborator.star = Number(Number(collaborator.total_star / collaborator.total_review).toFixed(1));
      //     } else {
      //         const temp = 5 - collaborator.total_review;
      //         collaborator.star = Number(Number((collaborator.total_star + (5 * temp)) / (collaborator.total_review + temp)).toFixed(1))
      //     }

      //     await collaborator.save();
      // }
      /// kết thúc update số sao CTV

      // const arrCollaborator = await this.collaboratorModel.find();
      // for (const item of arrCollaborator) {
      //     item.invite_code = item.phone;
      //     await item.save();
      // }

      // const arrItem = await this.collaboratorModel.find();
      // for (const item of arrItem) {
      //     switch (item.code_phone_area) {
      //         case "+84": {
      //             item.phone = (item.phone.length === 10) ? item.phone : "0" + item.phone;
      //             break;
      //         }
      //         default: {
      //             break;
      //         }
      //     }
      //     if (item.birthday && item.birthday !== null) {
      //         const convertDate = new Date(item.birthday).toISOString();
      //         item.birthday = convertDate;
      //     } else {
      //         const convertDate = new Date("1990-01-01T10:00:00.000Z").toISOString();
      //         item.birthday = convertDate;
      //     }
      //     item.save();

      // }
      // await this.collaboratorModel.updateMany({
      //     $set: {
      //         password_default: null,
      //     }
      // })
      // await this.collaboratorModel.updateMany({
      //     $set: {
      //         id_view: '',
      //         ordinal_number: 1
      //     }
      // });
      // const CODE_COLLABORATOR = 'CTV79';
      // const CODE_COLLABORATOR_ZERO = '00000';
      // let tempCollaborator = 1;
      // await this.collaboratorModel.updateMany({
      //     $set: {
      //         id_view: '',
      //         ordinal_number: 1
      //     }
      // });
      // const arrCollaborator = await this.collaboratorModel.find().sort({ date_create: 1, _id: 1 });
      // for (let item of arrCollaborator) {
      //     item.ordinal_number = tempCollaborator;
      //     let tempIdView: string;
      //     tempIdView = CODE_COLLABORATOR_ZERO.concat(item.ordinal_number.toString());
      //     tempIdView = tempIdView.slice(-5);
      //     tempIdView = CODE_COLLABORATOR.concat(tempIdView.toString());
      //     item.id_view = tempIdView;
      //     tempCollaborator += 1;
      //     await item.save();
      // }
      // await this.collaboratorModel.updateMany({
      //     total_star: 0,
      //     total_review: 0
      // })
      // const getArrCollaborator = await this.collaboratorModel.find();
      // for (let item of getArrCollaborator) {
      //     const getArrOrder = await this.orderModel.find({
      //         $and: [
      //             { id_collaborator: item._id, },
      //             { status: 'done' },
      //             { star: { $gt: 0 } }
      //         ]
      //     })
      //     for (let i of getArrOrder) {
      //         item.total_review += 1;
      //         item.total_star += i.star;
      //     }
      //     await item.save();
      // }
      // await this.collaboratorModel.updateMany({
      //     $set: {
      //         is_locked: false,
      //         date_lock: null
      //     }
      // })

      /** Cap nhat id_inviter */
      // await this.collaboratorModel.updateMany({ id_customer_inviter: { $exists: false }, id_collaborator_inviter: { $exists: false } }, {$set: { id_customer_inviter: null, id_collaborator_inviter: null }})

      // const getListCollaborator = await this.collaboratorModel.find({ id_inviter: { $ne:null } }, {}, { sort: {date_create: 1} })

      // const lstIdInviter = getListCollaborator.map((e) => new Types.ObjectId(e.id_inviter))

      // const query = {
      //   $and: [
      //     { _id: { $in: lstIdInviter } }
      //   ]
      // }
      // const lstCustomerInviter = await this.customerRepositoryService.getListDataByCondition(query)

      // const lstCollaboratorInviter = await this.collaboratorRepositoryService.getListDataByCondition(query)

      // for(let i = 0; i < lstCustomerInviter.length; i++) {
      //   const lstCollaborator = getListCollaborator.filter((e) => e.id_inviter !== null && e.id_inviter.toString() === lstCustomerInviter[i]._id.toString())
      //     if (lstCollaborator.length > 0) {
      //       for(let j = 0; j < lstCollaborator.length; j++) {
      //       lstCollaborator[j].id_customer_inviter = lstCollaborator[j].id_inviter
      //       lstCollaborator[j].id_inviter = null

      //       await this.collaboratorRepositoryService.findByIdAndUpdate(lstCollaborator[j]._id, lstCollaborator[j])
      //     }
      //   }

      // }

      // for(let i = 0; i < lstCollaboratorInviter.length; i++) {
      //   const lstCollaborator = getListCollaborator.filter((e) => e.id_inviter !== null && e.id_inviter.toString() === lstCollaboratorInviter[i]._id.toString())
      //   if(lstCollaborator.length > 0) {
      //     for(let j = 0; j < lstCollaborator.length; j++) {
      //       lstCollaborator[j].id_collaborator_inviter = lstCollaborator[j].id_inviter
      //       lstCollaborator[j].id_inviter = null

      //       await this.collaboratorRepositoryService.findByIdAndUpdate(lstCollaborator[j]._id, lstCollaborator[j])
      //     }
      //   }

      // }

      await this.collaboratorModel.updateMany({
        $set: {
          // reward_point: 0,
          // number_of_violation: 0,
          // top1_count: 0,
          // top2_count: 0,
          // top3_count: 0,
          // last_point_updated_at: null,
          // lock_start_time: null,
          // lock_end_time: null,
          // monthly_reward_point: 0,
          // monthly_number_of_violation: 0,
          // monthly_top1_count: 0,
          // monthly_top2_count: 0,
          // monthly_top3_count: 0,
          // monthly_last_point_updated_at: null,
          is_not_received_reward: false
        }
      })

      console.log('migate CTV >>> ');
      return true;
    } catch (err) {
      throw new HttpException(
        err.response || err.toString(),
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async updateNotification() {
    try {

      // await this.notificationModel.updateMany({}, { $set: { is_delete: false } })
      await this.notificationModel.updateMany({}, { $set: { sound_guvi: NOTIFICATION_SOUND.default } })

      return true;
    } catch (err) {
      throw new HttpException(
        err.response || err.toString(),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }


  // async updateNotification() {
  //   try {
  //     // await this.notificationModel.updateMany({}, { $set: { id_customer: null, id_collaborator: null, id_order: null, id_group_order: null, id_promotion: null } })
  //     const arrNotification = await this.notificationModel.find();
  //     for (const item of arrNotification) {
  //       console.log(item._id, 'item');

  //       if (item.type_notification === 'activity' && item.id_order !== null) {
  //         const findOrder = await this.orderModel.findById(item.id_order);
  //         if (!findOrder) {
  //           await this.notificationModel.findByIdAndDelete(item._id);
  //           continue;
  //         }
  //       }
  //       if (item.type_notification === 'activity' && item.id_order !== null) {
  //         const findGroupOrder = await this.groupOrderModel.findById(
  //           item.id_group_order,
  //         );
  //         if (!findGroupOrder) {
  //           await this.notificationModel.findByIdAndDelete(item._id);
  //           continue;
  //         }
  //       }
  //       if (
  //         item.type_notification === 'promotion' &&
  //         item.id_promotion !== null
  //       ) {
  //         const findPromotion = await this.promotionModel.findById(
  //           item.id_promotion,
  //         );
  //         if (!findPromotion) {
  //           await this.notificationModel.findByIdAndDelete(item._id);
  //           continue;
  //         }
  //       }
  //     }
  //     //     const temp = await this.customerModel.findById(item.user_id)
  //     //     const temp2 = await this.collaboratorModel.findById(item.user_id)
  //     //     const temp3 = await this.orderModel.findById(item.related_id)
  //     //     const temp4 = await this.groupOrderModel.findById(item.related_id)
  //     //     const temp5 = await this.promotionModel.findById(item.related_id)
  //     //     if (temp) {
  //     //         item.id_customer = temp._id;
  //     //     }
  //     //     if (temp2) {
  //     //         item.id_collaborator = temp2._id;
  //     //     }
  //     //     if (temp3) {
  //     //         item.id_order = temp3._id;
  //     //         const getService = await this.serviceModel.findById(temp3.service["_id"])
  //     //         if (getService) {
  //     //             if (item.title.en.indexOf(getService.title.en) > -1) {
  //     //                 const tempVi = item.title.en;
  //     //                 const tempEn = item.title.vi;
  //     //                 item.title.en = tempEn;
  //     //                 item.title.vi = tempVi;
  //     //             }
  //     //         }

  //     //     }
  //     //     if (temp4) {
  //     //         item.id_group_order = temp4._id;
  //     //         // const getService = await this.serviceModel.findById(item.related_id)

  //     //     }
  //     //     if (temp5) {
  //     //         item.id_promotion = temp5._id;
  //     //     }
  //     //     if (item.id_transistion_collaborator !== null) {

  //     // }
  //     //     item.save();

  //     // }
  //     // await this.notificationModel.updateMany({
  //     //     $set: { type_schedule: null }
  //     // })
  //     // const arrNotification = await this.notificationModel.find({
  //     //     id_group_order: { $nin: null },
  //     // });
  //     // for (let i of arrNotification) {
  //     //     const getGroupOrder = await this.groupOrderModel.findById(i.id_group_order);
  //     //     // console.log('getorder =>>>> ', getGroupOrder);
  //     //     if (!getGroupOrder) {
  //     //         await this.notificationModel.findByIdAndDelete(i._id);
  //     //     } else {
  //     //         if (getGroupOrder.type !== 'schedule') {
  //     //             let length: number = getGroupOrder.id_order.length;
  //     //             i.id_order = getGroupOrder.id_order[length - 1];
  //     //             i.type_schedule = getGroupOrder.type;
  //     //             await i.save();
  //     //             console.log('>>>>>>>>>>>> ', i);
  //     //         } else {
  //     //             i.id_order = null;
  //     //             i.type_schedule = getGroupOrder.type;
  //     //             await i.save();
  //     //         }

  //     //     }
  //     // }
  //     return true;
  //   } catch (err) {
  //     throw new HttpException(
  //       err.response || err.toString(),
  //       HttpStatus.FORBIDDEN,
  //     );
  //   }
  // }

  async deleteOrderError() {
    try {
      const arrOrder = await this.orderModel.find();
      for (const item of arrOrder) {
        const findCustomer = await this.customerModel.findById(
          item.id_customer,
        );
        const findCollaborator = await this.customerModel.findById(
          item.id_customer,
        );
        if (!findCollaborator || !findCustomer) {
          const findGroupOrder = await this.groupOrderModel.findById(
            item.id_group_order,
          );
          if (findGroupOrder) {
            await this.groupOrderModel.findByIdAndDelete(findGroupOrder._id);
          }
          await this.orderModel.findByIdAndDelete(item._id);
        }
      }
      console.log('done deleteOrderError');
      return true;
    } catch (err) {
      throw new HttpException(
        err.response || err.toString(),
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async updateOrder() {
    try {
      // const iPage = {
      //   length: 100,
      //   start: 0
      // }
      // const count = await this.orderModel.count()
      // do {
      //   console.log('oke ');

      //   const getOrder = await this.orderModel.find()
      //     .sort({ date_create: -1, _id: 1 })
      //     .skip(iPage.start)
      //     .limit(iPage.length)
      //   for (let item of getOrder) {
      //     await item.save()
      //   }
      //   iPage.start += 100
      // } while (iPage.start <= count)

      // Cap nhat is_system_review = true cho cac don hang is_system_review = false nhung date_create_review = null
      // await this.orderModel.updateMany(
      //   {
      //     star: { $gt: 0 },
      //     is_system_review: false,
      //     is_delete: false,
      //     date_create_review: null
      //   },
      //   {
      //     $set: {
      //       is_system_review: true
      //     }
      //   }
      // )

      await this.orderModel.updateMany({
        $set: {
          total_fee: 0
        }
      })

      await this.orderModel.updateMany(
        {},
        [
          {
            $set: { total_fee: { $sum: ["$initial_fee", { $arrayElemAt: ["$service_fee.fee", 0] }] } }
          }
        ]
      )

      console.log('updateOrder is done');
      

      return true;
    } catch (err) {
      throw new HttpException(
        err.response || err.toString(),
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async updateGroupOrder() {
    try {
      // await this.groupOrderModel.updateMany({
      //   bonus_collaborator: null,
      // });

      // await this.groupOrderModel.updateMany({}, {$set: {"service.optional_service.type": null}});
      // const arrGroupOrder = await this.groupOrderModel.find();
      // for (let item of arrGroupOrder) {
      //     for (const optionalServie of item.service["optional_service"]) {
      //         const findOptionalService = await this.optionalServiceModel.findById(optionalServie._id);
      //         if (findOptionalService) {
      //             optionalServie["type"] = findOptionalService.type;
      //         }
      //     }
      //     console.log(item._id, 'item');

      //     item.save();
      //     // // update promotion order
      //     // if (item.type === "schedule") {
      //     //     // console.log(item._id, 'item');

      //     //     const arrOrder = await this.orderModel.find({ id_group_order: item._id });
      //     //     for (const order of arrOrder) {
      //     //         if (order.code_promotion && order.code_promotion["discount"]) {
      //     //             order.code_promotion["discount"] = Math.floor(item.code_promotion["discount"] / arrOrder.length);
      //     //         }

      //     //         for (let y = 0; y < order.event_promotion.length; y++) {
      //     //             order.event_promotion[y]["discount"] = Math.floor(item.event_promotion[y]["discount"] / arrOrder.length)
      //     //         }
      //     //         console.log(order._id, 'order');

      //     //         await order.save();
      //     //     }
      //     //     // console.log(item._id, 'item');
      //     //     // console.log(item.id_cancel_user_system, 'id_cancel_user_system');
      //     //     await item.save();

      //     // }

      //     // await item.save();
      // }

      // check order
      // for (const item of arrGroupOrder) {
      //     if (item.type = "loop") {
      //         for (let i = 0; i < item.id_order.length; i++) {
      //             const checkOrder = await this.orderModel.findById(item.id_order[i]);
      //             if (!checkOrder) {
      //                 console.log(item._id, "item");

      //                 await this.groupOrderModel.findOneAndDelete({ _id: item._id })
      //                 continue;
      //             }
      //         }
      //     }
      // }

      // for (let groupOrder of getGroupOrder) {
      //     const getOrder = await this.orderModel.findOne({ id_group_order: groupOrder._id });
      //     if (getOrder.id_cancel_collaborator.length > 0) {
      //         console.log('aaaaaaaaaaaaaaaaaaa');
      //         for (let item of getOrder.id_cancel_collaborator) {
      //             groupOrder.id_cancel_collaborator.push(item)
      //         }
      //         await groupOrder.save()

      //         console.log('=>>> ', groupOrder.id_cancel_collaborator, ' id group order ==>> ', groupOrder._id);

      //     }
      // }
      // const getArr = await this.groupOrderModel.find({type: "schedule"});
      // for(const item of getArr) {
      //     let arrMonth = []
      //     for(const dateWork of item.date_work_schedule) {
      //         const getMonth = new Date(dateWork.date).getMonth();
      //         arrMonth.push(getMonth)
      //     }
      //     arrMonth = [...new Set(arrMonth)];
      //     arrMonth.sort();
      //     let timeSchedule = Math.abs(Number(arrMonth[0]) - Number (arrMonth[arrMonth.length - 1]));
      //     timeSchedule = (item.time_schedule !== null ) ? item.time_schedule : (timeSchedule === 0) ? 1 : timeSchedule;
      //     // item.time_schedule = Math.abs(timeSchedule);
      //     await this.groupOrderModel.findByIdAndUpdate(item._id, {$set: {"service.time_schedule": timeSchedule}})
      //     const findOrder = await this.orderModel.find({id_group_order: item._id});
      //     for(const itemOrder of findOrder) {
      //         await this.orderModel.findByIdAndUpdate(itemOrder._id, {$set: {"service.time_schedule": timeSchedule}})
      //     }
      //     console.log(item._id, 'item._id');
      // }
      // for (let item of getArr) {
      //     const getCustomer = await this.customerModel.findById(item.id_customer);
      //     item.name_customer = getCustomer.full_name;
      //     item.phone_customer = getCustomer.phone;
      //     if (item.id_collaborator !== null) {
      //         const getCollaborator = await this.collaboratorModel.findById(item.id_collaborator);
      //         item.name_collaborator = getCollaborator.full_name;
      //         item.phone_collaborator = getCollaborator.phone;
      //     }
      //     await item.save();
      // }
      // await this.groupOrderModel.updateMany(
      //     {
      //         $set: {
      //             name_customer: null,
      //             name_collaborator: null,
      //             phone_collaborator: null,
      //             phone_customer: null
      //         }
      //     }
      // )

      // await this.groupOrderModel.updateMany(
      //         {
      //             $set: {
      //                 id_block_collaborator: [],
      //                 id_favourite_collaborator: [],
      //             }
      //         }
      //     )
      console.log('?? >> .> > >   ');

      // const getGroupOrder = await this.groupOrderModel.find();

      // for (let groupOrder of getGroupOrder) {
      //     let arrId: any = [];
      //     const getArrOrder = await this.orderModel.find({ id_group_order: groupOrder._id });
      //     for (let order of getArrOrder) {
      //         const item = order._id;
      //         arrId.push(item);
      //     }
      //     groupOrder.id_order = arrId;
      //     await groupOrder.save();
      // }

      // await this.groupOrderModel.updateMany({ id_cancel_user_system: null });
      // await this.groupOrderModel.updateMany({ temp_final_fee: { $exists: false } }, {
      //     temp_final_fee: 0,
      //     temp_initial_fee: 0,
      //     temp_net_income_collaborator: 0,
      //     temp_pending_money: 0,
      //     temp_refund_money: 0
      // })
      // const arrItem = await this.groupOrderModel.find();
      // for (const item of arrItem) {
      //     let temp_final_fee = 0;
      //     let temp_initial_fee = 0;
      //     let temp_net_income_collaborator = 0;
      //     let temp_pending_money = 0;
      //     let temp_refund_money = 0;
      //     let temp_platform_fee = 0;

      //     if (item.type === "schedule") {
      //         const orderConfirmOrPending = await this.orderModel.find({
      //             $and: [
      //                 {
      //                     $or: [
      //                         { status: "confirm" },
      //                         { status: "pending" }
      //                     ]
      //                 },
      //                 { id_group_order: item._id }
      //             ]
      //         });
      //         for (const order of orderConfirmOrPending) {
      //             temp_final_fee += order.final_fee;
      //             temp_initial_fee += order.initial_fee;;
      //             temp_net_income_collaborator += order.net_income_collaborator;
      //             temp_pending_money += order.pending_money;
      //             temp_refund_money += order.refund_money;
      //             temp_platform_fee += order.platform_fee;
      //         }
      //         item.temp_final_fee = temp_final_fee;
      //         item.temp_initial_fee = temp_initial_fee;
      //         item.temp_net_income_collaborator = temp_net_income_collaborator;
      //         item.temp_pending_money = temp_pending_money;
      //         item.temp_refund_money = temp_refund_money;
      //         item.temp_platform_fee = temp_platform_fee;
      //     }
      //     await item.save();
      // const countarrTotalOrder = await this.orderModel.count({id_group_order: item._id});
      // const temp = findOrder.net_income_collaborator * (countarrTotalOrder - countOrderDone);
      // await this.groupOrderModel.findByIdAndUpdate(item._id, {$set: {net_income_collaborator: temp}})
      // }
      // await this.orderModel.updateMany({
      //     $set: {
      //         id_view: null,
      //         ordinal_number: 0,
      //     }
      // })
      // await this.groupOrderModel.updateMany({
      //     $set: {
      //         id_view: null,
      //         ordinal_number: 0,
      //     }
      // });
      // const getGroupOrder = await this.groupOrderModel.find();
      // let tempOrdinalNumber = 1;

      // for (let item of getGroupOrder) {
      //     const temp = item.address.split(",");
      //     const administrative = {
      //         city: temp[temp.length - 1],
      //         district: temp[temp.length - 2]
      //     }
      //     const callPromiseAll = await Promise.all([
      //         this.generalHandleService.getCodeAdministrativeToString(administrative),
      //         this.serviceModel.findById(item.service["_id"])
      //     ]);
      //     const city: number = callPromiseAll[0].city;
      //     const district: number = callPromiseAll[0].district;
      //     item.city = city;
      //     item.district = district;
      //     item.ordinal_number = tempOrdinalNumber;
      //     let currentYear: string = new Date().getUTCFullYear().toString();
      //     let tempIdView: string = '0000000';
      //     tempIdView = `${tempIdView}${tempOrdinalNumber}`
      //     tempIdView = tempIdView.slice(-7);
      //     item.id_view = `#${currentYear.slice(-2)}${city}${tempIdView}`
      //     tempOrdinalNumber += 1;
      //     await item.save();
      //     ////// cập nhật order dựa theo group order /////

      //     const getOrder = await this.orderModel.find({
      //         id_group_order: item._id
      //     })
      //     for (let i = 0; i < getOrder.length; i++) {
      //         console.log('>>>> aaaaaaaaaaaaa');

      //         let tempIdViewOrder: string = `000${i + 1}`;
      //         getOrder[i].id_view = `${item.id_view}.${tempIdViewOrder.slice(-3)}`;
      //         getOrder[i].ordinal_number = i + 1;
      //         await getOrder[i].save();
      //     }
      // }

      // Cap nhat group order type schedule
      // const id_group_order = '6737feb222d91d4d27d2e99d'
      // const groupOrder = await this.groupOrderModel.findOne({ _id: id_group_order })

      // const arrayDate = groupOrder.date_work_schedule

      // arrayDate.sort((a, b) => new Date(a.date).getTime() > new Date(b.date).getTime() ? 1 : -1)

      // await this.groupOrderModel.updateOne({ _id: id_group_order }, { $set: { date_work_schedule: arrayDate } })

      // const lstOrder = await this.orderModel.find({ id_group_order: id_group_order }, {}, { sort: { date_work: 1 } })
      // // console.log(lstOrder);
      // for (let i = 0; i < lstOrder.length; i++) {
      //   let ordinal_number = i + 1
      //   let id_view = `#24740012735.0${i >= 9 ? `${i + 1}` : `0${i + 1}`}`

      //   await this.orderModel.updateOne({ _id: lstOrder[i]._id }, { $set: { ordinal_number: ordinal_number, id_view: id_view } })
      // }

      /** Cap nhat truong moi */
      // const arrGroupOrder = await this.groupOrderModel.find()
      // console.log('arrGroupOrder', arrGroupOrder.length)
      // const lstTask:any = []
      // for(let i = 0; i < arrGroupOrder.length; i++) {
      //   arrGroupOrder[i].transaction_execution_date = arrGroupOrder[i].date_create

      //   arrGroupOrder[i].save()
      // }
      
      // await Promise.all(lstTask)

      // const getGroupOrder = await this.groupOrderModel.findById(new ObjectId('676f6972220af59ca6f75c98'))
      // const getOrder = await this.orderModel.findById(new ObjectId('676f6972220af59ca6f75cb2'))

      // getGroupOrder.info_linked_collaborator = getOrder.info_linked_collaborator
      // getGroupOrder.index_search_collaborator = getOrder.index_search_collaborator

      // await getGroupOrder.save()
      await this.groupOrderModel.updateMany({
        $set: {
          is_check_duplicate: false
        }
      })

      console.log('migrate group order')

      return true;
    } catch (err) {
      throw new HttpException(
        err.response || err.toString(),
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async updateHistoryActivity() {
    try {


      // let iPage = {
      //   length: 10000,
      //   start: 0
      // }
      // let lengthData = 10000;
      // do {

      //   const arrHistory = await this.historyActivityModel.find()
      //     .populate({ path: 'id_order', select: { _id: 1, id_view: 1 } })
      //     .populate({ path: 'id_customer', select: { _id: 1, full_name: 1 } })
      //     .populate({ path: 'id_collaborator', select: { _id: 1, full_name: 1 } })
      //     .populate({ path: 'id_admin_action', select: { _id: 1, full_name: 1 } })

      //     .sort({ date_create: -1 })
      //     .skip(iPage.start)
      //     .limit(iPage.length)

      //   for (const item of arrHistory) {
      //     if (item.id_order !== null) {
      //       item.title_admin = item.title_admin.replace(item.id_order['_id'].toString(), item.id_order['id_view'])
      //     }
      //     if (item.id_customer !== null) {
      //       item.title_admin = item.title_admin.replace(item.id_customer['_id'].toString(), item.id_customer['full_name'])
      //     }
      //     if (item.id_collaborator !== null) {
      //       item.title_admin = item.title_admin.replace(item.id_collaborator['_id'].toString(), item.id_collaborator['full_name'])
      //     }
      //     if (item.id_admin_action !== null) {
      //       item.title_admin = item.title_admin.replace(item.id_admin_action['_id'].toString(), item.id_admin_action['full_name'])
      //     }

      //     item.save();
      //     console.log(item.title_admin, 'item.title_admin');

      //   }

      //   iPage.start += iPage.length;
      //   console.log('-----------------------');
      //   console.log(iPage.start, 'iPage.start');
      //   console.log('-----------------------');
      //   lengthData = arrHistory.length
      // } while (lengthData === iPage.length)

      // const punishTickets = await this.punishTicketRepositoryService.getListDataByCondition({});
      // for (let item of punishTickets) {
      //   console.log('item ', item);
      //   const collaborator = await this.collaboratorModel.findById(item.id_collaborator);
      //   // -------------------------------- xử lý phần log lịch sử tạo punish ticket ------------------------------ //
      //   const query = {
      //     $and: [
      //       { type: 'create_punish_ticket' },
      //       {
      //         $or: [
      //           { id_punish_ticket: item._id },
      //           { id_transaction: item._id },
      //         ]
      //       },
      //     ]
      //   }
      //   const historyCreate = await this.historyActivityRepositoryService.findOne(query);
      //   const message = {
      //     en: `Create punish ticket ${item.id_view} success`,
      //     vi: `Tạo vé phạt ${item.id_view} thành công`,
      //   }
      //   const temp = `Vé phạt ${item.id_view} của ${collaborator.id_view} đã được tạo thành công`;
      //   if (historyCreate) {
      //     historyCreate.id_punish_ticket = item._id;
      //     historyCreate.id_transaction = item.id_transaction;
      //     historyCreate.title.en = message.en;
      //     historyCreate.title.vi = message.vi;
      //     historyCreate.body.en = message.en;
      //     historyCreate.body.vi = message.vi;
      //     historyCreate.title_admin = temp;
      //     historyCreate.date_create = item.date_create;
      //     await this.historyActivityRepositoryService.findByIdAndUpdate(historyCreate._id, historyCreate);
      //     console.log(' update history');
      //   } else {
      //     const payload = {
      //       id_transaction: item.id_transaction,
      //       id_punish_ticket: item._id,
      //       id_customer: item.id_customer,
      //       id_collaborator: item.id_collaborator,
      //       title: message,
      //       body: message,
      //       title_admin: temp,
      //       value: item.punish_money,
      //       type: 'create_punish_ticket',
      //       date_create: item.date_create
      //     }
      //     await this.historyActivityRepositoryService.create(payload);
      //     console.log(' create history');
      //   }
      //   // -------------------------------- kết thúc xử lý phần log lịch sử tạo punish ticket ------------------------------ //

      //   // -------------------------------- xử lý các hành động sau khi create: cancel or verify -> revoke punish ticket ------------------------------ //
      //   if (item.status === 'cancel') {
      //     const queryCancel = {
      //       $and: [
      //         { type: 'admin_cancel_punish_ticket' },
      //         { id_punish_ticket: item._id, }
      //       ]
      //     }
      //     const getHistoryCancel = await this.historyActivityRepositoryService.findOne(queryCancel);
      //     if (!getHistoryCancel) continue;
      //     const messageCancel = {
      //       vi: `Hủy vé phạt ${item.id_view} thành công`,
      //       en: `Cancelled punish ticket ${item.id_view} successfully`
      //     }
      //     getHistoryCancel.title.vi = messageCancel.vi;
      //     getHistoryCancel.title.en = messageCancel.en;
      //     getHistoryCancel.body.en = messageCancel.en;
      //     getHistoryCancel.body.vi = messageCancel.vi;
      //     getHistoryCancel.title_admin = `Hủy vé phạt ${item.id_view} thành công`;
      //     getHistoryCancel.type = 'cancel_punish_ticket';
      //     await this.historyActivityRepositoryService.findByIdAndUpdate(getHistoryCancel._id, getHistoryCancel);
      //   } else {
      //     // -------------------------------- xử lý phần log lịch sử duyệt lệnh phạt ------------------------------ //
      //     const query2 = {
      //       $and: [
      //         { type: 'verify_punish_ticket' },
      //         {
      //           $or: [
      //             { id_punish_ticket: item._id },
      //             { id_transaction: item._id },
      //           ]
      //         },
      //       ]
      //     }
      //     const historyVerify = await this.historyActivityRepositoryService.findOne(query2);
      //     const title = {
      //       en: `Verify punish ticket ${item.id_view} successfully`,
      //       vi: `Duyệt vé phạt ${item.id_view} thành công`,
      //     };
      //     const title_admin = `Duyệt vé phạt ${item.id_view} thành công`;
      //     if (historyVerify) {
      //       historyCreate.id_punish_ticket = item._id;
      //       historyCreate.id_transaction = item.id_transaction;
      //       historyCreate.title.vi = title.vi;
      //       historyCreate.title.en = title.en;
      //       historyCreate.body.vi = title.vi;
      //       historyCreate.body.en = title.en;
      //       historyCreate.title_admin = title_admin;
      //       historyCreate.date_create = item.date_create;
      //       await this.historyActivityRepositoryService.findByIdAndUpdate(historyCreate._id, historyCreate);
      //       console.log(' update history verify');
      //     } else {
      //       const payload = {
      //         id_admin_action: item.id_admin_verify,
      //         id_collaborator: item.id_collaborator,
      //         id_customer: item.id_customer,
      //         id_punish_ticket: item._id,
      //         id_transaction: item.id_transaction,
      //         id_order: item.id_order,
      //         title: title,
      //         body: title,
      //         title_admin: title_admin,
      //         type: 'verify_punish_ticket',
      //         date_create: item.time_end,
      //       }
      //       await this.historyActivityRepositoryService.create(payload)
      //       console.log(' create history verify');
      //     }
      //     // -------------------------------- kết thúc xử lý phần log lịch sử duyệt lệnh phạt ------------------------------ //
      //     // -------------------------------- xử lý phần log lịch sử thu hồi lệnh phạt ------------------------------ //
      //     if (item.status === 'revoke') {
      //       const queryRevoke = {
      //         $and: [
      //           { type: 'admin_revoke_punish_ticket' },
      //           { id_punish_ticket: item._id, }
      //         ]
      //       }
      //       const messageRevoke = {
      //         vi: `Thu hồi vé phạt ${item.id_view} thành công`,
      //         en: `Revoked punish ticket ${item.id_view} successfully`
      //       }
      //       const getHistoryRevoke = await this.historyActivityRepositoryService.findOne(queryRevoke);
      //       if (getHistoryRevoke) {
      //         getHistoryRevoke.title.vi = messageRevoke.vi;
      //         getHistoryRevoke.title.en = messageRevoke.en;
      //         getHistoryRevoke.body.vi = messageRevoke.vi;
      //         getHistoryRevoke.body.en = messageRevoke.en;
      //         getHistoryRevoke.title_admin = `Thu hồi vé phạt ${item.id_view} thành công`;
      //         getHistoryRevoke.type = 'revoke_punish_ticket';
      //         await this.historyActivityRepositoryService.findByIdAndUpdate(getHistoryRevoke._id, getHistoryRevoke);
      //         console.log('thu hoi');
      //       }

      //     }


      //     // -------------------------------- xử lý phần log lịch sử thu hồi lệnh phạt ------------------------------ //
      //   }
      //   // ======================================== xử lý phần transaction ============================================== //
      // }

      // await this.historyActivityModel.updateMany(
      //   { type: "system_add_pay_point" },
      //   [ { $set: { id_customer: "$id_inviter" } } ]
      // )

      // Cap nhat type nhan tien khi gioi thieu thanh cong

      // await this.historyActivityModel.updateMany(
      //   { type: "system_add_pay_point", id_customer: { $in: [new Types.ObjectId('65dbf1585d07673614317590'), new Types.ObjectId('6524ffd9c3c0fbe25cc2f941')]} },
      //   [ { $set: { id_collaborator: "$id_inviter", id_customer: null, id_inviter: null } } ]
      // )

      // await this.historyActivityModel.updateMany(
      //   { type: "system_add_pay_point" },
      //   [ { $set: { id_inviter: null, type: "system_give_pay_point_customer" } } ]
      // )

      // const getListHistoryActivites = await this.historyActivityModel.find({ type: 'collaborator_receive_refund_money', value: 0 })
      // const lstIdOrder = getListHistoryActivites.map((e) => e.id_order)
      // const getListOrder = await this.orderModel.find({_id: {$in: lstIdOrder}})

      // for(let i = 0; i < getListHistoryActivites.length; i++) {
      //   const order = getListOrder.find((e) => e._id.toString() === getListHistoryActivites[i].id_order.toString())
      //   let refundMoney = 0
      //   if(order) {
      //     if (order.subtotal_fee !== order.initial_fee) {
      //       refundMoney = order.net_income; // doi tac nhan so tien thuc nhan cua ca, thay vi nhan so tien chenh lech
      //     } else {
      //       // Giu lai cach tinh gia cu
      //       if (order.payment_method === PAYMENT_METHOD.cash) {
      //           refundMoney = order.refund_money
      //       } else {
      //           refundMoney = order.final_fee + order.refund_money
      //       }
      //     }

      //     getListHistoryActivites[i].value = refundMoney

      //     await getListHistoryActivites[i].save()
      //   }
      // }

      // await this.historyActivityModel.updateMany({ type: 'system_receive_discount' }, {$set:{ id_customer_referrer: '$id_customer' }})
      await this.historyActivityModel.updateMany({
        $set: {
          current_reward_point: 0,
          status_current_reward_point: "none",
          id_reward_ticket: null,
          current_monthly_reward_point: 0,
          status_current_monthly_reward_point: "none",
        }
      })
      console.log('migrate history activity') 

      return true
    } catch (err) {
      throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
    }
  }

  async updateOptionalService() {
    try {
      // await this.optionalServiceModel.updateMany({}, {$set: {platform_fee: 0}})
      // const arrItem = await this.optionalServiceModel.find();
      // for (const item of arrItem) {
      //   // if (item.title.vi === 'Thời lượng') {
      //   //   item.platform_fee = 30;
      //   //   item.save();
      //   // }
      //   await item.save();
      // }

      const getOptionalService = await this.optionalServiceModel.findOne({ _id: new Types.ObjectId('644c7d4339e0ee341ded334a') })

      // Tao dien tich
      this.optionalServiceModel.create({
        title: {
          vi: 'Ước tính',
          en: 'Estimated'
        },
        thumbnail: getOptionalService.thumbnail,
        type: getOptionalService.type,
        description: {
          vi: 'Ước tính số thời gian và số người làm việc',
          en: 'Estimate the amount of time and number of people working'
        },
        id_service: "673fed227b8382b9840d6219",
        is_active: true,
        screen: 1,
        position: 1,
        platform_fee: 28,
        price_option_holiday: getOptionalService.price_option_holiday,
        price_option_rush_hour: getOptionalService.price_option_rush_hour,
        price_option_rush_day: getOptionalService.price_option_rush_day,
        is_main_optional: true
      })

      return true;
    } catch (err) {
      throw new HttpException(
        err.response || err.toString(),
        HttpStatus.FORBIDDEN,
      );
    }
  }

  // async updateHistory() {
  //     try {
  //         // await this.optionalServiceModel.updateMany({}, {$set: {platform_fee: 0}})
  //         const arrItem = await this.optionalServiceModel.find();
  //         for (const item of arrItem) {
  //             if(item.title.vi === "Thời lượng") {
  //                 item.platform_fee = 30;
  //                 item.save();
  //             }
  //         }
  //         return true;
  //     } catch (err) {
  //         throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
  //     }
  // }

  async deleteAll() {
    try {
      const dateNow = new Date(Date.now()).toISOString();
      const arrCustomer = await this.customerModel.find({
        date_create: { $lt: '2022-12-14T07:00:00.000Z' },
      });
      if (arrCustomer.length > 0) {
        for (const item of arrCustomer) {
          await this.groupOrderModel.deleteMany({ id_customer: item._id });
          await this.orderModel.deleteMany({ id_customer: item._id });
          await this.notificationModel.deleteMany({ id_customer: item._id });
          await this.transitionCustomerModel.deleteMany({
            id_customer: item._id,
          });
          item.delete();
        }
      }
      return true;
    } catch (err) {
      throw new HttpException(
        err.response || err.toString(),
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async updateFeedback() {
    // const findFeedback = await this.feedBackModel.find();
    // for (const item of findFeedback) {
    //     await this.feedBackModel.findOneAndUpdate({ _id: item._id }, { $set: { full_name: item.name } })
    // }
    try {
      // await this.feedBackModel.updateMany({
      //     $set: {
      //         status: 'pending'
      //     }
      // })
      await this.feedBackModel.updateMany({
        $set: {
          id_admin_action: null,
          date_processed: null,
        },
      });
    } catch (err) {
      throw new HttpException(
        err.response || err.toString(),
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async seedGroupCustomer() {
    const findGroupCustomer = await this.groupCustomerModel.find();
    if (findGroupCustomer.length < 1) {
      for (const item of GROUP_CUSTOMER) {
        const newGroupCustomer = new this.groupCustomerModel({
          name: item.name,
          description: item.description,
          date_create: new Date(Date.now()).toISOString(),
          condition_in: item.condition_in,
          condition_out: item.condition_out,
        });
        await newGroupCustomer.save();
      }
    }
  }

  async updatePriceOptionalService() {
    try {
      await this.optionalServiceModel.updateMany(
        {},
        {
          $set: {
            price_option_holiday: [],
            price_option_rush_hour: [],
            price_option_rush_day: [],
          },
        },
      );
      const holiday = [
        {
          time_start: '2023-06-04T17:00:00.000Z',
          time_end: '2023-06-05T16:59:59.999Z',
          type_increase: 'percent_accumulate',
          value: 25,
        },
        {
          time_start: '2023-04-29T17:00:00.000Z',
          time_end: '2023-04-30T16:59:59.999Z',
          type_increase: 'percent_accumulate',
          value: 25,
        },
        {
          time_start: '2023-04-30T17:00:00.000Z',
          time_end: '2023-05-01T16:59:59.999Z',
          type_increase: 'percent_accumulate',
          value: 25,
        },
        {
          time_start: '2023-05-01T17:00:00.000Z',
          time_end: '2023-05-02T16:59:59.999Z',
          type_increase: 'percent_accumulate',
          value: 25,
        },
      ];
      const rush_hour = [
        {
          time_start: '10:00:00.000Z',
          time_end: '16:59:59.999Z',
          type_increase: 'percent_accumulate',
          value: 15,
        },
        {
          time_start: '00:00:00.000Z',
          time_end: '00:30:00.000Z',
          type_increase: 'percent_accumulate',
          value: 15,
        },
      ];
      const rush_day = [
        {
          rush_day: [6, 0],
          type_increase: 'percent_accumulate',
          value: 10,
        },
      ];

      const arrItem = await this.optionalServiceModel.find({
        type: 'select_horizontal_no_thumbnail',
      });
      for (const item of arrItem) {
        item.price_option_holiday = holiday;
        item.price_option_rush_hour = rush_hour;
        item.price_option_rush_day = rush_day;
        await item.save();
      }

      return true;
    } catch (err) {
      throw new HttpException(
        err.response || err.toString(),
        HttpStatus.FORBIDDEN,
      );
    }
  }

  // theo gio, co dinh
  // async updateHolidayPriceExtendOptional() {
  //   try {

  //     const arrHoliday = [
  //       {
  //         start_day: "1/9/2024",
  //         end_day: "1/9/2024",
  //         price_up: 6
  //       },
  //       {
  //         start_day: "2/9/2024",
  //         end_day: "2/9/2024",
  //         price_up: 30
  //       },
  //       {
  //         start_day: "3/9/2024",
  //         end_day: "3/9/2024",
  //         price_up: 20
  //       },
  //       {
  //         start_day: "1/1/2025",
  //         end_day: "1/1/2025",
  //         price_up: 20
  //       },
  //       {
  //         start_day: "20/1/2025",
  //         end_day: "22/1/2025",
  //         price_up: 20
  //       },
  //       {
  //         start_day: "23/1/2025",
  //         end_day: "25/1/2025",
  //         price_up: 30
  //       },
  //       {
  //         start_day: "26/1/2025",
  //         end_day: "27/1/2025",
  //         price_up: 50
  //       },
  //       {
  //         start_day: "28/1/2025",
  //         end_day: "31/1/2025",
  //         price_up: 100
  //       },
  //       {
  //         start_day: "1/2/2025",
  //         end_day: "3/2/2025",
  //         price_up: 50
  //       },
  //       {
  //         start_day: "4/2/2025",
  //         end_day: "7/2/2025",
  //         price_up: 10
  //       }
  //     ]

  //     const optionalServiceApply = ["637487ad7ae89c47997ee131", "63204b79e59ef92c13e57fd0"];

  //     const arrDate = []
  //     for (const item of arrHoliday) {
  //       console.log(item, 'item');

  //       const tempStartDay = item.start_day.split("/")
  //       const tempEndDay = item.end_day.split("/")
  //       const startDay = new Date(`${tempStartDay[1]}/${tempStartDay[0]}/${tempStartDay[2]}`);
  //       const endDay = new Date(`${tempEndDay[1]}/${tempEndDay[0]}/${tempEndDay[2]}`);
  //       if (startDay.getTime() === endDay.getTime()) {
  //         const payload = {
  //           time_start: new Date(new Date(startDay).getTime()).toISOString(),
  //           time_end: new Date(endDay.getTime() + ((24 * 60 * 60 * 1000) - 1)).toISOString(),
  //           price_type_increase: "percent_accumulate",
  //           price: item.price_up
  //         }
  //         arrDate.push(payload)
  //       } else {
  //         const diffTime = Math.abs(endDay.getTime() - startDay.getTime());
  //         const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  //         for (let i = 0; i <= diffDays; i++) {
  //           const tempStartDay = new Date(startDay).getTime() + i * 24 * 60 * 60 * 1000;
  //           const tempEndDay = (new Date(startDay).getTime() + (i + 1) * 24 * 60 * 60 * 1000) - 1
  //           const payload = {
  //             time_start: new Date(tempStartDay).toISOString(),
  //             time_end: new Date(tempEndDay).toISOString(),
  //             price_type_increase: "percent_accumulate",
  //             price: item.price_up
  //           }
  //           arrDate.push(payload)
  //         }
  //       }
  //     }
  //     console.log(arrDate, 'arrDate');

  //     // ap dung cho dich vu
  //     const queryExtend = {
  //       $and: [
  //         { id_optional_service: { $in: optionalServiceApply } }
  //       ]
  //     }

  //     const dataExtend = await this.extendOptionalModel.find(queryExtend);
  //     console.log(dataExtend.length, 'dataExtend');

  //     for (const item of dataExtend) {
  //       for (let i = 0; i < item.area_fee.length; i++) {
  //         item.area_fee[i].price_option_holiday = arrDate
  //       }
  //       item.save();
  //     }



  //     return true;
  //   } catch (err) {
  //     throw new HttpException(
  //       err.response || err.toString(),
  //       HttpStatus.FORBIDDEN,
  //     );
  //   }
  // }

  // cac dich vu con lai
  async updateHolidayPriceExtendOptional() {
    try {

      const arrHoliday = [
        {
          start_day: "1/9/2024",
          end_day: "1/9/2024",
          price_up: 15
        },
        {
          start_day: "2/9/2024",
          end_day: "2/9/2024",
          price_up: 15
        },
        {
          start_day: "3/9/2024",
          end_day: "3/9/2024",
          price_up: 15
        },
        {
          start_day: "1/1/2025",
          end_day: "1/1/2025",
          price_up: 15
        },
        {
          start_day: "20/1/2025",
          end_day: "22/1/2025",
          price_up: 15
        },
        {
          start_day: "23/1/2025",
          end_day: "25/1/2025",
          price_up: 15
        },
        {
          start_day: "26/1/2025",
          end_day: "27/1/2025",
          price_up: 15
        },
        {
          start_day: "28/1/2025",
          end_day: "31/1/2025",
          price_up: 15
        },
        {
          start_day: "1/2/2025",
          end_day: "3/2/2025",
          price_up: 15
        },
        {
          start_day: "4/2/2025",
          end_day: "7/2/2025",
          price_up: 15
        }
      ]

      const optionalServiceApply = ["654ddb5b8b3f1a21b709bc03", "654ddb858b3f1a21b709d100", "654ddba48b3f1a21b70a10c7", "654ddbb28b3f1a21b70a1129", "64be25d9177d3dd356d6fb9b"];

      const payloadNewArea = [
        {
          "is_active": true,
          "area_lv_1": 79,
          "platform_fee": "$platform_fee",
          "price_type_increase": "amount",
          "price": "$price",
          "price_option_rush_day": [],
          "price_option_holiday": [],
          "area_lv_2": [],
        },
        {
          "is_active": true,
          "area_lv_1": 74,
          "platform_fee": "$platform_fee",
          "price_type_increase": "amount",
          "price": "$price",
          "price_option_rush_day": [],
          "price_option_holiday": [],
          "area_lv_2": [],
        },
        {
          "is_active": true,
          "area_lv_1": 1,
          "platform_fee": "$platform_fee",
          "price_type_increase": "amount",
          "price": "$price",
          "price_option_rush_day": [],
          "price_option_holiday": [],
          "area_lv_2": [],
        },
        {
          "is_active": true,
          "area_lv_1": 48,
          "platform_fee": "$platform_fee",
          "price_type_increase": "amount",
          "price": "$price",
          "price_option_rush_day": [],
          "price_option_holiday": [],
          "area_lv_2": [],
        },
      ]

      const newField = [
        {
          $set: {
            area_fee: payloadNewArea
          }
        }
      ]


      await this.extendOptionalModel.updateMany({ id_optional_service: optionalServiceApply }, newField)




      const arrDate = []
      for (const item of arrHoliday) {

        const tempStartDay = item.start_day.split("/")
        const tempEndDay = item.end_day.split("/")
        const startDay = new Date(`${tempStartDay[1]}/${tempStartDay[0]}/${tempStartDay[2]}`);
        const endDay = new Date(`${tempEndDay[1]}/${tempEndDay[0]}/${tempEndDay[2]}`);
        if (startDay.getTime() === endDay.getTime()) {
          const payload = {
            time_start: new Date(new Date(startDay).getTime()).toISOString(),
            time_end: new Date(endDay.getTime() + ((24 * 60 * 60 * 1000) - 1)).toISOString(),
            price_type_increase: "percent_accumulate",
            price: item.price_up
          }
          arrDate.push(payload)
        } else {
          const diffTime = Math.abs(endDay.getTime() - startDay.getTime());
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          for (let i = 0; i <= diffDays; i++) {
            const tempStartDay = new Date(startDay).getTime() + i * 24 * 60 * 60 * 1000;
            const tempEndDay = (new Date(startDay).getTime() + (i + 1) * 24 * 60 * 60 * 1000) - 1
            const payload = {
              time_start: new Date(tempStartDay).toISOString(),
              time_end: new Date(tempEndDay).toISOString(),
              price_type_increase: "percent_accumulate",
              price: item.price_up
            }
            arrDate.push(payload)
          }
        }
      }

      // ap dung cho dich vu
      const queryExtend = {
        $and: [
          { id_optional_service: { $in: optionalServiceApply } }
        ]
      }

      const dataExtend = await this.extendOptionalModel.find(queryExtend);
      console.log(dataExtend.length, 'dataExtend');

      for (const item of dataExtend) {
        for (let i = 0; i < item.area_fee.length; i++) {
          item.area_fee[i].price_option_holiday = arrDate
        }
        item.save();
      }



      return true;
    } catch (err) {
      throw new HttpException(
        err.response || err.toString(),
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async updatePriceExtendOptional() {
    try {




      const Hour2 = [
        {
          setor: ["Quận 1", "Quận 3", "Quận 4", "Quận 5", "Quận 6", "Quận 8", "Quận 10", "Quận 11", "Quận 12", "Quận Gò Vấp", "Quận Phú Nhuận", "Quận Tân Bình", "Quận Tân Phú",
            "Quận Bình Tân", "Nhà Bè", "Hóc Môn", "Bình Chánh", "Củ Chi", "Cần Giờ"],
          price: 192000
        },
        {
          setor: ["Quận 2", "Quận 7", "Quận 9", "Quận Bình Thạnh", "Quận Thủ Đức"],
          price: 216000
        }
      ]

      const Hour3 = [
        {
          setor: ["Quận 1", "Quận 3", "Quận 5", "Quận 10", "Quận Phú Nhuận"],
          price: 258000
        },
        {
          setor: ["Quận 2", "Quận Bình Thạnh", "Quận Thủ Đức"],
          price: 279000
        },
        {
          setor: ["Quận 4", "Quận 6", "Quận 8", "Quận 9", "Quận 11", "Quận 12", "Quận Gò Vấp", "Quận Tân Bình", "Quận Tân Phú", "Quận Bình Tân"],
          price: 249000
        },
        {
          setor: ["Quận 7"],
          price: 270000
        },
        {
          setor: ["Nhà Bè", "Hóc Môn", "Bình Chánh", "Củ Chi", "Cần Giờ"],
          price: 252000
        }
      ]

      const Hour4 = [
        {
          setor: ["Quận 1", "Quận 3", "Quận 5", "Quận 10", "Quận Phú Nhuận"],
          price: 320000
        },
        {
          setor: ["Quận 2", "Quận 9", "Quận Bình Thạnh", "Quận Thủ Đức"],
          price: 344000
        },
        {
          setor: ["Quận 4", "Quận 6", "Quận 8", "Quận 11", "Quận 12", "Quận Gò Vấp", "Quận Tân Bình", "Quận Tân Phú", "Quận Bình Tân"],
          price: 312000
        },
        {
          setor: ["Quận 7"],
          price: 336000
        },
        {
          setor: ["Nhà Bè", "Hóc Môn", "Bình Chánh", "Củ Chi", "Cần Giờ"],
          price: 316000
        }
      ]


      const arr = [
        {
          estimate: 2,
          data: Hour2,
        },
        {
          estimate: 3,
          data: Hour3,
        },
        {
          estimate: 4,
          data: Hour4,
        }
      ]


      for (let i = 0; i < Hour2.length; i++) {
        let payload = [];
        for (const itemDistrict of Hour2[i].setor) {
          let tempCodeDistrict = -1
          const temp = await this.generalHandleService.removeWhiteSpace("Hồ Chí Minh")
          const temp2 = await this.generalHandleService.removeAdministrative(temp);
          const temp3 = await this.generalHandleService.cleanAccents(temp2);
          let code = -1;
          for (const item of AministrativeDivision) {
            if (item.value_compare && item.value_compare.indexOf(temp3) > -1) {
              code = item.code;
              tempCodeDistrict = item.code;
              const temp4 = await this.generalHandleService.removeWhiteSpace(itemDistrict);
              const temp5 = await this.generalHandleService.removeAdministrative(temp4);
              const temp6 = await this.generalHandleService.cleanAccents(temp5);
              for (const district2 of item.districts) {
                if (district2.value_compare && district2.value_compare.indexOf(temp6) > -1) {
                  // console.log(district2, 'district2');

                  tempCodeDistrict = district2.code
                  break;
                }
              }
              break;
            }
          }
          payload.push(tempCodeDistrict)
        }
        Hour2[i].setor = payload
      }

      for (let i = 0; i < Hour3.length; i++) {
        let payload = [];
        for (const itemDistrict of Hour3[i].setor) {
          let tempCodeDistrict = -1
          const temp = await this.generalHandleService.removeWhiteSpace("Hồ Chí Minh")
          const temp2 = await this.generalHandleService.removeAdministrative(temp);
          const temp3 = await this.generalHandleService.cleanAccents(temp2);
          let code = -1;
          for (const item of AministrativeDivision) {
            if (item.value_compare && item.value_compare.indexOf(temp3) > -1) {
              code = item.code;
              tempCodeDistrict = item.code;
              const temp4 = await this.generalHandleService.removeWhiteSpace(itemDistrict);
              const temp5 = await this.generalHandleService.removeAdministrative(temp4);
              const temp6 = await this.generalHandleService.cleanAccents(temp5);
              for (const district2 of item.districts) {
                if (district2.value_compare && district2.value_compare.indexOf(temp6) > -1) {
                  // console.log(district2, 'district2');

                  tempCodeDistrict = district2.code
                  break;
                }
              }
              break;
            }
          }
          payload.push(tempCodeDistrict)
        }
        Hour3[i].setor = payload
      }


      for (let i = 0; i < Hour4.length; i++) {
        let payload = [];
        for (const itemDistrict of Hour4[i].setor) {
          let tempCodeDistrict = -1
          const temp = await this.generalHandleService.removeWhiteSpace("Hồ Chí Minh")
          const temp2 = await this.generalHandleService.removeAdministrative(temp);
          const temp3 = await this.generalHandleService.cleanAccents(temp2);
          let code = -1;
          for (const item of AministrativeDivision) {
            if (item.value_compare && item.value_compare.indexOf(temp3) > -1) {
              code = item.code;
              tempCodeDistrict = item.code;
              const temp4 = await this.generalHandleService.removeWhiteSpace(itemDistrict);
              const temp5 = await this.generalHandleService.removeAdministrative(temp4);
              const temp6 = await this.generalHandleService.cleanAccents(temp5);
              for (const district2 of item.districts) {
                if (district2.value_compare && district2.value_compare.indexOf(temp6) > -1) {
                  // console.log(district2, 'district2');

                  tempCodeDistrict = district2.code
                  break;
                }
              }
              break;
            }
          }
          payload.push(tempCodeDistrict)
        }
        Hour4[i].setor = payload
      }



      const getExtend2 = await this.extendOptionalModel.find(
        {
          $and: [
            { estimate: { $lte: 2.5 } },
            { estimate: { $gte: 0.5 } },
            {
              is_delete: false
            }
          ]
        }
      )
      for (const item of getExtend2) {
        const findIndexArea = item.area_fee.findIndex(objectLv1 => objectLv1.area_lv_1 === 79);
        if (findIndexArea > -1) {
          item.area_fee[findIndexArea].area_lv_2 = [];
          for (const itemHour of Hour2) {
            const payload = {
              is_active: true,
              area_lv_2: itemHour.setor,
              price: (itemHour.price / 2) * item.estimate,
              is_platform_fee: false,
              platform_fee: 28
            }

            item.area_fee[findIndexArea].area_lv_2.push(payload)
          }
          console.log(item.area_fee[findIndexArea].area_lv_1, 'item.area_fee[findIndexArea].area_lv_1');
          console.log(item.estimate, 'item.estimate');
          await item.save();
          // console.log(item.area_fee[findIndexArea].area_lv_2, 'item.area_fee[findIndexArea]');
        }
      }


      const getExtend3 = await this.extendOptionalModel.find(
        {
          $and: [
            { estimate: { $lte: 3.5 } },
            { estimate: { $gte: 3 } },
            {
              is_delete: false
            }
          ]
        }
      )
      for (const item of getExtend3) {
        const findIndexArea = item.area_fee.findIndex(objectLv1 => objectLv1.area_lv_1 === 79);
        if (findIndexArea > -1) {
          item.area_fee[findIndexArea].area_lv_2 = [];
          for (const itemHour of Hour3) {
            const payload = {
              is_active: true,
              area_lv_2: itemHour.setor,
              price: (itemHour.price / 3) * item.estimate,
              is_platform_fee: false,
              platform_fee: 28
            }

            item.area_fee[findIndexArea].area_lv_2.push(payload)
          }
          console.log(item.area_fee[findIndexArea].area_lv_1, 'item.area_fee[findIndexArea].area_lv_1');
          console.log(item.estimate, 'item.estimate');
          await item.save();
          // console.log(item.area_fee[findIndexArea].area_lv_2, 'item.area_fee[findIndexArea]');
        }
      }


      const getExtend4 = await this.extendOptionalModel.find(
        {
          $and: [
            // {estimate: {$lte: 2}},
            { estimate: { $gte: 4 } },
            {
              is_delete: false
            }
          ]
        }
      )
      for (const item of getExtend4) {
        const findIndexArea = item.area_fee.findIndex(objectLv1 => objectLv1.area_lv_1 === 79);
        if (findIndexArea > -1) {
          item.area_fee[findIndexArea].area_lv_2 = [];
          for (const itemHour of Hour4) {
            const priceFinal = (itemHour.price / 200)
            const payload = {
              is_active: true,
              area_lv_2: itemHour.setor,
              price: (itemHour.price / 4) * item.estimate,
              is_platform_fee: false,
              platform_fee: 28
            }
            console.log(payload, 'payload');

            item.area_fee[findIndexArea].area_lv_2.push(payload)
          }
          // if()
          console.log(item.area_fee[findIndexArea].area_lv_1, 'item.area_fee[findIndexArea].area_lv_1');
          console.log(item.estimate, 'item.estimate');
          await item.save();
          // console.log(item.area_fee[findIndexArea].area_lv_2, 'item.area_fee[findIndexArea]');
        }
      }


      // console.log(Hour2, 'Hour2');


      // convertDistrict = await t

      // const getExtend = await this.extendOptionalModel.find({id_option});



      return true;
    } catch (err) {
      console.log(err, 'err');

      throw new HttpException(
        err.response || err.toString(),
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async updatePromotion() {
    try {

      // await this.promotionModel.updateMany({
      //   $set: {
      //     id_group_promotion: []
      //   }
      // })

      /** Cap nhat promotion */
       await this.promotionModel.updateMany({
        $set: {
          // is_parent_promotion: false,
          // parent_promotion: null,
          type_action: PROMOTION_ACTION_TYPE.exchange
        }
      })

      const arrPromotion = await this.promotionModel.find()
      const lstTask:any = []
      for (let i = 0; i < arrPromotion.length; i++) {
        if(arrPromotion[i].brand === 'guvi') {
          arrPromotion[i].type_action = PROMOTION_ACTION_TYPE.use_in_app
        } else {
          arrPromotion[i].type_action = PROMOTION_ACTION_TYPE.exchange
        }
        // arrPromotion[i].is_parent_promotion = arrPromotion[i].is_parrent_promotion
        // arrPromotion[i].parent_promotion = arrPromotion[i].parrent_promotion

        // console.log('is_parent_promotion', arrPromotion[i].is_parent_promotion)
        // console.log('parent_promotion', arrPromotion[i].parent_promotion)
        
        lstTask.push(arrPromotion[i].save())
      }

      await Promise.all(lstTask)

      // await this.promotionModel.updateMany({}, {
      //   $unset: {
      //     is_parrent_promotion: "",
      //     parrent_promotion: "",
      //   }
      // })


      // await this.promotionModel.updateMany({
      //   $set: {
      //     // is_show_in_app: true,// migrate có show trên app hay ko
      //     type_date_apply: 'date_create'
      //   },
      // });
      // kết thúc migrate có show trên app hay ko
      //
      // await this.promotionModel.updateMany({
      //     $set: {
      //         is_child_promotion: false,
      //         child_promotion: [],
      //         is_parrent_promotion: false,
      //         parrent_promotion: null,
      //         total_child_promotion: 0
      //     }
      // })
      // await this.promotionModel.updateMany({
      //     $set: {
      //         status: "doing"
      //     }
      // })
      // await this.promotionModel.updateMany({
      //     $set: {
      //         is_loop: false,
      //         day_loop: [],
      //         start_time_loop: null,
      //         end_time_loop: null
      //     }
      // });

      console.log('migrate promotion done')

      return true;
    } catch (err) {
      throw new HttpException(
        err.response || err.toString(),
        HttpStatus.FORBIDDEN,
      );
    }
  }
  async updateAdmin() {
    try {
      await this.userSystemModel.updateMany({
        // $set: { is_active: true, is_delete: false, role: 'admin' },
        $set: { session_login: [] }
      });
      console.log('>>>>>>>>>>>> updateAdmin');
    } catch (err) {
      throw new HttpException(
        err.response || err.toString(),
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async updateNews() {
    try {
      console.log('có chạy ở đây == .>>>>> ');
      // await this.promotionModel.updateMany({type_discount: "same_price"}, {$set: {
      //     type_discount: "order", is_id_group_customer: true, is_id_customer: false, exp_date_exchange: 100
      // }});
      // await this.promotionModel.updateMany({$set:{
      //     is_id_group_customer: true, is_id_customer: false, exp_date_exchange: 100
      // }})
      await this.newsModel.updateMany({
        $set: {
          position: 0,
        },
      });
      console.log('có chạy ở đây 2222222 == .>>>>> ');

      return true;
    } catch (err) {
      throw new HttpException(
        err.response || err.toString(),
        HttpStatus.FORBIDDEN,
      );
    }
  }
  async updateBanner() {
    try {
      const getBanner = await this.bannerModel.find();
      console.log('get banner >>>> ', getBanner);
      await this.bannerModel.updateMany({
        $set: { kind: null },
      });
      for (let item of getBanner) {
        if (item.type_link === 'service') {
          console.log('aaaaaaaaaa');

          const getService = await this.serviceModel.findById(item.link_id);
          console.log('gggggggggggggg');

          if (getService.title.vi === 'Giúp việc cố định') {
            console.log('ddddddddddddd');

            item.kind = 'giup_viec_co_dinh';
          } else if (getService.title.vi === 'Giúp việc theo giờ') {
            item.kind = 'giup_viec_theo_gio';
          }
          await item.save();
        }
      }
      console.log('>>>> done');

      return true;
    } catch (err) {
      throw new HttpException(
        err.response || err.toString(),
        HttpStatus.FORBIDDEN,
      );
    }
  }
  async updateTransition() {
    try {
      // //  await this.transitionCollaboratorModel.updateMany({
      // //     $set : {
      // //         date_verify_created : null
      // //     }
      // //  })
      // await this.transitionCollaboratorModel.updateMany({
      //     $set: {
      //         id_admin_verify: null
      //     }
      // })

      await this.transitionCollaboratorModel.updateMany(
        {},
        { $set: { date_create: null } },
      );
      await this.transitionCustomerModel.updateMany(
        {},
        { $set: { date_create: null } },
      );

      const arrTransColl = await this.transitionCollaboratorModel.find();
      for (let i = 0; i < arrTransColl.length; i++) {
        console.log(
          arrTransColl[i].toObject().date_created,
          'arrTransColl[i].toObject().date_created',
        );
        console.log(
          arrTransColl[i].toObject().date_create,
          'arrTransColl[i].toObject().date_create',
        );
        if (
          arrTransColl[i].toObject().date_create === null &&
          arrTransColl[i].toObject().date_created === null
        ) {
          arrTransColl[i].date_create =
            arrTransColl[i].toObject().date_verify_created;
          arrTransColl[i].date_created =
            arrTransColl[i].toObject().date_verify_created;
          await arrTransColl[i].save();
        } else {
          if (arrTransColl[i].date_create !== null) {
            arrTransColl[i].date_created =
              arrTransColl[i].toObject().date_create;
            await arrTransColl[i].save();
            continue;
          }
          if (arrTransColl[i].date_created !== null) {
            arrTransColl[i].date_create =
              arrTransColl[i].toObject().date_created;
            await arrTransColl[i].save();
            continue;
          }
        }
      }

      // const arrTransCus = await this.transitionCustomerModel.find();
      // for(let i = 0 ; i < arrTransCus.length ; i++) {
      //     if(arrTransCus[i].toObject().rsp_query_vnpay.length > 0) {
      //         console.log(arrTransCus[i].toObject().rsp_query_vnpay, 'arrTransCus[i].toObject().rsp_query_vnpay.');

      //         if(arrTransCus[i].rsp_query_vnpay.length > 0) {
      //             arrTransCus[i].date_create = arrTransCus[i].toObject().rsp_query_vnpay[0].date
      //             arrTransCus[i].date_created = arrTransCus[i].toObject().rsp_query_vnpay[0].date
      //             await arrTransCus[i].save();
      //         }
      //     } else if(arrTransCus[i].toObject().date_verify_created !== null) {
      //         arrTransCus[i].date_create = arrTransCus[i].toObject().date_verify_created
      //         arrTransCus[i].date_created = arrTransCus[i].toObject().date_verify_created
      //         await arrTransCus[i].save();
      //     } else {
      //         if(arrTransCus[i].date_create !== null) {
      //             arrTransCus[i].date_created = arrTransCus[i].toObject().date_create;
      //             await arrTransCus[i].save();
      //             continue;
      //         }
      //         if(arrTransCus[i].date_created !== null) {
      //             arrTransCus[i].date_create = arrTransCus[i].toObject().date_created;
      //             await arrTransCus[i].save();
      //             continue;
      //         }
      //     }
      // }
    } catch (err) {
      throw new HttpException(
        err.response || err.toString(),
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async updateTransitionCollaborator() {
    try {
      await this.transitionCollaboratorModel.updateMany({
        $set: {
          type_wallet: 'wallet',
        },
      });
    } catch (err) {
      throw new HttpException(
        err.response || err.toString(),
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async updateBalanceCollaborator() {
    try {
      const collaborator = await this.collaboratorModel.find({
        _id: '6411638ebf1f450065350e71',
      });
      for (const item of collaborator) {
        console.log(item._id, 'item');

        let history = await this.historyActivityModel
          .find({ id_collaborator: item._id, value: { $ne: 0 } })
          .sort({ date_create: 1 });
        // if(history.length > 2) {
        //     console.log(history[0], 'history 1');
        //     console.log(history[history.length -1], 'history 2');
        // }
        let current_remainder = 0;
        let current_gift_remainder = 0;
        let status_current_remainder = 'none';
        let status_current_gift_remainder = 'none';
        // for(let i = 0 ; i < history.length ; i++) {
        //     await this.historyActivityModel.findOneAndUpdate({_id: history[i]._id},
        //         {$set: {current_remainder: 0, status_current_remainder: "none", current_gift_remainder: 0, status_current_gift_remainder: "none"}});
        // }

        for (let i = 0; i < history.length; i++) {
          if (
            history[i].type === 'collaborator_done_order' ||
            history[i].type === 'admin_change_status_to_order'
          ) {
            history[i].value = Math.abs(history[i].value);
            await history[i].save();
          }

          if (
            history[i].type === 'refund_platform_fee_cancel_order' ||
            history[i].type === 'refund_collaborator_fee' ||
            history[i].type === 'refund' ||
            history[i].type === 'collaborator_refund_platform_fee' ||
            history[i].type === 'collaborator_refund_pending_money'
          ) {
            current_gift_remainder += history[i].value;
            status_current_gift_remainder = 'up';
            history[i].current_remainder = current_remainder;
            history[i].status_current_remainder = 'none';
            history[i].current_gift_remainder = current_gift_remainder;
            history[i].status_current_gift_remainder =
              status_current_gift_remainder;
            await history[i].save();
            continue;
          }

          if (
            history[i].type === 'collaborator_receive_platform_fee' ||
            history[i].type === 'collaborator_receive_refund_money' ||
            history[i].type === 'receive_extra_collaborator_fee' ||
            history[i].type === 'collaborator_done_order' ||
            history[i].type === 'admin_change_status_to_order'
          ) {
            current_remainder += history[i].value;
            status_current_remainder = 'up';
            history[i].current_remainder = current_remainder;
            history[i].status_current_remainder = status_current_remainder;
            history[i].current_gift_remainder = current_gift_remainder;
            history[i].status_current_gift_remainder = 'none';
            await history[i].save();
            continue;
          }

          if (
            history[i].type === 'collaborator_minus_collaborator_fee' ||
            history[i].type === 'collaborator_minus_platform_fee' ||
            history[i].type === 'collaborator_minus_pending_money' ||
            history[i].type === 'minus_platform_fee' ||
            history[i].type === 'collaborator_penalty_cancel_job'
          ) {
            let tempRemainder = 0;
            tempRemainder = current_gift_remainder - Math.abs(history[i].value);
            if (tempRemainder < 0) {
              const tempRemainderAbs = Math.abs(tempRemainder);
              current_remainder = current_remainder - tempRemainderAbs;
              current_gift_remainder = 0;
            } else {
              current_gift_remainder = tempRemainder;
            }
            history[i].current_remainder = current_remainder;
            history[i].status_current_remainder =
              tempRemainder < 0 ? 'down' : 'none';
            history[i].current_gift_remainder = current_gift_remainder;
            history[i].status_current_gift_remainder =
              Math.abs(history[i].value) === Math.abs(tempRemainder)
                ? 'none'
                : 'down';
            await history[i].save();
            continue;
          }

          if (history[i].type === 'verify_withdraw') {
            console.log('check');

            current_remainder -= history[i].value;
            history[i].current_remainder = current_remainder;
            history[i].status_current_remainder = 'down';
            history[i].current_gift_remainder = current_gift_remainder;
            history[i].status_current_gift_remainder = 'none';
            await history[i].save();
            continue;
          }

          if (
            history[i].type === 'verify_top_up' ||
            history[i].type === 'admin_top_up_user'
          ) {
            // console.log(history[i], 'history[i]');

            const findTransition =
              await this.transitionCollaboratorModel.findOne({
                _id: history[i].id_transistion_collaborator,
              });
            // console.log(findTransition, 'findTransition');
            // if(!findTransition) continue;
            if (!findTransition) {
              // current_remainder += history[i].value;
              // history[i].current_remainder = current_remainder;
              // history[i].status_current_remainder = "up";
              // history[i].current_gift_remainder = current_gift_remainder
              // history[i].status_current_gift_remainder = "none";
              // await history[i].save();
              continue;
            } else if (
              !findTransition.type_wallet ||
              findTransition.type_wallet === 'wallet'
            ) {
              current_remainder += history[i].value;
              history[i].current_remainder = current_remainder;
              history[i].status_current_remainder = 'up';
              history[i].current_gift_remainder = current_gift_remainder;
              history[i].status_current_gift_remainder = 'none';
              await history[i].save();
              continue;
            } else if (findTransition.type_wallet === 'gift_wallet') {
              current_gift_remainder += history[i].value;
              history[i].current_gift_remainder = current_gift_remainder;
              history[i].status_current_gift_remainder = 'up';
              history[i].current_remainder = current_remainder;
              history[i].status_current_remainder = 'none';
              await history[i].save();
              continue;
            }
          }

          // if()

          // else {
          //     current_gift_remiander = history[i].value > 0)
          //     status_current_gift_remainder = "up"

          //     history[i].current_remainder = current_remiander
          //     history[i].status_current_remainder = status_current_remainder
          //     history[i].current_gift_remainder = current_gift_remiander
          //     history[i].status_current_gift_remainder = status_current_gift_remainder
          //     await history[i].save();
          // }
        }
      }
    } catch (err) {
      throw new HttpException(
        err.response || err.toString(),
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async seedDataPermision() {
    try {
      // await this.roleAdminModel.updateMany({}, { $set: { id_key_api: [] } });


      // for (const item of PERMISSION_ADMIN) {
      //   const checkAPi = await this.keyApiModel.findOne({ name_api: item.name_api, key_group_api: item.key_group_api })
      //   if (!checkAPi) {
      //     const newPermission = new this.keyApiModel(item);
      //     await newPermission.save();
      //   }
      // }

      for (const item of PERMISSION_ADMIN) {
        const checkAPi = await this.keyApiModel.findOne({ name_api: item.name_api, key_group_api: item.key_group_api })
        if (!checkAPi) {
          const lengthItem = item.key_api_parent.length;
          for (let i = 0; i < lengthItem; i++) {
            const findKeyApi = await this.keyApiModel.findOne({
              name_api: item.key_api_parent[i],
            });
            if (findKeyApi) item.key_api_parent.push(findKeyApi._id);
            item.key_api_parent.shift();
          }
          const newPermission = new this.keyApiModel(item);
          await newPermission.save();
        }
      }


      // await this.keyApiModel.deleteMany();

      // for (const item of PERMISSION_ADMIN) {
      //   if (item.key_api_parent.length > 0) {
      //     const lengthItem = item.key_api_parent.length;
      //     for (let i = 0; i < lengthItem; i++) {
      //       const findKeyApi = await this.keyApiModel.findOne({
      //         name_api: item.key_api_parent[i],
      //       });
      //       if (findKeyApi) item.key_api_parent.push(findKeyApi._id);
      //       item.key_api_parent.shift();
      //     }
      //   }
      //   const newPermission = new this.keyApiModel(item);
      //   await newPermission.save();
      // }
      // const getKeyApi = await this.keyApiModel.find();
      // const getRoleAdmin = await this.roleAdminModel.find();
      // for (const item of getRoleAdmin) {
      //   for (const itemKeyApi of getKeyApi) {
      //     if (item.name_role === 'admin quản lý') {
      //       item.id_key_api.push(itemKeyApi._id.toString());
      //     }
      //     if (
      //       item.name_role === 'Support customer' &&
      //       (itemKeyApi.id_side_bar === 'cash_book' ||
      //         itemKeyApi.id_side_bar === 'customer_manager' ||
      //         itemKeyApi.id_side_bar === 'collaborator_manager')
      //     ) {
      //       item.id_key_api.push(itemKeyApi._id.toString());
      //     }
      //   }
      //   await item.save();
      // }

      return true;
    } catch (err) {
      throw new HttpException(
        err.response || err.toString(),
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async seedPriceOption() {
    try {
      await this.priceOptionModel.deleteMany({});
      await this.extendOptionalModel.updateMany(
        {},
        { $set: { id_price_option: null } },
      );

      const seedData = [
        {
          title: 'Theo giờ, 30 phút',
          description: '',
          price_option_area: [
            {
              district: [773, 775, 776, 772, 761, 777, 764, 766, 767],
              city: 79,
              // level_0: "vietnam",
              // level_1: "hochiminh",
              // level_2: ["9", "10", "binhthanh"],
              value: 42000,
              type_increase: 'amount',
            },
            {
              district: [760, 770, 774, 771, 768, 769],
              city: 79,
              // level_0: "vietnam",
              // level_1: "hochiminh",
              // level_2: ["9", "10", "binhthanh"],
              value: 43000,
              type_increase: 'amount',
            },
            {
              district: [779, 780, 765],
              city: 79,
              // level_0: "vietnam",
              // level_1: "hochiminh",
              // level_2: ["9", "10", "binhthanh"],
              value: 46000,
              type_increase: 'amount',
            },
            {
              district: [778],
              city: 79,
              // level_0: "vietnam",
              // level_1: "hochiminh",
              // level_2: ["9", "10", "binhthanh"],
              value: 44000,
              type_increase: 'amount',
            },
            {
              district: [724],
              city: 74,
              // level_0: "vietnam",
              // level_1: "hochiminh",
              // level_2: ["9", "10", "binhthanh"],
              value: 43000,
              type_increase: 'amount',
            },
          ],
          price_option_rush_day: [
            {
              title: 'giờ cao điểm, ban ngày',
              day_local: [1, 2, 3, 4, 5, 6, 0],
              start_time_local: '07:00:00',
              end_time_local: '08:30:00',
              timezone: 'Asia/Ho_Chi_Minh',
              type_increase: 'percent_accumulate',
              value: 10,
            },
            {
              title: 'giờ cao điểm tối',
              day_local: [1, 2, 3, 4, 5, 6, 0],
              start_time_local: '17:00:00',
              end_time_local: '23:59:59',
              timezone: 'Asia/Ho_Chi_Minh',
              type_increase: 'percent_accumulate',
              value: 10,
            },
          ],
          price_option_holiday: [
            {
              title: 'ngày lễ',
              time_start: '2023-06-04T17:00:00.000Z',
              time_end: '2023-06-05T16:59:59.999Z',
              type_increase: 'percent_accumulate',
              value: 25,
            },
          ],
        },
        {
          title: 'Theo giờ, 1 giờ, ',
          description: '',
          price_option_area: [
            {
              district: [773, 775, 776, 772, 761, 777, 764, 766, 767],
              city: 79,
              type_increase: 'amount',
              value: 84000,
            },
            {
              district: [760, 770, 774, 771, 768, 769],
              city: 79,
              type_increase: 'amount',
              value: 86000,
            },
            {
              district: [779, 780, 765],
              city: 79,
              type_increase: 'amount',
              value: 92000,
            },
            {
              district: [778],
              city: 79,
              type_increase: 'amount',
              value: 88000,
            },
            {
              district: [724],
              city: 74,
              type_increase: 'amount',
              value: 86000,
            },
          ],
          price_option_rush_day: [
            {
              title: 'giờ cao điểm, ban ngày',
              day_local: [1, 2, 3, 4, 5, 6, 0],
              start_time_local: '07:00:00',
              end_time_local: '08:30:00',
              timezone: 'Asia/Ho_Chi_Minh',
              type_increase: 'percent_accumulate',
              value: 10,
            },
            {
              title: 'giờ cao điểm tối',
              day_local: [1, 2, 3, 4, 5, 6, 0],
              start_time_local: '17:00:00',
              end_time_local: '23:59:59',
              timezone: 'Asia/Ho_Chi_Minh',
              type_increase: 'percent_accumulate',
              value: 10,
            },
          ],
          price_option_holiday: [
            {
              title: 'ngày lễ',
              time_start: '2023-06-04T17:00:00.000Z',
              time_end: '2023-06-05T16:59:59.999Z',
              type_increase: 'percent_accumulate',
              value: 25,
            },
          ],
        },
        {
          title: 'Theo giờ, 2 giờ',
          description: '',
          price_option_area: [
            {
              district: [773, 775, 776, 772, 761, 777, 764, 766, 767],
              city: 79,
              type_increase: 'amount',
              value: 168000,
            },
            {
              district: [760, 770, 774, 771, 768, 769],
              city: 79,
              type_increase: 'amount',
              value: 172000,
            },
            {
              district: [779, 780, 765],
              city: 79,
              type_increase: 'amount',
              value: 184000,
            },
            {
              district: [778],
              city: 79,
              type_increase: 'amount',
              value: 176000,
            },
            {
              district: [724],
              city: 74,
              type_increase: 'amount',
              value: 172000,
            },
          ],
          price_option_rush_day: [
            {
              title: 'giờ cao điểm, ban ngày',
              day_local: [1, 2, 3, 4, 5, 6, 0],
              start_time_local: '07:00:00',
              end_time_local: '08:30:00',
              timezone: 'Asia/Ho_Chi_Minh',
              type_increase: 'percent_accumulate',
              value: 10,
            },
            {
              title: 'giờ cao điểm tối',
              day_local: [1, 2, 3, 4, 5, 6, 0],
              start_time_local: '17:00:00',
              end_time_local: '23:59:59',
              timezone: 'Asia/Ho_Chi_Minh',
              type_increase: 'percent_accumulate',
              value: 10,
            },
          ],
          price_option_holiday: [
            {
              title: 'ngày lễ',
              time_start: '2023-06-04T17:00:00.000Z',
              time_end: '2023-06-05T16:59:59.999Z',
              type_increase: 'percent_accumulate',
              value: 25,
            },
          ],
        },
        {
          title: 'Theo giờ, 3 giờ',
          description: '',
          price_option_area: [
            {
              district: [773, 775, 776, 772, 761, 777, 764, 766, 767],
              city: 79,
              type_increase: 'amount',
              value: 246000,
            },
            {
              district: [760, 770, 774, 771, 768, 769],
              city: 79,
              type_increase: 'amount',
              value: 252000,
            },
            {
              district: [779, 780, 765],
              city: 79,
              type_increase: 'amount',
              value: 276000,
            },
            {
              district: [778],
              city: 79,
              type_increase: 'amount',
              value: 258000,
            },
            {
              district: [724],
              city: 74,
              type_increase: 'amount',
              value: 252000,
            },
          ],
          price_option_rush_day: [
            {
              title: 'giờ cao điểm, ban ngày',
              day_local: [1, 2, 3, 4, 5, 6, 0],
              start_time_local: '07:00:00',
              end_time_local: '08:30:00',
              timezone: 'Asia/Ho_Chi_Minh',
              type_increase: 'percent_accumulate',
              value: 10,
            },
            {
              title: 'giờ cao điểm tối',
              day_local: [1, 2, 3, 4, 5, 6, 0],
              start_time_local: '17:00:00',
              end_time_local: '23:59:59',
              timezone: 'Asia/Ho_Chi_Minh',
              type_increase: 'percent_accumulate',
              value: 10,
            },
          ],
          price_option_holiday: [
            {
              title: 'ngày lễ',
              time_start: '2023-06-04T17:00:00.000Z',
              time_end: '2023-06-05T16:59:59.999Z',
              type_increase: 'percent_accumulate',
              value: 25,
            },
          ],
        },
        {
          title: 'Theo giờ, 4 giờ',
          description: '',
          price_option_area: [
            {
              district: [773, 775, 776, 772, 761, 777, 764, 766, 767],
              city: 79,
              type_increase: 'amount',
              value: 320000,
            },
            {
              district: [760, 770, 774, 771, 768, 769],
              city: 79,
              type_increase: 'amount',
              value: 328000,
            },
            {
              district: [779, 780, 765],
              city: 79,
              type_increase: 'amount',
              value: 352000,
            },
            {
              district: [778],
              city: 79,
              type_increase: 'amount',
              value: 336000,
            },
            {
              district: [724],
              city: 74,
              type_increase: 'amount',
              value: 328000,
            },
          ],
          price_option_rush_day: [
            {
              title: 'giờ cao điểm, ban ngày',
              day_local: [1, 2, 3, 4, 5, 6, 0],
              start_time_local: '07:00:00',
              end_time_local: '08:30:00',
              timezone: 'Asia/Ho_Chi_Minh',
              type_increase: 'percent_accumulate',
              value: 10,
            },
            {
              title: 'giờ cao điểm tối',
              day_local: [1, 2, 3, 4, 5, 6, 0],
              start_time_local: '17:00:00',
              end_time_local: '23:59:59',
              timezone: 'Asia/Ho_Chi_Minh',
              type_increase: 'percent_accumulate',
              value: 10,
            },
          ],
          price_option_holiday: [
            {
              title: 'ngày lễ',
              time_start: '2023-06-04T17:00:00.000Z',
              time_end: '2023-06-05T16:59:59.999Z',
              type_increase: 'percent_accumulate',
              value: 25,
            },
          ],
        },
      ];

      const areaFor2HourSchedule = [
        {
          district: [773, 775, 778, 776, 772, 761, 777, 764, 766, 767],
          city: 79,
          type_increase: 'amount',
          value: 160000,
        },
        {
          district: [760, 770, 774, 771, 768, 769],
          city: 79,
          type_increase: 'amount',
          value: 164000,
        },
        {
          district: [779, 780, 765],
          city: 79,
          type_increase: 'amount',
          value: 172000,
        },
        {
          district: [724],
          city: 74,
          type_increase: 'amount',
          value: 164000,
        },
      ];
      const areaFor3HourSchedule = [
        {
          district: [773, 775, 778, 776, 772, 761, 777, 764, 766, 767],
          city: 79,
          type_increase: 'amount',
          value: 240000,
        },
        {
          district: [760, 770, 774, 771, 768, 769],
          city: 79,
          type_increase: 'amount',
          value: 246000,
        },
        {
          district: [779, 780, 765],
          city: 79,
          type_increase: 'amount',
          value: 258000,
        },
        {
          district: [724],
          city: 74,
          type_increase: 'amount',
          value: 264000,
        },
      ];
      const areaFor4HourSchedule = [
        {
          district: [773, 775, 778, 776, 772, 761, 777, 764, 766, 767],
          city: 79,
          type_increase: 'amount',
          value: 320000,
        },
        {
          district: [760, 770, 774, 771, 768, 769],
          city: 79,
          type_increase: 'amount',
          value: 328000,
        },
        {
          district: [779, 780, 765],
          city: 79,
          type_increase: 'amount',
          value: 344000,
        },
        {
          district: [724],
          city: 74,
          type_increase: 'amount',
          value: 328000,
        },
      ];

      const seedDataSchedule = [
        {
          title: 'Theo gói, 2 tiếng',
          description: '',
          price_option_area: areaFor2HourSchedule,
          price_option_rush_day: [
            {
              title: 'giờ cao điểm, ban ngày',
              day_local: [1, 2, 3, 4, 5, 6, 0],
              start_time_local: '07:00:00',
              end_time_local: '08:30:00',
              timezone: 'Asia/Ho_Chi_Minh',
              type_increase: 'percent_accumulate',
              value: 10,
            },
            {
              title: 'giờ cao điểm tối',
              day_local: [1, 2, 3, 4, 5, 6, 0],
              start_time_local: '17:00:00',
              end_time_local: '23:59:59',
              timezone: 'Asia/Ho_Chi_Minh',
              type_increase: 'percent_accumulate',
              value: 10,
            },
          ],
          price_option_holiday: [
            {
              title: 'ngày lễ',
              time_start: '2023-06-04T17:00:00.000Z',
              time_end: '2023-06-05T16:59:59.999Z',
              type_increase: 'percent_accumulate',
              value: 25,
            },
          ],
        },
        {
          title: 'Theo gói, 3 tiếng',
          description: '',
          price_option_area: areaFor3HourSchedule,
          price_option_rush_day: [
            {
              title: 'giờ cao điểm, ban ngày',
              day_local: [1, 2, 3, 4, 5, 6, 0],
              start_time_local: '07:00:00',
              end_time_local: '08:30:00',
              timezone: 'Asia/Ho_Chi_Minh',
              type_increase: 'percent_accumulate',
              value: 10,
            },
            {
              title: 'giờ cao điểm tối',
              day_local: [1, 2, 3, 4, 5, 6, 0],
              start_time_local: '17:00:00',
              end_time_local: '23:59:59',
              timezone: 'Asia/Ho_Chi_Minh',
              type_increase: 'percent_accumulate',
              value: 10,
            },
          ],
          price_option_holiday: [
            {
              title: 'ngày lễ',
              time_start: '2023-06-04T17:00:00.000Z',
              time_end: '2023-06-05T16:59:59.999Z',
              type_increase: 'percent_accumulate',
              value: 25,
            },
          ],
        },
        {
          title: 'Theo gói, 4 tiếng',
          description: '',
          price_option_area: areaFor4HourSchedule,
          price_option_rush_day: [
            {
              title: 'giờ cao điểm, ban ngày',
              day_local: [1, 2, 3, 4, 5, 6, 0],
              start_time_local: '07:00:00',
              end_time_local: '08:30:00',
              timezone: 'Asia/Ho_Chi_Minh',
              type_increase: 'percent_accumulate',
              value: 10,
            },
            {
              title: 'giờ cao điểm tối',
              day_local: [1, 2, 3, 4, 5, 6, 0],
              start_time_local: '17:00:00',
              end_time_local: '23:59:59',
              timezone: 'Asia/Ho_Chi_Minh',
              type_increase: 'percent_accumulate',
              value: 10,
            },
          ],
          price_option_holiday: [
            {
              title: 'ngày lễ',
              time_start: '2023-06-04T17:00:00.000Z',
              time_end: '2023-06-05T16:59:59.999Z',
              type_increase: 'percent_accumulate',
              value: 25,
            },
          ],
        },
      ];

      for (const item of seedData) {
        console.log(item.title, 'item.title');

        const newItem = new this.priceOptionModel({
          title: item.title,
          description: item.description,
          price_option_area: item.price_option_area,
          price_option_rush_day: item.price_option_rush_day,
          price_option_holiday: item.price_option_holiday,
        });
        console.log(newItem.title, 'newItem');

        await newItem.save();
      }

      // const getExtend = await this.extendOptionalModel.find();
      // for(const item of getExtend) {
      //     if(item.estimate === 2) {
      //         const findPriceOption = await this.priceOptionModel.findOne({title: "Theo giờ, 2 giờ"})
      //         item.id_price_option = findPriceOption._id
      //     }
      //     if(item.estimate === 3) {
      //         const findPriceOption = await this.priceOptionModel.findOne({title: "Theo giờ, 3 giờ"})
      //         item.id_price_option = findPriceOption._id
      //     }
      //     if(item.estimate === 4) {
      //         const findPriceOption = await this.priceOptionModel.findOne({title: "Theo giờ, 4 giờ"})
      //         item.id_price_option = findPriceOption._id
      //     }
      //     await item.save();
      // }
    } catch (err) {
      throw new HttpException(
        err.response || err.toString(),
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async updatecustomerSetting() {
    try {
      // const customerSetting = await this.customerSettingModel.findOne();
      // await customerSetting.save()

      await this.customerSettingModel.updateMany({
        $set: {
          // affiliate_discount_percentage: 5
          // is_momo_payment: true,
          // is_g_pay_payment: true,
          // is_cash_payment: true
        //   payment_method: [{
        //     title: { vi: 'Tiền mặt', en: 'Cash' },
        //     icon: 'IconDollars',
        //     titleIcon: 'IconDollars',
        //     method: 'cash',
        //     id_service_apply: [new Types.ObjectId('6321598ea6c81260452bf4f5'), new Types.ObjectId('654dd5598b3f1a21b7011e3f'), new Types.ObjectId('64be251b177d3dd356d5eae1')],
        //     allow_adding_card: false,
        //     is_activated: true,
        //     advertisement: null,
        //   },
        //   {
        //     title: { vi: 'GPay', en: 'GPay' },
        //     icon: 'IconWallet',
        //     titleIcon: 'IconWallet',
        //     method: 'point',
        //     img: 'https://server.guvico.com/image/upload/cd5576232dd4d8002103d45e35d19befa.png',
        //     id_service_apply: [new Types.ObjectId('6321598ea6c81260452bf4f5'), new Types.ObjectId('63215877a6c81260452bf4f0'), new Types.ObjectId('654dd5598b3f1a21b7011e3f'), new Types.ObjectId('64be251b177d3dd356d5eae1')],
        //     allow_adding_card: false,
        //     is_activated: true,
        //     advertisement: null,
        //   },
        //   {
        //     title: { vi: 'MoMo', en: 'MoMo' },
        //     icon: 'IconMomo',
        //     titleIcon: 'IconMomo',
        //     method: 'momo',
        //     img: ' https://server.guvico.com/image/upload/31e2e489e0609a556ef2d1f46b26a1105.png',
        //     id_service_apply: [new Types.ObjectId('6321598ea6c81260452bf4f5'), new Types.ObjectId('63215877a6c81260452bf4f0'), new Types.ObjectId('654dd5598b3f1a21b7011e3f'), new Types.ObjectId('64be251b177d3dd356d5eae1') ],
        //     allow_adding_card: false,
        //     is_activated: true,
        //     advertisement: null,
        //   },
        //   {
        //     title: { vi: 'VNPAY-QR', en: 'VNPAY-QR' },
        //     icon: 'IconVNPay',
        //     titleIcon: 'IconVNPay',
        //     method: 'vnpay',
        //     description: { vi: 'Quét QR từ Ứng dụng ngân hàng & Ví', en: 'Scan QR code from Banking App & Wallet' },
        //     id_service_apply: [new Types.ObjectId('6321598ea6c81260452bf4f5'), new Types.ObjectId('63215877a6c81260452bf4f0'), new Types.ObjectId('654dd5598b3f1a21b7011e3f'), new Types.ObjectId('64be251b177d3dd356d5eae1') ],
        //     allow_adding_card: false,
        //     is_activated: true,
        //     advertisement: {
        //       title: {
        //         vi: 'Nhập "VNPGUVI25" giảm ngay 10% tối đa 25K',
        //         en: 'Get 10%off max'
        //       },
        //       link: '',
        //       type_link: TYPE_LINK_ADVERTISEMENT.in_app,
        //       id_promotion: new Types.ObjectId('676e4edc437dc443413075bb')
        //     }
        //   },
        //   {
        //     title: { vi: 'ATM (Thẻ nội địa)', en: 'ATM (Domestic card)' },
        //     icon: 'IconATM',
        //     titleIcon: 'IconATM',
        //     method: 'vnbank',
        //     id_service_apply: [new Types.ObjectId('6321598ea6c81260452bf4f5'), new Types.ObjectId('63215877a6c81260452bf4f0'), new Types.ObjectId('654dd5598b3f1a21b7011e3f'), new Types.ObjectId('64be251b177d3dd356d5eae1') ],
        //     allow_adding_card: true,
        //     is_activated: true,
        //     advertisement: null,
        //   },
        //   {
        //     title: { vi: 'Thẻ Quốc tế', en: 'International card' },
        //     icon: 'IconIntcard',
        //     titleIcon: 'IconIntcard',
        //     method: 'intcard',
        //     id_service_apply: [new Types.ObjectId('6321598ea6c81260452bf4f5'), new Types.ObjectId('63215877a6c81260452bf4f0'), new Types.ObjectId('654dd5598b3f1a21b7011e3f'), new Types.ObjectId('64be251b177d3dd356d5eae1') ],
        //     allow_adding_card: true,
        //     is_activated: true,
        //     advertisement: null,
        //   },
        // ],
          otp_setting_in_30days: 20
        }
      })

      console.log('migrate customer setting done')

    }
    catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    }
  }

  async updateGroupOrderAndOrder() {
    try {
      const getGroupOrder = await this.groupOrderModel.find(
        {
          $and: [
            { "code_promotion": { $exists: true } },
            { "code_promotion": { $ne: null } }
          ]
        });
      for (const item of getGroupOrder) {
        console.log(item.code_promotion["_id"], 'getGroupOrder');

        const getPromotion = await this.promotionModel.findById(item["code_promotion._id"])
        if (getPromotion) {
          item.code_promotion["_id"] = getPromotion._id;
          await item.save();
        }
      }

      const getOrder = await this.orderModel.find({
        $and: [
          { "code_promotion": { $exists: true } },
          { "code_promotion": { $ne: null } }
        ]
      });
      for (const item of getOrder) {
        console.log(item.code_promotion["_id"], 'getOrder');

        const getPromotion = await this.promotionModel.findById(item["code_promotion._id"])
        if (getPromotion) {
          item.code_promotion["_id"] = getPromotion._id;
          await item.save();

        }
      }
    }
    catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    }
  }

  async updateInfoTestCollaborator() {
    try {
      await this.infoTestCollaboratorModel.updateMany({
        $set: { is_pass: false }
      })
      const getInfoTest = await this.infoTestCollaboratorModel.find()
        .sort({ date_create: -1 })
        .populate({ path: 'id_training_lesson' })
      console.log('test ', getInfoTest);

      for (let info of getInfoTest) {
        if (info.id_training_lesson) {
          // if (info.correct_answers >= Number(info.id_training_lesson["total_correct_exam_pass"]) || (Number(info.id_training_lesson["total_correct_exam_pass"]) >= Number(info.correct_answers) && Number(info.total_answers / info.correct_answers) >= 3 / 4)) {
          //   info.is_pass = true;
          // } else {
          //   info.is_pass = false;
          // }
          if (Number(info.correct_answers / info.total_answers) >= 3 / 4) {

            info.is_pass = true;
          } else {
            info.is_pass = false;

          }
        }
        await info.save();
      }
    }
    catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    }
  }

  async changePhoneCollaborator(phone, newPhone) {
    try {
      const findUserByPhone = await this.collaboratorModel.findOne({ phone: phone });
      // if(!findUserByPhone) console.log();
      if (findUserByPhone) {
        findUserByPhone.phone = newPhone;
        await findUserByPhone.save();


        const findOrder = await this.orderModel.find({ id_collaborator: findUserByPhone._id });
        const findGroupOrder = await this.groupOrderModel.find({ id_collaborator: findUserByPhone._id });
        const findInfoTest = await this.infoTestCollaboratorModel.find({ id_collaborator: findUserByPhone._id })
        for (let i = 0; i < findOrder.length; i++) {
          findOrder[i].phone_collaborator = newPhone;
          await findOrder[i].save();
        }
        console.log(findGroupOrder, 'findGroupOrder');

        for (let y = 0; y < findGroupOrder.length; y++) {
          findGroupOrder[y].phone_collaborator = newPhone;
          console.log(findGroupOrder[y].phone_collaborator, 'sss');

          await findGroupOrder[y].save();
        }
        for (let z = 0; z < findInfoTest.length; z++) {
          findInfoTest[z].phone_collaborator = newPhone;
          await findInfoTest[z].save();
        }
      }
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    }
  }

  async updateCustomerRequest() {
    try {
      const getCustomerRequest = await this.customerRequestModel.find();
      for (const item of getCustomerRequest) {
        if (item.status === "done") {
          const findHistoryActivity = await this.historyActivityModel.findOne({ type: "admin_change_status_customer_request", id_customer_request: item._id })
          const findUserSystem = await this.userSystemRepositoryService.findOneById(findHistoryActivity.id_admin_action);
          if (!findHistoryActivity) continue;
          item.id_admin = findHistoryActivity.id_admin_action;
          item.full_name_admin = findUserSystem?.full_name || "";
          item.date_admin_contact_create = findHistoryActivity.date_create;
          item.save();
        }
      }
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    }
  }

  async updateWalletCollaborator(arrCollaborator) {
    try {
      for (const idItem of arrCollaborator) {
        const getData = await this.collaboratorModel.findById(idItem);
        if (getData) {

          const previousBalance = {
            gift_remainder: getData.gift_remainder,
            remainder: getData.remainder,
            collaborator_wallet: getData.collaborator_wallet,
            work_wallet: getData.work_wallet,
          }

          const tempMoney = getData.work_wallet;
          getData.work_wallet = 0;
          getData.collaborator_wallet += tempMoney;

          const tempMoneyRemainder = getData.remainder;
          getData.remainder = 0;
          getData.gift_remainder += tempMoneyRemainder;


          console.log(getData, 'getData');

          console.log(getData.work_wallet, 'work_wallet');
          console.log(getData.collaborator_wallet, 'collaborator_wallet');

          const temp = {
            en: `Change money from work wallet to collaborator wallet`,
            vi: `Chuyển đổi tiền từ ví công việc sang ví CTV`
          }
          const formatMoney = await this.generalHandleService.formatMoney(tempMoney);
          const description = {
            vi: `Chuyển đổi tiền từ ví công việc sang ví CTV`,
            en: `Change money from work wallet to collaborator wallet`
          }
          const temp2 = `Chuyển đổi tiền từ ví công việc sang ví CTV`
          const newItem = new this.historyActivityModel({
            id_collaborator: getData._id,
            title: temp,
            title_admin: temp2,
            body: description,
            type: "auto_change_money_from_work_to_collaborator",
            date_create: new Date(Date.now()).toISOString(),
            id_order: null,
            id_group_order: null,
            value: tempMoney,
            current_remainder: getData.remainder,
            status_current_remainder: (previousBalance.remainder < getData.remainder) ?
              "up" : (previousBalance.remainder > getData.remainder) ? "down" : "none",
            current_gift_remainder: getData.gift_remainder,
            status_current_gift_remainder: (previousBalance.gift_remainder < getData.gift_remainder) ?
              "up" : (previousBalance.gift_remainder > getData.gift_remainder) ? "down" : "none",

            current_collaborator_wallet: getData.collaborator_wallet,
            status_current_collaborator_wallet: (previousBalance.collaborator_wallet < getData.collaborator_wallet) ?
              "up" : (previousBalance.collaborator_wallet > getData.collaborator_wallet) ? "down" : "none",
            current_work_wallet: getData.work_wallet,
            status_current_work_wallet: (previousBalance.work_wallet < getData.work_wallet) ?
              "up" : (previousBalance.work_wallet > getData.work_wallet) ? "down" : "none",

          })

          console.log(newItem, 'newItem');

          await getData.save();
          await newItem.save();


        }
      }
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    }
  }

  async autoBalanceMoneyWallet(arrCollaborator) {
    try {
      for (const idItem of arrCollaborator) {
        const getData = await this.collaboratorModel.findById(idItem);
        if (getData) {

          const previousBalance = {
            gift_remainder: getData.gift_remainder,
            remainder: getData.remainder,
            collaborator_wallet: getData.collaborator_wallet,
            work_wallet: getData.work_wallet,
          }

          const tempMoney = getData.work_wallet;
          getData.work_wallet = 0;
          getData.collaborator_wallet += tempMoney;

          const tempMoneyRemainder = getData.remainder;
          getData.remainder = 0;
          getData.gift_remainder += tempMoneyRemainder;


          console.log(getData, 'getData');

          console.log(getData.work_wallet, 'work_wallet');
          console.log(getData.collaborator_wallet, 'collaborator_wallet');

          const temp = {
            en: `Change money from collaborator wallet to top up wallet`,
            vi: `Chuyển đổi tiền từ ví CTV sang ví nạp`
          }
          const formatMoney = await this.generalHandleService.formatMoney(tempMoney);
          const description = {
            vi: `Chuyển đổi tiền từ ví CTV sang ví nạp`,
            en: `Change money from collaborator wallet to top up wallet`
          }
          const temp2 = `Chuyển đổi tiền từ ví CTV sang ví nạp`
          const newItem = new this.historyActivityModel({
            id_collaborator: getData._id,
            title: temp,
            title_admin: temp2,
            body: description,
            type: "auto_change_money_from_work_to_collaborator",
            date_create: new Date(Date.now()).toISOString(),
            id_order: null,
            id_group_order: null,
            value: Math.abs(tempMoney),
            current_remainder: getData.remainder,
            status_current_remainder: (previousBalance.remainder < getData.remainder) ?
              "up" : (previousBalance.remainder > getData.remainder) ? "down" : "none",
            current_gift_remainder: getData.gift_remainder,
            status_current_gift_remainder: (previousBalance.gift_remainder < getData.gift_remainder) ?
              "up" : (previousBalance.gift_remainder > getData.gift_remainder) ? "down" : "none",

            current_collaborator_wallet: getData.collaborator_wallet,
            status_current_collaborator_wallet: (previousBalance.collaborator_wallet < getData.collaborator_wallet) ?
              "up" : (previousBalance.collaborator_wallet > getData.collaborator_wallet) ? "down" : "none",
            current_work_wallet: getData.work_wallet,
            status_current_work_wallet: (previousBalance.work_wallet < getData.work_wallet) ?
              "up" : (previousBalance.work_wallet > getData.work_wallet) ? "down" : "none",

          })

          console.log(newItem, 'newItem');

          await getData.save();
          await newItem.save();


        }
      }
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    }
  }

  async autoBalanceMoneyWallet2() {
    try {
      const lstCollaborator = await this.collaboratorModel.find({
        collaborator_wallet: { $lt: 0 }
      })
      for (const collaborator of lstCollaborator) {
        // if (getData && getData.collaborator_wallet < 0) {

          const previousBalance = {
            collaborator_wallet: collaborator.collaborator_wallet,
            work_wallet: collaborator.work_wallet
          }

          const tempMoney = previousBalance.collaborator_wallet;
          const remainingBalance = collaborator.work_wallet + collaborator.collaborator_wallet
          // if(remainingBalance >= 0) {
          //   getData.collaborator_wallet = remainingBalance
          //   getData.work_wallet = 0
          // } else {
            collaborator.collaborator_wallet = 0
            collaborator.work_wallet = remainingBalance
          // }


          // console.log(getData, 'getData');

          // console.log(getData.work_wallet, 'work_wallet');
          // console.log(getData.collaborator_wallet, 'collaborator_wallet');

          const temp = {
            en: `Change money from top up wallet to collaborator wallet`,
            vi: `Chuyển đổi tiền từ ví nạp sang ví CTV`
          }
          const description = {
            vi: `Chuyển đổi tiền từ ví nạp sang ví CTV`,
            en: `Change money from top up wallet to collaborator wallet`
          }
          const temp2 = `Chuyển đổi tiền từ ví nạp sang ví CTV`
          const newItem = new this.historyActivityModel({
            id_collaborator: collaborator._id,
            title: temp,
            title_admin: temp2,
            body: description,
            type: "system_change_money_from_work_to_collaborator",
            date_create: new Date(Date.now()).toISOString(),
            id_order: null,
            id_group_order: null,
            value: Math.abs(tempMoney),
            current_collaborator_wallet: collaborator.collaborator_wallet,
            status_current_collaborator_wallet: (previousBalance.collaborator_wallet < collaborator.collaborator_wallet) ?
              "up" : (previousBalance.collaborator_wallet > collaborator.collaborator_wallet) ? "down" : "none",
            current_work_wallet: collaborator.work_wallet,
            status_current_work_wallet: (previousBalance.work_wallet < collaborator.work_wallet) ?
              "up" : (previousBalance.work_wallet > collaborator.work_wallet) ? "down" : "none",

          })

          console.log('tempMoney', tempMoney);

          await collaborator.save();
          await newItem.save();

        // }

      }

      console.log('autoBalanceMoneyWallet2 is done');
      return true
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    }
  }

  async fixError() {
    try {


      const arrCollaborator = await this.collaboratorModel.find({ is_verify: true, is_active: true, is_locked: false, is_delete: false });
      console.log(arrCollaborator.length, 'arrCollaborator.length');


      for (let y = 0; y < arrCollaborator.length; y++) {

        // console.log(arrCollaborator[y]._id, 'arrCollaborator[y]._id');

        if (arrCollaborator[y]._id.toString() == "652e9134c438bab0e3e27571"

        ) {

          // await this.timDonDaBiHuy(arrCollaborator[y]._id);

          await this.tinhLaiTienTuLichSu(arrCollaborator[y]._id, y);
        }
      }



    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    }
  }

  async timDonDaBiHuy(idCollaborator) {
    try {
      const findCollaborator = await this.collaboratorModel.findById(idCollaborator);
      if (!findCollaborator) {
        console.log(idCollaborator, " - CTV k ton tai");
        return true;
      }

      const query = {
        $and: [
          {
            $or: [{ type: "collaborator_penalty_cancel_job" }]
          },
          { id_collaborator: findCollaborator._id },
          { value: { $ne: 0 } },
          { date_create: { $gte: "2023-10-28T17:00:00.000Z" } },
          { date_create: { $lte: "2023-11-03T17:00:00.000Z" } }
        ]
      }
      const getHistory = await this.historyActivityModel.find(query).sort({ date_create: 1 }).limit(1)

      if (getHistory.length > 0) {
        console.log(findCollaborator._id, " - ", findCollaborator.full_name);
      }

    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    }
  }



  async tinhLaiTienTuLichSu(idCollaborator, index) {
    const findCollaborator = await this.collaboratorModel.findById(idCollaborator);
    if (!findCollaborator) {
      console.log(idCollaborator, " - CTV k ton tai");
      return true;
    }

    const exclude = HISTORY_ACTIVITY_WALLET

    const query = {
      $and: [
        {
          $or: exclude
        },
        { id_collaborator: findCollaborator._id },
        { value: { $ne: 0 } },
        { date_create: { $gte: "2023-10-28T17:00:00.000Z" } }
      ]
    }

    const checkHave = await this.historyActivityModel.findOne({ id_collaborator: idCollaborator, type: "collaborator_penalty_cancel_job" }).sort({ date_create: -1 });


    if (!checkHave) return true;


    const getHistory = await this.historyActivityModel.find(query).sort({ date_create: 1 }).skip(1)

    // const getHistory = await this.historyActivityModel.find(query).sort({date_create: 1}).skip(0).limit(200);

    const getCurrent = await this.historyActivityModel.find(query).sort({ date_create: 1 }).skip(0).limit(1);
    // const getCurrent = [];
    // let position = 0 ; 
    // let findPoint = false;

    // while(findPoint === true || position < getHistory.length - 1) {
    //   if(getHistory[position].type === "collaborator_penalty_cancel_job") {
    //     findPoint = true;
    //     if(getHistory[position].status_current_work_wallet) {
    //       findCollaborator.work_wallet = getHistory[position].current_work_wallet;
    //       findCollaborator.collaborator_wallet = getHistory[position].current_collaborator_wallet;
    //     } else {
    //       findCollaborator.work_wallet = getHistory[position].current_remainder;
    //       findCollaborator.work_wallet = getHistory[position].current_gift_remainder;
    //     }
    //   } else {
    //     position++;
    //   }
    // }
    // console.log(getCurrent, 'getCurrent');

    let collaborator = {
      work_wallet: (getCurrent.length === 0) ? 0 : (getCurrent[0].current_work_wallet && getCurrent[0].current_work_wallet !== 0) ? getCurrent[0].current_work_wallet : getCurrent[0].current_remainder,
      // collaborator_wallet: (getCurrent.length > 0) ? getCurrent[0].current_gift_remainder : 0
      collaborator_wallet: (getCurrent.length === 0) ? 0 : (getCurrent[0].current_collaborator_wallet && getCurrent[0].current_collaborator_wallet !== 0) ? getCurrent[0].current_collaborator_wallet : getCurrent[0].current_gift_remainder
    }

    // console.log(collaborator, 'collaborator');


    for (let i = 0; i < getHistory.length; i++) {
      collaborator = await this.tinhLaiTienTrongVi(collaborator, getHistory[i])

      // getHistory[i].current_collaborator_wallet = collaborator.collaborator_wallet;
      // getHistory[i].current_work_wallet = collaborator.work_wallet
      // getHistory[i].save();

      console.log(getHistory[i].title.vi, "");
      console.log(collaborator.work_wallet, "collaborator.work_wallet");
      console.log(collaborator.collaborator_wallet, "collaborator.collaborator_wallet");
      console.log("---------------------------");

    }

    // findCollaborator.collaborator_wallet = collaborator.collaborator_wallet
    // findCollaborator.work_wallet = collaborator.work_wallet
    // findCollaborator.save();

    // // check log co dung hay k
    // if(collaborator.work_wallet !== getHistory[getHistory.length - 1].current_remainder && collaborator.collaborator_wallet !== getHistory[getHistory.length - 1].current_gift_remainder) {
    //   console.log(findCollaborator._id, " - false");
    //   console.log(collaborator.work_wallet, "collaborator.work_wallet");
    //   console.log(collaborator.collaborator_wallet, "collaborator.collaborator_wallet");
    //   console.log("---------------------------");
    // } else {
    //   console.log(findCollaborator._id, " - true");
    //   console.log("---------------------------");
    // }

    // console.log(findCollaborator.work_wallet, 'findCollaborator.work_wallet');
    // console.log(findCollaborator.collaborator_wallet, 'findCollaborator.collaborator_wallet');
    // console.log(collaborator.work_wallet, 'collaborator.work_wallet');
    // console.log(collaborator.collaborator_wallet, 'collaborator.collaborator_wallet');
    // console.log(collaborator.work_wallet !== findCollaborator.work_wallet, 'sss');




    // check vi co dung hay k
    if (getHistory.length > 0) {
      if (collaborator.work_wallet !== findCollaborator.work_wallet || collaborator.collaborator_wallet !== findCollaborator.collaborator_wallet) {
        if ((collaborator.work_wallet + collaborator.collaborator_wallet) === (findCollaborator.work_wallet + findCollaborator.collaborator_wallet)) {
          console.log(findCollaborator._id, " - dung tien nhung sai vi");
          console.log(collaborator.work_wallet, "collaborator.work_wallet");
          console.log(collaborator.collaborator_wallet, "collaborator.collaborator_wallet");
          console.log("---------------------------");
        } else {
          const logWallet = collaborator.work_wallet + collaborator.collaborator_wallet
          const currentWallet = findCollaborator.work_wallet + findCollaborator.collaborator_wallet
          console.log(`${findCollaborator._id.toString()} ${findCollaborator.full_name.toString()} : ${logWallet} - ${currentWallet} = lech ${logWallet - currentWallet} `);
          console.log(logWallet - currentWallet, "logWallet - currentWallet");
          console.log(collaborator.work_wallet, "collaborator.work_wallet");
          console.log(collaborator.collaborator_wallet, "collaborator.collaborator_wallet");
          console.log("---------------------------");
        }
      } else {
        console.log(findCollaborator._id, " - true 1");
        console.log("---------------------------");
      }
    } else {
      console.log(findCollaborator._id, " - true 2");
      console.log("---------------------------");
    }




    // for(let i = 0 ; i < getHistory.length ; i++) {
    //   if()
    // }

    return true;

    // const arrOrder = await this.orderModel.find({status: ["confirm", "doing", "done"], id_collaborator: findCollaborator._id});
    // const arrPunish = await this.punishModel.find({status: ["done", "refund"], id_collaborator: findCollaborator._id});
    // const arrTraisition = await this.transitionCollaboratorModel.find({status: "done", id_collaborator: findCollaborator._id})
    // for(const item of arrOrder) {
    //   findCollaborator.work_wallet -= item.pending_money + item.platform_fee;
    //   if(item.status === "done") findCollaborator.collaborator_wallet = 
    // }

    // for(const item of arrPunish) {

    // }

    // for(const item of arrTraisition) {

    // }
  }


  async tinhLaiTienTrongVi(collaborator, history: HistoryActivityDocument, maths?) {
    try {
      const TYPE_DONE_ORDER = [
        "receive_done_order", "collaborator_receive_refund_money", "verify_top_up"
      ]
      const dayDeployNewWallet = new Date("2023-10-28T17:00:00.000Z").getTime()
      const dayHistory = new Date(history.date_create).getTime();

      const math = (maths) ? maths : (history.value > 0) ? "+" : "-"

      // console.log(math, 'math');
      // console.log(history.value, 'history.value');
      // console.log(dayDeployNewWallet, 'dayDeployNewWallet');
      // console.log(dayHistory, 'dayHistory');




      if (math === "-") {
        if (dayHistory < dayDeployNewWallet) {
          const temp = collaborator.collaborator_wallet - Math.abs(history.value)
          // console.log(temp, 'temp');

          if (temp < 0) {
            collaborator.work_wallet -= Math.abs(temp)
            collaborator.collaborator_wallet = 0;
          } else {
            collaborator.collaborator_wallet -= Math.abs(history.value)
          }
        } else {
          if (history.type === "minus_platform_fee") {
            // const checkOrderBySchedule = await this.orderModel.findById(history.id_order)
            const checkSecondOrder = history.body.vi.split(".");
            if (checkSecondOrder[1] !== "001") {
              collaborator.collaborator_wallet -= Math.abs(history.value)
            } else {
              collaborator.work_wallet -= Math.abs(history.value)
            }
          } else {
            collaborator.work_wallet -= Math.abs(history.value)
          }
        }
      } else {
        if (dayHistory < dayDeployNewWallet) {
          if (TYPE_DONE_ORDER.findIndex(x => x === history.type) > -1) {
            collaborator.work_wallet += Math.abs(history.value)
          } else {
            collaborator.collaborator_wallet += Math.abs(history.value)
          }
        } else {
          if (history.type === "collaborator_change_money_wallet") {
            collaborator.work_wallet += Math.abs(history.value)
            collaborator.collaborator_wallet -= Math.abs(history.value)
          } else if (history.type === "verify_top_up" || history.type === "refund_platform_fee_cancel_order" || history.type === "admin_cancel_punish" ||
            history.type === "collaborator_refund_platform_fee") {
            collaborator.work_wallet += Math.abs(history.value)
          } else {
            collaborator.collaborator_wallet += Math.abs(history.value)
          }
        }
      }

      return collaborator;





    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    }
  }



  async updateDate() {

    // const Holiday = [
    //   {
    //     time_start: "2023-12-31T17:00:00.000Z",
    //     time_end: "2024-01-01T17:00:00.000Z",
    //     price_type_increase: "percent_accumulate",
    //     price: 50
    //   },
    //   {
    //     time_start: "2024-04-29T17:00:00.000Z",
    //     time_end: "2024-04-30T17:00:00.000Z",
    //     price_type_increase: "percent_accumulate",
    //     price: 100
    //   },
    //   {
    //     time_start: "2024-04-30T17:00:00.000Z",
    //     time_end: "2024-05-01T17:00:00.000Z",
    //     price_type_increase: "percent_accumulate",
    //     price: 200
    //   },
    //   {
    //     time_start: "2024-02-08T17:00:00.000Z",
    //     time_end: "2024-02-09T17:00:00.000Z",
    //     price_type_increase: "percent_accumulate",
    //     price: 200
    //   },
    //   {
    //     time_start: "2024-02-01T17:00:00.000Z",
    //     time_end: "2024-02-07T17:00:00.000Z",
    //     price_type_increase: "percent_accumulate",
    //     price: 120
    //   },
    //   {
    //     time_start: "2024-02-07T17:00:00.000Z",
    //     time_end: "2024-02-14T17:00:00.000Z",
    //     price_type_increase: "percent_accumulate",
    //     price: 300
    //   },
    // ]

    const Holiday = [
      {
        time_start: "2023-12-31T17:00:00.000Z",
        time_end: "2024-01-01T17:00:00.000Z",
        price_type_increase: "percent_accumulate",
        price: 50
      },
      {
        time_start: "2024-04-29T17:00:00.000Z",
        time_end: "2024-04-30T16:59:59.999Z",
        price_type_increase: "percent_accumulate",
        price: 100
      },
      {
        time_start: "2024-04-30T17:00:00.000Z",
        time_end: "2024-05-01T16:59:59.999Z",
        price_type_increase: "percent_accumulate",
        price: 100
      },
      {
        time_start: "2024-02-01T17:00:00.000Z",
        time_end: "2024-02-02T16:59:59.999Z",
        price_type_increase: "percent_accumulate",
        price: 20
      },
      {
        time_start: "2024-02-02T17:00:00.000Z",
        time_end: "2024-02-03T16:59:59.999Z",
        price_type_increase: "percent_accumulate",
        price: 20
      },
      {
        time_start: "2024-02-03T17:00:00.000Z",
        time_end: "2024-02-04T16:59:59.999Z",
        price_type_increase: "percent_accumulate",
        price: 20
      },
      {
        time_start: "2024-02-04T17:00:00.000Z",
        time_end: "2024-02-05T16:59:59.999Z",
        price_type_increase: "percent_accumulate",
        price: 20
      },
      {
        time_start: "2024-02-05T17:00:00.000Z",
        time_end: "2024-02-06T16:59:59.999Z",
        price_type_increase: "percent_accumulate",
        price: 20
      },
      {
        time_start: "2024-02-06T17:00:00.000Z",
        time_end: "2024-02-07T16:59:59.999Z",
        price_type_increase: "percent_accumulate",
        price: 20
      },
      {
        time_start: "2024-02-12T17:00:00.000Z",
        time_end: "2024-02-13T16:59:59.999Z",
        price_type_increase: "percent_accumulate",
        price: 50,
      },
      {
        time_start: "2024-02-13T17:00:00.000Z",
        time_end: "2024-02-14T16:59:59.999Z",
        price_type_increase: "percent_accumulate",
        price: 50,
      },
      {
        time_start: "2024-02-14T17:00:00.000Z",
        time_end: "2024-02-15T16:59:59.999Z",
        price_type_increase: "percent_accumulate",
        price: 50,
      },
      {
        time_start: "2024-02-15T17:00:00.000Z",
        time_end: "2024-02-16T16:59:59.999Z",
        price_type_increase: "percent_accumulate",
        price: 20
      },
      {
        time_start: "2024-02-16T17:00:00.000Z",
        time_end: "2024-02-17T16:59:59.999Z",
        price_type_increase: "percent_accumulate",
        price: 20
      },
      {
        time_start: "2024-02-17T17:00:00.000Z",
        time_end: "2024-02-18T16:59:59.999Z",
        price_type_increase: "percent_accumulate",
        price: 20
      },
      {
        time_start: "2024-02-18T17:00:00.000Z",
        time_end: "2024-02-19T16:59:59.999Z",
        price_type_increase: "percent_accumulate",
        price: 20
      },
      {
        time_start: "2024-02-07T17:00:00.000Z",
        time_end: "2024-02-08T16:59:59.999Z",
        price_type_increase: "percent_accumulate",
        price: 100
      },
      {
        time_start: "2024-02-08T17:00:00.000Z",
        time_end: "2024-02-09T16:59:59.999Z",
        price_type_increase: "percent_accumulate",
        price: 100
      },
      {
        time_start: "2024-02-09T17:00:00.000Z",
        time_end: "2024-02-10T16:59:59.999Z",
        price_type_increase: "percent_accumulate",
        price: 100
      },
      {
        time_start: "2024-02-10T17:00:00.000Z",
        time_end: "2024-02-11T16:59:59.999Z",
        price_type_increase: "percent_accumulate",
        price: 100
      },
      {
        time_start: "2024-02-11T17:00:00.000Z",
        time_end: "2024-02-12T16:59:59.999Z",
        price_type_increase: "percent_accumulate",
        price: 100
      }
    ]

    const findExtend = await this.extendOptionalModel.find({
      $or: [
        { id_optional_service: "637487ad7ae89c47997ee131" },
        { id_optional_service: "63204b79e59ef92c13e57fd0" }
      ]
    })




    for (let i = 0; i < findExtend.length; i++) {
      console.log(findExtend[i]._id);

      for (let y = 0; y < findExtend[i].area_fee.length; y++) {
        findExtend[i].area_fee[y].price_option_holiday = Holiday
      }
      findExtend[i].save();
    }

  }



  async topUpFromCTVWalletToWorkWallet(idCollaborator, money) {
    try {
      const findCollaborator = await this.collaboratorModel.findById(idCollaborator)
      // if(!findCollaborator) {}

      const previousBalance = {
        work_wallet: findCollaborator.work_wallet,
        collaborator_wallet: findCollaborator.collaborator_wallet,
      }


      findCollaborator.collaborator_wallet -= money;
      findCollaborator.work_wallet += money;


      await findCollaborator.save();

      const formatMoney = await this.generalHandleService.formatMoney(money);
      const title = {
        vi: `Bạn đã chuyển thành công ${formatMoney} sang ví công việc thành công.`,
        en: `The transfer of ${formatMoney} to the work wallet was successful.`
      }
      const body = {
        vi: `Bạn đã chuyển thành công ${formatMoney} sang ví công việc thành công.\nBạn có thể kiểm tra lại trong phần lịch sử tài khoản bạn nhé!!!`,
        en: `The transfer of ${formatMoney} to the work wallet was successful.
          You can check it again in the account history section.`
      }
      // const getCollaborator = await this.collaboratorModel.findById(idCollaborator);
      const title_admin = `${findCollaborator._id} đã chuyển ${formatMoney} sang ví công việc`;
      const newItem = new this.historyActivityModel({
        id_collaborator: idCollaborator,
        title: title,
        title_admin: title_admin,
        body: body,
        type: "collaborator_change_money_wallet",
        date_create: new Date(Date.now()).toISOString(),
        value: money,
        current_work_wallet: Number(findCollaborator.work_wallet),
        status_current_work_wallet: (previousBalance.work_wallet < findCollaborator.work_wallet) ?
          "up" : (previousBalance.work_wallet > findCollaborator.work_wallet) ? "down" : "none",
        current_collaborator_wallet: Number(findCollaborator.collaborator_wallet),
        status_current_collaborator_wallet: (previousBalance.collaborator_wallet < Number(findCollaborator.collaborator_wallet)) ?
          "up" : (previousBalance.collaborator_wallet > Number(findCollaborator.collaborator_wallet)) ? "down" : "none",
      })

      console.log(newItem, 'historyActivityModel');
      console.log(findCollaborator, 'findCollaborator');


      await newItem.save();

      const payloadNotification = {
        title: title,
        description: body,
        user_object: "collaborator",
        id_collaborator: idCollaborator,
        type_notification: "activity",
      }

      console.log(newItem, 'historyActivityModel');

      // await newItem.save();
      // this.notificationSystemService.newActivity(payloadNotification);
      // const arrDeviceToken = await this.deviceTokenModel.find({ user_id: idCollaborator, user_object: "collaborator" })
      // if (arrDeviceToken.length > 0) {
      //     const payload = {
      //         title: title.vi,
      //         body: body.vi,
      //         token: [arrDeviceToken[0].token],
      //         data: { link: "guvipartner://" }
      //     }
      //     for (let i = 1; i < arrDeviceToken.length; i++) {
      //         payload.token.push(arrDeviceToken[i].token)
      //     }
      //     this.notificationService.send(payload)
      // }

      return true;
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    }
  }


  async mergeTransition() {
    try {
      await this.transactionModel.deleteMany();

      const findTransitionCustomer = await this.transitionCustomerModel.find();
      const findTransitionCollaborator = await this.transitionCollaboratorModel.find();
      const findPunish = await this.punishModel.find();




      // convert data TransitionCollaborator
      let index = 0;
      for (const item of findTransitionCollaborator) {
        const kind_transfer = (item.type_transfer === "top_up") ? "income" : "expense";

        const methodTransfer = (item.method_transfer === "admin_action") ? "bank" : item.method_transfer;
        const findCashBook = await this.cashBookModel.findOne({ type_bank: methodTransfer });
        if (findCashBook && item.status === "done") {
          findCashBook.money = (kind_transfer === "income") ? findCashBook.money + item.money : findCashBook.money - item.money;
          findCashBook.save();
        }
        const payload = {
          id_collaborator: item.id_collaborator,
          // id_customer: item.id_customer,
          subject: "collaborator",
          date_create: item.date_create,
          // id_admin_action: item.ad,
          id_admin_verify: item.id_admin_verify,
          // title: {},
          money: item.money,
          transfer_note: item.transfer_note,
          kind_transfer: kind_transfer,
          type_transfer: item.type_transfer,
          type_bank: methodTransfer,
          id_cash_book: findCashBook._id,
          status: (item.status === "transfered") ? "transferred" : item.status,
          // vnpay_transfer: null,
          momo_transfer: item.momo_payment_method,
          // viettel_money_transfer: null,
          // bank_transfer: null,
          id_view: null,
          // id_reason_punish: null
        }

        const newTransiton = new this.transactionModel(payload);

        newTransiton.save();
        console.log(index++, "collaborator");

      }



      // convert data TransitionCustomer
      for (const item of findTransitionCustomer) {
        const kind_transfer = (item.type_transfer === "top_up") ? "income" : "expense";

        const methodTransfer = (item.method_transfer === "admin_action") ? "bank" : item.method_transfer;
        const findCashBook = await this.cashBookModel.findOne({ type_bank: methodTransfer });
        if (findCashBook && item.status === "done") {
          findCashBook.money = (kind_transfer === "income") ? findCashBook.money + item.money : findCashBook.money - item.money;
          findCashBook.save();
        }
        const payload = {
          // id_collaborator: item.id_collaborator,
          id_customer: item.id_customer,
          subject: "customer",
          date_create: item.date_create,
          // id_admin_action: item.ad,
          id_admin_verify: item.id_admin_verify,
          // title: {},
          money: item.money,
          transfer_note: item.transfer_note,
          kind_transfer: kind_transfer,
          type_transfer: item.type_transfer,
          type_bank: methodTransfer,
          id_cash_book: findCashBook._id,
          status: (item.status === "transfered") ? "transferred" : item.status,
          vnpay_transfer: item.vnp_payload,
          momo_transfer: item.momo_payment_method,
          // viettel_money_transfer: null,
          // bank_transfer: null,
          id_view: null,
          // id_reason_punish: null
        }

        const newTransiton = new this.transactionModel(payload);
        newTransiton.save();
      }


      console.log("done");




    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  async addLimitAdressToCustomerSetting() {
    await this.customerSettingModel.updateMany({}, { $set: { limit_address: 15 } });
  }
  async addMinMoneyToCustomerSetting() {

    await this.customerSettingModel.updateMany({}, { $set: { min_money: 10000 } });
  }
  async addMinMoneyBankToCollaboratorSetting() {
    await this.collaboratorSettingModel.updateMany({}, { $set: { min_money_bank: 300000 } });
  }
  async addMinMoneyMomoToCollaboratorSetting() {
    await this.collaboratorSettingModel.updateMany({}, { $set: { min_money_momo: 100000 } });
  }
  async addMomoToCustomer() {
    await this.customerModel.updateMany({}, { $set: { token_payment_momo: null, is_link_momo: false } });

    await this.customerModel.updateMany({}, { $set: { session_socket: null, is_online: false } });
    await this.collaboratorModel.updateMany({}, { $set: { session_socket: null, is_online: false } });
    await this.userSystemModel.updateMany({}, { $set: { session_socket: null, is_online: false } });

    await this.notificationModel.updateMany({}, { $set: { status_send_socket: "create", status_send_firebase: "none", push_time: null } });
  }
  async addExamtestsSetting() {
    await this.trainingLessonModel.updateMany({ type_service_exam: { $exists: false } }, { $set: { type_service_exam: ["Dịch vụ dọn dẹp", "Dịch vụ máy lạnh", "Dịch vụ rèm - thảm - sofa"] } });

  }

  async updateHistoryActivityAffiliate() {
    try {
      await this.historyActivityModel.updateMany({
        status_current_a_pay: { $exists: false },
        current_a_pay: { $exists: false },
      }, {
        $set: {
          status_current_a_pay: 'none',
          current_a_pay: 0,
        }
      })

    } catch (err) {
      throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
    }
  }

  async updateHistoryAddPoint() {
    try {
      // const result = await this.customerSystemService.getListCustomerHaveIdInviter()

      // if (result.listOrder.length > 0 && result.listCustomer.length > 0 && (result.lstInviter.length > 0 || result.listCollaborator.length > 0)) {

      //   for (let i = 0; i < result.listOrder.length;i++) {
      //     const customer = result.listCustomer.find((e) => e._id.toString() === result.listOrder[i].id_customer.toString())
      //     if (customer) {
      //       const dateCreate = new Date(new Date(result.listOrder[i].end_date_work).getTime() + 300).toISOString()
      //       const inviter = result.lstInviter.find((e) => e._id.toString() === customer.id_inviter.toString()) 
      //       const collaborator = result.listCollaborator.find((e) => e._id.toString() === customer.id_inviter.toString())

      //       if (inviter) {
      //         let previousBalancePayPoints = {
      //           pay_point: inviter?.pay_point || 0,
      //         }

      //         let subjectAction = {
      //           type: "system"
      //         }

      //         let payloadDependency = {
      //           inviter: null,
      //           customer: customer,
      //           order: result.listOrder[i]
      //         }

      //         payloadDependency.inviter = await this.customerOopSystemService.addPayPoint("vi", REFERRAL_MONEY, inviter._id)

      //         await this.historyActivityOopSystemService.addPayPointsForInviterWhenDoneOrder(subjectAction, payloadDependency, previousBalancePayPoints, REFERRAL_MONEY, true, dateCreate)
      //       }

      //       if (collaborator) {
      //         let previousBalancePayPoints = {
      //           work_wallet: collaborator.work_wallet
      //         }

      //         let subjectAction = {
      //           type: "system"
      //         }

      //         let payloadDependency = {
      //           inviter: null,
      //           customer: customer,
      //           order: result.listOrder[i]
      //         }

      //         payloadDependency.inviter = await this.collaboratorOopSystemService.addPointWallet('vi', collaborator._id, TYPE_WALLET.work_wallet, REFERRAL_MONEY)

      //         await this.historyActivityOopSystemService.addPayPointsForInviterWhenDoneOrder(subjectAction, payloadDependency, previousBalancePayPoints, REFERRAL_MONEY, false, dateCreate)
      //       }
      //     }
      //   }
      // } 

    } catch (err) {
      throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
    }
  }


  async addNewFieldFee() {
    try {
      // await this.serviceModel.updateMany({}, { $set: { value_added_tax: 8 } })
      const newField = [
        {
          $set: {
            subtotal_fee: "$initial_fee"
          }
        },
        {
          $set: {
            shift_income: { $subtract: ["$initial_fee", "$platform_fee"] }
          }
        },
        {
          $set: {
            net_income: { $sum: ["$shift_income", "$tip_collaborator"] }
          }
        },
        {
          $set: {
            total_punish_money: 0
          }
        }
      ]
      // await this.groupOrderModel.updateMany({ shift_income: { $exists: false } }, newField)
      // await this.orderModel.updateMany({ shift_income: { $exists: false } }, newField)

      // await this.groupOrderModel.updateMany({}, newField)
      // await this.orderModel.updateMany({}, newField)


      // await this.groupOrderModel.updateMany({}, {$set: {info_linked_collaborator: []}})
      // await this.orderModel.updateMany({}, {$set: {info_linked_collaborator: []}})


      const newInfoLinked = [
        {
          $set: {
            info_linked_collaborator: [{
              id_collaborator: "$id_collaborator",
              status: "$status",
              // total_punish_money: 0,
              // net_income: 0
            }]
          }
        }
      ]

      // await this.orderModel.updateMany({status: ["cancel", "done", "doing", "confirm"]}, newInfoLinked)
      await this.orderModel.updateMany({ id_group_order: {$in: [new ObjectId('677caca027a46d8b8e9ec681'), new ObjectId('677cacc227a46d8b8e9ee2f1'), new ObjectId('677cace627a46d8b8e9efd72')]} }, newInfoLinked)




      // update gia tinh moi
      // const arrExtend = await this.extendOptionalModel.find()

      // for(let i = 0 ; i < arrExtend.length ; i++) {
      //   const findOptionalService = await this.optionalServiceModel.findById(arrExtend[i].id_optional_service)

      //   if(!findOptionalService) continue;

      //   const findService = await this.serviceModel.findById(findOptionalService.id_service);

      //   if(findService) {
      //     if(findService && (findService.type === "schedule" || findService.type === "loop")) {
      //       for(let y = 0 ; y < arrExtend[i].area_fee.length ; y++) {
      //         if(arrExtend[i].id_optional_service === "63204b79e59ef92c13e57fd0" || arrExtend[i].id_optional_service === "644c7d4339e0ee341ded334a") {
      //           arrExtend[i].platform_fee = 20;
      //           if(arrExtend[i].area_fee[y].area_lv_1 === 1) {
      //             console.log(arrExtend[i].area_fee[y].area_lv_1, 'arrExtend[i].area_fee[y].area_lv_1');
                  
      //             arrExtend[i].area_fee[y].platform_fee = 18
      //           } else {
      //             arrExtend[i].area_fee[y].platform_fee = 20
      //           }
      //         }
      //       }
      //     } else {
      //       arrExtend[i].platform_fee = 20
      //       for(let y = 0 ; y < arrExtend[i].area_fee.length ; y++) {
      //         arrExtend[i].area_fee[y].platform_fee = 18
      //       }
      //     }
      //     await arrExtend[i].save();
      //   }



      // }


      console.log('addNewFieldFee done')

      return true;
    } catch (err) {
      throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
    }
  }

  // async addThumbnailAndIsHideCollaborator() {
  //   try {

  //     const iPageGroupOrder = {
  //       start: 0,
  //       length: 1000
  //     }
  //     const iPageOrder = {
  //       start: 0,
  //       length: 1000
  //     }

  //     let arrOrder = []
  //     let arrGroupOrder = []


  //     await this.extendOptionalModel.updateMany({}, {$set: {is_hide_collaborator: false}})

  //     const arrExtend = await this.extendOptionalModel.find();

  //     for(const item of arrExtend) {
  //       if(item.title.vi === "Ưu tiên người làm yêu thích") {
  //         item.is_hide_collaborator = true;
  //         await item.save();
  //       } else if (item.id_optional_service === "63204b79e59ef92c13e57fd0" || item.id_optional_service === "637487ad7ae89c47997ee131") {
  //         item.is_hide_collaborator = true;
  //         await item.save();
  //       }
  //     }
  //   } catch (err) {
  //     console.log(err, 'err');
      
  //   }
  // }





  async addThumbnailAndIsHideCollaborator() {
    try {


      await this.extendOptionalModel.updateMany({}, {$set: {is_hide_collaborator: false}})

      const arrExtend2 = await this.extendOptionalModel.find();

      for(const item of arrExtend2) {
        if(item.title.vi === "Ưu tiên người làm yêu thích") {
          item.is_hide_collaborator = true;
          await item.save();
        } else if (item.id_optional_service === "63204b79e59ef92c13e57fd0" || item.id_optional_service === "637487ad7ae89c47997ee131") {
          item.is_hide_collaborator = true;
          await item.save();
        }
      }


      await this.groupOrderModel.updateMany({}, { $set: { "service.optional_service.$[].extend_optional.$[].thumbnail": null } })
      await this.groupOrderModel.updateMany({}, { $set: { "service.optional_service.$[].extend_optional.$[].is_hide_collaborator": false } })

      await this.orderModel.updateMany({}, { $set: { "service.optional_service.$[].extend_optional.$[].thumbnail": null } })
      await this.orderModel.updateMany({}, { $set: { "service.optional_service.$[].extend_optional.$[].is_hide_collaborator": false } })

      const iPage = {
        start: 0,
        length: 1000
      }


      const arrExtend = await this.extendOptionalModel.find();


      let totalItem = iPage.length

      do {
        const query = [
          {
            $group: {
              _id: "$service",
              id_order: { $push: "$_id" }
            }
          },
          {
            $facet: {
              totalItem: [
                  {
                      $count: 'count'
                  }
              ],
              data: [{ $skip: iPage.start }, { $limit: iPage.length }],
          },
          }
        ]
        const data = await this.orderModel.aggregate(query)
          
        for (const item of data[0]["data"]) {
          const newPayload = {...item._id}
          for (let i = 0; i < newPayload.optional_service.length; i++) {
            for (let y = 0; y < newPayload.optional_service[i].extend_optional.length; y++) {
              const indexExtend = arrExtend.findIndex(a => a._id.toString() === newPayload.optional_service[i].extend_optional[y]._id.toString())
              if (indexExtend > -1) {
                newPayload.optional_service[i].extend_optional[y].thumbnail = arrExtend[indexExtend].thumbnail
                newPayload.optional_service[i].extend_optional[y].is_hide_collaborator = arrExtend[indexExtend].is_hide_collaborator

              }
            }
          }

          // console.log(item._id, 'item._id');
          console.log(item.id_order, 'item.id_order');
          const result = await this.orderModel.updateMany({ _id: item.id_order }, {service: newPayload})
          console.log(result, 'result');
          
        }

        iPage.start += iPage.length
        totalItem = data[0]["data"].length
        console.log(totalItem, 'totalItem');
        
  
        } while (totalItem === iPage.length)





    } catch (err) {
      throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
    }
  }

  async updatePaymentMethodDefault() {
    try {
      console.log('start update payment method default')
      const getListCustomer = await this.customerModel.find()
      const getCustomerSetting = await this.customerSettingModel.findOne()

      console.log('getCustomerSetting.payment_method', getCustomerSetting.payment_method)

      const lstTask = []
      for(const customer of getListCustomer) {
        const paymentMethod = getCustomerSetting.payment_method[0]
        if(paymentMethod) {
          customer['payment_method_default'] = {}
          customer['payment_method_default'] = {...paymentMethod}

          lstTask.push(customer.save())
        }
      
      }

      await Promise.all(lstTask)


      console.log('updatePaymentMethodDefault done')

      return
    } catch (err) {
      throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
    }
  }

  async updateGroupOrderWithCollaborator() {
    try {
      const getGroupOrder = await this.groupOrderModel.findOne({_id: new ObjectId('67726c8dd84b3feacda20640') })
      const getListOrder = await this.orderModel.find({ id_group_order: new ObjectId('67726c8dd84b3feacda20640') }).sort({date_work: 1}) 
      const getCollaborator = await this.collaboratorModel.findOne({ _id: new ObjectId('664d5ad0fbda78c1b00000a1') })

      getGroupOrder.status = 'confirm'
      getGroupOrder.save()

      const lstTask:any = []
      for(let i = 0; i < getListOrder.length; i++) {
        getListOrder[i].id_collaborator = getCollaborator._id
        getListOrder[i].name_collaborator = getCollaborator.full_name
        getListOrder[i].phone_collaborator = getCollaborator.phone
        getListOrder[i].status = 'confirm'

        lstTask.push(getListOrder[i].save())
      }

      const temp = {
        vi: "QTV đã gán đơn cho CTV",
        en: "Administrator assigned order to collaborator",
      }

      const titleAdmin = `QTV đã gán công việc ${getListOrder[0].id_view} cho ${getCollaborator.full_name}`
      const type = "admin_confirm_order";
      const newItem = new this.historyActivityModel({
        id_collaborator: getCollaborator._id,
        title: temp,
        title_admin: titleAdmin,
        body: temp,
        type: type,
        date_create: new Date(Date.now()).toISOString(),
        id_order: getListOrder[0]._id,
        id_group_order: new ObjectId('67726c8dd84b3feacda20640'),
      })

      console.log(newItem, 'newItem');

      lstTask.push(newItem.save())

      await Promise.all(lstTask)
      console.log('updateGroupOrderWithCollaborator done')

      return true
    } catch (err) {
      throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
    }
  }

  async updateNewFee() {
    try {
      const arrService = await this.serviceModel.find()
      const lstTask:any = []
      for(let i = 0 ; i < arrService.length ; i++) {
          if(arrService[i].type === "schedule" || arrService[i].type === "loop") {
              if(arrService[i].id === "63215877a6c81260452bf4f0" || arrService[i].id === "6321598ea6c81260452bf4f5") {
                arrService[i].area_fee = [
                  {
                    is_active: true,
                    area_lv_1: 79,
                    platform_fee: 20
                  },
                  {
                    is_active: true,
                    area_lv_1: 74,
                    platform_fee: 20
                  },
                  {
                    is_active: true,
                    area_lv_1: 1,
                    platform_fee: 18
                  },
                  {
                    is_active: true,
                    area_lv_1: 48,
                    platform_fee: 20
                  }
                ]
                
              }
          } else {
            arrService[i].area_fee = [
              {
                is_active: true,
                area_lv_1: 79,
                platform_fee: 18
              },
              {
                is_active: true,
                area_lv_1: 74,
                platform_fee: 18
              },
              {
                is_active: true,
                area_lv_1: 1,
                platform_fee: 18
              },
              {
                is_active: true,
                area_lv_1: 48,
                platform_fee: 18
              }
            ]
          }
          lstTask.push(arrService[i].save())
      }
      await Promise.all(lstTask)

      console.log('update new fee done');
      
      
      return true
    } catch (err) {
      throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
    }
  }

  async refundPayPointCustomer() {
    try {

        const getCustomer = await this.customerModel.findOne({ _id: new ObjectId('66ad05fe52a276741cab00c8') })
        const getOrder = await this.orderModel.findOne({_id: new ObjectId('6777c5e8d4494b1fb0018d32')})
        const getGroupOrder = await this.groupOrderModel.findOne({_id: new ObjectId('6777c5e8d4494b1fb0018d1e')})

        const money = getGroupOrder.final_fee

        getCustomer.pay_point += money

        let title = {
            vi: "Hoàn tiền dịch vụ",
            en: "Refund service"
        }
        let titleAdmin = `Hoàn tiền cho khách hàng`
        if(getOrder) {
            if(getOrder.final_fee < money) {
                titleAdmin = `Hoàn tiền dịch vụ ${getGroupOrder.id_view}`
            } else {
                titleAdmin = `Hoàn tiền ca làm ${getOrder.id_view}`
            }
        }

        const newItem = new this.historyActivityModel({
          id_customer: getCustomer._id,
          title: title,
          title_admin: titleAdmin,
          body: title,
          type: 'customer_refund_money',
          date_create: new Date(Date.now()).toISOString(),
          id_order: getOrder._id,
          id_group_order: getGroupOrder._id,
          value: money || 0,
          current_pay_point: getCustomer.pay_point,
          status_current_pay_point: "up",
        })

        await getCustomer.save()
        await newItem.save()

        console.log('refundPayPointCustomer done')

        return true;
    } catch (err) {
        throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
    
    async orderSuccessfully() {
      try {
        const payloadDependency = {
          customer: null,
          group_order: null,
          order: null
        }
        const getOrder = await this.orderModel.findOne({_id: new ObjectId('677803a3d4494b1fb01c0357')})
        const getGroupOrder = await this.groupOrderModel.findOne({_id: new ObjectId('677803a3d4494b1fb01c0343')})
        const getCustomer = await this.customerModel.findOne({_id: new ObjectId('663309496aa3dc5e89bc8720')})

        getOrder.status = STATUS_ORDER.PENDING
        getGroupOrder.status = STATUS_GROUP_ORDER.pending

        await getOrder.save()
        await getGroupOrder.save()

        payloadDependency.customer = getCustomer
        payloadDependency.order = getOrder
        payloadDependency.group_order = getGroupOrder

        const subjectAction = {
          _id: getCustomer._id,
          type: "customer"
        }

        // await this.historyActivityOopSystemService.paymentServiceCustomer(subjectAction, payloadDependency, getGroupOrder.final_fee, getGroupOrder.payment_method)
        // await this.historyActivityOopSystemService.createGroupOrder(subjectAction, payloadDependency)

        console.log('orderSuccessfully done');
        
        return true
      } catch (err) {
    throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

async changStatusOrder() {
  try {
    const getListOrder = await this.orderModel.find({status:'pending', type: {$ne: 'schedule'}})
    const lstIdGroupOrder = getListOrder.map((e) => e.id_group_order)
    const getListGroupOrder = await this.groupOrderModel.updateMany({ _id: {$in: lstIdGroupOrder}, type: {$ne: 'schedule'}}, {status: 'pending'})

    

    console.log('changStatusOrder done');
    
  } catch (err) {
    throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

async addLogForCompletingOrder() {
  try {
    const subjectAction = {
      type: 'collaborator',
      _id: new ObjectId('654e17831b179d42722bfe52')
    }

    const getOrder = await this.orderModel.findOne({_id: new ObjectId('677f406228ef73ddd85a1a18')})
    const getGroupOrder = await this.groupOrderModel.findOne({_id: new ObjectId('677f406228ef73ddd85a19cf')})
    const getCollaborator = await this.collaboratorModel.findOne({_id: new ObjectId('654e17831b179d42722bfe52')})

    const payloadDependency = {
      order: getOrder,
      group_order: getGroupOrder,
      collaborator: null
    }

    
    const money = getOrder.final_fee
    const previousBalance = {
      work_wallet: 416900,
      collaborator_wallet: 1100 
    }
    
    getCollaborator.work_wallet -= money
    payloadDependency.collaborator = getCollaborator

    // await this.collaboratorModel.findByIdAndUpdate(getCollaborator._id, getCollaborator)
    await this.historyActivityOopSystemService.minusPlatformFee(subjectAction, payloadDependency, money, previousBalance)

    console.log('addLogForCompletingOrder done');
    
    return true
  } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async addNewFieldForOrder() {
    try {
      await this.orderModel.updateMany({
        $set: {
          work_shift_deposit: 0,
          remaining_shift_deposit: 0
        }
      })

      const arrOrder = await this.orderModel.find(
        { $expr: { $ne: ["$subtotal_fee", "$initial_fee"] } },
      )

      const lstTask:any = []
      for(let i = 0; i < arrOrder.length; i++) {
        if(arrOrder[i].status === 'pending') {
          arrOrder[i].work_shift_deposit = arrOrder[i].platform_fee
          arrOrder[i].remaining_shift_deposit = arrOrder[i].final_fee - arrOrder[i].platform_fee

        } else {
          arrOrder[i].work_shift_deposit = arrOrder[i].final_fee
        }

        lstTask.push(arrOrder[i].save())
      }
      await Promise.all(lstTask)
      
      console.log('addNewFieldForOrder done');
      return true
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
  async addInfoLinkedCollaborator() {
    try {
      // const getOrder = await this.orderModel.findOne({_id: new ObjectId('67866152f0dc34dce6fc9c56')})

      // getOrder.info_linked_collaborator.push({
      //   id_collaborator: getOrder.id_collaborator,
      //   status: STATUS_ORDER.DOING
      // })

      // await getOrder.save()

      const getListOrder = await this.orderModel.find({status: {$in: ['confirm', 'doing']}, info_linked_collaborator: {$size: 0}})
      for(let i = 0; i<getListOrder.length;i++) {
        getListOrder[i].info_linked_collaborator.push({
        id_collaborator: getListOrder[i].id_collaborator,
        status: getListOrder[i].status
      })

      await getListOrder[i].save()
      }

      console.log('addInfoLinkedCollaborator is done');
      
      return true
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
  async plusMoneyForInviter() {
    try {
      const getCustomer = await this.customerModel.findOne({_id: new ObjectId('677f3b2d28ef73ddd8557fd7')})
      const getInviter = await this.customerModel.findOne({_id: new ObjectId('663e710ee1328069321f476f')})
      const getOrder = await this.orderModel.findOne({_id: new ObjectId('677f3c5128ef73ddd856b8c9')})
      const getCollaborator = await this.collaboratorModel.findOne({_id: getOrder.id_collaborator})

      const payloadDependency = {
        customer: getInviter,
        order: getOrder,
        collaborator: getCollaborator
      }

      const subjectAction = {
        type: 'collaborator',
        _id: getCollaborator._id
      }

      const previousBalance = {
        pay_point: getInviter.pay_point
      }
      getInviter.pay_point+= 50000

      await getInviter.save()

      await this.historyActivityOopSystemService.addPayPointsForInviterWhenDoneOrder(subjectAction, payloadDependency, previousBalance, 50000, getCustomer, true)

      console.log('plusMoneyForInviter done');
      
      return true
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
  async addNewFieldForBannerAndPromotion() {
    try {
      await this.bannerModel.updateMany({
        $set: {
          is_counted: false,
          key_event_count: null
        }
      })

      await this.promotionModel.updateMany({
        $set: {
          is_counted: false,
          key_event_count: null
        }
      })

      console.log('addNewFieldForBannerAndPromotion is done');

      return true
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
  async addLogMinusMoneyWhenConfirmOrder() {
    try {
      const getCustomer = await this.customerModel.findOne({_id: new ObjectId('63a94c3643314af9fe75a4fa')})
      let payloadDependency = {
        customer: getCustomer,
        group_order: null,
        collaborator: null,
        admin_action: null,
        order: null
    }

      const subjectAction = {
        type: 'admin',
        _id: new ObjectId('63eca1366034ca25712abc04')
      }

      if(subjectAction.type == "admin") {
        const getUser = await this.userSystemOoopSystemService.getDetailItem('vi', subjectAction._id)
        payloadDependency.admin_action = getUser
    }

    const collaborator = await this.collaboratorModel.findOne({ _id: new ObjectId('638eff7bc997d9de6c826900') });
    payloadDependency.order = await this.orderModel.findOne({_id: new ObjectId('678755698844f8708740410d')})
    payloadDependency.group_order = await this.groupOrderModel.findOne({_id: new ObjectId('678755698844f870874040f2')})

    const previousBalance = {
      work_wallet: 259100,
      collaborator_wallet: 10200
    }

    collaborator.work_wallet = 259100 - payloadDependency.order.work_shift_deposit
    collaborator.collaborator_wallet = 10200

    payloadDependency.collaborator = collaborator

    // payloadDependency.collaborator = await collaborator.save()


    // console.log(payloadDependency.order);
    
      await this.historyActivityOopSystemService.minusPlatformFee(subjectAction, payloadDependency, payloadDependency.order.work_shift_deposit, previousBalance)

      await this.historyActivityOopSystemService.confirmOrder(subjectAction, payloadDependency)

      console.log('addLogMinusMoneyWhenConfirmOrder is done');
      
      return true
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
  async balanceMoneyForCollaborator() {
    try {
      const getCollaborator = await this.collaboratorModel.findOne({_id: new ObjectId('6694d65b6461ca7195dfeaa8')})
      const getListHistoryActivites = await this.historyActivityModel.find(
        {
          $and: [
            { id_collaborator: getCollaborator._id },
            {
              $or: HISTORY_ACTIVITY_WALLET
            },
            { date_create: { $gte: '2025-03-03T12:35:27.613Z' } }
          ]
        },
        {},
        { sort: {date_create: 1} }
    )

      let money = getListHistoryActivites[0].current_work_wallet
      console.log(money);
      
      for(let i = 1; i < getListHistoryActivites.length; i++ ) {
        console.log('current money', money);
        if(getListHistoryActivites[i].status_current_work_wallet ===  'up' || getListHistoryActivites[i].status_current_work_wallet ===  'down') {
          if(getListHistoryActivites[i].status_current_work_wallet === 'down') {
          getListHistoryActivites[i].current_work_wallet = money
          getListHistoryActivites[i].current_work_wallet -= Math.abs(getListHistoryActivites[i].value)
          money = getListHistoryActivites[i].current_work_wallet
          console.log('money after', money);
          console.log('current_work_wallet after', getListHistoryActivites[i].current_work_wallet);
          } 
          if(getListHistoryActivites[i].status_current_work_wallet ===  'up') {
            getListHistoryActivites[i].current_work_wallet = money
            getListHistoryActivites[i].current_work_wallet += Math.abs(getListHistoryActivites[i].value)
            money = getListHistoryActivites[i].current_work_wallet
            console.log('money after', money);
            console.log('current_work_wallet after', getListHistoryActivites[i].current_work_wallet);
          }
        } else {
          getListHistoryActivites[i].current_work_wallet = money
          console.log('current_work_wallet after', getListHistoryActivites[i].current_work_wallet);
        }
        await getListHistoryActivites[i].save()
      }

      let money2 = getListHistoryActivites[0].current_collaborator_wallet
      console.log(money2);
      for(let i = 1; i < getListHistoryActivites.length; i++ ) {
        console.log('current money2', money2);
        if(getListHistoryActivites[i].status_current_collaborator_wallet ===  'up' || getListHistoryActivites[i].status_current_collaborator_wallet ===  'down') {
          if(getListHistoryActivites[i].status_current_collaborator_wallet === 'down') {
            getListHistoryActivites[i].current_collaborator_wallet = money2
            getListHistoryActivites[i].current_collaborator_wallet -= Math.abs(getListHistoryActivites[i].value)
            money2 = getListHistoryActivites[i].current_collaborator_wallet
            console.log('money2 after', money2);
            console.log('current_collaborator_wallet after', getListHistoryActivites[i].current_collaborator_wallet);
          } 
          if (getListHistoryActivites[i].status_current_collaborator_wallet ===  'up') {
            getListHistoryActivites[i].current_collaborator_wallet = money2
            getListHistoryActivites[i].current_collaborator_wallet += Math.abs(getListHistoryActivites[i].value)
            money2 = getListHistoryActivites[i].current_collaborator_wallet
            console.log('money2 after', money2);
            console.log('current_collaborator_wallet after', getListHistoryActivites[i].current_collaborator_wallet);
          } 
        } else {
          getListHistoryActivites[i].current_collaborator_wallet = money2
          console.log('current_collaborator_wallet after', getListHistoryActivites[i].current_collaborator_wallet);
        }
        getListHistoryActivites[i].save()
      }

      // console.log('getListHistoryActivites', getListHistoryActivites[1]);

      getCollaborator.collaborator_wallet = money2
      getCollaborator.work_wallet = money
      await getCollaborator.save()

      console.log('last money', money);
      console.log('last money2', money2);

      console.log('balanceMoneyForCollaborator is done');
    
    return true
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async verifyPunishCollaboratorTransaction() {
    try {
      const getTransaction = await this.transactionModel.findOne({_id: new Object('6789c7ec9b8c9072bfb85799')})
      const getPunishTicket = await this.punishTicketModel.findOne({_id: getTransaction.id_punish_ticket});
      const collaborator = await this.collaboratorModel.findOne({_id: getPunishTicket.id_collaborator});
      const order = await this.orderModel.findOne({_id: getPunishTicket.id_order});
    const previousBalance = {
      work_wallet: 0,
      collaborator_wallet: -59100 
    }

    getTransaction.status = 'done'
    await getTransaction.save()

    getPunishTicket.status = 'done'
    await getPunishTicket.save()

    const temp = {
      en: `Punish collaborator because ${getPunishTicket.note_admin || getPunishTicket.title.en}${order !== null ? ` shift ${order.id_view}` : ""}`,
      vi: `Phạt CTV vì lý do ${getPunishTicket.note_admin || getPunishTicket.title.vi}${order !== null ? ` ca làm việc ${order.id_view}` : ""}`
    }
    const temp2 = `Phạt CTV vì lý do ${getPunishTicket.note_admin || getPunishTicket.title.vi}${order !== null ? ` ca làm việc ${order.id_view}` : ""}`
    await this.historyActivityRepositoryService.create({
      id_collaborator: getPunishTicket.id_collaborator,
      id_punish_ticket: getPunishTicket._id,
      id_admin_action: getPunishTicket.id_admin_action,
      id_admin_verify: getPunishTicket.id_admin_verify,
      id_order: getPunishTicket.id_order,
      id_transaction: getPunishTicket.id_transaction,
      title: temp,
      title_admin: temp2,
      body: temp,
      type: `verify_transaction_punish_ticket`,
      date_create: new Date(Date.now()).toISOString(),
      value: -getTransaction.money,
      current_work_wallet: collaborator.work_wallet,
      status_current_work_wallet: (previousBalance.work_wallet < collaborator.work_wallet) ?
          "up" : (previousBalance.work_wallet > collaborator.work_wallet) ? "down" : "none",
      current_collaborator_wallet: collaborator.collaborator_wallet,
      status_current_collaborator_wallet: (previousBalance.collaborator_wallet < collaborator.collaborator_wallet) ?
          "up" : (previousBalance.collaborator_wallet > collaborator.collaborator_wallet) ? "down" : "none",
    })

    console.log('verifyPunishCollaboratorTransaction is done');
    

    return true;
  } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
      
    }
  }
          
  async addLogWhenPayingOrder() {
    try {
      const getCustomer = await this.customerModel.findOne({_id: new ObjectId('6790627a6021c73e9f6d20c0')})
      const getOrder = await this.orderModel.findOne({_id: new ObjectId('679066f06021c73e9f706010')})
      const getGroupOrder = await this.groupOrderModel.findOne({_id: new ObjectId('679066f06021c73e9f705ff9')})

      const subjectAction = {
        _id: getCustomer._id,
        type: 'customer'
      }

      const payloadDependency = {
        group_order: getGroupOrder,
        order: getOrder,
        customer: getCustomer
      }

      await this.historyActivityOopSystemService.paymentPayPointCustomer(subjectAction, payloadDependency, getOrder.final_fee)
      await this.historyActivityOopSystemService.createGroupOrder(subjectAction, payloadDependency)

      console.log('addLogWhenPayingOrder is done');

      return true
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
}
}
  
  async updateDateCancelForOrder() {
    try {
      await this.orderModel.updateMany({
        $set: {
          cancellation_date: null
        }
      })
      const lstOrderCancel = await this.orderModel.find({
        status: "cancel"
      },
      {}, 
      {sort: {date_create: 1}})
      const lstIdOrder = lstOrderCancel.map((e:any) => e._id)

      const getListHistoryActivites = await this.historyActivityModel.find({
        id_order:{ $in: lstIdOrder },
        type: {$in: ["customer_cancel_order", "collaborator_cancel_order", "admin_cancel_order", "system_cancel_order"]}
      }, 
      {}, 
      {
        sort: {date_create: -1}
      })
      
      const lstHistoryActiviesMap = new Map(getListHistoryActivites.map((e) => [e.id_order.toString(), e]))
      
      const lstTask: any= []
      for(let i = 0; i < lstOrderCancel.length; i++) {
        const historyActivity = lstHistoryActiviesMap.get(lstOrderCancel[i]._id.toString())
        
        if(historyActivity) {
          lstOrderCancel[i].cancellation_date = historyActivity.date_create
          
          lstTask.push(lstOrderCancel[i].save())
        }
      }

      await Promise.all(lstTask)

      console.log('updateDateCancelForOrder is done');
      
      
      return true
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    } 
  }

  async updateDateCompleteForOrder() {
    try {
      await this.orderModel.updateMany({
        $set: {
          completion_date: null
        }
      })
      const lstOrderCancel = await this.orderModel.find({
        status: "done"
      },
      {}, 
      {sort: {date_create: 1}})
      const lstIdOrder = lstOrderCancel.map((e:any) => e._id)

      const getListHistoryActivites = await this.historyActivityModel.find({
        id_order:{ $in: lstIdOrder },
        type: {$in: ["collaborator_done_order", "admin_done_order" ]}
      }, 
      {}, 
      {
        sort: {date_create: -1}
      })
      
      const lstHistoryActiviesMap = new Map(getListHistoryActivites.map((e) => [e.id_order.toString(), e]))
      
      const lstTask: any= []
      for(let i = 0; i < lstOrderCancel.length; i++) {
        const historyActivity = lstHistoryActiviesMap.get(lstOrderCancel[i]._id.toString())
        
        if(historyActivity) {
          lstOrderCancel[i].completion_date = historyActivity.date_create
          
          lstTask.push(lstOrderCancel[i].save())
        }
      }

      await Promise.all(lstTask)

      console.log('updateDateCompleteForOrder is done');
      
      
      return true
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    } 
  }

  async runOrdinalNumberAndIdViewForCustomer() {
    try {
      let latestOrdinalNumber = 41466
      const latestIdView = 'KH00041466'
      const lstCustomer = await this.customerModel.find(
        { date_create: {$gte: '2025-01-16T17:12:57.988Z'} },
        {},
        { sort: {date_create: 1} }
    )

    const lstTask:any = []
    for(let i = 0; i < lstCustomer.length; i++) {
      latestOrdinalNumber += 1
      lstCustomer[i].ordinal_number = latestOrdinalNumber
      lstCustomer[i].id_view = `KH000${latestOrdinalNumber}`

      lstTask.push(lstCustomer[i].save())
    }

    await Promise.all(lstTask)

    console.log('runOrdinalNumberAndIdViewForCustomer is done');
    
    return true
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
  async updateNewPunishTicket(){
    try {
      await this.orderModel.updateMany({
        $set: {
          total_refund_fee: 0,
          list_of_punish_ticket: [],
          incurrence_time: [],
        }
      })
      await this.punishTicketModel.updateMany({
        $set: {
          execution_date: null,
          revocation_date: null
        }
      })
      const lstPunishTicket = await this.punishTicketModel.find({}, {}, { sort: { date_create: 1 } })
      const lstIdPunishTicket = lstPunishTicket.map((e) => e._id)
      const lstIdOrder = lstPunishTicket.filter((e) => e.id_order !== null && e.id_order !== undefined).map((e) => e.id_order)
      
      const lstOrder = await this.orderModel.find(
        { _id: {$in: lstIdOrder} },
        {},
        { sort: { date_create: 1 } }
      )

      const getListHistoryActivites = await this.historyActivityModel.find({
        id_punish_ticket:{ $in: lstIdPunishTicket },
        type: {$in: ["create_punish_ticket", "revoke_punish_ticket", "verify_punish_ticket", "verify_transaction_punish_ticket", "punish_ticket_waiting_to_doing", "system_verify_transaction", "admin_revoke_punish_money", "admin_revoke_punish_ticket", "refund_money_revoke_punish_ticket"]}
      }, 
      {}, 
      {
        sort: {date_create: -1}
      })
      
      const lstTask: any= []
      for(let i = 0; i < lstOrder.length; i++) {
        lstOrder[i].list_of_punish_ticket = []
        lstOrder[i].incurrence_time = []
        lstOrder[i].total_punish = 0
        lstOrder[i].total_refund_fee = 0
        const lstPunishTicketByOrder = lstPunishTicket.filter((e) => e.id_order !== null && e.id_order !== undefined && e.id_order.toString() === lstOrder[i]._id.toString())
        for(let j = 0; j < lstPunishTicketByOrder.length; j++) {
          const item:any = {}
          const item2:any = {}
          item.id_punish_ticket = lstPunishTicketByOrder[j]._id

          // Tạo lệnh phạt
          item.date_create = lstPunishTicketByOrder[j].date_create
          item2.date_create = lstPunishTicketByOrder[j].date_create
          item2.fee = lstPunishTicketByOrder[j].punish_money
          
          // Thực thi lệnh phạt
          let historyActivityExecute = getListHistoryActivites.find((e) => e.id_punish_ticket.toString() === lstPunishTicketByOrder[j]._id.toString() && e.type === 'punish_ticket_waiting_to_doing')

          if(historyActivityExecute) {
            item.execution_date = historyActivityExecute.date_create
            lstPunishTicketByOrder[j].execution_date = historyActivityExecute.date_create
          } else {
            historyActivityExecute = getListHistoryActivites.find((e) => e.id_punish_ticket.toString() === lstPunishTicketByOrder[j]._id.toString() && (e.type === 'verify_punish_ticket' || e.type === 'verify_transaction_punish_ticket' || e.type === "system_verify_transaction"))
            if(historyActivityExecute) {
              item.execution_date = historyActivityExecute.date_create
              lstPunishTicketByOrder[j].execution_date = historyActivityExecute.date_create
            }
          }
          
          // Thu hồi lệnh phạt
          let historyActivityRevoke = getListHistoryActivites.find((e) => e.id_punish_ticket.toString() === lstPunishTicketByOrder[j]._id.toString() && (e.type === 'revoke_punish_ticket' || e.type === 'admin_revoke_punish_money' || e.type === 'admin_revoke_punish_ticket' || e.type === 'refund_money_revoke_punish_ticket'))
          if(historyActivityRevoke) {
            item.revocation_date = historyActivityRevoke.date_create
            lstPunishTicketByOrder[j].revocation_date = historyActivityRevoke.date_create

            lstOrder[i].total_refund_fee += lstPunishTicketByOrder[j].punish_money
          }

          lstOrder[i].total_punish += lstPunishTicketByOrder[j].punish_money

          lstOrder[i].list_of_punish_ticket.push(item)
          lstOrder[i].incurrence_time.push(item2)
          await lstPunishTicketByOrder[j].save()
        }

        lstTask.push(lstOrder[i].save())
      }

      await Promise.all(lstTask)

      console.log('updateNewPunishTicket is done');
      

    } catch(err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
  async renameFieldInReportCollection() {
    try {
      // await this.reportModel.updateMany({},
      //   {
      //     $rename: { "total_service_fees_collected_done": "total_service_collection_amount_done" }
      //   }
      // )

      await this.reportModel.updateMany({},
        {
          $set: {
            // total_service_collection_amount_done: 0,
            // total_revenue_done: 0,
            // total_discount_done: 0,
            // total_net_revenue_done: 0,
            // total_invoice_done: 0,
            // total_applied_fees_done: 0,
            // total_value_added_tax: 0,
            // total_profit_done: 0,
            // total_profit_after_tax_done: 0,
            // total_projected_service_collection_amount: 0,
            // total_projected_revenue: 0,
            // total_projected_discount: 0,
            // total_projected_net_revenue: 0,
            // total_projected_invoice: 0,
            // total_projected_applied_fees: 0,
            // total_projected_value_added_tax: 0,
            // total_projected_profit: 0,
            // total_projected_profit_after_tax: 0,
            // detailed_total_money_created: [],
            // total_money_canceled: 0,
            total_zns_spending: 0,
            total_sent_zns: 0,
            total_chargeable_zns: 0,
            total_non_chargeable_zns: 0,
            total_successful_zns: 0,
            total_failed_zns: 0
          }
        }
      )

      console.log('renameFieldInReportCollection is done');
      
      return true
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
  async addNewFieldInOrder() {
    try {
      // await this.orderModel.updateMany({}, {
      //   $set: {
      //     total_discount: 0
      //   }
      // })
    
      const lstOrder = await this.orderModel.find({
        $or: [
          { code_promotion: { $ne :null } },
          { event_promotion: { $not: { $size: 0 } } },
        ]
      })      

      const lstTask:any = []

      for(let i = 0; i < lstOrder.length; i++) {
        lstOrder[i].total_discount = 0
        if(lstOrder[i].code_promotion !== null && lstOrder[i].code_promotion !== undefined) {
          console.log('code_promotion', lstOrder[i].code_promotion);
          
          lstOrder[i].total_discount += lstOrder[i].code_promotion['discount']
        }
        
        console.log('event_promotion', lstOrder[i]['event_promotion'])
        for(let j = 0; j < lstOrder[i]['event_promotion'].length; j++) {
          lstOrder[i].total_discount += lstOrder[i]['event_promotion'][j]['discount']
        }

        lstTask.push(lstOrder[i].save())
      }

      await Promise.all(lstTask)

      console.log('addNewFieldInOrder is done');
      
      return true
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
  async restoreAccountForCollaborator() {
    try {
      const subjectAction = {
        _id: "63eca1366034ca25712abc04",
        type: "admin"
      }

      const payloadDependency = {
        admin_action: null,
        collaborator: null
      }
      const getUser = await this.userSystemOoopSystemService.getDetailItem('vi', subjectAction._id)
      payloadDependency.admin_action = getUser
      const getCollaborator = await this.collaboratorModel.findById(new ObjectId('674ea9695d0d1c150881a4a3'))
      getCollaborator.is_delete = false

      payloadDependency.collaborator = await getCollaborator.save()

      await this.historyActivityOopSystemService.restoreAccountForCollaborator(subjectAction, payloadDependency)

      console.log('restoreAccountForCollaborator is done');

      return true
    } catch(err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
  async updateDateVerifyForTransaction() {
    try {
      const lstTransaction = await this.transactionModel.find(
        {
          $and: [
            { type_transfer: 'order_payment' },
            { status: 'done' },
            { 
              $or: [
                { date_verify: "" },
                { date_verify: null },
              ]
            }
          ]
        }, {},
        { sort: { date_create: 1} }
      )
      const lstIdOrder = lstTransaction.map((e) => e.id_order)
      const lstHistoryActivities = await this.historyActivityModel.find(
        { 
          $and: [
            { id_order: lstIdOrder },
            { type: 'customer_create_group_order' }
          ]
        },
        {},
        { sort: { date_create: 1 } }
      )

      const lstTask = []
      for(let i = 0; lstTransaction.length; i++) {
        console.log('transaction', lstTransaction[i]);
        console.log('id_order', lstTransaction[i].id_order);
        
        const historyActivity = lstHistoryActivities.find((e) => e.id_order.toString() === lstTransaction[i].id_order.toString())
        if(historyActivity) {
          lstTransaction[i].date_verify = new Date(new Date(historyActivity.date_create).getTime() - 200).toISOString()
          historyActivity.id_transaction = lstTransaction[i]._id

          lstTask.push(lstTransaction[i].save())
          lstTask.push(historyActivity.save())
        }
      }
      await Promise.all(lstTask)

      console.log('updateDateVerifyForTransaction is done');

      return true
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async newRefundMoney() {
    try {
      const subjectAction = {
        _id: new ObjectId('63eca1366034ca25712abc04'),
        type: 'admin'
      }

      const payloadDependency = {
        order: null,
        group_order: null,
        customer: null,
        collaborator: null,
        admin_action: null
      }

      if (subjectAction.type === TYPE_SUBJECT_ACTION.admin) {
        const getUser = await this.userSystemOoopSystemService.getDetailItem('vi', subjectAction._id)
        payloadDependency.admin_action = getUser
    }

      const order = await this.orderModel.findById(new ObjectId('676f6972220af59ca6f75cb2'))
      const group_order = await this.groupOrderModel.findById(new ObjectId('676f6972220af59ca6f75c98'))
      const customer = await this.customerModel.findById(new ObjectId('676f60bc220af59ca6f23515'))
      const collaborator = await this.collaboratorModel.findById(new ObjectId('65dc66f25d076736145f9821'))

      payloadDependency.order = order
      payloadDependency.group_order = group_order
      payloadDependency.customer = customer
      payloadDependency.collaborator = collaborator

      const previousBalance:any = {
        work_wallet: 239500,
        collaborator_wallet: 0
      }

      await this.historyActivityOopSystemService.receiveRefundMoney(subjectAction, payloadDependency, previousBalance, 30000)

      console.log('newRefundMoney is done');

      return true
    } catch(err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateSystemSetting() {
    try {
      await this.systemSettingModel.create({
        updated_at: new Date().toISOString(),
        access_token_zns: 'gU325_VzV6QlwySIz_fpQQdcon_nxHPenfV57lt0BYtuhkKyuySc7BpNvWUYdHmI_kpIDF_y3mF5wUGocAGCHw3Fk52xe0qcfyQmF8khP3cMwRqgc9W81hBGuYQhp3OkXu3u1wgM90cN-lq2k9Wc1UZDw2_Xlo01tylqSUEu4aFRsjzJnAnhMD_hicZx_LjuzUs4Vko_N5FMwh5_zgfKSFJwY5hpXZLfz9Fi6gZW4YwjbgiKg8TfP9MLYn6VXsqXWP6l1QFrQn7uWgC_eV9r3AYZh0hszdP_rv2fQztcJNl4z_DgrUKy6lYMqGRgqWbsrxYtSi_DRtBidT1GxyuMKFQ7ybh_bpT6vV7VISoa5qRWiC4nkyKF5OIeqoU8z1usZQ7qHP_LG6wDWBbSryS1KuQpna0mD6WbZ4Frwtrj',
        refresh_token_zns: '8Y7jRqQjHN0aAkXgHgfAVo8dv6T0lJWCU4JuSKs183z71S1QNz0oMZnKc1O6raLEPoMtKs6a50TTG-TDLQz84aXijWX3uLvnOs615LscMcrQUR4lG9HlUcXva3vWbKDn0qYZB3QDG6GyTuedE812Jm8Pi54Vxdi-96-xHKMGQIDc4AjPHyXM0aOvc7XawbSz1GwKLm3VNGCTBg965kbi7mW_d7ysqL462H69HIESNomMMgz8TBi3Dt9Cw7rOZJvaV7B204MLBNjFIeCdIvGgO7redIbuiq1BJqoh96dEVq128AfUK-DRB6i1fZ1QqNrwHHoERYBv83L71DnpNFyo4qens0PA_3XJMIVcELxd1LLJCl8IIiKdLaaarn1uuc0EK0EtQatkJ3T8BxHWLTTbVLAqcYr4kqHx'
      })

      console.log('updateSystemSetting is done');
      
      return true
    } catch(err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
  async updatePhoneOTP() {
    try {
      await this.phoneOTPModel.updateMany({}, {
        $set: {
          type: PHONE_OTP_TYPE.sms
        }
      })
      console.log('updatePhoneOTP is done');
      
      return true
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
  async setUpContentNotification() {
    try {
      const lstContentNotification:any = [
        {
          title: {
            vi: "Đồng phục sai quy định lần 1",
            en: "First violation of uniform policy"
          },
          description: {
            vi: "Guvi/ hệ thống ghi nhận bạn không mặc đồng phục khi đi làm. Vui lòng tuân thủ quy định để tránh bị khóa tài khoản",
            en: "Guvi/system has recorded that you did not wear the uniform while at work. Please comply with the regulations to avoid having your account locked"
          },
          type_notification: "activity",
          user_apply: "collaborator"
        },
        {
          title: {
            vi: "Đồng phục sai quy định lần 2",
            en: "Second violation of uniform policy"
          },
          description: {
            vi: "Bạn đã không mặc đồng phục lần 2. Tài khoản của bạn sẽ tạm khóa 3 ngày. Vui lòng tuân thủ quy định để tránh bị khóa dài hơn nhé!",
            en: "You did not wear the uniform for the second time. Your account will be temporarily locked for 3 days. Please comply with the regulations to avoid a longer lock"
          },
          type_notification: "activity",
          user_apply: "collaborator"
        },
        {
          title: {
            vi: "Đồng phục sai quy định lần 3",
            en: "Third violation of uniform policy"
          },
          description: {
            vi: "Tài khoản của bạn sẽ tạm khóa 7 ngày và yêu cầu cam kết thực hiện đúng quy định. Guvi rất mong bạn hợp tác!",
            en: "Your account will be temporarily locked for 7 days, and you are required to commit to following the regulations. Guvi sincerely hopes for your cooperation!"
          },
          type_notification: "activity",
          user_apply: "collaborator"
        },
        {
          title: {
            vi: "Đồng phục sai quy định lần 4",
            en: "Fourth violation of uniform policy"
          },
          description: {
            vi: "Guvi buộc phải tạm khóa tài khoản 1 tháng. Hãy liên hệ tổng đài để được hỗ trợ",
            en: "Guvi is compelled to temporarily lock your account for 1 month. Please contact our hotline for assistance!"
          },
          type_notification: "activity",
          user_apply: "collaborator"
        },
        {
          title: {
            vi: "Quên trình CCCD lần 1",
            en: "First offense for forgetting to present your Citizen ID card"
          },
          description: {
            vi: "Bạn ơi, nhớ trình CCCD trước khi làm việc nhé!",
            en: "Please remember to present your Citizen ID card before starting work!"
          },
          type_notification: "activity",
          user_apply: "collaborator"
        },
        {
          title: {
            vi: "Quên trình CCCD lần 2",
            en: "Second offense for forgetting to present your Citizen ID card"
          },
          description: {
            vi: "Bạn đã không trình CCCD lần 2 rồi.Tài khoản sẽ tạm khóa 3 ngày. Hãy cẩn thận hơn nhé!",
            en: "You did not present your Citizen ID card for the second time. Your account will be temporarily locked for 3 days. Please be more careful!"
          },
          type_notification: "activity",
          user_apply: "collaborator"
        },
        {
          title: {
            vi: "Quên trình CCCD lần 3",
            en: "Third offense for forgetting to present your Citizen ID card"
          },
          description: {
            vi: "Tài khoản sẽ tạm khóa 7 ngày và cần cam kết tuân thủ quy định để tiếp tục đồng hành cùng Guvi!",
            en: "Your account will be temporarily locked for 7 days, and you are required to commit to following the regulations to continue your journey with Guvi!"
          },
          type_notification: "activity",
          user_apply: "collaborator"
        },
        {
          title: {
            vi: "Quên trình CCCD lần 4",
            en: "Fourth offense for forgetting to present your Citizen ID card"
          },
          description: {
            vi: "Tài khoản sẽ tạm khóa 1 tháng. Hãy liên hệ tổng đài để được hỗ trợ!",
            en: "Your account will be temporarily locked for 1 month. Please contact our hotline for assistance!"
          },
          type_notification: "activity",
          user_apply: "collaborator"
        },
      ]
    } catch(err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
  async setUpRewardPolicy() {
    try {
      const lstRewardPolicy = [
        // {
        //   title: {
        //     vi: "Thưởng mốc 40 điểm",
        //     en: "40-point milestone reward",
        //   },
        //   description: {
        //     vi: "Thưởng mốc 40 điểm",
        //     en: "40-point milestone reward",
        //   },
        //   user_apply: "collaborator",
        //   total_time_process: 0,
        //   total_order_process: 0,
        //   reward_policy_type: REWARD_POLICY_TYPE.reward_milestone,
        //   reward_wallet_type: REWARD_WALLET_TYPE.work_wallet,
        //   score: 40,
        //   reward_rule: {
        //       reward_value_type: REWARD_VALUE_TYPE.money,
        //       dependency_order_value: DEPENDENCY_ORDER_VALUE.none,
        //       reward_value: 30000, 
        //       id_content_notification: null
        //   },
        //   cycle_time_type: CYCLE_TIME_TYPE.week,
        //   start_time_cycle: '2025-02-23T17:00:00.000Z',
        //   is_delete: false,
        //   status: "doing",
        //   id_view: await this.generalHandleService.randomIDTransaction(4),
        // },
        // {
        //   title: {
        //     vi: "Thưởng mốc 55 điểm",
        //     en: "55-point milestone reward",
        //   },
        //   description: {
        //     vi: "Thưởng mốc 55 điểm",
        //     en: "55-point milestone reward",
        //   },
        //   user_apply: "collaborator",
        //   total_time_process: 0,
        //   total_order_process: 0,
        //   reward_policy_type: REWARD_POLICY_TYPE.reward_milestone,
        //   reward_wallet_type: REWARD_WALLET_TYPE.work_wallet,
        //   score: 55,
        //   reward_rule: {
        //       reward_value_type: REWARD_VALUE_TYPE.money,
        //       dependency_order_value: DEPENDENCY_ORDER_VALUE.none,
        //       reward_value: 50000, 
        //       id_content_notification: null
        //   },
        //   cycle_time_type: CYCLE_TIME_TYPE.week,
        //   start_time_cycle: '2025-02-23T17:00:00.000Z',
        //   is_delete: false,
        //   status: "doing",
        //   id_view: await this.generalHandleService.randomIDTransaction(4),
        // },
        // {
        //   title: {
        //     vi: "Thưởng mốc 75 điểm",
        //     en: "75-point milestone reward",
        //   },
        //   description: {
        //     vi: "Thưởng mốc 75 điểm",
        //     en: "75-point milestone reward",
        //   },
        //   user_apply: "collaborator",
        //   total_time_process: 0,
        //   total_order_process: 0,
        //   reward_policy_type: REWARD_POLICY_TYPE.reward_milestone,
        //   reward_wallet_type: REWARD_WALLET_TYPE.work_wallet,
        //   score: 75,
        //   reward_rule: {
        //       reward_value_type: REWARD_VALUE_TYPE.money,
        //       dependency_order_value: DEPENDENCY_ORDER_VALUE.none,
        //       reward_value: 150000, 
        //       id_content_notification: null
        //   },
        //   cycle_time_type: CYCLE_TIME_TYPE.week,
        //   start_time_cycle: '2025-02-23T17:00:00.000Z',
        //   is_delete: false,
        //   status: "doing",
        //   id_view: await this.generalHandleService.randomIDTransaction(4),
        // },
        // {
        //   title: {
        //     vi: "Thưởng mốc 90 điểm",
        //     en: "90-point milestone reward",
        //   },
        //   description: {
        //     vi: "Thưởng mốc 90 điểm",
        //     en: "90-point milestone reward",
        //   },
        //   user_apply: "collaborator",
        //   total_time_process: 0,
        //   total_order_process: 0,
        //   reward_policy_type: REWARD_POLICY_TYPE.reward_milestone,
        //   reward_wallet_type: REWARD_WALLET_TYPE.work_wallet,
        //   score: 90,
        //   reward_rule: {
        //       reward_value_type: REWARD_VALUE_TYPE.money,
        //       dependency_order_value: DEPENDENCY_ORDER_VALUE.none,
        //       reward_value: 200000, 
        //       id_content_notification: null
        //   },
        //   cycle_time_type: CYCLE_TIME_TYPE.week,
        //   start_time_cycle: '2025-02-23T17:00:00.000Z',
        //   is_delete: false,
        //   status: "doing",
        //   id_view: await this.generalHandleService.randomIDTransaction(4),
        // },
        {
          title: {
            vi: "Bấm bắt đầu ca đúng giờ",
            en: "Press to start the shift on time",
          },
          description: {
            vi: "Bấm bắt đầu ca đúng giờ",
            en: "Press to start the shift on time",
          },
          user_apply: "collaborator",
          total_time_process: 0,
          total_order_process: 0,
          reward_policy_type: REWARD_POLICY_TYPE.reward,
          reward_wallet_type: REWARD_WALLET_TYPE.reward_point,
          score: 0,
          reward_rule: {
              reward_value_type: REWARD_VALUE_TYPE.point,
              dependency_order_value: DEPENDENCY_ORDER_VALUE.none,
              reward_value: 2, 
              id_content_notification: null
          },
          cycle_time_type: CYCLE_TIME_TYPE.hour,
          start_time_cycle: '2025-02-23T17:00:00.000Z',
          is_delete: false,
          status: "doing",
          id_view: await this.generalHandleService.randomIDTransaction(4),
        },
        {
          title: {
            vi: "Hoàn thành ca",
            en: "Complete the shift",
          },
          description: {
            vi: "Hoàn thành ca",
            en: "Complete the shift",
          },
          user_apply: "collaborator",
          total_time_process: 0,
          total_order_process: 0,
          reward_policy_type: REWARD_POLICY_TYPE.reward,
          reward_wallet_type: REWARD_WALLET_TYPE.reward_point,
          score: 0,
          reward_rule: {
              reward_value_type: REWARD_VALUE_TYPE.point,
              dependency_order_value: DEPENDENCY_ORDER_VALUE.none,
              reward_value: 2, 
              id_content_notification: null
          },
          cycle_time_type: CYCLE_TIME_TYPE.hour,
          start_time_cycle: '2025-02-23T17:00:00.000Z',
          is_delete: false,
          status: "doing",
          id_view: await this.generalHandleService.randomIDTransaction(4),
        },
        {
          title: {
            vi: "Bấm hoàn thành ca đúng giờ",
            en: "Press to complete the shift",
          },
          description: {
            vi: "Bấm hoàn thành ca đúng giờ",
            en: "Press to complete the shift",
          },
          user_apply: "collaborator",
          total_time_process: 0,
          total_order_process: 0,
          reward_policy_type: REWARD_POLICY_TYPE.reward,
          reward_wallet_type: REWARD_WALLET_TYPE.reward_point,
          score: 0,
          reward_rule: {
              reward_value_type: REWARD_VALUE_TYPE.point,
              dependency_order_value: DEPENDENCY_ORDER_VALUE.none,
              reward_value: 2, 
              id_content_notification: null
          },
          cycle_time_type: CYCLE_TIME_TYPE.hour,
          start_time_cycle: '2025-02-23T17:00:00.000Z',
          is_delete: false,
          status: "doing",
          id_view: await this.generalHandleService.randomIDTransaction(4),
        },
        {
          title: {
            vi: "Nhận đánh giá 5 sao",
            en: "Receive a 5-star rating",
          },
          description: {
            vi: "Nhận đánh giá 5 sao",
            en: "Receive a 5-star rating",
          },
          user_apply: "collaborator",
          total_time_process: 0,
          total_order_process: 0,
          reward_policy_type: REWARD_POLICY_TYPE.reward,
          reward_wallet_type: REWARD_WALLET_TYPE.reward_point,
          score: 0,
          reward_rule: {
              reward_value_type: REWARD_VALUE_TYPE.point,
              dependency_order_value: DEPENDENCY_ORDER_VALUE.none,
              reward_value: 3, 
              id_content_notification: null
          },
          cycle_time_type: CYCLE_TIME_TYPE.hour,
          start_time_cycle: '2025-02-23T17:00:00.000Z',
          is_delete: false,
          status: "doing",
          id_view: await this.generalHandleService.randomIDTransaction(4),
        },
      ]

      await this.rewardPolicyOopSystemService.createManyItem(lstRewardPolicy)

      console.log('setUpRewardPolicy is done');
      
    } catch(err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
  async setUpPunishPolicy(){
    try {
      const lstPunishPolicy = [
        // {
        //   title: {
        //     vi: "Vi phạm lần thứ 2 trong tuần",
        //     en: "Second violation within the week",
        //   },
        //   description: {
        //     vi: "Vi phạm lần thứ 2 trong tuần",
        //     en: "Second violation within the week",
        //   },
        //   user_apply: "collaborator",
        //   total_time_process: 0,
        //   total_order_process: 0,
        //   punish_money_type: "amount",
        //   punish_money: 0,
        //   action_lock: "unset",
        //   punish_lock_time: 0,
        //   punish_lock_time_type: "unset",
        //   is_delete: false,
        //   status: "doing",
        //   punish_policy_type: PUNISH_POLICY_TYPE.punish_milestone,
        //   id_view: await this.generalHandleService.randomIDTransaction(4),
        //   punish_rule: [
        //     {
        //       punish_type: PUNISH_TYPE.punish,
        //       nth_time: 2,
        //       punish_value_type: PUNISH_VALUE_TYPE.none,
        //       dependency_order_value: DEPENDENCY_ORDER_VALUE.none,
        //       punish_value: 0,
        //       punish_function: PUNISH_FUNCTION_TYPE.none,
        //       punish_lock_time: 0,
        //       punish_lock_time_type: PUNISH_LOCK_TIME_TYPE.unset,
        //       id_content_notification: null
        //     }
        //   ],
        //   cycle_time_type: CYCLE_TIME_TYPE.week,
        //   start_time_cycle: '2025-02-23T17:00:00.000Z',
        // },
        // {
        //   title: {
        //     vi: "Vi phạm lần thứ 5 trong tuần",
        //     en: "Fifth violation within the week",
        //   },
        //   description: {
        //     vi: "Vi phạm lần thứ 5 trong tuần",
        //     en: "Fifth violation within the week",
        //   },
        //   user_apply: "collaborator",
        //   total_time_process: 0,
        //   total_order_process: 0,
        //   punish_money_type: "amount",
        //   punish_money: 0,
        //   action_lock: "unset",
        //   punish_lock_time: 0,
        //   punish_lock_time_type: "unset",
        //   is_delete: false,
        //   status: "doing",
        //   punish_policy_type: PUNISH_POLICY_TYPE.punish_milestone,
        //   id_view: await this.generalHandleService.randomIDTransaction(4),
        //   punish_rule: [
        //     {
        //       punish_type: PUNISH_TYPE.punish,
        //       nth_time: 5,
        //       punish_value_type: PUNISH_VALUE_TYPE.none,
        //       dependency_order_value: DEPENDENCY_ORDER_VALUE.none,
        //       punish_value: 0,
        //       punish_function: PUNISH_FUNCTION_TYPE.none,
        //       punish_lock_time: 0,
        //       punish_lock_time_type: PUNISH_LOCK_TIME_TYPE.unset,
        //       id_content_notification: null
        //     }
        //   ],
        //   cycle_time_type: CYCLE_TIME_TYPE.week,
        //   start_time_cycle: '2025-02-23T17:00:00.000Z',
        // },
        {
          title: {
            vi: "Không mặc đồng phục",
            en: "Not wearing a uniform",
          },
          description: {
            vi: "Không mặc đồng phục",
            en: "Not wearing a uniform",
          },
          user_apply: "collaborator",
          total_time_process: 0,
          total_order_process: 0,
          punish_money_type: "amount",
          punish_money: 0,
          action_lock: "unset",
          punish_lock_time: 0,
          punish_lock_time_type: "unset",
          is_delete: false,
          status: "doing",
          punish_policy_type: PUNISH_POLICY_TYPE.punish,
          id_view: await this.generalHandleService.randomIDTransaction(4),
          punish_rule: [
            {
              punish_type: PUNISH_TYPE.reminder,
              nth_time: 1,
              punish_value_type: PUNISH_VALUE_TYPE.none,
              dependency_order_value: DEPENDENCY_ORDER_VALUE.none,
              punish_value: 0,
              punish_function: PUNISH_FUNCTION_TYPE.none,
              punish_lock_time: 0,
              punish_lock_time_type: PUNISH_LOCK_TIME_TYPE.unset,
              id_content_notification: null
            },
            {
              punish_type: PUNISH_TYPE.punish,
              nth_time: 2,
              punish_value_type: PUNISH_VALUE_TYPE.none,
              dependency_order_value: DEPENDENCY_ORDER_VALUE.none,
              punish_value: 0,
              punish_function: PUNISH_FUNCTION_TYPE.none,
              punish_lock_time: 72,
              punish_lock_time_type: PUNISH_LOCK_TIME_TYPE.hours,
              id_content_notification: null
            },
            {
              punish_type: PUNISH_TYPE.punish,
              nth_time: 3,
              punish_value_type: PUNISH_VALUE_TYPE.none,
              dependency_order_value: DEPENDENCY_ORDER_VALUE.none,
              punish_value: 0,
              punish_function: PUNISH_FUNCTION_TYPE.none,
              punish_lock_time: 168,
              punish_lock_time_type: PUNISH_LOCK_TIME_TYPE.hours,
              id_content_notification: null
            },
            {
              punish_type: PUNISH_TYPE.punish,
              nth_time: 4,
              punish_value_type: PUNISH_VALUE_TYPE.none,
              dependency_order_value: DEPENDENCY_ORDER_VALUE.none,
              punish_value: 0,
              punish_function: PUNISH_FUNCTION_TYPE.none,
              punish_lock_time: 720,
              punish_lock_time_type: PUNISH_LOCK_TIME_TYPE.hours,
              id_content_notification: null
            },
          ],
          cycle_time_type: CYCLE_TIME_TYPE.week,
          start_time_cycle: '2025-02-23T17:00:00.000Z',
        },
        {
          title: {
            vi: "Quên trình CCCD",
            en: "Forgot to present the citizen identification card",
          },
          description: {
            vi: "Quên trình CCCD",
            en: "Forgot to present the citizen identification card",
          },
          user_apply: "collaborator",
          total_time_process: 0,
          total_order_process: 0,
          punish_money_type: "amount",
          punish_money: 0,
          action_lock: "unset",
          punish_lock_time: 0,
          punish_lock_time_type: "unset",
          is_delete: false,
          status: "doing",
          punish_policy_type: PUNISH_POLICY_TYPE.punish,
          id_view: await this.generalHandleService.randomIDTransaction(4),
          punish_rule: [
            {
              punish_type: PUNISH_TYPE.reminder,
              nth_time: 1,
              punish_value_type: PUNISH_VALUE_TYPE.none,
              dependency_order_value: DEPENDENCY_ORDER_VALUE.none,
              punish_value: 0,
              punish_function: PUNISH_FUNCTION_TYPE.none,
              punish_lock_time: 0,
              punish_lock_time_type: PUNISH_LOCK_TIME_TYPE.unset,
              id_content_notification: null
            },
            {
              punish_type: PUNISH_TYPE.punish,
              nth_time: 2,
              punish_value_type: PUNISH_VALUE_TYPE.none,
              dependency_order_value: DEPENDENCY_ORDER_VALUE.none,
              punish_value: 0,
              punish_function: PUNISH_FUNCTION_TYPE.none,
              punish_lock_time: 72,
              punish_lock_time_type: PUNISH_LOCK_TIME_TYPE.hours,
              id_content_notification: null
            },
            {
              punish_type: PUNISH_TYPE.punish,
              nth_time: 3,
              punish_value_type: PUNISH_VALUE_TYPE.none,
              dependency_order_value: DEPENDENCY_ORDER_VALUE.none,
              punish_value: 0,
              punish_function: PUNISH_FUNCTION_TYPE.none,
              punish_lock_time: 168,
              punish_lock_time_type: PUNISH_LOCK_TIME_TYPE.hours,
              id_content_notification: null
            },
            {
              punish_type: PUNISH_TYPE.punish,
              nth_time: 4,
              punish_value_type: PUNISH_VALUE_TYPE.none,
              dependency_order_value: DEPENDENCY_ORDER_VALUE.none,
              punish_value: 0,
              punish_function: PUNISH_FUNCTION_TYPE.none,
              punish_lock_time: 720,
              punish_lock_time_type: PUNISH_LOCK_TIME_TYPE.hours,
              id_content_notification: null
            },
          ],
          cycle_time_type: CYCLE_TIME_TYPE.week,
          start_time_cycle: '2025-02-23T17:00:00.000Z',
        },
      ]

      await this.punishPolicyOopSystemService.createManyItem(lstPunishPolicy)

      console.log('setUpPunishPolicy is done');
    } catch(err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR)
    }
  } 
  
  async setUpRewardTicket() {
    try {
      const lstRewardTicket = [
        // {
        //   title: {
        //     vi: "Bấm hoàn thành ca đúng giờ",
        //     en: "Press to complete the shift",
        //   },
        //   user_apply: "collaborator",
        //   id_collaborator: new ObjectId('674fc9df5d0d1c1508e84109'),
        //   id_customer: null,
        //   date_create: new Date(Date.now()).toISOString(),
        //   current_total_time_process: 1,
        //   current_total_order_process: 1,
        //   status: "standby",
        //   id_reward_policy: new ObjectId('67d28c5555d8e1c6f1b9bfc5'),
        //   reward_value_type: REWARD_VALUE_TYPE.point,
        //   reward_value: 2,
        //   id_order: null,
        //   id_view: await this.generalHandleService.randomIDTransaction(4),
        //   type_wallet: "reward_point",
        // },
        // {
        //   title: {
        //     vi: "Bấm hoàn thành ca đúng giờ",
        //     en: "Press to complete the shift",
        //   },
        //   user_apply: "collaborator",
        //   id_collaborator: new ObjectId('674fc9df5d0d1c1508e84109'),
        //   id_customer: null,
        //   date_create: new Date(Date.now()).toISOString(),
        //   current_total_time_process: 1,
        //   current_total_order_process: 1,
        //   status: "standby",
        //   id_reward_policy: new ObjectId('67d28c5555d8e1c6f1b9bfc5'),
        //   reward_value_type: REWARD_VALUE_TYPE.point,
        //   reward_value: 2,
        //   id_order: null,
        //   id_view: await this.generalHandleService.randomIDTransaction(4),
        //   type_wallet: "reward_point",
        // },
        // {
        //   title: {
        //     vi: "Hoàn thành ca",
        //     en: "Complete the shift",
        //   },
        //   user_apply: "collaborator",
        //   id_collaborator: new ObjectId('674fc9df5d0d1c1508e84109'),
        //   id_customer: null,
        //   date_create: new Date(Date.now()).toISOString(),
        //   current_total_time_process: 1,
        //   current_total_order_process: 1,
        //   status: "standby",
        //   id_reward_policy: new ObjectId('67d28c5555d8e1c6f1b9bfbe'),
        //   reward_value_type: REWARD_VALUE_TYPE.point,
        //   reward_value: 2,
        //   id_order: null,
        //   id_view: await this.generalHandleService.randomIDTransaction(4),
        //   type_wallet: "reward_point",
        // },
        // {
        //   title: {
        //     vi: "Hoàn thành ca",
        //     en: "Complete the shift",
        //   },
        //   user_apply: "collaborator",
        //   id_collaborator: new ObjectId('674fc9df5d0d1c1508e84109'),
        //   id_customer: null,
        //   date_create: new Date(Date.now()).toISOString(),
        //   current_total_time_process: 1,
        //   current_total_order_process: 1,
        //   status: "standby",
        //   id_reward_policy: new ObjectId('67d28c5555d8e1c6f1b9bfbe'),
        //   reward_value_type: REWARD_VALUE_TYPE.point,
        //   reward_value: 2,
        //   id_order: null,
        //   id_view: await this.generalHandleService.randomIDTransaction(4),
        //   type_wallet: "reward_point",
        // },
        // {
        //   title: {
        //     vi: "Bấm bắt đầu ca đúng giờ",
        //     en: "Press to start the shift on time",
        //   },
        //   user_apply: "collaborator",
        //   id_collaborator: new ObjectId('674fc9df5d0d1c1508e84109'),
        //   id_customer: null,
        //   date_create: new Date(Date.now()).toISOString(),
        //   current_total_time_process: 1,
        //   current_total_order_process: 1,
        //   status: "standby",
        //   id_reward_policy: new ObjectId('67d28c5555d8e1c6f1b9bfb7'),
        //   reward_value_type: REWARD_VALUE_TYPE.point,
        //   reward_value: 2,
        //   id_order: null,
        //   id_view: await this.generalHandleService.randomIDTransaction(4),
        //   type_wallet: "reward_point",
        // },
        // {
        //   title: {
        //     vi: "Bấm bắt đầu ca đúng giờ",
        //     en: "Press to start the shift on time",
        //   },
        //   user_apply: "collaborator",
        //   id_collaborator: new ObjectId('674fc9df5d0d1c1508e84109'),
        //   id_customer: null,
        //   date_create: new Date(Date.now()).toISOString(),
        //   current_total_time_process: 1,
        //   current_total_order_process: 1,
        //   status: "standby",
        //   id_reward_policy: new ObjectId('67d28c5555d8e1c6f1b9bfcc'),
        //   reward_value_type: REWARD_VALUE_TYPE.point,
        //   reward_value: 2,
        //   id_order: null,
        //   id_view: await this.generalHandleService.randomIDTransaction(4),
        //   type_wallet: "reward_point",
        // },
        // {
        //   title: {
        //     vi: "Nhận đánh giá 5 sao",
        //     en: "Receive a 5-star rating",
        //   },
        //   user_apply: "collaborator",
        //   id_collaborator: new ObjectId('674fc9df5d0d1c1508e84109'),
        //   id_customer: null,
        //   date_create: new Date(Date.now()).toISOString(),
        //   current_total_time_process: 1,
        //   current_total_order_process: 1,
        //   status: "standby",
        //   id_reward_policy: new ObjectId('67d28c5555d8e1c6f1b9bfb7'),
        //   reward_value_type: REWARD_VALUE_TYPE.point,
        //   reward_value: 3,
        //   id_order: null,
        //   id_view: await this.generalHandleService.randomIDTransaction(4),
        //   type_wallet: "reward_point",
        // },
        {
          title: {
            vi: "Đạt thưởng mốc 40 điểm",
            en: "Achieve the 40-point milestone reward",
          },
          user_apply: "collaborator",
          id_collaborator: new ObjectId('674fc9df5d0d1c1508e84109'),
          id_customer: null,
          date_create: "2025-03-11T06:19:39.495Z",
          current_total_time_process: 1,
          current_total_order_process: 1,
          status: "standby",
          id_reward_policy: new ObjectId('67cea51cd164676908eb834d'),
          reward_value_type: REWARD_VALUE_TYPE.money,
          reward_value: 30000,
          id_order: null,
          id_view: await this.generalHandleService.randomIDTransaction(4),
          type_wallet: "work_wallet",
        },
      ]

      await this.rewardTicketOopSystemService.createManyItem(lstRewardTicket)

      console.log('setUpRewardTicket');
      
      return true
    } catch(err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async setUpPunishTicket() {
    try {
      const lstRewardTicket = [
        {
          id_customer: null,
          id_collaborator: new ObjectId('674fc9df5d0d1c1508e84109'),
          id_order: null,
          id_admin_action: null,
          date_create: new Date(Date.now()).toISOString(),
          title: {
            vi: "Quên trình CCCD",
            en: "Forgot to present the citizen identification card",
          },
          user_apply: 'collaborator',
          status: "standby",
          id_transaction: null,
          punish_lock_time: 1,
          current_total_time_process: 1,
          current_total_order_process: 1,
          id_punish_policy: new ObjectId('67d29a7bea474af2994a1467'),
          time_end: null,
          time_start: null,
          punish_money: 0,
          id_view: null,
          note_admin: "Quên trình CCCD",
          payment_out: null,
          payment_in: null,
          punish_type: PUNISH_TYPE.reminder,
          nth_time: 1,
        },
        {
          id_customer: null,
          id_collaborator: new ObjectId('674fc9df5d0d1c1508e84109'),
          id_order: null,
          id_admin_action: null,
          date_create: new Date(Date.now()).toISOString(),
          title: {
            vi: "Không mặc đồng phục",
            en: "Not wearing a uniform",
          },
          user_apply: 'collaborator',
          status: "standby",
          id_transaction: null,
          punish_lock_time: 1,
          current_total_time_process: 1,
          current_total_order_process: 1,
          id_punish_policy: new ObjectId('67d29a7bea474af2994a145e'),
          time_end: null,
          time_start: null,
          punish_money: 0,
          id_view: null,
          note_admin: "Không mặc đồng phục",
          payment_out: null,
          payment_in: null,
          punish_type: PUNISH_TYPE.reminder,
          nth_time: 1,
        },
      ]

      await this.punishTicketOopSystemService.createManyItem(lstRewardTicket)

      console.log('setUpPunishTicket is done');
      
      return true
    } catch(err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
  
  async setUpHistoryAcitiviesForRewardTicket() {
    try {
      let getCollaborator = await this.collaboratorModel.findById(new ObjectId('674fc9df5d0d1c1508e84109'))

      const lstHistoryActivities = [
        // {
        //   "date_create": '2025-03-10T00:00:00.000Z',
        //   "id_collaborator": new ObjectId('674fc9df5d0d1c1508e84109'),
        //   "title_admin": "Đối tác Huy Bắt đầu ca đúng giờ ca làm #25790004283.001!",
        //   "title": {
        //     "vi": "Bắt đầu ca đúng giờ",
        //     "en": "Bắt đầu ca đúng giờ",
        //   },
        //   "body": {
        //     "vi": "Bắt đầu ca đúng giờ ca làm #25790004283.001!",
        //     "en": "Bắt đầu ca đúng giờ ca làm #25790004283.001!",
        //   },
        //   "type": "system_add_reward_point",
        //   "id_reward_ticket": new ObjectId('67d2975882dd5ec40f586155'),
        //   "id_service": null,
        //   "value": 2,
        //   "is_delete": false,
        //   "current_reward_point": 2,
        //   "status_current_reward_point": "up"
        // },
        // {
        //   "date_create": '2025-03-10T02:00:01.400Z',
        //   "id_collaborator": new ObjectId('674fc9df5d0d1c1508e84109'),
        //   "title_admin": "Đối tác Huy Hoàn thành ca đúng giờ ca làm #25790004283.001!",
        //   "title": {
        //     "vi": "Hoàn thành ca đúng giờ",
        //     "en": "Hoàn thành ca đúng giờ",
        //   },
        //   "body": {
        //     "vi": "Hoàn thành ca đúng giờ ca làm #25790004283.001!",
        //     "en": "Hoàn thành ca đúng giờ ca làm #25790004283.001!",
        //   },
        //   "type": "system_add_reward_point",
        //   "id_reward_ticket": new ObjectId('67d2975882dd5ec40f586149'),
        //   "value": 2,
        //   "is_delete": false,
        //   "current_reward_point": 4,
        //   "status_current_reward_point": "up"
        // },
        // {
        //   "date_create": '2025-03-10T02:00:01.700Z',
        //   "id_collaborator": new ObjectId('674fc9df5d0d1c1508e84109'),
        //   "title_admin": "Đối tác Huy Hoàn thành ca ca làm #25790004283.001!",
        //   "title": {
        //     "vi": "Hoàn thành ca ca làm",
        //     "en": "Hoàn thành ca ca làm",
        //   },
        //   "body": {
        //     "vi": "Hoàn thành ca ca làm #25790004283.001!",
        //     "en": "Hoàn thành ca ca làm #25790004283.001!",
        //   },
        //   "type": "system_add_reward_point",
        //   "id_reward_ticket": new ObjectId('67d2975882dd5ec40f586149'),
        //   "value": 2,
        //   "is_delete": false,
        //   "current_reward_point": 6,
        //   "status_current_reward_point": "up"
        // },
        // {
        //   "date_create": '2025-03-10T03:00:01.700Z',
        //   "id_collaborator": new ObjectId('674fc9df5d0d1c1508e84109'),
        //   "title_admin": "Đối tác Huy Nhận đánh giá 5 sao ca làm #25790004283.001!",
        //   "title": {
        //     "vi": "Nhận đánh giá 5 sao",
        //     "en": "Nhận đánh giá 5 sao",
        //   },
        //   "body": {
        //     "vi": "Nhận đánh giá 5 sao ca làm #25790004283.001!",
        //     "en": "Nhận đánh giá 5 sao ca làm #25790004283.001!",
        //   },
        //   "type": "system_add_reward_point",
        //   "id_reward_ticket": new ObjectId('67d2975882dd5ec40f58614f'),
        //   "id_service": null,
        //   "value": 3,
        //   "is_delete": false,
        //   "current_reward_point": 9,
        //   "status_current_reward_point": "up"
        // },
        // {
        //   "date_create": '2025-03-10T02:00:01.700Z',
        //   "id_collaborator": new ObjectId('674fc9df5d0d1c1508e84109'),
        //   "title_admin": "Đối tác Huy Hoàn thành ca ca làm #25790004283.001!",
        //   "title": {
        //     "vi": "Hoàn thành ca ca làm",
        //     "en": "Hoàn thành ca ca làm",
        //   },
        //   "body": {
        //     "vi": "Hoàn thành ca ca làm #25790004283.001!",
        //     "en": "Hoàn thành ca ca làm #25790004283.001!",
        //   },
        //   "type": "system_add_reward_point",
        //   "id_reward_ticket": new ObjectId('67d2975882dd5ec40f586149'),
        //   "value": 2,
        //   "is_delete": false,
        //   "current_reward_point": 6,
        //   "status_current_reward_point": "up"
        // },
        {
          "date_create": '2025-03-11T19:00:00.000Z',
          "id_collaborator": new ObjectId('674fc9df5d0d1c1508e84109'),
          "title_admin": "Đối tác Huy đạt thưởng mốc 120 điểm!",
          "title": {
            "vi": "Đạt thưởng mốc 120 điểm",
            "en": "Đạt thưởng mốc 120 điểm",
          },
          "body": {
            "vi": "Đạt thưởng mốc 120 điểm!",
            "en": "Đạt thưởng mốc 120 điểm!",
          },
          "type": "system_add_reward_money",
          "id_reward_ticket": new ObjectId('67d3da972c98a70ffd14d8aa'),
          "id_service": null,
          "value": 70000,
          "is_delete": false,
          "current_work_wallet": 14000,
          "status_current_work_wallet": "up",
          "current_collaborator_wallet": 200000,
          "status_current_collaborator_wallet": "none"
        },
        // {
        //   "date_create": '2025-03-16T17:00:00.000Z',
        //   "id_collaborator": new ObjectId('674fc9df5d0d1c1508e84109'),
        //   "title_admin": "Hệ thống đặt lại điểm thưởng về 0 cho đối tác Huy ",
        //   "title": {
        //     "vi": "Hệ thống đặt lại điểm thưởng về 0",
        //     "en": "Hệ thống đặt lại điểm thưởng về 0",
        //   },
        //   "body": {
        //     "vi": "Hệ thống đặt lại điểm thưởng về 0",
        //     "en": "Hệ thống đặt lại điểm thưởng về 0",
        //   },
        //   "type": "system_reset_reward_point",
        // },
      ]
      // let currentPoint = 9
      // // let dateCreate = new Date('2025-03-17T00:00:00.000Z')
      // let dateCreate = new Date('2025-03-17T03:30:00.000Z')
      // for(let i = 0; i < lstHistoryActivities.length;i++) {
      //   currentPoint+=lstHistoryActivities[i].value
      //   lstHistoryActivities[i].current_reward_point = currentPoint
      //   if(i===0) {
      //     lstHistoryActivities[i].date_create = new Date(dateCreate).toISOString()
      //   }
      //   if(i===1) {
      //     lstHistoryActivities[i].date_create =  new Date(dateCreate.setHours(dateCreate.getHours() + 2)).toISOString()
      //   }
      //   if(i===2) {
      //     lstHistoryActivities[i].date_create =  new Date(dateCreate.setMilliseconds(300)).toISOString()
      //   }
      //   if(i===3) {
      //     lstHistoryActivities[i].date_create =  new Date(dateCreate.setMinutes(dateCreate.getMinutes() + 15)).toISOString()
      //   }
      //   console.log('date_create', lstHistoryActivities[i].date_create);
      //   console.log('currentPoint', currentPoint);
      // }

      await this.historyActivityOopSystemService.createManyItem(lstHistoryActivities)

      console.log('setUpHistoryAcitiviesForRewardTicket is done');
      
      return true
    } catch(err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
  
  async setUpHistoryAcitiviesForPunishTicket() {
    try {
      let getCollaborator = await this.collaboratorModel.findById(new ObjectId('674fc9df5d0d1c1508e84109'))

      const lstHistoryActivities = [
        {
          "date_create": '2025-03-13T09:41:40.034Z',
          "id_collaborator": new ObjectId('674fc9df5d0d1c1508e84109'),
          "title_admin": "Đối tác Huy Quên trình CCCD ca làm #25790004283.002!",
          "title": {
            "vi": "Quên trình CCCD",
            "en": "Quên trình CCCD",
          },
          "body": {
            "vi": "Quên trình CCCD ca làm #25790004283.002!",
            "en": "Quên trình CCCD ca làm #25790004283.002!",
          },
          "type": "system_log_violation",
          "id_punish_ticket": new ObjectId('67d2a853130e4f120f403d2b'),
          "is_delete": false,
        },
      ]

      await this.historyActivityOopSystemService.createManyItem(lstHistoryActivities)

      console.log('setUpHistoryAcitiviesForPunishTicket is done');
      
      return true
    } catch(err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
  
  async updatePunishPolicy() {
    try {
      await this.punishPolicyModel.updateMany({},
        {
          $set: {
            severity_level: 1
          }
        }
      )

      console.log('updatePunishPolicy is done');
      
      return true
    } catch(err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}
