import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const IPageDecorator = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const req: any = context.switchToHttp().getRequest();
    req.query = JSON.parse(JSON.stringify(req.query))
    req.query.length = Number(req.query.length) || 10;
    req.query.search = decodeURI(req.query.search || "").toString();
    req.query.start = Number(req.query.start) || 0
    req.query.brand = req.query.brand ? req.query.brand : "";
    if(req.query.typeSort) req.query.valueSort = Number(req.query.valueSort) || -1;
    return req.query;
  },
);

export const IPageIntervalDecorator = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const req: any = context.switchToHttp().getRequest();
    req.query = JSON.parse(JSON.stringify(req.query))
    req.query.length = Number(req.query.length) || 10;
    req.query.search = decodeURI(req.query.search || "").toString();
    req.query.start = Number(req.query.start) || 0
    req.query.start_date = new Date(req.query.end_date).toISOString() || new Date().toISOString()
    req.query.end_date = new Date(req.query.end_date).toISOString() || new Date().toISOString()
    return req.query;
  },
);

export const IPageTransitionDecorator = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const req: any = context.switchToHttp().getRequest();
    req.query = JSON.parse(JSON.stringify(req.query))
    req.query.length = Number(req.query.length) || 10;
    req.query.search = decodeURI(req.query.search || "").toString();
    req.query.start = Number(req.query.start) || 0
    req.query.type_bank = req.query.type_bank || ""
    req.query.status = req.query.status || ""
    req.query.kind_transfer = req.query.kind_transfer || ""
    req.query.subject = req.query.subject || ""

    return req.query;
  },
);
