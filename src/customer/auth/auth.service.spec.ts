import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { HttpStatus } from '@nestjs/common';
import * as request from "supertest";

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe("AuthController (e2e)", () => {
    const authUrl = `http://localhost:5000/customer/auth`;

    const mockUser: any = {
      code_phone_area: "+84",
      phone: "0389888952",
      password: "Guvico2022"
    };

    describe("/auth/login (POST)", () => {
      it("it should register a user and return the new user object", () => {
        return request(authUrl)
          .post("/login?lang=vi")
          .set("Accept", "application/json")
          .send(mockUser)
          .expect((response: request.Response) => {
            const {
              token
            } = response.body;

            expect(typeof token).toBe("string")
            //   expect(givenName).toEqual(mockUser.givenName),
            //   expect(familyName).toEqual(mockUser.familyName),
            //   expect(email).toEqual(mockUser.email),
            //   expect(password).toBeUndefined();
            // expect(imagePath).toBeNull();
            // expect(role).toEqual("user");
          })
          .expect(HttpStatus.CREATED);
      });
    });
  });

});
