import { PipeTransform, Injectable, NotFoundException } from '@nestjs/common';
import { DEFAULT_LANG, LANGUAGE } from '../constant';

@Injectable()
export class ValidateLangPipe implements PipeTransform<any, LANGUAGE> {
  transform(lang: LANGUAGE): LANGUAGE {
    if (!lang) {
      return DEFAULT_LANG;
    }

    if (!Object.values(LANGUAGE).includes(lang)) {
      throw new NotFoundException();
    }
    return lang;
  }
}
