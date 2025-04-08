import { NestFactory } from '@nestjs/core';
import { CoreSystemModule2 } from 'src/core-system/@core-system/core-system.module';
import { INestApplicationContext } from '@nestjs/common';

let appContext: INestApplicationContext | null = null;

(async function initializeContext() {
  try {
    console.log('[Master] Initializing Nest application context...');
    appContext = await NestFactory.createApplicationContext(CoreSystemModule2);
    console.log('[Master] Application context initialized.');

    // Lắng nghe yêu cầu từ sandbox process
    process.on('message', async (msg) => {
      if (msg === 'getContext') {
        if (appContext) {
          process.send({ ready: true });
        } else {
          process.send({ error: 'Application context not initialized!' });
        }
      }
    });

    // Đóng context khi tiến trình master dừng
    process.on('SIGINT', async () => {
      console.log('[Master] Closing application context...');
      await appContext?.close();
      process.exit(0);
    });
  } catch (error) {
    console.error('[Master] Failed to initialize application context:', error);
    process.exit(1);
  }
})();
