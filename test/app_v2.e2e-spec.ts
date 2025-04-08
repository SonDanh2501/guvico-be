import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
// import TestCase from './test-case/index';
const TestCase = [
    {
        "description": "Danh sách banner",
        "method": "get",
        "endpoint": "/admin/banner_manager/get_list",
        "expectedStatus": 200,
        "expectedData": null,
        "headers": true,
        "token": true,
        "requestData": null,
        ex: [

        ]
    },
    // {
    //     "description": "Should create a new user",
    //     "method": "post",
    //     "endpoint": "/users",
    //     "requestData": {
    //         "name": "Jane Smith",
    //         "email": "jane@example.com"
    //     },
    //     "expectedStatus": 201,
    //     "expectedData": {
    //         "id": 2,
    //         "name": "Jane Smith",
    //         "email": "jane@example.com"
    //     }
    // }
]
describe('API Tests', () => {
    let app;
    let token;
    beforeAll(async () => {
        app = 'http://localhost:5000';
        token = ''
    });

    TestCase.forEach((testCase) => {
        it(testCase.description, async () => {
            let req = request(app)[testCase.method](testCase.endpoint);
            if (testCase.requestData) {
                req = req.send(testCase.requestData);
            }
            if (testCase.headers) {
                req = req.set('Version', '2.0.0');
            }
            if (testCase.token) {
                req = req.set('Authorization', `Bearer ${token}`);
            }
            const response = await req;
            console.log('response.status  ', response.status);

            expect(response.status).toBe(testCase.expectedStatus);

            if (testCase.expectedData) {
                expect(response.body).toEqual(testCase.expectedData);
            }
        });
    });
});