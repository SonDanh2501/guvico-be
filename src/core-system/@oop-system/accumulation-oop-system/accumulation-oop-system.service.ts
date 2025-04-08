import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { ERROR } from 'src/@core'
import { AccumulationRepositoryService } from 'src/@repositories/repository-service/accumulation-repository/accumulation-repository.service'
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service'

@Injectable()
export class AccumulationOopSystemService {
  constructor(
    private customExceptionService: CustomExceptionService,
    private accumulationRepositoryService: AccumulationRepositoryService
  ) { }
  
  async createManyItem(lstPayload) {
    try {
      return await this.accumulationRepositoryService.createMany(lstPayload)
    } catch(err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    }
  }
  
  async getDetailItem(lang, idCustomer) {
    try {
      const getCustomer = await this.accumulationRepositoryService.findOneById(idCustomer);
      if (!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "accumlation")], HttpStatus.NOT_FOUND)
      return getCustomer;
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    }
  }
  
  async getAccumulateByCollaboratorAndTimeFrame(idCollaborator, startTime, endTime) {
    try {
      const aggregateQuery = [
        {
          $match: {
            id_collaborator: idCollaborator,
            start_time: { $gte: startTime },
            end_time: { $gte: endTime },
          }
        },
        { 
          $sort: { date_create: 1 }
        },
        {
          $group: {
            _id: "$id_collaborator",
            reward_point: { $sum: "$reward_point" },
            reward_money: { $sum: "$reward_money" },
            number_of_violation: { $sum: "$number_of_violation" },
            all_list_of_violation: {
              $push: "$list_of_violation"
            }
          },
        },
        {
          $project: {
            all_list_of_violation: {
              $reduce: {
                input:
                  "$all_list_of_violation",
                initialValue: [],
                in: {
                  $concatArrays: ["$$value", "$$this"]
                }
              }
            }
          }
        },
        {
          $unwind: "$all_list_of_violation"
        },
        {
          $group: {
            _id: {
              id_collaborator: "$_id.id_collaborator",
              id_push_policy:
                "$all_list_of_violation.id_push_policy"
            },
            total_amount: {
              $sum: "$all_list_of_violation.amount"
            }
          }
        },
        {
          $group: {
            _id: "$_id.id_collaborator",
            list_of_violation: {
              $push: {
                payment_method: "$_id.id_push_policy",
                total_amount: "$total_amount"
              }
            }
          }
        }
      ]

      return await this.accumulationRepositoryService.aggregateQuery(aggregateQuery)
    } catch(err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    }
  }
}
