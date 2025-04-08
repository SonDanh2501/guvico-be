import { Controller, Get, HttpException, HttpStatus, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { DEFAULT_LANG, GlobalService, iPageDTO, LANGUAGE, ValidateLangPipe } from 'src/@core'
import { GroupServiceService } from '../group-service/group-service.service'
// import { OptionalServiceService } from '../optional-service/optional-service.service';
import { ServiceService } from '../service/service.service'
import { SettingService } from './setting.service'

@Controller('setting')
export class SettingController {
    constructor(
        private groupServiceService: GroupServiceService,
        private serviceService: ServiceService,
        private settingService: SettingService,
        private globalService: GlobalService,
        // @InjectModel(Setting.name) private serviceModel: Model<ServiceDocument>,
        // private optionalServiceService: OptionalServiceService

    ) { }

    @ApiTags('customer')
    @Get('')
    async settings(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
    ) {
        try {
            const iPage: iPageDTO = {
                search: "",
                length: 20,
                start: 0
            }
            const getGroupService = await this.groupServiceService.getListItem(lang, iPage)
            // let temp: any = getGroupService.data;

            let temp2 = []
            for (let i = 0; i < getGroupService.data.length; i++) {
                const temp = getGroupService.data[i];
                const getService = await this.serviceService.getServiceByGroup(lang, iPage, temp._id.toString())
                temp['service'] = [getService.data];
                const object = {
                    title: temp.title,
                    thumbnail: temp.thumbnail,
                    description: temp.description,
                    service: getService.data,
                    point_popular: temp.point_popular
                }
                temp2.push(object)
            }

            const settingCustomer = await this.settingService.getSetting();

            const goong = { APIKey: "no_secret_key" };
            const encryptAPIGoong = await this.globalService.encryptObject(goong)
            const result = {
                goong_key: encryptAPIGoong,
                arr_code_phone_area: [
                    {
                        code_phone_area: "+84",
                        name: "vi",
                        icon: "https://res.cloudinary.com/dbxnp5vc0/image/upload/v1664254297/guvi/icon/vietnamTron_rbka2d.png"
                    }
                    // {
                    //     code_phone_area: "+1",
                    //     name: "us",
                    //     icon: "https://res.cloudinary.com/dbxnp5vc0/image/upload/v1664254293/guvi/icon/united_states_1_xz3wyu.png"
                    // }
                ],
                language: [
                    {
                        value: "vi",
                        value_view: "Tiếng Việt",
                        icon: "https://res.cloudinary.com/dbxnp5vc0/image/upload/v1664254297/guvi/icon/vietnamTron_rbka2d.png"
                    },
                    {
                        value: "en",
                        value_view: "English",
                        icon: "https://res.cloudinary.com/dbxnp5vc0/image/upload/v1664254293/guvi/icon/united_states_1_xz3wyu.png"
                    }
                ],
                group_service: temp2,
                background_header: settingCustomer.background_header,
                rank_member_minium_point: settingCustomer.rank_member_minium_point,
                rank_member_max_point: settingCustomer.rank_member_max_point,
                rank_silver_minium_point: settingCustomer.rank_silver_minium_point,
                rank_silver_max_point: settingCustomer.rank_silver_max_point,
                rank_gold_minium_point: settingCustomer.rank_gold_minium_point,
                rank_gold_max_point: settingCustomer.rank_gold_max_point,
                rank_platinum_minium_point: settingCustomer.rank_platinum_minium_point,
                rank_platinum_max_point: settingCustomer.rank_platinum_max_point,
                lock_payment: settingCustomer.lock_payment,
                background_promotion: settingCustomer.background_promotion,
                count_down_loading_create_order: settingCustomer.count_down_loading_create_order,
                limit_address: settingCustomer.limit_address,
                min_money: settingCustomer.min_money,
                is_cash_payment: settingCustomer.is_cash_payment,
                is_g_pay_payment: settingCustomer.is_g_pay_payment,
                is_momo_payment: settingCustomer.is_momo_payment,
                affiliate_discount_percentage: settingCustomer.affiliate_discount_percentage,
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], HttpStatus.FORBIDDEN);
        }
    }
    @ApiTags('customer')
    @Get('/holiday')
    async holiday(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
    ) {
        try {

            const arrHoliday = [
                {
                  start_day: "1/9/2024",
                  end_day: "1/9/2024",
                  price_up: 6
                },
                {
                  start_day: "2/9/2024",
                  end_day: "2/9/2024",
                  price_up: 30
                },
                {
                  start_day: "3/9/2024",
                  end_day: "3/9/2024",
                  price_up: 20
                },
                {
                  start_day: "20/1/2025",
                  end_day: "22/1/2025",
                  price_up: 20
                },
                {
                  start_day: "23/1/2025",
                  end_day: "25/1/2025",
                  price_up: 30
                },
                {
                  start_day: "26/1/2025",
                  end_day: "27/1/2025",
                  price_up: 50
                },
                {
                  start_day: "28/1/2025",
                  end_day: "31/1/2025",
                  price_up: 100
                },
                {
                  start_day: "1/2/2025",
                  end_day: "3/2/2025",
                  price_up: 50
                },
                {
                  start_day: "4/2/2025",
                  end_day: "7/2/2025",
                  price_up: 10
                }
              ]

              const arrDate = []
              for(const item of arrHoliday) {
                console.log(item, 'item');
                
                const tempStartDay = item.start_day.split("/")
                const tempEndDay = item.end_day.split("/")
                const startDay = new Date(`${tempStartDay[1]}/${tempStartDay[0]}/${tempStartDay[2]}`);
                const endDay = new Date(`${tempEndDay[1]}/${tempEndDay[0]}/${tempEndDay[2]}`);
                if(startDay.getTime() === endDay.getTime()) {
                  const payload = {
                    date: new Date(startDay).toString(),
                    time_start: new Date(new Date(startDay).getTime()).toISOString(),
                    time_end: new Date(endDay.getTime() + ((24 * 60 * 60 * 1000) - 1)).toISOString(),
                    price_type_increase: "percent_accumulate",
                    price: item.price_up
                  }
                  arrDate.push(payload.date.replace(" (Indochina Time)", ""))
                } else {
                  const diffTime = Math.abs(endDay.getTime() - startDay.getTime());
                  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); 
                  for(let i = 0 ; i <= diffDays ; i++) {
                    const tempStartDay = new Date(startDay).getTime() + i * 24 * 60 * 60 * 1000;
                    const tempEndDay = (new Date(startDay).getTime() + (i + 1) * 24 * 60 * 60 * 1000) - 1
                    const payload = {
                        date: new Date(tempStartDay).toString(),
                      time_start: new Date(tempStartDay).toISOString(),
                      time_end: new Date(tempEndDay).toISOString(),
                      price_type_increase: "percent_accumulate",
                      price: item.price_up
                    }
                    arrDate.push(payload.date.replace(" (Indochina Time)", ""))
                  }
                }
              }

              const result = [
                "Mon Sep 02 2024 00:00:00 GMT+0700", "Wed Jan 01 2025 00:00:00 GMT+0700", "Tue Jan 28 2025 00:00:00 GMT+0700", "Wed Jan 29 2025 00:00:00 GMT+0700",
                "Thu Jan 30 2025 00:00:00 GMT+0700", "Fri Jan 31 2025 00:00:00 GMT+0700", "Mon Apr 7 2025 00:00:00 GMT+0700", "Wed Apr 30 2025 00:00:00 GMT+0700",
                "Thu May 1 2025 00:00:00 GMT+0700", "Tue Sep 30 2025 00:00:00 GMT+0700"
            ]
            return arrDate;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], HttpStatus.FORBIDDEN);
        }
    }
}
