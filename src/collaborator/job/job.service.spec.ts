
import { Test, TestingModule } from "@nestjs/testing";
import { JobService } from "./job.service";
import { CustomExceptionService } from "src/@share-module/custom-exception/custom-exception.service";
import { GroupOrderSystemService } from "src/core-system/group-order-system/group-order-system.service";
import { OrderSystemService } from "src/core-system/order-system/order-system.service";
import { CollaboratorModule } from "../collaborator.module";
import { CoreSystemModule } from "src/core-system/core-system.module";
import { CollaboratorSystemService } from "src/core-system/collaborator-system/collaborator-system.service";
import { CollaboratorDocument, OrderDocument } from "src/@core";
import { GroupOrderDocument } from "src/@core/db/schema/group_order.schema";
const testCasePendingToConfirmOrder = [
  {
    title: 'Thông tin đơn hàng bị lỗi',
    id_collaborator: '64377673971815b99f8cf778',
    id_order: '',
    expect_result: 'Không tìm thấy dữ liệu',
    version: '1.1.11',
    lang: 'vi'
  },
  {
    title: 'Thông tin CTV bị lỗi',
    id_collaborator: '64377673971815b99f8cf778',
    id_order: '',
    expect_result: 'Taì khoản không tồn tại',
    version: '1.1.11',
    lang: 'vi'
  },
  {
    title: 'Đơn hàng bị huỷ',
    id_collaborator: '64377673971815b99f8cf778',
    id_order: '',
    expect_result: 'Công việc đã bị huỷ',
    version: '1.1.11',
    lang: 'vi'
  },
  {
    title: 'Đơn hàng đã có người nhận',
    id_collaborator: '64377673971815b99f8cf778',
    id_order: '',
    expect_result: 'Công việc đã có người nhận',
    version: '1.1.11',
    lang: 'vi'
  },
  {
    title: 'Thời gian làm việc trùng nhau',
    id_collaborator: '64377673971815b99f8cf778',
    id_order: '',
    expect_result: "Thời gian làm việc trùng nhau",
    version: '1.1.11',
    lang: 'vi'
  },
  {
    title: 'Đơn hàng đã được hoàn thành',
    id_collaborator: '64377673971815b99f8cf778',
    id_order: '',
    expect_result: "Công việc đã hoàn thành",
    version: '1.1.11',
    lang: 'vi'
  },
  {
    title: 'Không đủ tiền nhận đơn hàng',
    id_collaborator: '64377673971815b99f8cf778',
    id_order: '',
    expect_result: "Không đủ tiền bạn hãy nạp thêm tiền để nhận việc này",
    version: '1.1.11',
    lang: 'vi'
  },
]
describe('JobService', () => {
  let jobService: JobService;
  let collaboratorSystem: CollaboratorSystemService;
  let orderSystemService: OrderSystemService;
  let groupOrderSystemService: GroupOrderSystemService;
  let collaborator: CollaboratorDocument;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        CollaboratorModule, CoreSystemModule
      ]
    }).compile();
    jobService = module.get<JobService>(JobService);
    collaboratorSystem = module.get<CollaboratorSystemService>(CollaboratorSystemService);
    orderSystemService = module.get<OrderSystemService>(OrderSystemService);
    groupOrderSystemService = module.get<GroupOrderSystemService>(GroupOrderSystemService);
    collaborator = await collaboratorSystem.findCollaboratorById('64377673971815b99f8cf778');//CTV Lam Trường
  });
  describe('collaborator confirm order EXEPTION CASE', () => {
    testCasePendingToConfirmOrder.forEach((testCase) => {
      const { title, id_collaborator, id_order, expect_result, version, lang } = testCase;
      it(title, async () => {
        const getCollaborator = await collaboratorSystem.findCollaboratorById(id_collaborator);
        const expectError = async () => {
          try {
            await jobService.collaboratorEditPedingConfirm(lang, getCollaborator, id_order, version);
          } catch (error) {
            expect(error.message).toHaveProperty(error.response[0].message);
            throw error;
          }
        };
        await expect(expectError()).rejects.toThrow(expect_result);
      });
    });
    // describe('confirm order HAPPY CASE', () => {
    //   let getOrder: OrderDocument;
    //   let getGroupOrder: GroupOrderDocument;
    //   beforeEach(async () => {
    //     await collaboratorSystem.resetCollaborator('64377673971815b99f8cf778');
    //     getOrder = await jobService.collaboratorEditPedingConfirm('vi', collaborator, '64fe74f27afb8c11efdfba07', '2.1.1');
    //   })
    //   afterEach(async () => {
    //     await orderSystemService.resetOrder('64fe74f27afb8c11efdfba07');
    //     await collaboratorSystem.resetCollaborator('64377673971815b99f8cf778');
    //   });

    //   it('kiểm tra trừ tiền phí dịch vụ của CTV', async () => {
    //     const total_previousBalance = collaborator.gift_remainder + collaborator.remainder;
    //     const total_previousBalance_wallet = collaborator.work_wallet + collaborator.collaborator_wallet;
    //     collaborator = await collaboratorSystem.findCollaboratorById('64377673971815b99f8cf778');
    //     const total_remainder = collaborator.gift_remainder + collaborator.remainder;
    //     const total_remainder_wallet = collaborator.work_wallet + collaborator.collaborator_wallet;
    //     expect(getOrder.platform_fee + getOrder.pending_money).toEqual(total_previousBalance - total_remainder);
    //     expect(getOrder.platform_fee + getOrder.pending_money).toEqual(total_previousBalance_wallet - total_remainder_wallet);
    //   });

    //   it('kiểm tra thông tin CTV trong ca làm', async () => {
    //     expect(getOrder.name_collaborator).toEqual(collaborator.full_name);
    //     expect(getOrder.phone_collaborator).toEqual(collaborator.phone);
    //     expect(getOrder.id_collaborator).toEqual(collaborator._id);
    //   });

    //   it('kiểm tra thông tin CTV trong tổng đơn hàng', async () => {
    //     expect(getGroupOrder.name_collaborator).toEqual(collaborator.full_name);
    //     expect(getGroupOrder.phone_collaborator).toEqual(collaborator.phone);
    //     expect(getGroupOrder.id_collaborator).toEqual(collaborator._id);
    //   });

    //   it('kiểm tra trạng thái đơn hàng', async () => {
    //     expect(getOrder.status).toEqual('confirm');
    //   });

    //   it('kiểm tra trạng thái tổng đơn hàng', async () => {
    //     expect(getGroupOrder.status).toEqual('confirm');
    //   });

    // })
    // describe('confirm order EXEPTION CASE', () => {

    //   it('Đơn hàng đã được người khác nhận', async () => {
    //     const getCollaborator = await collaboratorSystem.findCollaboratorById('64ffdbf8e4e1d637a13d35a1'); // CTV Lam Trường V2
    //     const expectError = async () => {
    //       try {
    //         await jobService.collaboratorEditPedingConfirm('vi', getCollaborator, '64fe74f27afb8c11efdfba07', '1.1.11');
    //       } catch (error) {
    //         expect(error.message).toHaveProperty(error.response[0].message);
    //         throw error;
    //       }
    //     };
    //     await expect(expectError()).rejects.toThrow('Công việc đã có người nhận');
    //   });
    //   it('Đơn hàng đã được người khác nhận và đang làm', async () => {
    //     const getCollaborator = await collaboratorSystem.findCollaboratorById('64ffdc0be4e1d637a13d35a3'); // CTV Lam Trường V2
    //     const expectError = async () => {
    //       try {
    //         await jobService.collaboratorEditPedingConfirm('vi', getCollaborator, '64ffdcfbe4e1d637a13d35a9', '1.1.11');
    //       } catch (error) {
    //         expect(error.message).toHaveProperty(error.response[0].message);
    //         throw error;
    //       }
    //     };
    //     await expect(expectError()).rejects.toThrow('Đơn hàng đang làm');
    //   });
    //   it('Đơn hàng đã được hoàn thành', async () => {
    //     const getCollaborator = await collaboratorSystem.findCollaboratorById('64ffdbf8e4e1d637a13d35a1'); // CTV Lam Trường V2
    //     const expectError = async () => {
    //       try {
    //         await jobService.collaboratorEditPedingConfirm('vi', getCollaborator, '64ffdb70e4e1d637a13d359b', '1.1.11');
    //       } catch (error) {
    //         expect(error.message).toHaveProperty(error.response[0].message);
    //         throw error;
    //       }
    //     };
    //     await expect(expectError()).rejects.toThrow('Đơn hàng đã hoàn thành');
    //   });
    //   it('Đơn hàng đã bị huỷ', async () => {
    //     const getCollaborator = await collaboratorSystem.findCollaboratorById('64ffdbf8e4e1d637a13d35a1'); // CTV Lam Trường V2
    //     const expectError = async () => {
    //       try {
    //         await jobService.collaboratorEditPedingConfirm('vi', getCollaborator, '64ffdd05e4e1d637a13d35ab', '1.1.11');
    //       } catch (error) {
    //         expect(error.message).toHaveProperty(error.response[0].message);
    //         throw error;
    //       }
    //     };
    //     await expect(expectError()).rejects.toThrow('Đơn hàng đã bị huỷ');
    //   });
    //   it('CTV không đủ tiền nhận đơn hàng', async () => {

    //   });
    //   it('CTV bị trùng thời gian làm việc', async () => {

    //   });
    //   it('CTV bị hạn chế bởi khách hàng', async () => {

    //   });
    //   it('CTV đã từng huỷ ca làm đó', async () => {

    //   });
    // });

  })

});
