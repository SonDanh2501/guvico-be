import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ERROR, iPageDTO } from 'src/@core';
import { CollaboratorSettingRepositoryService } from 'src/@repositories/repository-service/collaborator-setting-repository/collaborator-setting-repository.service';
import { CustomerSettingRepositoryService } from 'src/@repositories/repository-service/customer-setting-repository/customer-setting-repository.service';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';
import { iPageTrainingLessonDTOCollaborator } from 'src/@core/dto/trainingLesson.dto';
import { TrainingLessonRepositoryService } from 'src/@repositories/repository-service/training-lesson-repository/training-lesson-repository.service';
import { InfoTestCollaboratorRepositoryService } from 'src/@repositories/repository-service/info-test-collaborator-repository/info-test-collaborator-repository.service';
import { createTrainingDTOAdmin } from 'src/@core/dto/trainingLesson.dto';
@Injectable()
export class TraininglessonsOopSystemService {
    constructor(
        private customExceptionService: CustomExceptionService,
        private infoTestCollaboratorRepositoryService: InfoTestCollaboratorRepositoryService,
        private trainingLessonRepositoryService: TrainingLessonRepositoryService
    ) { }
    async getListTrainingLesson(lang, iPage: iPageTrainingLessonDTOCollaborator, user, service) {

        try {

            let query: any = {
                $and: [
                    { is_delete: false },
                    { is_active: true },
                    { type_training_lesson: iPage.type_training_lesson },
                    { type_service_exam: service }
                ]
            };

            let arrItem = await this.trainingLessonRepositoryService.getListDataByCondition(query)
            const count = await this.trainingLessonRepositoryService.countDataByCondition(query);
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

                const infoTest = await this.infoTestCollaboratorRepositoryService.findOne(query, {}, { date_create: -1 })

                const total = await this.infoTestCollaboratorRepositoryService.countDataByCondition(query);

                let check = false;
                if (infoTest) {
                    check = infoTest.is_pass;
                }
                let is_lock = false;
                if (i.type_training_lesson !== 'input') {
                    is_lock = prevItem ? !prevItem.is_pass : false;
                    if (!prevItem) {

                        const query = {
                            $and: [
                                { id_collaborator: user._id },
                                { is_delete: false },
                                { type_exam: 'input' }
                            ]
                        }
                        const theory = await this.infoTestCollaboratorRepositoryService.findOne(query, {}, { date_create: -1, correct_answers: -1 })


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

    async createTrainingLesson(payload: createTrainingDTOAdmin) {
        try {
            const dataCreate = {
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
                total_correct_exam_pass: payload.total_correct_exam_pass,
                type_service_exam: payload.type_service_exam
            }
            const newItem = await this.trainingLessonRepositoryService.create(dataCreate);
            return newItem;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }









}
