// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getDatabase } from 'firebase/database';
import { set } from 'mongoose';
import * as admin from 'firebase-admin';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: 'AIzaSyAVnh2YawgiSMyp2eMcTUywfP54NGhvchM',
//   authDomain: 'guvico-351910.firebaseapp.com',
//   databaseURL: 'https://guvico-351910-default-rtdb.firebaseio.com',
//   projectId: 'guvico-351910',
//   storageBucket: 'guvico-351910.appspot.com',
//   messagingSenderId: '818916011618',
//   appId: '1:818916011618:web:4dd48fc0af70a24ef5ab3b',
//   measurementId: 'G-25XMXFFRFZ',
// };

// https://github.com/tkssharma/nestjs-advance-course/tree/main/nestjs-firebase-auth-authz/src/logger
// async function  bootstrap() {
//     admin.initializeApp({
//       credential: admin.credential.cert({
//         apiKey: 'AIzaSyAVnh2YawgiSMyp2eMcTUywfP54NGhvchM',
//         authDomain: 'guvico-351910.firebaseapp.com',
//         projectId: 'guvico-351910',
//         storageBucket: 'guvico-351910.appspot.com',
//         messagingSenderId: '818916011618',
//         appId: '1:818916011618:web:4dd48fc0af70a24ef5ab3b',
//         measurementId: 'G-25XMXFFRFZ',
//       }as Partial<admin.ServiceAccount>) ,
//       databaseURL: 'https://guvico-351910-default-rtdb.firebaseio.com',
//     });
//     const app = await NestFactory.create(AppModule);
//     app.useLogger(app.get(Logger));
//     const configService = app.get(ConfigService);
//     SwaggerModule.setup('api/v1', app, createDocument(app));
//     await app.listen(configService.get().port);
//   }
//   export default admin;
//   bootstrap();

//   // Initialize Firebase
//   // const app = initializeApp(firebaseConfig);
//   // const analytics = getAnalytics(app);

//   function writeTokenData(token) {
//   // const app = initializeApp(firebaseConfig);
//     const db = getDatabase();
//     const references = ref(db, 'token');

//     set(references, {
//       token: token,
//     });
// }
// export function writeTokenData()
