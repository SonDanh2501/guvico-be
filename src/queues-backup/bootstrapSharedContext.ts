import { NestFactory } from '@nestjs/core';
import { CollaboratorModule } from 'src/collaborator/collaborator.module';
import { CoreSystemModule } from 'src/core-system/core-system.module';
import { CronjobModule } from 'src/cronjob/cronjob.module';

// async function bootstrapCronJobContext() {
//   const app = await NestFactory.createApplicationContext(CronjobModule);
//   console.log('run cronjob');
//   return app;
// }

async function bootstrapCoreSystemContext() {
    const app = await NestFactory.createApplicationContext(CoreSystemModule);
    return app;
}

async function bootstrapCollaborator() {
  const app = await NestFactory.createApplicationContext(CollaboratorModule);
  return app
}

// Lưu trữ context đã được bootstrap
// export const cronJobApp = bootstrapCronJobContext();
export const coreSystemApp = bootstrapCoreSystemContext();
export const collaboratorApp = bootstrapCollaborator();