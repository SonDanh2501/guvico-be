import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { TYPE_SUBJECT_ACTION } from 'src/@repositories/module/mongodb/@database/enum/base.enum'
import { GeneralHandleService } from 'src/@share-module/general-handle/general-handle.service'
import { AutomationOopSystemService } from 'src/core-system/@oop-system/automation-oop-system/automation-oop-system.service'
import { LeaderBoardOopSystemService } from 'src/core-system/@oop-system/leader-board-oop-system/leader-board-oop-system.service'
import { OrderOopSystemService } from 'src/core-system/@oop-system/order-oop-system/order-oop-system.service'
import { PunishTicketSystemService } from '../punish-ticket-system/punish-ticket-system.service'
import { RewardTicketSystemService } from '../reward-ticket-system/reward-ticket-system.service'

@Injectable()
export class AutomationSystemService {
    constructor (
        private generalHandleService: GeneralHandleService,
        private automationOopSystemService: AutomationOopSystemService,
        private orderOopSystemService: OrderOopSystemService,
        private leaderBoardOopSystemService: LeaderBoardOopSystemService,
        private punishTicketSystemService: PunishTicketSystemService,
        private rewardTicketSystemService: RewardTicketSystemService,
    ) {}

    async runAutomationForSchedule(schedule_trigger) {
        try {
            const getArrAutomation = await this.automationOopSystemService.getAutomationBySchedule(schedule_trigger);
            for(const automation of getArrAutomation) {
                await this.runCondition(automation)
            }

            return 
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    async getAutomationForTrigger(action_trigger) {
        try {
            const getArrAutomation = await this.automationOopSystemService.getAutomationByAfterTrigger(action_trigger);
            for(const automation of getArrAutomation) {
                await this.runCondition(automation)
            }

            return
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    async getDependencyByAction() {
        try {

        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async runCondition(automation) {
        try {
            const temp = await this.generalHandleService.sortArrObject(automation.condition.condition, "data_table", 1)
            let result = [{
                table: temp[0].data_table,
                dependency: temp[0].dependency,
                condition: [temp[0]],
                query_dependency: [],
                data: null
            }];


            // console.log(temp, 'temp');
            

            for(let i = 1 ; i < temp.length ; i++) {
                const item = temp[i]
                
                if(result[result.length - 1].table !== item.data_table) {
                    result.push({
                        table: item.data_table,
                        dependency: item.dependency,
                        condition: [item],
                        query_dependency: [],
                        data: null
                    })
                } else {
                    result[result.length - 1].condition.push(item)
                }
            }

            // console.log(result, 'result');
            
            
            let bestCondition = result[0]

            for(let i = 0 ; i < result.length ; i++) {
                if(bestCondition.dependency.length < result[i].dependency.length) {
                    bestCondition = result[i]
                }
            }


            const temp2 = result.filter(item => item.table !== bestCondition.table)
            bestCondition.query_dependency = temp2;


            // console.log(bestCondition, 'bestCondition');
            


            if(bestCondition.table === 'order') {
                bestCondition.data = await this.getOrder(bestCondition)
            } else if (bestCondition.table === 'collaborator') {
                bestCondition.data = await this.getCollaborator(bestCondition)
            } else if (bestCondition.table === 'leaderboard') {
                bestCondition.data = await this.getLeaderBoard(bestCondition)
            }

            console.log('bestCondition', bestCondition);
            

            const dataAction = await this.getDataInput(bestCondition, automation);
            console.log('dataAction', dataAction);
            
            await this.runAction(dataAction, automation);

            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    async getCollaborator(item) {
        try {
            
            return item;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getOrder(item) {
        try {
            const result = await this.orderOopSystemService.queryAutomation(item)
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getDataInput(dataCondition, automation) {
        try {
            const data = [];
            const filterMainId = dataCondition.dependency.filter(item => item === `id_${dataCondition.table}`)
            for(const item of dataCondition.data) {
                const payload: any = {};
                // const payload = {
                //     id_punish_policy: automation.action.id_punish_policy,
                //     id_content_notification: automation.action.id_content_notification
                // };
                for(const keyField of automation.action.input_require) {
                    if(keyField === filterMainId[0]) {
                        payload[keyField] = item._id
                    } else {
                        payload[keyField] = item[keyField]._id || item[keyField] || null
                    }
                }
                
                data.push(payload);
            }
            
            return data;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async runAction(dataAction, automation) {
        try {

            // console.log(dataAction, 'dataAction');
            

            // doi tuong tao hanh dong
            const subjectAction = {
                type: TYPE_SUBJECT_ACTION.system,
                _id: null
            }

            switch(automation.action.type_action) {
                case 'create_and_start_punish_ticket': {
                    for(const item of dataAction) {
                        const payload = {
                            ...item,
                            ...{
                                id_punish_policy: automation.action.id_punish_policy,
                                id_content_notification: automation.action.id_content_notification
                            }
                        }
                        const payloadDependency = await this.punishTicketSystemService.createPunishTicket("vi", subjectAction, payload)
                        await this.punishTicketSystemService.executePunishTicket("vi", subjectAction, payloadDependency)
                    }
                    break; 
                }
                case 'create_and_start_reward_ticket': {
                    for(const item of dataAction) {
                        const payload = {
                            ...item,
                            ...{
                                id_reward_policy: automation.action.id_reward_policy,
                                id_content_notification: automation.action.id_content_notification
                            }
                        }
                        const payloadDependency = await this.rewardTicketSystemService.createRewardTicket("vi", subjectAction, payload)
                        await this.rewardTicketSystemService.executeRewardTicket("vi", subjectAction, payloadDependency)
                    }
                    break; 
                }
                case 'send_push_notification': {
                    break;
                }
                default: break;
            }

            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    async getLeaderBoard(item) {
        try {
            return await this.leaderBoardOopSystemService.queryAutomation(item)
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
