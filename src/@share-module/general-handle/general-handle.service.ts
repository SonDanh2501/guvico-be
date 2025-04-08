import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import * as crypto from 'crypto-js'
import { endOfDay, startOfDay, subHours } from 'date-fns'
import { Types } from 'mongoose'
import * as AministrativeDivision from 'src/@core/constant/provincesVN.json'


@Injectable()
export class GeneralHandleService {

    async getCodeAdministrativeToString(address: string) {

        let splitAddress = address.split(/[,;]/);
        splitAddress = (splitAddress[splitAddress.length - 1] === "") ? splitAddress.slice(0, splitAddress.length - 1) : splitAddress
        let payload = {
            city: splitAddress[splitAddress.length - 1],
            district: splitAddress[splitAddress.length - 2]
        }
        if (payload.city.length < 3) {
            payload = {
                city: splitAddress[splitAddress.length - 2],
                district: splitAddress[splitAddress.length - 3]
            }
        }

        const result = {
            city: -1,
            district: -1
        }
        const temp = await this.removeWhiteSpace(payload.city)
        const temp2 = await this.removeAdministrative(temp);
        const temp3 = await this.cleanAccents(temp2);
        let code = -1;
        for (const item of AministrativeDivision) {
            if (item.value_compare && item.value_compare.indexOf(temp3) > -1) {
                code = item.code;
                result.city = item.code;
                if (typeof payload.district === 'string') {
                    const temp4 = await this.removeWhiteSpace(payload.district);
                    const temp5 = await this.removeAdministrative(temp4);
                    const temp6 = await this.cleanAccents(temp5);
                    for (const district2 of item.districts) {
                        if (district2.value_compare && district2.value_compare.indexOf(temp6) > -1) {
                            result.district = district2.code
                            break;
                        }
                    }
                }
                break;
            }
        }
        return result;
    }




