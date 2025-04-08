import { CoreSystemModule2 } from "src/core-system/@core-system/core-system.module";

const net = require('net');
const { NestFactory } = require('@nestjs/core');
// const { CoreSystemModule2 } = require('src/core-system/@core-system/core-system.module');

let appContext = null;

// Hàm khởi tạo NestJS application context
async function initializeContext() {
  if (!appContext) {
    console.log('[Context Server] Initializing Nest application context...');
    appContext = await NestFactory.createApplicationContext(CoreSystemModule2);


    const modules = appContext['container']['modules']; // Các module trong context

    // console.log(appContext['container'], 'appContext');
    

    // for()
// console.log(modules, 'modules');
// console.log(modules._applicationId, '_applicationId');
// console.log(modules.InternalCoreModule, 'InternalCoreModule');
// console.log(modules.InternalCoreModule._metatype, '_metatype');
// console.log(modules.InternalCoreModule, 'InternalCoreModule');
// console.log(modules.InternalCoreModule, 'InternalCoreModule');

const coreSystemModule: any = Array.from(modules.values()).find(
  (module: any) => module._metatype?.name === 'CoreSystemModule2', // Tìm module CoreSystemModule2
);

if (coreSystemModule) {
  // Sử dụng `metatype` để truy cập danh sách providers trong chính module
  const providersDeclaredInModule = Reflect.getMetadata('providers', coreSystemModule._metatype) || [];
  console.log(providersDeclaredInModule, 'providersDeclaredInModule');
  
  console.log('[Debug] Providers declared directly in CoreSystemModule2:');
  providersDeclaredInModule.forEach((provider) => {
    console.log(`- ${provider.name || provider}`); // Hiển thị tên class hoặc token provider
  });
} else {
  console.error('[Debug] CoreSystemModule2 not found in context.');
}



    // console.log(modules.providers, 'modules.providers');
    


// modules.forEach((module, key) => {

//   console.log(`Module2222: ${key.toString()}`); // Tên module

//   if(key.toString() === '0ab251364e145e4bbceaf7ff57cb420f3414ef7176d5209224efccca5dca9c8d') {
//     console.log(`Module2222: ${key}`); // Tên module
//     console.log('Providers:');
//     module.providers.forEach((provider, providerKey) => {
//       console.log('23123123123 ',  ` - ${providerKey}`); // Tên provider
//     });
//   }
// });


    console.log('[Context Server] Application context initialized.');
  }
  return appContext;
}

// Tạo IPC server
const server = net.createServer(async (socket) => {
  console.log('[Context Server] Received connection from sandbox...');

  socket.on('data', async (data) => {
    try {
      const message = JSON.parse(data.toString());

      if (message.command === 'getContext') {
        await initializeContext();
        socket.write(JSON.stringify({ ready: true }));
      }

      if (message.command === 'callService') {
        const { service, method, args } = message.payload;
        console.log(service, 'service');
        


        // Đảm bảo context đã được khởi tạo
        await initializeContext();

        // Lấy instance service từ context
        const targetService = appContext.get(service);

        console.log(targetService, 'targetService');
        // console.log(targetService[method], 'targetService');

        

        if (targetService && typeof targetService[method] === 'function') {
          const result = await targetService[method](...args);
          socket.write(JSON.stringify({ success: true, result }));
        } else {
          socket.write(JSON.stringify({ success: false, error: 'Invalid service or method' }));
        }
      }
    } catch (error) {
      console.error('[Context Server] Error processing message:', error);
      socket.write(JSON.stringify({ success: false, error: error.message }));
    }
  });

  socket.on('end', () => {
    console.log('[Context Server] Connection closed.');
  });
});

// Lắng nghe tại một cổng IPC
server.listen(9000, () => {
  console.log('[Context Server] Listening for connections...');
});

// Đóng context khi server dừng
process.on('SIGINT', async () => {
  if (appContext) {
    console.log('[Context Server] Closing application context...');
    await appContext.close();
  }
  process.exit(0);
});
