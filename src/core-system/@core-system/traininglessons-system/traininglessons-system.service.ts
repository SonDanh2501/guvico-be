import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service'
import { CollaboratorOopSystemService } from 'src/core-system/@oop-system/collaborator-oop-system/collaborator-oop-system.service'
import { HistoryActivityOopSystemService } from 'src/core-system/@oop-system/history-activity-oop-system/history-activity-oop-system.service'
import { TraininglessonsOopSystemService } from 'src/core-system/@oop-system/traininglessons-oop-system/traininglessons-oop-system.service'
import { actiTrainingDTOAdmin, createTrainingDTOAdmin, editTrainingDTOAdmin, iPageTrainingLessonDTOAdmin } from 'src/@core/dto/trainingLesson.dto';
import { Collaborator, CollaboratorDocument, ERROR, GlobalService, UserSystemDocument, iPageDTO } from 'src/@core';
import { ActivityOopSystemService } from 'src/core-system/@oop-system/activity-oop-system/activity-oop-system.service'

@Injectable()
export class TraininglessonsSystemService {
    constructor(

        private collaboratorOopSystemService: CollaboratorOopSystemService,
        private traininglessonsOopSystemService: TraininglessonsOopSystemService,
        private activityOopSystemService: ActivityOopSystemService
    ) { }



    async getListTrainingLesson(lang, iPage, user) {
        try {
            const userId = user._id
            const arrServiceApply = await this.collaboratorOopSystemService.getDesireService(userId)
            const result = await this.traininglessonsOopSystemService.getListTrainingLesson(lang, iPage, user, arrServiceApply)
            return result
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    async createTrainingLesson(payload: createTrainingDTOAdmin, admin: UserSystemDocument) {
        try {

            const trainingLesson = await this.traininglessonsOopSystemService.createTrainingLesson(payload)
            await this.activityOopSystemService.createTrainingLesson(trainingLesson, admin);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

}
