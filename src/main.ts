import { NestFactory } from '@nestjs/core'
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { contentParser } from 'fastify-multer'
import { join } from 'path'
import { AutomationModule } from './@automation/automation.module'
import { CronjobModule2 } from './@share-module/cronjob/cronjob.module'
import { AppModule } from './app.module'
import { CronjobModule } from './cronjob/cronjob.module'
import { fork } from 'child_process'
// import { OrderSchedulerService } from './cronjob/order-scheduler/order-scheduler.service';
// import { SmsModule } from './@share-module/sms/sms.module';
// import { CoreSystemModule } from './core-system/core-system.module';



async function bootstrap() {
  const CORS_OPTIONS = {
    origin: "*", // or '*' or whatever is required
    allowedHeaders: [
      'Access-Control-Allow-Origin',
      'Origin',
      'X-Requested-With',
      'Accept',
      'Content-Type',
      'Authorization',
    ],
    exposedHeaders: 'Authorization',
    // credentials: true,
    methods: ['GET', 'POST'],
  };
  const adapter = new FastifyAdapter();
  adapter.enableCors(CORS_OPTIONS)

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    adapter
  );

  app.useStaticAssets({
    root: join(__dirname, '..', 'public'),
    prefix: '/public/',
  });
  app.setViewEngine({
    engine: {
      handlebars: require('handlebars'),
    },
    templates: join(__dirname, '..', 'public/views'),
  });

  await app.register(contentParser)

  const config = new DocumentBuilder()
    .setTitle('Guvico API')
    .setDescription('Cái nào nằm ở default là chưa xài được')
    .setVersion('1.0')
    .addTag('customer')
    .addTag('admin')
    .addTag('google map')
    .addTag('collaborator')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const server = await app.listen(process.env.PORT || process.env.APP_PORT || 4000, '::');
  server.setTimeout(1800000);

}


async function bootstrapCronjob() {
  // khong su dung trong day, cronjob da dua vao app.service
  await NestFactory.createApplicationContext(CronjobModule);
  await NestFactory.createApplicationContext(AutomationModule);
}

async function bootstrapCronjob2() {
  // khong su dung trong day, cronjob da dua vao app.service
  await NestFactory.createApplicationContext(CronjobModule2);
}
async function bootstrapQueues() {
  // Khởi động context server
  // /Volumes/DATA/PROJECT/GUVI/BE/AUTOMATION/guvico-be/src/queues/sandbox-processor/master-context.ts
  // /Volumes/DATA/PROJECT/GUVI/BE/AUTOMATION/guvico-be/dist/queues/sandbox-processor/context-server.js
  // console.log(__dirname, '__dirname');
  console.log(join(__dirname, 'queues/sandbox-processor/context-server.js'), 'sss');
  
  
  const contextServerProcess = fork(join(__dirname, 'queues/sandbox-processor/context-server.js'));
  console.log('[Main] Context server started.');
  
  // Xử lý sự kiện từ tiến trình context-server
  contextServerProcess.on('error', (error) => {
    console.error('[Main] Context server encountered an error:', error);
  });

<<<<<<< HEAD
bootstrapCronjob();
=======
  contextServerProcess.on('exit', (code) => {
    console.log(`[Main] Context server exited with code: ${code}`);
  });
// khong su dung trong day, cronjob da dua vao app.service
// await NestFactory.createApplicationContext(QueuesStackModule);
}
// bootstrapCronjob();
// bootstrapCronjob2();
>>>>>>> son
bootstrap();
// use 2 workers
// Cluster.register(2, bootstrap);
