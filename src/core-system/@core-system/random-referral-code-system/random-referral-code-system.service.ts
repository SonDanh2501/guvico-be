import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { GlobalService, NUMBER_REFERRAL_CODE } from 'src/@core';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';
import { GeneralHandleService } from 'src/@share-module/general-handle/general-handle.service';
import { CustomerOopSystemService } from 'src/core-system/@oop-system/customer-oop-system/customer-oop-system.service';
import { RandomReferralCodeOopSystemService } from 'src/core-system/@oop-system/random-referral-code-oop-system/random-referral-code-oop-system.service';

@Injectable()
export class RandomReferralCodeSystemService {
    constructor (
        private customExceptionService: CustomExceptionService,
        private generalHandleService: GeneralHandleService,
        private globalService: GlobalService,

        private randomReferralCodeOopSystemService: RandomReferralCodeOopSystemService,
        private customerOopSystemService: CustomerOopSystemService,
    ) {}

    async generateRandomReferralCodeList() {
        try {
            // 1. Lay danh sach ma gioi thieu da duoc su dung
            const [lstCodesUsed, numReferralCode] = await Promise.all([
                this.randomReferralCodeOopSystemService.getListOfCodesUsed(),
                this.randomReferralCodeOopSystemService.getNumberReferralCode()
            ]) 

            // 2. Kiem tra so luong ma hien co
            // Neu so luong bang 0 thi sinh ra ma theo so luong NUMBER_REFERRAL_CODE
            if (numReferralCode === 0) {
                const lstPayloadCreate = []
                for(let i = 0; i < NUMBER_REFERRAL_CODE; i++) {
                    const referralCode = await this.genReferralCode(10)
                    const payloadCreate = {
                        referral_code: referralCode,
                        is_used: false
                    }

                    lstPayloadCreate.push(payloadCreate)
                }

                await this.randomReferralCodeOopSystemService.createMany(lstPayloadCreate)

                return true
            } else {
                const lstActualCodesUsed = [] // Danh sach ma that su duoc su dung boi khach hang
                const lstCodeNotUsed = [] // Danh sach ma that su chua duoc su dung

                // 3. Kiem tra ma gioi thieu nao that su da su dung boi khach hang va dua vao danh sach
                for(let i = 0; i < lstCodesUsed.length; i++) {
                    const getCustomer = await this.customerOopSystemService.getReferralCode("vi", lstCodesUsed[i].referral_code)
                    if(getCustomer) {
                        lstActualCodesUsed.push(lstCodesUsed[i].referral_code)
                    } else {
                        lstCodeNotUsed.push(lstCodesUsed[i].referral_code)
                    }
                }

                // 4. Cap nhat lai ma that su chua duoc su dung
                if(lstCodeNotUsed.length > 0) {
                    await this.randomReferralCodeOopSystemService.updateIsUsedForListData(lstCodeNotUsed)
                }

                // 5. Xoa vinh vien ma thuc te da duoc su dung va tao ra cac ma moi theo so luong ma thuc te da duoc su dung
                if(lstActualCodesUsed.length > 0) {
                    // Xoa vinh vien
                    await this.randomReferralCodeOopSystemService.deleteMany(lstActualCodesUsed)

                    // Tao moi
                    for(let i = 0; i < lstActualCodesUsed.length; i++) {
                        const lstPayloadCreate = []
                        for(let i = 0; i < NUMBER_REFERRAL_CODE; i++) {
                            const referralCode = await this.genReferralCode(10)
                            const payloadCreate = {
                                referral_code: referralCode,
                                is_used: false
                            }
        
                            lstPayloadCreate.push(payloadCreate)
                        }
        
                        await this.randomReferralCodeOopSystemService.createMany(lstPayloadCreate)
                    }
                }

                return true
            }
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    
    async genReferralCode(codeLength) {
        try {
            let referralCode = ''
            let isExisted = false;
            do {
                referralCode = await this.globalService.randomReferralCode(codeLength)
                const checkDuplicate = await this.customerOopSystemService.getReferralCode("vi", referralCode)
                isExisted = !!checkDuplicate
            } while (isExisted);

            return referralCode 
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getRandomReferralCode() {
        try { 
            return await this.randomReferralCodeOopSystemService.getAndUpdateReferralCode()
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
