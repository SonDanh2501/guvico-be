import { HttpException, HttpStatus, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { CustomExceptionService } from '../custom-exception/custom-exception.service';
import { GeneralHandleService } from '../general-handle/general-handle.service';
import * as fs from 'fs';
import * as path from 'path';
import * as xlsx from 'xlsx';

@Injectable()
export class EditorCodeToolService implements OnApplicationBootstrap {
    constructor(
        private customExceptionService: CustomExceptionService,
        private generalHandleService: GeneralHandleService,
        // @InjectModel(Promotion.name) private promotionModel: Model<PromotionDocument>,
    ) { }

    async onApplicationBootstrap(): Promise<any> {
        try {
            // await this.converFile()
        } catch (err) {
            console.error(err, 'err');
        }
    }

    async converFile() {
        try {
            console.log("run");

            const linkFile = path.join(__dirname, '../../../src/core-system/activity-admin-system/activity-admin-system.service.ts');

            const beginFunction = `try {`;
            const lastFunction = `} catch (err) {`;



            const fileData = fs.readFileSync(linkFile, 'utf8');
            console.log(fileData);

            let indexStart = -1;
            let indexEnd = -1;

            const positions = [];
            while ((indexStart = fileData.indexOf(beginFunction, indexStart + 1)) !== -1) {
                indexEnd = fileData.indexOf(lastFunction, indexStart + 1)
                positions.push({ start: indexStart, end: indexEnd });
            }

            console.log(positions, 'positions');

            const newFile = "activity-admin-system-test.service.ts"


            // const editContent = fileData.substring(positions[0].start, positions[0].end);
            // const temp = editContent.split("\n")
            // console.log(editContent, 'editContent');
            // console.log(temp, 'temp');
            let newContent = fileData.substring(0, positions[0].start);
            let jsonContent3 = [];
            let jsonContent2 = [{
                STT: 1,
                srouce_user: "ADMIN",
                log_history_admin: "",
                log_history_ctv: "",
                notification_ui_ctv: "",
                notification_ctv: "",
                log_history_kh: "",
                notification_ui_kh: "",
                notification_kh: "",
                type_history: ""
            }]

            for (let i = 0; i < positions.length; i++) {
                let editContent = fileData.substring(positions[i].start, positions[i].end);
                // // jsonContent.push({
                // //     STT: "0",
                // //     srouce_user: "ADMIN",
                // //     log_history_admin: "",
                // //     log_history_ctv: "",
                // //     notification_ui_ctv: "",
                // //     notification_ctv: "",
                // //     log_history_kh: "",
                // //     notification_ui_kh: "",
                // //     notification_kh: "",
                // //     type_history: ""
                // // })
                // const temp = 'temp';
                // const temp2 = 'temp2';
                // const mess = 'message';

                // const searchTemp = editContent.indexOf(temp)
                // const searchTemp2 = editContent.indexOf(temp2)
                // const searchMess = editContent.indexOf(mess)
                // // if(searchMess !== -1) {
                // //   editContent = editContent.replace(/temp/g, "messAdmin")
                // // } else {
                // //   editContent = editContent.replace(/temp2/g, "messAdmin")
                // //   editContent = editContent.replace(/temp/g, "message")
                // // }



                // if(searchMess !== -1) {

                //     const search_title_vi = "vi: '";
                //     const positionSearchTitleVi = editContent.indexOf(search_title_vi);
                //     const positionSearchTitleViEnd = editContent.indexOf("'", positionSearchTitleVi + 10 );
                //     const textTemp = editContent.substring(positionSearchTitleVi + 5, positionSearchTitleViEnd);

                //     const positionLogAdmin = editContent.indexOf("temp = `");
                //     const positionLogAdminEnd = editContent.indexOf("`", positionLogAdmin + 10 );
                //     const textTemp2 = editContent.substring(positionLogAdmin + 8, positionLogAdminEnd);

                //     jsonContent.push({
                //         STT: jsonContent.length + 1,
                //         srouce_user: "ADMIN",
                //         log_history_admin: textTemp2,
                //         log_history_ctv: textTemp,
                //         notification_ui_ctv: "",
                //         notification_ctv: "",
                //         log_history_kh: "",
                //         notification_ui_kh: "",
                //         notification_kh: "",
                //         type_history: ""
                //     })


                // } else {

                // }

                // newContent += " " + editContent;

                let jsonContent = {}
                const tempText = editContent.split("\n");
                for (let y = 0; y < tempText.length; y++) {
                    const findTemp = tempText[y].indexOf("temp =")

                    const findTemp2 = tempText[y].indexOf("temp2 =")
                    const findDescription = tempText[y].indexOf("description =")
                    const findMess = tempText[y].indexOf("message =")

                    if (findTemp > -1) {
                        const findVi1 = tempText[y + 1].indexOf("vi:")
                        const findVi2 = tempText[y + 2].indexOf("vi:")
                        if (findVi1 > -1) {
                            const findWord = await this.findPositionByKeyWord(['`', '"', `'`], tempText[y + 1]);
                            if (findWord.length > 0) jsonContent['temp'] = tempText[y + 1].substring(findWord[0].positions[0], findWord[0].positions[1])
                        } else if (findVi2 > -1) {
                            const findWord = await this.findPositionByKeyWord(['`', '"', `'`], tempText[y + 2]);
                            if (findWord.length > 0) jsonContent['temp'] = tempText[y + 2].substring(findWord[0].positions[0], findWord[0].positions[1])
                        } else if (findVi1 < 0 && findVi2 < 0) {
                            const findWord = await this.findPositionByKeyWord(['`', '"', `'`], tempText[y]);
                            if (findWord.length > 0) jsonContent['temp'] = tempText[y].substring(findWord[0].positions[0], findWord[0].positions[1])
                        }
                    }
                    if (findTemp2 > -1) {


                        const findVi1 = tempText[y + 1].indexOf("vi:")
                        const findVi2 = tempText[y + 2].indexOf("vi:")
                        if (findVi1 > -1) {
                            const findWord = await this.findPositionByKeyWord(['`', '"', `'`], tempText[y + 1]);
                            if (findWord.length > 0) jsonContent['temp2'] = tempText[y + 1].substring(findWord[0].positions[0], findWord[0].positions[1])
                        } else if (findVi2 > -1) {
                            const findWord = await this.findPositionByKeyWord(['`', '"', `'`], tempText[y + 2]);
                            if (findWord.length > 0) jsonContent['temp2'] = tempText[y + 2].substring(findWord[0].positions[0], findWord[0].positions[1])
                        } else if (findVi1 < 0 && findVi2 < 0) {
                            const findWord = await this.findPositionByKeyWord(['`', '"', `'`], tempText[y]);
                            if (findWord.length > 0) jsonContent['temp2'] = tempText[y].substring(findWord[0].positions[0], findWord[0].positions[1])
                        }


                        // const findWord = await this.findPositionByKeyWord(['`', '"', `'`], tempText[y]);
                        // if(findWord.length > 0) jsonContent['temp2'] = tempText[y].substring(findTemp2 + 7, findWord[0].positions[0])
                    }
                    if (findDescription > -1) {
                        const findVi1 = tempText[y + 1].indexOf("vi:")
                        const findVi2 = tempText[y + 2].indexOf("vi:")
                        if (findVi1 > -1) {
                            const findWord = await this.findPositionByKeyWord(['`', '"', `'`], tempText[y + 1]);
                            if (findWord.length > 0) jsonContent['description'] = tempText[y + 1].substring(findWord[0].positions[0], findWord[0].positions[1])
                        } else if (findVi2 > -1) {
                            const findWord = await this.findPositionByKeyWord(['`', '"', `'`], tempText[y + 2]);
                            if (findWord.length > 0) jsonContent['description'] = tempText[y + 2].substring(findWord[0].positions[0], findWord[0].positions[1])
                        }
                    }
                    if (findMess > -1) {
                        const findVi1 = tempText[y + 1].indexOf("vi:")
                        const findVi2 = tempText[y + 2].indexOf("vi:")
                        if (findVi1 > -1) {
                            const findWord = await this.findPositionByKeyWord(['`', '"', `'`], tempText[y + 1]);
                            if (findWord.length > 0) jsonContent['message'] = tempText[y + 1].substring(findWord[0].positions[0], findWord[0].positions[1])
                        } else if (findVi2 > -1) {
                            const findWord = await this.findPositionByKeyWord(['`', '"', `'`], tempText[y + 2]);
                            if (findWord.length > 0) jsonContent['message'] = tempText[y + 2].substring(findWord[0].positions[0], findWord[0].positions[1])
                        }
                    }
                }
                jsonContent3.push(jsonContent)



                for (let y = 0; y < tempText.length; y++) {
                    console.log(jsonContent2, 'jsonContent2');



                    if (tempText[y].indexOf("title_admin: temp2,") > -1) {
                        jsonContent2[i].log_history_admin = jsonContent3[i].temp2
                    }
                    if (tempText[y].indexOf("title_admin: temp,") > -1) {
                        jsonContent2[i].log_history_admin = jsonContent3[i].temp
                    }
                    if (tempText[y].indexOf("title: temp,") > -1) {
                        if(jsonContent3[i].temp.indexOf("ollaborator._id") > -1) jsonContent2[i].log_history_ctv = jsonContent3[i].temp
                        if(jsonContent3[i].temp.indexOf("ustomer._id") > -1) jsonContent2[i].log_history_kh = jsonContent3[i].temp
                    }
                    if (tempText[y].indexOf("title: temp2") > -1) {
                        if(jsonContent3[i].temp2.indexOf("ollaborator._id") > -1) jsonContent2[i].log_history_ctv = jsonContent3[i].temp2
                        if(jsonContent3[i].temp2.indexOf("ustomer._id") > -1) jsonContent2[i].log_history_kh = jsonContent3[i].temp2
                    }
                    if (tempText[y].indexOf("title: message") > -1) {
                        if(jsonContent3[i].message.indexOf("ollaborator._id") > -1) jsonContent2[i].log_history_ctv = jsonContent3[i].message
                        if(jsonContent3[i].message.indexOf("ustomer._id") > -1) jsonContent2[i].log_history_kh = jsonContent3[i].message
                    }



                    // if(tempText[y].indexOf("title_admin: temp,") > -1) {
                    //     jsonContent2[i].log_history_admin = jsonContent3[i].temp
                    // }
                    if (tempText[y].indexOf("type: ") > -1) {

                        // if (tempText[y].indexOf("customer") > -1) {
                        //     const temp = jsonContent2[i].log_history_ctv
                        //     jsonContent2[i].log_history_kh = temp;
                        //     jsonContent2[i].log_history_ctv = ""
                        // }
                        // if(tempText[y].indexOf("collaborator") < 0 && tempText[y].indexOf("customer") < 0) {
                        //     jsonContent2[i].log_history_ctv = ""
                        // }
                        jsonContent2[i].type_history = tempText[y].substring(tempText[y].indexOf("type: ") + 7, tempText[y].length - 2)
                    }
                    // if(tempText[y].indexOf("payloadNotification") > -1)
                }
                // console.log(jsonContent, 'jsonContent');
                // console.log(jsonContent2, 'jsonContent2');

                console.log(jsonContent2, 'jsonContent2');


                if (i < positions.length - 1) {
                    //   console.log(i , 'i ');

                    const contentMiddle = fileData.substring(positions[i].end, positions[i + 1].start)
                    //   console.log(contentMiddle, 'contentMiddle');

                    newContent += " " + contentMiddle;
                } else {
                    const contentMiddle = fileData.substring(positions[i].end)
                    //   console.log(contentMiddle, 'contentMiddle');

                    newContent += " " + contentMiddle;
                }


                if (i < positions.length) {
                    jsonContent2.push({
                        STT: i + 1,
                        srouce_user: "ADMIN",
                        log_history_admin: "",
                        log_history_ctv: "",
                        notification_ui_ctv: "",
                        notification_ctv: "",
                        log_history_kh: "",
                        notification_ui_kh: "",
                        notification_kh: "",
                        type_history: ""
                    })
                }

            }




            //   fs.writeFileSync(newFile, newContent);

            console.log("check");

            this.exportExcel(jsonContent2);

            //  await fs.writeFileSync("activity.json", JSON.stringify(jsonContent));

            return true;

        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getDataFromGoogleSheet() {
        try {
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    async readFile(nameFile, readLocation) {
        try {
            const linkFile = path.join(__dirname, `${readLocation}/${nameFile}`);
            const fileData = fs.readFileSync(linkFile, 'utf8');
            return fileData;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async readFileByGoogleSheet() {

    }

    async saveFile(nameFile, content, saveLocation) {
        try {
            const linkFile = path.join(__dirname, `${saveLocation}/${nameFile}`);
            fs.writeFileSync(linkFile, content);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async writeFile(textInput, contentInput) {
        try {
            const newContent = contentInput;

        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async convertFileExcelToJson() {
        try {

        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async convertFileJsonToExcel() {
        try {

        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    async findPositionByKeyWord(arrInput, contentInput) {
        try {
            let arrResult = [];
            for (let i = 0; i < arrInput.length; i++) {
                let index = -1
                let checkFirst = true;

                while ((index = contentInput.indexOf(arrInput[i], index + 1)) !== -1) {
                    if (checkFirst = true) {
                        arrResult.push({ positions: [index], valueFind: arrInput[i] })
                    } else {
                        arrResult[i].positions.push(index)
                    }
                    checkFirst = false;
                }
            }
            return arrResult;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    // while ((indexStart = fileData.indexOf(beginFunction, indexStart + 1)) !== -1) {
    //     indexEnd = fileData.indexOf(lastFunction, indexStart + 1)
    //     positions.push({start: indexStart, end: indexEnd});
    //   }

    async exportExcel(contentInput) {
        try {
            const worksheet = xlsx.utils.json_to_sheet(contentInput);
            const workbook = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
            const buffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' });
            await fs.writeFileSync("test.xlsx", buffer);

        }
        catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

}
