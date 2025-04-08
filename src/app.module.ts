import { Module } from '@nestjs/common'
import { APP_INTERCEPTOR, RouterModule } from '@nestjs/core'
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n'
import * as path from 'path'
import { CloudinaryModule } from './@share-module/cloudinary/cloudinary.module'
import { CustomExceptionModule } from './@share-module/custom-exception/custom-exception.module'
import { EmailModule } from './@share-module/email/email.module'
import { GeneralHandleModule } from './@share-module/general-handle/general-handle.module'
import { GoogleMapModule } from './@share-module/google-map/google-map.module'
import { MigrateModule } from './@share-module/migrate/migrate.module'
import { SmsModule } from './@share-module/sms/sms.module'
import { AdminModule } from './admin/admin.module'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ChatServiceModule } from './chat-service/chat-service.module'
import { CollaboratorModule } from './collaborator/collaborator.module'
import { CoreSystemModule } from './core-system/core-system.module'
import { CustomerModule } from './customer/customer.module'
import { NotificationModule } from './notification/notification.module'
import { UploadModule } from './upload/upload.module'
// import { WinstonModule } from 'nest-winston';
// import { AllExceptionFilter } from './@core';
import { HttpInterceptor } from './@core/interceptor/http-interceptor'
import { GoongModule } from './@share-module/goong/goong.module'
import { LinkInviteModule } from './@share-module/link-invite/link-invite.module'
import { VnpayModule } from './@share-module/vnpay/vnpay.module'
// import { WebsocketsModule } from './@share-module/websockets/websockets.module';
import { EditorCodeToolModule } from './@share-module/editor-code-tool/editor-code-tool.module'
import { MomoModule } from './@share-module/momo/momo.module'
import { UploadImageModule } from './@share-module/upload-image/upload-image.module'
import { CoreSystemModule2 } from './core-system/@core-system/core-system.module'
import { RestModule } from './rest/rest.module'

//import { PunishPolicyRepositoryService } from './@repository/punish-policy-repository/punish-policy-repository.service';
const router = [
  {
    path: 'admin',
    module: AdminModule,
  },
  {
    path: 'customer',
    module: CustomerModule,
  },
  {
    path: 'collaborator',
    module: CollaboratorModule,
  },
  // {
  //   path: 'cronjob',
  //   module: CronjobModule,
  // },
  {
    path: 'notification',
    module: NotificationModule,
  },
  {
    path: 'cloudinary',
    module: CloudinaryModule,
  },
  {
    path: 'chat',
    module: ChatServiceModule,
  },
  {
    path: 'invite',
    module: LinkInviteModule,
  },
  {
    path: 'image',
    module: UploadImageModule,
  },
  // {
  //   path: 'payment',
  //   children: [
  //     {
  //       path: 'vnpay',
  //       module: VnpayModule,
  //     },
  //   ]
  // },
]

const dateNow = new Date(Date.now())
const dateLogger = `${dateNow.getDate()}-${dateNow.getMonth() + 1}-${dateNow.getFullYear()}`;



@Module({
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: 'vi',
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
      ],
    }),
    // BullModule.forRoot({
    //   redis: {
    //     host: 'localhost',
    //     port: 6379,
    //   },
    // }),


    // ServeStaticModule.forRoot({
    //   rootPath: join(__dirname, '..', 'public'),
    // }),
    RouterModule.register(router),

    // ConfigModule.forRoot({
    //   load: [{
    //     port: parseInt(process.env.PORT, 10) || 3000,
    //   }],
    // }),
    AdminModule,
    CollaboratorModule,
    CustomerModule,
    NotificationModule,
    UploadModule,
    // MulterModule.register({
    //   storage: memoryStorage(), // use memory storage for having the buffer
    // }),
    CloudinaryModule,
    // ChatServiceModule,
    SmsModule,
    EmailModule,
    CoreSystemModule,
    CustomExceptionModule,
    GeneralHandleModule,
    MigrateModule,
    GoogleMapModule,
    VnpayModule,
    GoongModule,
    LinkInviteModule,
    // WebsocketsModule,
    UploadImageModule,
    EditorCodeToolModule,
    // CacheModule.register(),
    MomoModule,
    //QueuesModule,
    // ChatServiceModule,
    RestModule,
    CoreSystemModule2
  ],
  controllers: [AppController],
  providers: [
    // {
    //   provide: APP_FILTER,
    //   useClass: AllExceptionFilter,
    // },
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpInterceptor,
    },
  ]
})

export class AppModule { }
// export class AppModule implements NestModule {
//   configure(consumer: MiddlewareConsumer) {
//     consumer
//       .apply(LoggerMiddleWareService)
//       .forRoutes('collaborator');
//   }
// }
