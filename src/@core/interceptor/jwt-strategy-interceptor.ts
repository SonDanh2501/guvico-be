import { CallHandler, ExecutionContext, HttpException, HttpStatus, Injectable, NestInterceptor, UnauthorizedException } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Collaborator, CollaboratorDocument, Customer, CustomerDocument, UserSystem, UserSystemDocument } from '../db';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';
import { GlobalService } from '../service';
import { GeneralHandleService } from '../../@share-module/general-handle/general-handle.service';
import { FastifyRequest } from 'fastify';
import { KeyApi, KeyApiDocument } from '../db/schema/key_api.schema';
import { RoleAdmin, RoleAdminDocument } from '../db/schema/role_admin.schema';
import { compareAsc } from 'date-fns';
import { ERROR } from '../constant';
import { INFO_ADMIN } from '../query';
import { Observable, tap } from 'rxjs';
import { CollaboratorRepositoryService } from 'src/@repositories/repository-service/collaborator-repository/collaborator-repository.service';
import { CustomerRepositoryService } from 'src/@repositories/repository-service/customer-repository/customer-repository.service';
import { UserSystemRepositoryService } from 'src/@repositories/repository-service/user-system-repository/user-system-repository.service';
import { BehaviorTrackingRepositoryService } from 'src/@repositories/repository-service/behavior-tracking-repository/behavior-tracking-repository.service';
@Injectable()
export class JwTLogInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log('Before...');
    console.log(context, 'context...');
    console.log(next, 'next...');
    const now = Date.now();
    return next
      .handle()
      .pipe(
        tap(() => console.log(`After... ${Date.now() - now}ms`)),
      );
  }
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'sondanh2501#',
    });
  }
  async validate(user) {
    return user;
  }
}

@Injectable()
export class JwtStrategyAdmin extends PassportStrategy(Strategy, 'jwt_admin') {
  constructor(
    @InjectModel(UserSystem.name) private userSystemModel: Model<UserSystemDocument>,
    @InjectModel(KeyApi.name) private keyApiModel: Model<KeyApiDocument>,
    @InjectModel(RoleAdmin.name) private roleAdminModel: Model<RoleAdminDocument>,
    private userSystemRepositoryService: UserSystemRepositoryService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'sondanh2501#',
      passReqToCallback: true
    });
  }
  async validate(request: FastifyRequest, user) {
    const url_access = request.routeConfig.url;
    const getUser = await this.userSystemRepositoryService.findOneById(user._id,{},[{ path: 'id_role_admin', select: INFO_ADMIN }],)
    const breakToken = request.headers.authorization.split(" ");
    if (getUser.session_login.findIndex(item => item.token === breakToken[1]) < 0) {
      throw new UnauthorizedException();
    }
    if (!getUser || (getUser && getUser.is_delete === true)
      || (getUser && getUser.id_role_admin === null)
    ) {
      throw new UnauthorizedException();
    }
    // console.log('--- name ', getUser.full_name, '\n --- city ', getUser.area_manager_lv_1, '\n --- district', getUser.area_manager_lv_2,
    //   '\n---- id doanh nghiệp', getUser.id_business, ' \n--- loại dịch vụ', getUser.id_service_manager);
    const returnData = {
      subjectAction: {
        type: "admin",
        _id: getUser._id
      },
      data: getUser
    }
    return returnData;
  }
}

@Injectable()
export class JwtStrategyCollaborator extends PassportStrategy(Strategy, 'jwt_collaborator') {
  constructor(
    private customExceptionService: CustomExceptionService,
    private generalHandleService: GeneralHandleService,
    private collaboratorRepositoryService: CollaboratorRepositoryService,

  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'sondanh2501#',
    });
  }

  async validate(user) {
    const getUser = await this.collaboratorRepositoryService.findOneById(user._id);

    if (!getUser || (getUser && getUser.is_delete === true)) {
      throw new UnauthorizedException();
    }

    if (getUser.is_locked === true) {
       throw new HttpException([await this.customExceptionService.i18nError(ERROR.ACCOUNT_IS_LOCKED, 'vi', null)], HttpStatus.UNAUTHORIZED);
    }
    // const currentDate = new Date(Date.now());
    // const dateLock = new Date(getUser.date_lock);
    // const result = compareAsc(currentDate, dateLock);
    // if (result >= 0 && getUser.date_lock !== null) {
    //   getUser.is_locked = false;
    //   getUser.date_lock = null;
    //   await this.collaboratorRepositoryService.findByIdAndUpdate(user._id, getUser);
    // }
    // if (getUser.is_locked === true) {
    //   if (getUser.date_lock !== null) {
    //     if (result <= 0) {
    //       const time = await this.generalHandleService.convertMsToTime(dateLock.getTime() - currentDate.getTime());
    //       const property = {
    //         property: time
    //       }
    //       throw new HttpException([await this.customExceptionService.i18nErrorWithProperty(ERROR.COLLABORATOR.IS_LOCK_TIME, 'vi', property, null)], HttpStatus.UNAUTHORIZED);
    //     }
    //   }
    //   if (getUser.date_lock === null) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ACCOUNT_IS_LOCKED, 'vi', null)], HttpStatus.UNAUTHORIZED);
    // }
    const returnData = {
      subjectAction: {
        type: "collaborator",
        _id: getUser._id
      },
      data: getUser
    }

    return returnData;
  }
}


@Injectable()
export class JwtStrategyCustomer extends PassportStrategy(Strategy, 'jwt_customer') {
  constructor(
    private customerRepositoryService: CustomerRepositoryService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'sondanh2501#',
      passReqToCallback: true,
    });
  }
  async validate(request: FastifyRequest, user) {
    const getUser = await this.customerRepositoryService.findOneById(user._id);

    if (!getUser || (getUser && (getUser.is_delete === true || getUser.is_active === false))) {
      throw new UnauthorizedException();
    }
    const returnData = {
      subjectAction: {
        type: "customer",
        _id: getUser._id
      },
      data: getUser
    }

    return returnData;
  }
}

@Injectable()
export class JwtStrategySocket extends PassportStrategy(Strategy, 'jwt_socket') {
  constructor(
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'sondanh2501#',
      passReqToCallback: true
    });
  }

  async validate(request: FastifyRequest, user) {
    return user;
  }
}

@Injectable()
export class JwtStrategyChat extends PassportStrategy(Strategy, 'jwt_chat') {
  constructor(
    private customExceptionService: CustomExceptionService,
    private globalService: GlobalService,
    private generalHandleService: GeneralHandleService,
    private collaboratorRepositoryService: CollaboratorRepositoryService,
    private customerRepositoryService : CustomerRepositoryService

  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'sondanh2501#',
    });
  }
  async validate(user) {
    let getUser = await this.collaboratorRepositoryService.findOneById(user._id)
    if (!getUser) {
      getUser = await this.customerRepositoryService.findOneById(user._id)
    }
    if (!getUser) {
      throw new UnauthorizedException();
    }
    return getUser;
  }
}

@Injectable()
export class JwtStrategyGoong extends PassportStrategy(Strategy, 'jwt_goong') {
  constructor(
    // private behaviorTrackingRepositoryService: BehaviorTrackingRepositoryService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'sondanh2501#',
      passReqToCallback: true
    });
  }
  async validate(request: FastifyRequest, user) {
    // console.log(request, 'request');
    
    // await this.behaviorTrackingRepositoryService.findOneAndUpdateBehavior(user._id, request)


    return user;
  }
}