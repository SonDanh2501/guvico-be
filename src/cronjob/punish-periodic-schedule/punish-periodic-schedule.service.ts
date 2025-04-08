import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron } from '@nestjs/schedule';
import { addDays, endOfMonth, startOfMonth } from 'date-fns';
import { Model } from 'mongoose';
import { Collaborator, CollaboratorDocument, PunishCollaboratorDTOAdmin } from 'src/@core';
import { InfoTestCollaborator, InfoTestCollaboratorDocument } from 'src/@core/db/schema/info_test_collaborator.schema';
import { Punish, PunishDocument } from 'src/@core/db/schema/punish.schema';
import { GeneralHandleService } from 'src/@share-module/general-handle/general-handle.service';
import { PunishManagerService } from 'src/admin/punish-manager/punish-manager.service';

@Injectable()
export class PunishPeriodicScheduleService {
    constructor(
        private generalHandleService: GeneralHandleService,
        private punishManagerService: PunishManagerService,

        @InjectModel(Punish.name) private punishModel: Model<PunishDocument>,
        @InjectModel(Collaborator.name) private collaboratorModel: Model<CollaboratorDocument>,
        @InjectModel(InfoTestCollaborator.name) private infoTestCollaboratorModel: Model<InfoTestCollaboratorDocument>,

    ) { }
    @Cron(
        '0 0 02 21 * *',
        {
            timeZone: 'Asia/Ho_Chi_Minh'
        })
    async handleCron() {
        // this.punishExam()
    }
    async punishExam() {
        try {
            const currentDate = new Date(Date.now());
            const startMonth = startOfMonth(currentDate).toISOString();
            const endMonth = endOfMonth(currentDate).toISOString();
            const minimum_date_create = addDays(new Date(startMonth), 10);
            // chỉ lấy các CTV đăng ký trước ngày 10
            // các CTV đăng ký sau ngày 10 hằng tháng sẽ không làm bài kiểm tra
            const query = {
                $and: [
                    { is_delete: false },
                    { is_active: true },
                    { is_verify: true },
                    { is_locked: false },
                    { date_create: { $lte: minimum_date_create } }
                ]
            }
            const getCollaborator = await this.collaboratorModel.find(query);
            for (let collaborator of getCollaborator) {
                const queryInfo = {
                    $and: [
                        { is_delete: false },
                        { id_collaborator: collaborator._id.toString() },
                        { date_create: { $gte: startMonth } },
                        { date_create: { $lte: endMonth } },
                        { type_exam: 'periodic' }
                    ]
                }
                const getInfoTest = await this.infoTestCollaboratorModel.findOne(queryInfo)
                    .sort({ date_create: -1 });
                let payload: PunishCollaboratorDTOAdmin;
                if (getInfoTest) {
                    payload = {
                        money: 10000,
                        punish_note: "Phạt tiền không đạt bài kiểm tra hàng tháng",
                        id_punish: "64a37768cbb868c3aa137f1b",
                        id_info_test_collaborator: getInfoTest._id.toString()
                    }
                    if (getInfoTest.is_pass) {
                        await this.punishManagerService.systemMonetaryFineCollaborator("vi", collaborator._id, payload);
                    }
                } else {
                    payload = {
                        money: 20000,
                        punish_note: "Phạt tiền không làm bài kiểm tra hàng tháng",
                        id_punish: "64a377abcbb868c3aa1386ba",
                    }
                    await this.punishManagerService.systemMonetaryFineCollaborator("vi", collaborator._id, payload);
                }
            }
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
