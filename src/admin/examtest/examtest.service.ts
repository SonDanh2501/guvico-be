import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GlobalService, ERROR, Customer, CustomerDocument, UserSystem, UserSystemDocument, iPageDTO } from 'src/@core';
import { ExamTest, ExamTestDocument } from 'src/@core/db/schema/examtest_collaborator.schema';
import { InfoTestCollaborator, InfoTestCollaboratorDocument } from 'src/@core/db/schema/info_test_collaborator.schema';
import { ExamTestDto, actiExamTestDTOAdmin, createExamTestDTOAdmin, deleteExamTestDTOAdmin, editExamTestDTOAdmin, iPageExamTestDTOAdmin } from 'src/@core/dto/examtest.dto';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';
import { ActivityAdminSystemService } from 'src/core-system/activity-admin-system/activity-admin-system.service';

@Injectable()
export class ExamTestService {
    constructor(
        private globalService: GlobalService,
        private customExceptionService: CustomExceptionService,
        private activityAdminSystemService: ActivityAdminSystemService,
        @InjectModel(ExamTest.name) private examTestModel: Model<ExamTestDocument>,
        @InjectModel(InfoTestCollaborator.name) private inforTestCollaboratorModel: Model<InfoTestCollaboratorDocument>,

    ) { }

    async getListQuestion(lang, iPage: iPageExamTestDTOAdmin) {
        try {
            let query: any = {
                $and: [
                    { is_delete: false }
                ]
            }
            if (iPage.type !== 'all') {
                query.$and.push({ is_active: true })
            }
            if (iPage.type_exam !== 'all') {
                query.$and.push({
                    $or: [
                        {
                            $and: [
                                { type_exam: { $exists: true } },
                                { type_exam: iPage.type_exam },
                            ]
                        },
                        { type_exam: { $exists: false } }
                    ]
                })
            }
            const arrItem = await this.examTestModel.find(query)
                .sort({ question: 1, date_create: -1 })
                .skip(iPage.start)
                .limit(iPage.length);
            const count = await this.examTestModel.count(query)
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

    async createQuestion(lang, payload: createExamTestDTOAdmin, idAdmin: string) {
        try {
            const newItem = new this.examTestModel({
                question: payload.question,
                title: payload.title,
                description: payload.description,
                choose: payload.choose,
                date_create: new Date(Date.now()).toISOString(),
                id_training_lesson: payload.id_training_lesson
            });
            await newItem.save();
            this.activityAdminSystemService.createExamtest(idAdmin, newItem._id);
            return newItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async editQuestion(lang, payload: editExamTestDTOAdmin, id: string, idAdmin: string) {
        try {
            const getItem = await this.examTestModel.findById(id);
            if (!getItem) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
            }
            getItem.question = payload.question || getItem.question
            getItem.title = payload.title || getItem.title
            getItem.description = payload.description || getItem.description
            getItem.choose = payload.choose || getItem.choose
            getItem.id_training_lesson = payload.id_training_lesson || getItem.id_training_lesson
            await getItem.save();
            this.activityAdminSystemService.editExamtest(idAdmin, id);
            return getItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async actiQuestion(lang, payload: actiExamTestDTOAdmin, id: string, idAdmin: string) {
        try {
            const getItem = await this.examTestModel.findById(id);
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            getItem.is_active = (payload.is_active !== getItem.is_active) ? payload.is_active : getItem.is_active
            await getItem.save();
            this.activityAdminSystemService.activeExamTest(idAdmin, id);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async deleteQuestion(lang, payload: deleteExamTestDTOAdmin, id: string, idAdmin: string) {
        try {
            const getItem = await this.examTestModel.findById(id);
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            getItem.is_delete = true;
            await getItem.save();
            this.activityAdminSystemService.deleteExamTest(idAdmin, id);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getDetailQuestion(idQuestion) {
        try {
            const getDetailQuestion = await this.examTestModel.findById(idQuestion)
            return getDetailQuestion;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getExamByTrainingLesson(lang, iPage: iPageExamTestDTOAdmin, idTrainingLesson) {
        try {
            const query = {
                $and: [
                    { is_delete: false },
                    { id_training_lesson: idTrainingLesson }
                ]
            }
            const getList = await this.examTestModel.find(query)
                .sort({ date_create: -1, _id: 1 })
                .skip(iPage.start)
                .limit(iPage.length)
            const count = await this.examTestModel.count(query);
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
}
