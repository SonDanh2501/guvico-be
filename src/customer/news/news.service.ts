import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { from } from 'rxjs';
import { News, NewsDocument, iPageNewsDTOCustomer } from 'src/@core';

@Injectable()
export class NewsService {
    constructor(
        private readonly httpService: HttpService,
        @InjectModel(News.name) private newsModel: Model<NewsDocument>,
    ) { }

    public async getGuviLover(lang, iPage: iPageNewsDTOCustomer) {
        try {
            // let url = "https://www.guvico.com/guvilover/";
            // if(page !==1) {
            //     url = `https://www.guvico.com/guvilover/page/${page}/`
            // }
            // const getData = await this.httpService.axiosRef.get(
            //     url,
            //     {
            //         headers: {
            //           'Accept': 'application/json',
            //         },
            //       },
            //     );

            // const temp1 = JSON.stringify(getData.data);
            // if(temp1.search(`<link rel="canonical" href="https://www.guvico.com/"`) !== -1) {
            //     const result = {
            //         data: [],
            //         page: page
            //     }
            //     return result;
            // }
            // const start = ">#GuviLover</h1>";
            // const end = "mh-widget-col-1 mh-sidebar"
            // const temp3 = temp1.slice(temp1.search(start), temp1.search(end));
            // const temp4 = temp3.split("<article class=");
            //       const result = {
            //         data: [],
            //         page: page
            //       }
            // for(let i = 1; i < temp4.length; i++) {
            //     const temp5 = temp4[i].replace(/\\/g, "");
            //     const payload = {
            //         url: temp5.slice(temp5.search("<a href=")+9, temp5.search(`<img`)-3),
            //         short_description: temp5.slice(temp5.search(`class=\"mh-excerpt\"><p>`)+22,temp5.search(`<a class=\"mh-excerpt-more\"`)-1),
            //         title: temp5.slice(temp5.search(`100vw, 326px\" title=\"`)+21, temp5.search(`\" data-lazy-src=\"`)-1) ,
            //         thumbnail: temp5.slice(temp5.search(`<noscript><img width=\"326\" height=\"245\" src=\"`)+45, temp5.search(`.jpg" class=`)+4)
            // }
            // result.data.push(payload)
            // }


            // return result;
            const query = {
                $and: [
                    { is_active: true },
                    { type: 'guvilover' }
                ]
            }
            const getNews = await this.newsModel.find(query).sort({ position: -1, _id: 1 })
                .skip(iPage.start)
                .limit(iPage.length)
                .then();
            const count = await this.newsModel.count(query);

            const result = {
                start: iPage.start,
                length: iPage.length,
                totalItem: count,
                data: getNews,
            }
            return result;

        } catch (err) {
            // const result = {
            //     data: [],
            //     page: page
            // }
            // return result;
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    public async getListNews(lang, iPage: iPageNewsDTOCustomer) {
        try {
            // console.log('check')
            // let url = "https://www.guvico.com/tin-tuc-giup-viec-guvi/";
            // if (page !== 1) {
            //     url = `https://www.guvico.com/tin-tuc-giup-viec-guvi/page/${page}/`
            // }
            // const getData = await this.httpService.axiosRef.get(
            //     url,
            //     {
            //         headers: {
            //             'Accept': 'application/json',
            //         },
            //     },
            // );
            // const temp1 = JSON.stringify(getData.data);
            // if (temp1.search(`<link rel="canonical" href="https://www.guvico.com/"`) !== -1) {
            //     const result = {
            //         data: [],
            //         page: page
            //     }
            //     return result;
            // }
            // const start = ">Tin tức</h1>";
            // const end = "mh-widget-col-1 mh-sidebar"
            // const temp3 = temp1.slice(temp1.search(start), temp1.search(end));
            // const temp4 = temp3.split("<article class=");
            // const result = {
            //     data: [],
            //     page: page
            // }
            // for (let i = 1; i < temp4.length; i++) {
            //     const temp5 = temp4[i].replace(/\\/g, "");
            //     const payload = {
            //         url: temp5.slice(temp5.search("<a href=") + 9, temp5.search(`<img`) - 3),
            //         short_description: temp5.slice(temp5.search(`class=\"mh-excerpt\"><p>`) + 22, temp5.search(`<a class=\"mh-excerpt-more\"`) - 1),
            //         title: temp5.slice(temp5.search(`100vw, 326px\" title=\"`) + 21, temp5.search(`\" data-lazy-src=\"`) - 1),
            //         thumbnail: temp5.slice(temp5.search(`<noscript><img width=\"326\" height=\"245\" src=\"`) + 45, temp5.search(`.jpg" class=`) + 4)
            //     }
            //     result.data.push(payload)
            // }
            // return result;
            const query = {
                $and: [
                    { is_active: true },
                    { type: 'news' }
                ]
            }
            const getNews = await this.newsModel.find(query).sort({ position: -1, _id: 1 })
                .skip(iPage.start)
                .limit(iPage.length)
                .then();
            const count = await this.newsModel.count(query);

            const result = {
                start: iPage.start,
                length: iPage.length,
                totalItem: count,
                data: getNews,
            }
            return result;
        } catch (err) {
            // const result = {
            //     data: [],
            //     page: page
            // }
            // return result;
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

}
