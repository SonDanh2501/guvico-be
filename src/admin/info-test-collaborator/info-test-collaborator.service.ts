import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { count } from 'console';
import { Model } from 'mongoose';
import { Collaborator, CollaboratorDocument, ERROR, GlobalService, POP_COLLABORATOR_INFO, UserSystemDocument, iPageDTO } from 'src/@core';
import { InfoTestCollaborator, InfoTestCollaboratorDocument } from 'src/@core/db/schema/info_test_collaborator.schema';
import { TrainingLesson, TrainingLessonDocument } from 'src/@core/db/schema/training_lesson.schema';
import { InfoTestCollaboratorDto, deleteInfoTestDTOCollaborator, iPageInfoTestCollaboratorDTOAdmin } from 'src/@core/dto/info_test_collaborator.dto';
import { CollaboratorRepositoryService } from 'src/@repositories/repository-service/collaborator-repository/collaborator-repository.service';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';
import { ActivityAdminSystemService } from 'src/core-system/activity-admin-system/activity-admin-system.service';
import { ActivityCollaboratorSystemService } from 'src/core-system/activity-collaborator-system/activity-collaborator-system.service';

@Injectable()
export class InfoTestCollaboratorService {
    constructor(
        private globalService: GlobalService,
        private activityAdminSystemService: ActivityAdminSystemService,
        private activityCollaboratorSystemService: ActivityCollaboratorSystemService,
        private customExceptionService: CustomExceptionService,
        private collaboratorRepositoryService: CollaboratorRepositoryService,
        @InjectModel(InfoTestCollaborator.name) private inforTestCollaboratorModel: Model<InfoTestCollaboratorDocument>,
        @InjectModel(Collaborator.name) private collaboratorModel: Model<CollaboratorDocument>,
        @InjectModel(TrainingLesson.name) private trainingLessonModel: Model<TrainingLessonDocument>,

    ) { }

    async getListInforTest(lang, iPage: iPageInfoTestCollaboratorDTOAdmin, admin: UserSystemDocument) {
        try {
            let query: any = {
                $and: [
                    { is_delete: false }
                ]
            }
            if (iPage.type_exam !== 'all') {
                query.$and.push({ type_exam: iPage.type_exam })
            }
            const arrItem = await this.inforTestCollaboratorModel.find(query)
                .populate(POP_COLLABORATOR_INFO)
                .populate([{ path: 'answers', populate: { path: 'info_question', model: 'ExamTest' } },
                ])
                .sort({ date_create: -1, _id: 1 })
                .skip(iPage.start)
                .limit(iPage.length);

            const count = await this.inforTestCollaboratorModel.count(query)
            const result = {
                start: iPage.start,
                length: iPage.length,
                totalItem: count,
                data: arrItem
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getDetailInfoTest(lang, idInfo) {
        try {
            const getDetailInfoTest = await this.inforTestCollaboratorModel.findById(idInfo)
                .populate(POP_COLLABORATOR_INFO)
                .populate([{ path: 'answers', populate: { path: 'info_question', model: 'ExamTest' } },
                ])
            if (!getDetailInfoTest) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            return getDetailInfoTest;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getListInforTestByCollaborator(lang, iPage: iPageInfoTestCollaboratorDTOAdmin, idCollaborator) {
        try {
            let query: any = {
                $and: [
                    { is_delete: false },
                    { id_collaborator: idCollaborator }
                ]
            }
            if (iPage.type_exam !== 'all') {
                query.$and.push({ type_exam: iPage.type_exam })
            }
            const getList = await this.inforTestCollaboratorModel.find(query)
                .sort({ date_create: -1 })
                .skip(iPage.start)
                .limit(iPage.length)
                .populate(POP_COLLABORATOR_INFO)
                .populate([{ path: 'answers', populate: { path: 'info_question', model: 'ExamTest' } },
                ])
                .populate({ path: 'id_training_lesson', select: { title: 1, _id: 1, description: 1, times_submit: 1, link_video: 1 } })
            const count = await this.inforTestCollaboratorModel.count(query);
            const result = {
                start: iPage.start,
                length: iPage.length,
                totalItem: count,
                data: getList
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async deleteInfoTest(lang, payload: deleteInfoTestDTOCollaborator, id: string, idAdmin: string) {
        try {
            const getItem = await this.inforTestCollaboratorModel.findById(id);
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            getItem.is_delete = (payload.is_delete !== getItem.is_delete) ? payload.is_delete : getItem.is_delete
            await getItem.save();
            this.activityAdminSystemService.deleteInfoTestCollaborator(idAdmin, id);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    async getListInfoTestByTrainingLesson(lang, iPage, idTrainingLesson, idCollaborator) {
        try {
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(idCollaborator);

            if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, 'collaborator')], HttpStatus.NOT_FOUND);
            const getTrainingLesson = await this.trainingLessonModel.findById(idTrainingLesson);
            if (!getTrainingLesson) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, 'traininge lesson')], HttpStatus.NOT_FOUND);
            const query = {
                $and: [
                    { is_delete: false },
                    { id_collaborator: getCollaborator._id },
                    { id_training_lesson: getTrainingLesson._id }
                ]
            }
            const getInfoTest = await this.inforTestCollaboratorModel.find(query)
                .sort({ date_create: -1, _id: 1 })
                .skip(iPage.start)
                .limit(iPage.length)
                .populate(POP_COLLABORATOR_INFO)
                .populate([{ path: 'answers', populate: { path: 'info_question', model: 'ExamTest' } },
                ])
                .populate({ path: 'id_training_lesson', select: { title: 1, _id: 1, description: 1, times_submit: 1, link_video: 1 } })
            const count = await this.inforTestCollaboratorModel.count(query)
            const result = {
                start: iPage.start,
                length: iPage.length,
                totalItem: count,
                data: getInfoTest
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async createInfoExam(lang, payload: InfoTestCollaboratorDto, idAdmin: string) {
        try {
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(payload.id_collaborator);

            if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, 'collaborator')], HttpStatus.NOT_FOUND);
            const getTrainingLesson = await this.trainingLessonModel.findById(payload.id_training_lesson);
            if (!getTrainingLesson) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, 'training lesson')], HttpStatus.NOT_FOUND);

            const newExam = new this.inforTestCollaboratorModel({
                id_collaborator: payload.id_collaborator,
                name_collaborator: getCollaborator.full_name,
                phone_collaborator: getCollaborator.phone,
                time_start: new Date(Date.now()).toISOString(),
                total_answers: 0, // tổng số câu hỏi
                answers: [],
                correct_answers: 0, // số câu trả lời đúng của CTV
                score: `0/0`,
                type_exam: payload.type_exam,
                time_end: new Date(Date.now()).toISOString(),
                date_create: new Date(Date.now()).toISOString(),
                id_training_lesson: payload.id_training_lesson,
                is_pass: true
            })
            await newExam.save();
            this.activityCollaboratorSystemService.submitTest(getCollaborator._id, newExam);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
