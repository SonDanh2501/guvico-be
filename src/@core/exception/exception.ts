// import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Inject } from '@nestjs/common'
// import { HttpArgumentsHost } from '@nestjs/common/interfaces/features/arguments-host.interface'
// import { Response } from 'express'
// import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
// import { Logger } from 'winston';

// @Catch()
// export class AllExceptionFilter implements ExceptionFilter {
//   constructor(
//     @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
//     ) {}

//   catch(exception: HttpException | Error, host: ArgumentsHost): void {
//     const ctx: HttpArgumentsHost = host.switchToHttp()
//     const response: Response = ctx.getResponse()
    
//     // Handling error message and logging
//     this.handleMessage(exception)
    
//     // Response to client
//     AllExceptionFilter.handleResponse(response, exception)
//   }
  
//   private handleMessage(exception: HttpException | Error): void {
//     let message: any = 'Internal Server Error'
    
//     if (exception instanceof HttpException) {
//       // console.log(exception.getResponse().toString(), 'exception')
//       // const temp = exception.getResponse();
//       // if (isHttpExceptionResponse(exceptionResponse)) {

//       // }
//       message = exception.getResponse();
//     } else if (exception instanceof Error) {
//       message = exception.stack.toString()
//     }
//     this.logger.error(message)
//   }
  
//   private static handleResponse(response: Response , exception: HttpException | Error): void {
//     let responseBody: any = { message: 'Internal server error' }
//     let statusCode = HttpStatus.INTERNAL_SERVER_ERROR
    
//     if (exception instanceof HttpException) {
//       responseBody = exception.getResponse()
//       statusCode = exception.getStatus()
      
//     } else if (exception instanceof Error) {
//       responseBody = {
//         statusCode: statusCode,
//         message: exception.stack
//       }
//     }
  
//     response.status(statusCode).json(responseBody)
//   }
// }