    async cleanAccents(str) {
        try {
            str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
            str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
            str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
            str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
            str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
            str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
            str = str.replace(/đ/g, "d");
            return str;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async removeAdministrative(value: string): Promise<string> {
        try {

            value = value.toLocaleLowerCase();
            // const arr = ["quận", "huyện", "thànhphố", "tỉnh", "thịtrấn", "thịxã", "phường", "h.",
            //     "t.", "q.", "tp.", "tx.", "p.", "tt.", "city", "xã", "700000", "721261", "70000", "tinh",
            //     "thanhpho", "710000", "100000", "13500", "550000", "500000", "50000", "55000", "72900", "75308", "12106", "72100", "700900",
            //     "71800", "10000", "12009", "73020", "00700", "720300", "71418", "72312", "71500", "72907", "65001"];
            const arr = ["quận", "huyện", "thànhphố", "tỉnh", "thịtrấn", "thịxã", "phường", "h.",
                    "t.", "q.", "tp.", "tx.", "p.", "tt.", "city", "xã", "tinh",
                    "thanhpho"];
            for (const item of arr) {
                value = value.replace(item, "");
            }
            value = value.replace(/\d{3,}$/, "" );
            return value;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }
    async removeWhiteSpace(dataString: string) {
        return dataString.toString().replace(/\s+/g, "");
    }

    async sortArrObject(data: any[], valueSort: string, typeSort: number) {
        try {
            // console.log(valueSort, 'valueSort');
            
            const identifyField = typeof data[0][valueSort]

            let temp = [];

            if (identifyField === "number") {
                if (typeSort > 0) {
                    temp = data.sort((a, b) => a[valueSort] - b[valueSort]);
                } else {
                    temp = data.sort((a, b) => b[valueSort] - a[valueSort]);
                }
            } else {
                let arrNumber = [];
                let arrString = [];
                // console.log(data.length, 'data.length');
                // console.log(Number(data.length), 'Number(data.length)');

                
                for (let i = 0; i < Number(data.length); i++) {
                    // console.log(data[i], " data ", i);
                    
                    if (data[i][valueSort] / 2 > 0) {
                        arrNumber.push(data[i]);
                    } else {
                        arrString.push(data[i]);
                    }
                }
                arrNumber = arrNumber.sort((a, b) => {
                    return (a[valueSort] - b[valueSort]) * typeSort;
                });
                arrString = arrString.sort((a: any, b: any) => {
                    // console.log(a, 'a');
                    // console.log([valueSort], '[valueSort]');
                    
                    // console.log(a[valueSort], 'a[valueSort]');
                    // console.log(a[valueSort], 'b[valueSort]');

                    
                    return (a[valueSort].toString().localeCompare(b[valueSort].toString()) > 0) ?
                        1 * typeSort : (a[valueSort].toString().localeCompare(b[valueSort].toString()) < 0) ? -1 * typeSort : 0;
                });
                temp = (typeSort > 0) ? arrNumber.concat(arrString) : arrString.concat(arrNumber);
            }
            return temp;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    // async sortArrObject(data: any[], valueSort: string, typeSort: number) {
    //     try {
    //         let temp = [];
    //         let arrNumber = [];
    //         let arrString = [];
    //         for (let i = 0; i < Number(data.length); i++) {
    //             if (data[i][valueSort] / 2 > 0) {
    //                 arrNumber.push(data[i]);
    //             } else {
    //                 arrString.push(data[i]);
    //             }
    //         }
    //         arrNumber = arrNumber.sort((a, b) => {
    //             return (a[valueSort] - b[valueSort]) * typeSort;
    //         });
    //         arrString = arrString.sort((a: any, b: any) => {
    //             return (a[valueSort].toString().localeCompare(b[valueSort].toString()) > 0) ?
    //                 1 * typeSort : (a[valueSort].toString().localeCompare(b[valueSort].toString()) < 0) ? -1 * typeSort : 0;
    //         });
    //         temp = (typeSort > 0) ? arrNumber.concat(arrString) : arrString.concat(arrNumber);
    //         return temp;
    //     } catch (err) {
    //         throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
    //     }
    // }


    async GenerateRandomString(length: number) {
        try {
            let result = '';
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            const charactersLength = characters.length;
            for (var i = 0; i < length; i++) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async GenerateRandomNumberString(length: number) {
        try {
            let max = "9";
            let min = "1";
            for (let i = 1; i < length; i++) {
                max = max + "9";
                min = min + "0";
            }
            console.log(max, 'max');
            console.log(min, 'min');

            // const codeOTP = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
            const temp = Math.floor(Math.random() * (Number(max) - Number(min) + 1)) + Number(min);
            const result = temp.toString();
            return result;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    // async uniq_fast(arr: object[]) {
    //     try {
    //         let seen = {};
    //         let out = [];
    //         let len = arr.length;
    //         let j = 0;
    //         for(var i = 0; i < len; i++) {
    //              var item = arr[i];
    //              if(seen[item] !== 1) {
    //                    seen[item] = 1;
    //                    out[j++] = item;
    //              }
    //         }
    //         return out;
    //     } catch (err) {
    //          throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
    //     }
    // }


    async padTo2Digits(num) {
        try {
            return num.toString().padStart(2, '0');
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async convertMsToTime(milliseconds) {
        try {
            console.log(milliseconds, 'milliseconds')
            let seconds = Math.floor(milliseconds / 1000);
            let minutes = Math.floor(seconds / 60);
            let hours = Math.floor(minutes / 60);
            let dates = Math.floor(hours / 24);
            seconds = seconds % 60;
            minutes = minutes % 60;
            // 👇️ If you don't want to roll hours over, e.g. 24 to 00
            // 👇️ comment (or remove) the line below
            // commenting next line gets you `24:00:00` instead of `00:00:00`
            // or `36:15:31` instead of `12:15:31`, etc.
            hours = hours % 24;

            return `${await this.padTo2Digits(dates)} ngày ${await this.padTo2Digits(hours)}:${await this.padTo2Digits(minutes)}:${await this.padTo2Digits(
                seconds,
            )}`;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async convertISOStringToMs(dateInput: string) {
        try {
            const date = new Date(dateInput);
            const timestamp = date.getTime();
            // console.log(timestamp); // 👉️ 165839613182
        }
        catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }


    async formatMoney(number) {
        return number?.toString()?.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") + " đ";
    }


    async renderCodePromotion() {
        try {
            let result = '';
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            const charactersLength = characters.length;
            for (var i = 0; i < 4; i++) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async formatHidePhone(phone) {
        try {
            const lengthPhone = phone.length - 2;
            const numberPhoneVisible = phone.slice(-3);
            let phoneHide = "";
            for (let i = 0; i < lengthPhone; i++) {
                phoneHide += "*";
            }
            const result = phoneHide + numberPhoneVisible;
            return result;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    async formatDateWithTimeZone(date: Date, timeZone: string) {
        try {
            const arrDate = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
            let timeInTimeZone = date.toLocaleString('vn', { timeZone: timeZone, hour12: false, });
            let dateInTimeInTimeZone = date.toLocaleString('en-US', { timeZone: timeZone, hour12: false, weekday: 'short' });
            const tempDayInWeek = arrDate.indexOf(dateInTimeInTimeZone);
            let index = timeInTimeZone.indexOf(",");
            let tempDate = timeInTimeZone.slice(0, index);
            let tempTime = timeInTimeZone.slice(index).trim();
            let arrTempDate = tempDate.split("/");
            let arrTempHour = tempTime.split(":");
            const temp_day = Number(arrTempDate[1]) > 10 ? arrTempDate[1] : `0${arrTempDate[1]}`;
            const temp_month = Number(arrTempDate[0]) > 10 ? arrTempDate[0] : `0${arrTempDate[0]}`;
            const temp_date = `${temp_day}-${temp_month}-${arrTempDate[2]}`
            const result = {
                day: temp_day,
                month: temp_month,
                year: arrTempDate[2],
                day_of_week: tempDayInWeek,
                hour: arrTempHour[0].toString().slice(2),
                minute: arrTempHour[1],
                seconds: arrTempHour[2],
                time: tempTime.toString().slice(2),
                time_date: temp_date
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    async removeDuplicateValueArr(arr) {
        try {
            arr = arr.sort();
            const unique = arr.filter((value, index, array) => array.indexOf(value) === index);
            return unique;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async removeDuplicateValueObjectIdArr(arr) {
        try {
            const temp = [];
            for (const item of arr) {
                temp.push(item.toString());
            }
            const unique = arr.filter((value, index, array) => {
                return temp.indexOf(value.toString()) === index
            });
            return unique;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async roundUpMoney(amount: number) {
        let temp = amount / 100;
        temp = Math.round(temp) * 100;
        return {
            money: temp,
        };
    }

    async eachDayOfInterval(start, end, step?) {
        try {
            // step: thoi gian tung khoang cach tinh theo gio
            const stepInterval = (step) ? step : 24;
            const interval = stepInterval * 60 * 60 * 1000
            const miliStart = new Date(start).getTime();
            const miliEnd = new Date(end).getTime();
            let miliDayInterval = miliStart + interval;
            const arrDate = [new Date(miliStart)];
            while (miliDayInterval < miliEnd) {
                arrDate.push(new Date(miliDayInterval));
                miliDayInterval += interval;
            }
            return arrDate
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async customStartAndEndOfDay(date: Date) {
        try {
            const current = new Date(date);
            const getTimeZoneOffSet = current.getTimezoneOffset();
            let numberSubHour = 5;
            const timeZoneOffSetVN = -420;
            if (getTimeZoneOffSet < 0) {
                const temp = Math.abs(timeZoneOffSetVN) - Math.abs(getTimeZoneOffSet);
                numberSubHour = temp / 60;
            }
            const startDate = subHours(startOfDay(current), numberSubHour).toISOString();
            const endDate = subHours(endOfDay(current), numberSubHour).toISOString();
            const result = {
                startDate: startDate,
                endDate: endDate
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);

        }
    }

    async shuffleArr(array) {
        try {
            for (let i = array.length - 1; i > 0; i--) {
                let j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }


    async sortExtendInIdExtend(arrExtend) {
        try {
            let arrData = [...arrExtend];
            let dataMatch = []
            for (let i = 0; i < arrData.length; i++) {
                if (arrData[i].id_extend_optional.length > 0) {
                    const matchingItems = arrData.filter((otherItem) => {
                        for (let y = 0; y < arrData[i].id_extend_optional.length; y++) {
                            if (arrData[i].id_extend_optional[y].toString() === otherItem._id.toString()) return true;
                        }
                        return false;
                    })
                    if (matchingItems.length > 0) {
                        arrData[i].id_extend_optional = matchingItems;
                        dataMatch = [...dataMatch, ...matchingItems]
                    }
                }
            }
            arrData = arrData.filter(item => !dataMatch.includes(item))
            arrData.sort((a, b) => a.position_view > b.position_view ? 1 : -1)

            return arrData;
        } catch (err) {
            console.log(err);
            
            throw new HttpException(err.response || err.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async randomIDTransaction(length) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        var characters2 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

        var charactersLength = characters.length;
        var charactersLength2 = characters2.length;
        for (var i = 0; i < length; i++) {
            if (i === 0) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            } else {
                result += characters2.charAt(Math.floor(Math.random() * charactersLength2));
            }
        }
        return result;
    }


    async convertTemplateLiteral(payloadContent, text) {
        try {
            const temp = Object.keys(payloadContent);
            for(const item of temp) {
                switch (item) {
                    case "time_late":
                    case "order_id_view":
                    case "punish_money":
                    case "reward_value":
                    case "score":
                    case "collaborator_full_name":
                    case "punish_ticket_money": {
                        text = text.replace("${"+`${item}`+"}", payloadContent[item])
                    }
                    default: {
                        break;
                    }
                }
            }
            return text;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }



    async encryptObject(object: object) {
        const temp = JSON.stringify(object);
        const result = crypto.AES.encrypt(temp, "guvico")
        return result.toString();
      }
    
      async decryptObject(code) {
        const temp2 = crypto.AES.decrypt(code, "guvico")
        const temp3 = temp2.toString(crypto.enc.Utf8)
        return JSON.parse(temp3.toString());
      }

    // mac dinh tra ve khoang cach tinh theo phut
    async calculateTimeInterval(timeStart, timeEnd, typeRespone) {
        timeStart = new Date(timeStart).getTime();
        timeEnd = new Date(timeEnd).getTime();
        const timeInterval = timeEnd - timeStart;
        if(typeRespone === "hour") {
            const timeResult = timeInterval / (60 * 60000)
            return timeResult;
        } else if (typeRespone === "day") {
            const timeResult = timeInterval / (24 * 60 * 60000)
            return timeResult;
        } else if (typeRespone === "millisecond") {
            const timeResult = timeInterval
            return timeResult;
        }
         else {
            const timeResult = timeInterval / 60000
            return timeResult;
        }
    }

    async convertObjectId(stringId: string) {
        try {
            return new Types.ObjectId(stringId)
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // Chuyển đổi sang múi giờ mong muốn
    async formatToTimeZone(date:any, timeZone:string) {
        return new Intl.DateTimeFormat('en-US', {
            timeZone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).format(new Date(date));
    };

    async getWeekRange(
        date: Date | string, 
        startOfWeekDay:any = 1, // 0: Sunday, 1: Monday (mặc định)
        timezone?: string
    ) {
    // Chuyển đổi input thành đối tượng Date
    const inputDate = date instanceof Date ? date : new Date(date);
    
    // Sử dụng timezone nếu được cung cấp
    if (timezone) {
        inputDate.toLocaleString('en-US', { timeZone: timezone });
    }
    
    // Tìm ngày đầu tuần
    const startOfWeek = new Date(inputDate);
    const dayOfWeek = inputDate.getDay();
    
    // Tính toán ngày đầu tuần dựa trên startOfWeek
    const diff = dayOfWeek >= startOfWeekDay 
        ? dayOfWeek - startOfWeekDay 
        : 7 + (dayOfWeek - startOfWeekDay);
    
    startOfWeek.setDate(inputDate.getDate() - diff);
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Tìm ngày cuối tuần (6 ngày sau ngày đầu tuần)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    return {
        startOfWeek,
        endOfWeek,
    };
    }

    async getMonthRange(
        date: Date | string, 
        timezone?: string
    ) {
        // Chuyển đổi input thành đối tượng Date
        const inputDate = date instanceof Date ? date : new Date(date);
        
        // Áp dụng timezone nếu được cung cấp
        if (timezone) {
            inputDate.toLocaleString('en-US', { timeZone: timezone });
        }

        // Lấy ngày đầu tháng
        const startOfMonth = new Date(inputDate.getFullYear(), inputDate.getMonth(), 1);
        startOfMonth.setHours(0, 0, 0, 0);

        // Lấy ngày cuối tháng
        const endOfMonth = new Date(inputDate.getFullYear(), inputDate.getMonth() + 1, 0);
        endOfMonth.setHours(23, 59, 59, 999);
    
        return {
            startOfMonth,
            endOfMonth
        };
    }

    async convertToPluralNouns(noun) {
        const vowel = ['a', 'e', 'i', 'o', 'u']
        if(noun.endsWith("y")) {
            if(!vowel.includes(noun.slice(-2, -1))) {
                return `${noun.slice(0, -1)}ies`
            }
        }
        return `${noun}s`
    }

    async checkValueInput(value: String) {
        let flag = false;
        if (value !== "" && value !== undefined && value !== null) {
            flag = true
        }
        return flag;
    }
}

