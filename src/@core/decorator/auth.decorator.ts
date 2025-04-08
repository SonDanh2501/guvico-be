import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const GetUserByToken = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const req: any = context.switchToHttp().getRequest();
    return req.user.data || req.user;
  },
);

export const GetSubjectAction = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const req: any = context.switchToHttp().getRequest();

    return {...req.user.subjectAction, version: req.headers.version};
  },
);

export const GetUserByTokenSocket = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const req: any = context.switchToHttp().getRequest();
    return req.user;
  },
);

export const GetVersion = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const req: any = context.switchToHttp().getRequest();

    return req.headers.version 
  },
);
