import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PunishTicketSystemService } from 'src/core-system/punish-ticket-system/punish-ticket-system.service';
import { TransactionSystemService } from 'src/core-system/transaction-system/transaction-system.service';

@Injectable()
export class Miniute15Service {
    constructor(
        private punishTicketSystemService: PunishTicketSystemService,
        private transactionSystemService: TransactionSystemService,

    ) { }
    private readonly logger = new Logger(Miniute15Service.name);


    @Cron('15 * * * * *')
    async handleCron() {
        // console.log("run");
        // this.runPunishTicket();

        // this.punishTicketSystemService.RunDonePunishTicket();
    }



    async runPunishTicket() {
        try {
            // thuc thi cac lenh phat
            const returnPunishTicket = await this.punishTicketSystemService.getAllWaitingPunish();


            const arrPunishTicket = []
            for (let i = 0; i < returnPunishTicket.length; i++) {
                arrPunishTicket.push(this.punishTicketSystemService.waitingToDoingPunishTicket("vi", returnPunishTicket[i]));
            }
            await Promise.all(arrPunishTicket);


            // thuc thi giao dich tru tien
            const arrTransaction = []
            for (let i = 0; i < returnPunishTicket.length; i++) {
                if (returnPunishTicket[i].id_transaction) {
                    arrTransaction.push(this.transactionSystemService.verifyTransaction("vi", returnPunishTicket[i].id_transaction));
                }
            }
            const arrResultTransaction = await Promise.all(arrTransaction);




        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
