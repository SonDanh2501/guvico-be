import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { iPageDTO } from 'src/@core'
import { GeneralHandleService } from 'src/@share-module/general-handle/general-handle.service'
import { CollaboratorOopSystemService } from 'src/core-system/@oop-system/collaborator-oop-system/collaborator-oop-system.service'
import { LeaderBoardOopSystemService } from 'src/core-system/@oop-system/leader-board-oop-system/leader-board-oop-system.service'
import { LEADER_BOARD_TYPE } from './../../../@repositories/module/mongodb/@database/enum/base.enum'

@Injectable()
export class LeaderBoardSystemService {
  constructor(
    private leaderBoardOopSystemService: LeaderBoardOopSystemService,
    private collaboratorOopSystemService: CollaboratorOopSystemService,
    private generalHandleService: GeneralHandleService,
  ) {}

  async getCurrentLeaderBoard(iPage: iPageDTO) {
    try {
      return await this.collaboratorOopSystemService.getPaginationCurrentLeaderBoard(iPage)
    } catch(err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getCurrentMonthlyLeaderBoard(iPage: iPageDTO) {
    try {
      return await this.collaboratorOopSystemService.getPaginationCurrentMonthlyLeaderBoard(iPage)
    } catch(err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
  async getCurrentRank(lang, idCollaborator) {
    try {
      return await this.collaboratorOopSystemService.getCurrentRank(lang, idCollaborator)
    } catch(err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
  async getCurrentMonthlyRank(lang, idCollaborator) {
    try {
      return await this.collaboratorOopSystemService.getCurrentMonthlyRank(lang, idCollaborator)
    } catch(err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
  async summarizeLeaderboard(lang) {
    try {
      const yesterday = new Date(new Date().setDate(new Date().getDate() - 1))
      const getWeekRange = await this.generalHandleService.getWeekRange(new Date(yesterday), 1, 'Asia/Ho_Chi_Minh')
      const getCurrentLeaderBoard = await this.collaboratorOopSystemService.getCurrentLeaderBoard()
      const topCollaborators = getCurrentLeaderBoard.slice(0, 3)

      for(let i = 0; i < topCollaborators.length; i++) {
        if(i === 0) {
          // Top 1
          topCollaborators[i].top1_count += 1
        } else if (i === 1) {
          // Top 2
          topCollaborators[i].top2_count += 1
        } else if (i === 2) {
          // Top 3
          topCollaborators[i].top3_count += 1
        }

        await this.collaboratorOopSystemService.updateCollaborator(lang, topCollaborators[i])
      }

      // Tổng hợp bảng xếp hạng
      const lstRankings = getCurrentLeaderBoard.map((collaborator, index) => {
        return {
          id_collaborator: collaborator._id,
          reward_point: collaborator.reward_point,
          rank: index + 1
        }
      })

      const payload = {
        year: new Date(yesterday).getFullYear(),
        month: new Date(yesterday).getMonth(),
        start_time: getWeekRange.startOfWeek.toISOString(),
        end_time: getWeekRange.endOfWeek.toISOString(),
        rankings: lstRankings,
        type: LEADER_BOARD_TYPE.week
      }

      await this.leaderBoardOopSystemService.createItem(payload)

      return true
    } catch(err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

    
  async summarizeMonthlyLeaderboard(lang) {
    try {
      const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1))
      const getMonthRange = await this.generalHandleService.getMonthRange(new Date(lastMonth), 'Asia/Ho_Chi_Minh')
      const getCurrentMonthlyLeaderBoard = await this.collaboratorOopSystemService.getCurrentMonthlyLeaderBoard()
      const topCollaborators = getCurrentMonthlyLeaderBoard.slice(0, 3)

      for(let i = 0; i < topCollaborators.length; i++) {
        if(i === 0) {
          // Top 1
          topCollaborators[i].monthly_top1_count += 1
        } else if (i === 1) {
          // Top 2
          topCollaborators[i].monthly_top2_count += 1
        } else if (i === 2) {
          // Top 3
          topCollaborators[i].monthly_top3_count += 1
        }

        await this.collaboratorOopSystemService.updateCollaborator(lang, topCollaborators[i])
      }

      // Tổng hợp bảng xếp hạng
      const lstRankings = getCurrentMonthlyLeaderBoard.map((collaborator, index) => {
        return {
          id_collaborator: collaborator._id,
          reward_point: collaborator.monthly_reward_point,
          rank: index + 1
        }
      })

      const payload = {
        year: new Date(lastMonth).getFullYear(),
        month: new Date(lastMonth).getMonth(),
        start_time: getMonthRange.startOfMonth.toISOString(),
        end_time: getMonthRange.endOfMonth.toISOString(),
        rankings: lstRankings,
        type: LEADER_BOARD_TYPE.month
      }

      await this.leaderBoardOopSystemService.createItem(payload)

      return true
    } catch(err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
