import { BadRequestException, Body, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { endOfMonth, startOfMonth } from 'date-fns';
import { Model } from 'mongoose';
import { Collaborator, CollaboratorDocument, DeviceToken, DeviceTokenDocument, ERROR, GlobalService, iPageDTO } from 'src/@core';
import { ExamTest, ExamTestDocument } from 'src/@core/db/schema/examtest_collaborator.schema';
import { InfoTestCollaborator, InfoTestCollaboratorDocument } from 'src/@core/db/schema/info_test_collaborator.schema';
import { iPageExamTestDTOAdmin } from 'src/@core/dto/examtest.dto';
import { InfoTestCollaboratorDto } from 'src/@core/dto/info_test_collaborator.dto';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';
import { ActivityAdminSystemService } from 'src/core-system/activity-admin-system/activity-admin-system.service';
import { ActivityCollaboratorSystemService } from 'src/core-system/activity-collaborator-system/activity-collaborator-system.service';
import { GeneralHandleService } from '../../@share-module/general-handle/general-handle.service';
import { TrainingLesson, TrainingLessonDocument } from 'src/@core/db/schema/training_lesson.schema';
import { iPageTrainingLessonDTOCollaborator } from 'src/@core/dto/trainingLesson.dto';
import { increment } from 'firebase/database';
import { CollaboratorRepositoryService } from 'src/@repositories/repository-service/collaborator-repository/collaborator-repository.service';

@Injectable()
export class ExamTestService {
    constructor(
        private globalService: GlobalService,
        private activityCollaboratorSystemService: ActivityCollaboratorSystemService,
        private customExceptionService: CustomExceptionService,
        private generalHandleService: GeneralHandleService,
        private collaboratorRepositoryService: CollaboratorRepositoryService,
        @InjectModel(ExamTest.name) private examTestModel: Model<ExamTestDocument>,
        @InjectModel(Collaborator.name) private collaboratorModel: Model<CollaboratorDocument>,
        @InjectModel(InfoTestCollaborator.name) private infoTestCollaboratorModel: Model<InfoTestCollaboratorDocument>,
        @InjectModel(TrainingLesson.name) private trainingLessonModel: Model<TrainingLessonDocument>,

    ) { }

    async getListQuestion(lang, iPage: iPageExamTestDTOAdmin) {
        try {
            let query: any = {
                $and: [
                    { is_delete: false },
                    { is_active: true },
                    {
                        $or: [
                            {
                                $and: [
                                    { type_exam: { $exists: true } },
                                    { type_exam: iPage.type_exam },
                                ]
                            },
                            { type_exam: { $exists: false } }
                        ]
                    }
                ]
            };
            let arrItem = await this.examTestModel.find(query)
                .sort({ question: 1, _id: 1 })
                .skip(iPage.start)
                .limit(iPage.length);
            const count = await this.examTestModel.count(query);
            if (iPage.type_exam.toString() !== 'input') {
                arrItem = await this.generalHandleService.shuffleArr(arrItem);
            }
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

    async getDetailQuestion(idQuestion) {
        try {
            const getDetailQuestion = await this.examTestModel.findById(idQuestion)
            return getDetailQuestion;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);;
        }
    }

    async submitTest(lang, payload: InfoTestCollaboratorDto, user) {
        try {
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(payload.id_collaborator);

            if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, "collaborator")], HttpStatus.NOT_FOUND);
            const getTrainingLesson = await this.trainingLessonModel.findById(payload.id_training_lesson);
            if (!getTrainingLesson) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, "collaborator")], HttpStatus.NOT_FOUND);

            const correct_answer = payload.answers.filter(answer => answer.isCorrect).length;
            let check_pass = false;
            if (correct_answer >= getTrainingLesson.total_correct_exam_pass) {
                check_pass = true;
            }
            if (getTrainingLesson.total_correct_exam_pass > payload.answers.length) {
                // nếu tổng số câu trả lời để pass bài kiểm tra mà lớn hơn tổng số câu trả lời truyền lên
                // thì ta xem xét trường hợp 2 nếu tổng câu trả lời đúng chia cho tổng câu trả lời mà lớn hơn 3/4 thì ta cho pass bài kiểm tra
                if (correct_answer / payload.answers.length >= 3 / 4) {
                    check_pass = true;
                }
            }
            const newExam = new this.infoTestCollaboratorModel({
                id_collaborator: payload.id_collaborator,
                name_collaborator: getCollaborator.full_name,
                phone_collaborator: getCollaborator.phone,
                time_start: payload.time_start,
                total_answers: payload.answers.length, // tổng số câu hỏi mà client gửi lên
                answers: payload.answers,
                correct_answers: correct_answer, // số câu trả lời đúng của CTV
                score: `${correct_answer.toString()}/${payload.answers.length.toString()}`,
                type_exam: payload.type_exam,
                time_end: new Date(Date.now()).toISOString(),
                date_create: new Date(Date.now()).toISOString(),
                id_training_lesson: payload.id_training_lesson,
                is_pass: check_pass
            })
            await newExam.save();

            // // check xem CTV da hoan thanh het tat ca cac bai kiem tra hay chua
            // const countFindLesson =  await this.trainingLessonModel.count({type_training_lesson: {$in: ["input", "training"]}, is_delete: false, is_active: true});
            // const countLessonExam = await this.infoTestCollaboratorModel.count({type_exam: {$in: ["input", "training"]}, id_collaborator: getCollaborator._id})
            // const countLessonFail = await this.infoTestCollaboratorModel.count({type_exam: {$in: ["input", "training"]}, is_pass: false, id_collaborator: getCollaborator._id});

            // if((countFindLesson === countLessonExam) && countLessonFail === 0) {
            //     getCollaborator.status = "test_complete";
            //     getCollaborator.save();
            // }
            this.activityCollaboratorSystemService.submitTest(getCollaborator._id, newExam);
            return newExam;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);;
        }
    }
    async checkInfoTest(lang, user, headers) {
        try {
            const currentDate = new Date(Date.now());
            const startMonth = startOfMonth(currentDate).toISOString();
            const endMonth = endOfMonth(currentDate).toISOString();
            const queryInfo = {
                $and: [
                    { is_delete: false },
                    { id_collaborator: user._id },
                    { date_create: { $gte: startMonth } },
                    { date_create: { $lte: endMonth } },
                    { type_exam: 'periodic' }
                ]
            }
            const total = await this.infoTestCollaboratorModel.count(queryInfo).sort({ date_create: -1 });
            return total;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);;
        }
    }

    async getListTrainingLesson(lang, iPage: iPageTrainingLessonDTOCollaborator, user) {
        try {
            let query: any = {
                $and: [
                    { is_delete: false },
                    { is_active: true },
                    { type_training_lesson: iPage.type_training_lesson }
                ]
            };
            let arrItem = await this.trainingLessonModel.find(query)
                .sort({ lesson: 1, _id: 1 })
                .skip(iPage.start)
                .limit(iPage.length);

            let prevItem = undefined;
            const dataResult = [];
            for (let i of arrItem) {
                const query = {
                    $and: [
                        { id_training_lesson: i._id },
                        { id_collaborator: user._id },
                        { is_delete: false }
                    ]
                }

                const infoTest = await this.infoTestCollaboratorModel.findOne(query)
                    .sort({ date_create: -1 })
                const total = await this.infoTestCollaboratorModel.count(query);
                let check = false;
                if (infoTest) {
                    check = infoTest.is_pass; // nếu số câu trả lời của CTV đúng thì 
                }
                let is_lock = false;
                if (i.type_training_lesson !== 'input') {
                    is_lock = prevItem ? !prevItem.is_pass : false;
                    if (!prevItem) {
                        // check pass input theory
                        const query = {
                            $and: [
                                { id_collaborator: user._id },
                                { is_delete: false },
                                { type_exam: 'input' }
                            ]
                        }
                        const theory = await this.infoTestCollaboratorModel.findOne(query)
                            .sort({ date_create: -1, correct_answers: -1 })
                        let checkCorret = false
                        if (theory) {
                            checkCorret = theory.is_pass;
                        }
                        is_lock = !checkCorret;
                    }
                }
                const temp = {
                    _id: i._id,
                    title: i.title,
                    collaborator_times_submit: total,
                    is_pass: check,
                    description: i.description,
                    lesson: i.lesson,
                    total_estimate_lesson: i.total_estimate_lesson,
                    type_training_lesson: i.type_training_lesson,
                    is_lock: i.type_training_lesson === 'input' ? false : is_lock,
                    times_submit: i.times_submit
                }
                dataResult.push(temp);
                prevItem = temp;
            }
            const count = await this.trainingLessonModel.count(query);
            const result = {
                start: iPage.start,
                length: iPage.length,
                totalItem: count,
                data: dataResult
            }

            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getListExamByTrainingLesson(lang, idTrainingLesson: string, iPage: iPageTrainingLessonDTOCollaborator) {
        try {
            const getTrainingLesson = await this.trainingLessonModel.findById(idTrainingLesson);
            if (!getTrainingLesson) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "training lesson")], HttpStatus.NOT_FOUND);

            let query: any = {
                $and: [
                    { is_delete: false },
                    { is_active: true },
                    { id_training_lesson: idTrainingLesson }
                ]
            };
            let arrItem = await this.examTestModel.find(query)
                .skip(0)
                .limit(Number(getTrainingLesson.total_exam));
            const count = await this.examTestModel.count(query);
            arrItem = await this.generalHandleService.shuffleArr(arrItem)
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

    async checkTrainingLesson(lang, idTrainingLesson, user) {
        try {
            const getTraningLesson = await this.trainingLessonModel.findById(idTrainingLesson);
            if (!getTraningLesson) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "training lesson")], HttpStatus.NOT_FOUND);

            let query: any = {
                $and: [
                    { is_delete: false },
                    { id_training_lesson: getTraningLesson._id },
                    { id_collaborator: user._id }
                ]
            }
            if (getTraningLesson.type_training_lesson === 'periodic') {
                const currentDate = new Date(Date.now());
                const startMonth = startOfMonth(currentDate).toISOString();
                const endMonth = endOfMonth(currentDate).toISOString();
                query.$and.push({ date_create: { $gt: startMonth } })
                query.$and.push({ date_create: { $lt: endMonth } })
            }
            const getInfoTest = await this.infoTestCollaboratorModel.findOne(query)
                .sort({ date_create: -1 })
            let check = false;
            if (getInfoTest) {
                check = getInfoTest.is_pass;
            }
            const times_submit = await this.infoTestCollaboratorModel.count(query);
            const result = {
                collaborator_times_submit: times_submit,
                is_pass: check,
                times_submit: getTraningLesson.times_submit,
                total_answers: getInfoTest ? getInfoTest.total_answers : 0,
                correct_answers: getInfoTest ? getInfoTest.correct_answers : 0,
                score: getInfoTest ? getInfoTest.score : '0'
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);;
        }
    }

    async getDetailTrainingLesson(lang, idTrainingLesson, user) {
        try {
            const getTraningLesson = await this.trainingLessonModel.findById(idTrainingLesson);
            if (!getTraningLesson) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "training lesson")], HttpStatus.NOT_FOUND);
            return { data: getTraningLesson };
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);;
        }
    }
}
