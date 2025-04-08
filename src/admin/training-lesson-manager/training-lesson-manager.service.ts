import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Collaborator, CollaboratorDocument, ERROR, GlobalService, UserSystemDocument, iPageDTO } from 'src/@core';
import { InfoTestCollaborator, InfoTestCollaboratorDocument } from 'src/@core/db/schema/info_test_collaborator.schema';
import { TrainingLesson, TrainingLessonDocument } from 'src/@core/db/schema/training_lesson.schema';
import { actiTrainingDTOAdmin, createTrainingDTOAdmin, editTrainingDTOAdmin, iPageTrainingLessonDTOAdmin } from 'src/@core/dto/trainingLesson.dto';
import { CollaboratorRepositoryService } from 'src/@repositories/repository-service/collaborator-repository/collaborator-repository.service';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';
import { ActivityAdminSystemService } from 'src/core-system/activity-admin-system/activity-admin-system.service';

@Injectable()
export class TrainingLessonManagerService {
    constructor(
        private activityAdminSystemService: ActivityAdminSystemService,
        private customExceptionService: CustomExceptionService,
        private globalService: GlobalService,
        private collaboratorRepositoryService: CollaboratorRepositoryService,
        @InjectModel(TrainingLesson.name) private trainingLessonModel: Model<TrainingLessonDocument>,
        @InjectModel(Collaborator.name) private collaboratorModel: Model<CollaboratorDocument>,
        @InjectModel(InfoTestCollaborator.name) private infoTestCollaboratorModel: Model<InfoTestCollaboratorDocument>,
    ) { }
    async createTrainingLesson(lang, payload: createTrainingDTOAdmin, admin: UserSystemDocument) {
        try {
            const trainingLesson = new this.trainingLessonModel({
                lesson: payload.lesson,
                title: payload.title,
                description: payload.description,
                link_video: payload.link_video,
                type_training_lesson: payload.type_training_lesson,
                is_show_in_app: payload.is_show_in_app,
                date_create: new Date(Date.now()).toISOString(),
                times_submit: payload.times_submit,
                theory: payload.theory,
                total_exam: payload.total_exam,
                total_correct_exam_pass: payload.total_correct_exam_pass
            });
            const result = await trainingLesson.save();
            this.activityAdminSystemService.createTrainingLesson(admin._id, result._id);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getDetail(lang, id: string) {
        try {
            const trainingLesson = await this.trainingLessonModel.findById(id)
            if (!trainingLesson) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.FORBIDDEN);
            return trainingLesson;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async deleteTrainingLesson(lang, idTrainingLesson: string, admin: UserSystemDocument) {
        try {
            const getRTrainingLesson = await this.trainingLessonModel.findById(idTrainingLesson);
            if (!getRTrainingLesson) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.FORBIDDEN);
            // const checkPermisstion = await this.globalService.checkPermissionArea(admin, getRTrainingLesson.id_customer["city"]);
            // if (!checkPermisstion.permisstion) {
            //     throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            // }
            if (getRTrainingLesson.is_delete === true) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.FORBIDDEN);
            getRTrainingLesson.is_delete = true;
            await getRTrainingLesson.save();
            this.activityAdminSystemService.deleteTrainingLesson(admin._id, getRTrainingLesson._id);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async editTrainingLesson(lang, idTrainingLesson: string, payload: editTrainingDTOAdmin, admin: UserSystemDocument) {
        try {
            const trainingLesson = await this.trainingLessonModel.findById(idTrainingLesson);
            if (!trainingLesson) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.FORBIDDEN);
            trainingLesson.lesson = (payload.lesson) ? payload.lesson : trainingLesson.lesson;
            trainingLesson.title = (payload.title) ? payload.title : trainingLesson.title;
            trainingLesson.description = (payload.description) ? payload.description : trainingLesson.description;
            trainingLesson.link_video = (payload.link_video) ? payload.link_video : trainingLesson.link_video;
            trainingLesson.type_training_lesson = (payload.type_training_lesson) ? payload.type_training_lesson : trainingLesson.type_training_lesson;
            trainingLesson.is_show_in_app = (payload.is_show_in_app !== trainingLesson.is_show_in_app) ? payload.is_show_in_app : trainingLesson.is_show_in_app;
            trainingLesson.times_submit = (payload.times_submit) ? payload.total_exam : trainingLesson.times_submit;
            trainingLesson.theory = (payload.theory) ? payload.theory : trainingLesson.theory;
            trainingLesson.total_correct_exam_pass = (payload.total_correct_exam_pass) ? payload.total_correct_exam_pass : trainingLesson.total_correct_exam_pass;
            trainingLesson.total_exam = (payload.total_exam) ? payload.total_exam : trainingLesson.total_exam;
            if (payload.link_video === "") trainingLesson.link_video = "";
            await trainingLesson.save();
            this.activityAdminSystemService.editTrainingLesson(admin._id, trainingLesson._id);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    async getList(lang, iPage: iPageTrainingLessonDTOAdmin) {
        try {
            let query: any = {
                $and: [
                    { is_delete: false },
                ]
            }
            if (iPage.type_training_lesson !== 'all') {
                query.$and.push({ type_training_lesson: iPage.type_training_lesson })
            }
            const getListTrainingLesson = await this.trainingLessonModel.find(query);
            const count = await this.trainingLessonModel.count(query);
            const result = {
                start: iPage.start,
                length: iPage.length,
                totalItem: count,
                data: getListTrainingLesson
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getListTraniningLessonByCollaborator(lang, iPage: iPageTrainingLessonDTOAdmin, idCollaborator) {
        try {
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(idCollaborator);

            if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, 'collaborator')], HttpStatus.FORBIDDEN);
            let query: any = {
                $and: [
                    { is_delete: false },
                    { is_active: true },
                ]
            };
            if (iPage.type_training_lesson !== 'all') {
                query.$and.push({ type_training_lesson: iPage.type_training_lesson })
            }
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
                        { id_collaborator: getCollaborator._id },
                        { is_delete: false }
                    ]
                }

                const arrInfoTest = await this.infoTestCollaboratorModel.findOne(query)
                    .sort({ date_create: -1 })
                const total = await this.infoTestCollaboratorModel.count(query);
                let check = false;
                if (arrInfoTest) {
                    check = arrInfoTest.is_pass
                }
                let is_lock = false;
                if (i.type_training_lesson !== 'input') {
                    is_lock = prevItem ? !prevItem.is_pass : false;
                    if (!prevItem) {
                        // check pass input theory
                        const query = {
                            $and: [
                                { id_collaborator: getCollaborator._id },
                                { is_delete: false },
                                { type_exam: 'input' }
                            ]
                        }
                        const theory = await this.infoTestCollaboratorModel.findOne(query)
                            .sort({ date_create: -1, correct_answers: -1 })
                        let checkCorret = false
                        if (theory) {
                            checkCorret = Number(theory.correct_answers / theory.total_answers) >= Number(3 / 4)
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

    async activeTrainingLesson(lang, payload: actiTrainingDTOAdmin, idTrainingLesson: string, admin: UserSystemDocument) {
        try {
            const getTrainingLesson = await this.trainingLessonModel.findById(idTrainingLesson);
            if (!getTrainingLesson) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.FORBIDDEN);
            // const checkPermisstion = await this.globalService.checkPermissionArea(admin, getTrainingLesson.id_customer["city"]);
            // if (!checkPermisstion.permisstion) {
            //     throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            // }
            getTrainingLesson.is_active = (payload.is_active !== getTrainingLesson.is_active) ? payload.is_active : getTrainingLesson.is_active;
            await getTrainingLesson.save();
            this.activityAdminSystemService.activeTrainingLesson(admin._id, getTrainingLesson._id);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    async getDetailTrainingLesson(lang, idTrainingLesson: string, admin: UserSystemDocument) {
        try {
            const getTrainingLesson = await this.trainingLessonModel.findById(idTrainingLesson);
            if (!getTrainingLesson) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.FORBIDDEN);
            return getTrainingLesson;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
