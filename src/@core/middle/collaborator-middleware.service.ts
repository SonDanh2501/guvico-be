import { HttpException, HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CollaboratorSetting, CollaboratorSettingDocument } from '../db/schema/collaborator_setting.schema';
import { FastifyRequest, FastifyReply } from 'fastify';
import { CollaboratorOopSystemService } from 'src/core-system/@oop-system/collaborator-oop-system/collaborator-oop-system.service';
import { SettingOopSystemService } from 'src/core-system/@oop-system/setting-oop-system/setting-oop-system.service';
import { SettingSystemService } from 'src/core-system/@core-system/setting-system/setting-system.service';
@Injectable()
export class CollaboratorMiddleWareService implements NestMiddleware {
  constructor(
    private settingSystemService: SettingSystemService
  ) { }
  async use(req: FastifyRequest, res: FastifyReply, next: () => void) {
    await this.settingSystemService.checkVersionCollaborator(req)
    next();
  }
}
