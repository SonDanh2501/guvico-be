import { Injectable } from '@nestjs/common'
import { I18nService } from 'nestjs-i18n'

@Injectable()
export class CustomExceptionService {
    constructor(
        private i18n: I18nService,
      ) { }

    async i18nValidation(validationField, lang, field?) {
        const text = {
          message: this.i18n.translate(`validation.${validationField}`, { lang, args: {} }),
          field: field || null
        }
        return text;
      }
    
      async i18nError(validationField, lang, field?) {
        const text = {
          message: this.i18n.translate(`error.${validationField}`, { lang, args: {} }),
          field: field || null
        }
        return text;
      }
      async i18nMessage(validationField, lang, field?) {
        const text = {
          message: this.i18n.translate(`error.${validationField}`, { lang, args: {} }),
          field: field || null
        }
        return text;
      }
      async i18nErrorWithProperty(validationField, lang, property, field?) {
        const text = {
          message: this.i18n.translate(`error.${validationField}`, { lang, args: property }),
          field: field || null
        }
        return text;
      }  
}
