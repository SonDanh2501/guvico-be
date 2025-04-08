import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { LeaderBoardRepositoryService } from 'src/@repositories/repository-service/leader-board-repository/leader-board-repository.service'
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service'
import { GeneralHandleService } from 'src/@share-module/general-handle/general-handle.service'

@Injectable()
export class LeaderBoardOopSystemService {
  constructor(
        private customExceptionService: CustomExceptionService,
        private generalHandleService: GeneralHandleService,
        private leaderBoardRepositoryService: LeaderBoardRepositoryService,
  ) {}

  async createItem(payload) {
    try {
      const payloadCreate = {
        year: payload.year,
        month: payload.month,
        start_time: payload.start_time,
        end_time: payload.end_time,
        rankings: payload.rankings || [],
        created_at: new Date().toISOString()
      }

      return await this.leaderBoardRepositoryService.create(payloadCreate)
    } catch(err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async queryAutomation(item) {
    try {

      const query: any = [
        {
          $match: {
            $and: [
              { is_reward_paid: false }
            ]
          }
        },
        {
          $unwind: { path: "$rankings", preserveNullAndEmptyArrays: true }
        },
        {
          $addFields: {
            id_collaborator: "$rankings.id_collaborator",
            reward_point: "$rankings.reward_point",
            rank: "$rankings.rank",
          }
        },
        {
          $match: {
            $and: []
          }
        }
      ]

      for (const condition of item.condition) {
        if (condition.type_condition === "number" || condition.type_condition === "string") {
          if (condition.operator === ">=") {
              query[3].$match.$and.push({ [condition.kind]: { $gte: condition.value } })
          } else if (condition.operator === ">") {
              query[3].$match.$and.push({ [condition.kind]: { $gt: condition.value } })
          } else if (condition.operator === "<=") {
              query[3].$match.$and.push({ [condition.kind]: { $lte: condition.value } })
          } else if (condition.operator === "<") {
              query[3].$match.$and.push({ [condition.kind]: { $lt: condition.value } })
          } else if (condition.operator === "!=") {
              query[3].$match.$and.push({ [condition.kind]: { $ne: condition.value } })
          } else {
              query[3].$match.$and.push({ [condition.kind]: condition.value })
          }
        } else {
          switch (condition.kind) {
              case "status": {
                  break;
              }
              default: break;
          }
        }
      }

      const result = await this.leaderBoardRepositoryService.aggregateQuery(query);
      return result;
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

}
