import { HttpException } from "@nestjs/common"
import { iPageDTO } from "src/@core/dto"

export const searchQuery = (fieldSearch: string[], iPage: iPageDTO) => {
    const arrFieldSearch = []
    for (let i = 0; i < fieldSearch.length; i++) {
        arrFieldSearch.push({
            [fieldSearch[i]]: {
                $regex: iPage.search,
                $options: "i"
            }
        })
    }
    return {
        $and: [
            {
                $or: arrFieldSearch
            },
            {
                $or: [
                    { is_delete: false },
                    { is_delete: { $exists: false } }
                ]
            }
        ]
    }
}

// export const queryWithinRangeDate = (dateValue: String | Number | Date, startDate: String | Number | Date, endDate: String | Number | Date) => {
// let newDateValue: any;
// const checkType = typeof newDateValue

// switch (checkType) {
//     case 'string':
//         newDateValue = dateValue
//         break;
//     case 'number':
//         newDateValue = new Date(Number(dateValue)).toISOString()
//         break;
//     default:
//         console.log('myVar is neither A nor B');
//         throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
//         break;
// }


// if(typeof newDateValue === 'string') newDateValue = dateValue;
// if()
// }
export const queryWithinRangeDate = (fieldQuery: string, startDate: String, endDate: String) => {
    // console.log('startDate', startDate);

    return {
        $and: [
            { [fieldQuery]: { $lte: endDate } },
            { [fieldQuery]: { $gte: startDate } }
        ]
    }
}

// export const queryOutsideRangeDate = (dateValue: String | Number | Date, startDate: String | Number | Date, endDate: String | Number | Date) => {
export const queryOutsideRangeDate = (fieldQuery: string, startDate: String, endDate: String) => {


}