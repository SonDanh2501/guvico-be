// master.ts
import { NestFactory } from '@nestjs/core';
import { CoreSystemModule2 } from 'src/core-system/@core-system/core-system.module';

let appContext;

async function init() {
  if (!appContext) {
    console.log('[Master] Starting Nest application context...');
    appContext = await NestFactory.createApplicationContext(CoreSystemModule2);
    console.log('[Master] Application context initialized.');
  }
}

process.on('message', async (msg) => {
  if (msg === 'getContext') {
    if (!appContext) await init();
    process.send({ appContext });
  }
});

init();
