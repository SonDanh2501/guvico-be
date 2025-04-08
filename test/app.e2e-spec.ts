import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { CustomerModule } from 'src/customer/customer.module';
import TestCase from './test-case/index';


for (let i = 0; i < Object.keys(TestCase).length; i++) {
    const groupTest = `testcase${i}`
    const authUrl = `${TestCase[groupTest].base_point}`;
    for (let i = 0; i < TestCase[groupTest].group_test_case.length; i++) {
        // ----------------- run happy case -----------------


        console.log(TestCase[groupTest].group_test_case[i].request.body, 'TestCase[groupTest].group_test_case[i].request.body');
        


        if (TestCase[groupTest].group_test_case[i].method === "post") {
            describe(TestCase[groupTest].group_test_case[i].title, () => {
                it(TestCase[groupTest].group_test_case[i].description, () => {
                    return request(authUrl)
                        .post(TestCase[groupTest].group_test_case[i].url)
                        .set(TestCase[groupTest].headers)
                        .send(TestCase[groupTest].group_test_case[i].request.body)
                        .expect((response: request.Response) => {

                            

                            if (response.body[0]) {
                                console.log(response.body[0], 'response.body[0]ssssssss');
                                
                                for (const item of TestCase[groupTest].group_test_case[i].response.data) {
                                    if (item.type_of) {
                                        expect(typeof response.body[0][item.field]).toBe(item.type_of)
                                    } else if (item.value) {
                                        expect(typeof response.body[0][item.field]).toEqual(item.value)
                                    }
                                }
                            } else {
                                console.log(response.body, 'response.bodysssssss');

                                for (const item of TestCase[groupTest].group_test_case[i].response.data) {
                                    if (item.type_of) {
                                        expect(typeof response.body[item.field]).toBe(item.type_of)
                                    } else if (item.value) {
                                        expect(typeof response.body[0][item.field]).toEqual(item.value)
                                    }
                                }
                            }
                        })
                        .expect(TestCase[groupTest].group_test_case[i].response.status);
                });
            });
        } else if (TestCase[groupTest].group_test_case[i].method === "get") {
            describe(TestCase[groupTest].group_test_case[i].title, () => {
                it(TestCase[groupTest].group_test_case[i].description, () => {
                    return request(authUrl)
                        .get(TestCase[groupTest].group_test_case[i].url)
                        .set(TestCase[groupTest].headers)
                        .expect((response: request.Response) => {
                            if (response.body[0]) {
                                for (const item of TestCase[groupTest].group_test_case[i].response.data) {
                                    if (item.type_of) {
                                        expect(typeof response.body[0][item.field]).toBe(item.type_of)
                                    }
                                }
                            } else {
                                for (const item of TestCase[groupTest].group_test_case[i].response.data) {
                                    if (item.type_of) {
                                        expect(typeof response.body[item.field]).toBe(item.type_of)
                                    }
                                }
                            }
                        })
                        .expect(TestCase[groupTest].group_test_case[i].response.status);
                });
            });
        }
        // ----------------- run happy case -----------------

        // ----------------- run auto case -----------------
        if (TestCase[groupTest].group_test_case[i].test_empty_field_body === true) {
            // const lengthKeyObject = TestCase[groupTest].group_test_case[i].request.interface_body.length;
            for (const keyObject of TestCase[groupTest].group_test_case[i].request.interface_body) {
                if(keyObject.require === true) {
                    let body = {...TestCase[groupTest].group_test_case[i].request.body};
                    let description = `trường ${keyObject.field} rỗng ""`
                    body[keyObject.field] = ""
                    if (TestCase[groupTest].group_test_case[i].method === "post") {
                        describe(TestCase[groupTest].group_test_case[i].title, () => {
                            it(description, () => {
                                return request(authUrl)
                                    .post(TestCase[groupTest].group_test_case[i].url)
                                    .set(TestCase[groupTest].headers)
                                    .send(body)
                                    .expect((response: request.Response) => {
                                        if (response.body[0]) {
                                            for (const item of TestCase[groupTest].group_test_case[i].response_empty_field_body.data) {
                                                if (item.type_of) {
                                                    expect(typeof response.body[0][item.field]).toBe(item.type_of)
                                                } else if (item.value) {
                                                    expect(typeof response.body[0][item.field]).toEqual(item.value)
                                                }
                                            }
                                        } else {
                                            for (const item of TestCase[groupTest].group_test_case[i].response_empty_field_body.data) {
                                                if (item.type_of) {
                                                    expect(typeof response.body[item.field]).toBe(item.type_of)
                                                } else if (item.value) {
                                                    expect(typeof response.body[0][item.field]).toEqual(item.value)
                                                }
                                            }
                                        }
                                    })
                                    .expect(TestCase[groupTest].group_test_case[i].response_empty_field_body.status);
                            });
                        });
                    } else if (TestCase[groupTest].group_test_case[i].method === "get") {
                        describe(TestCase[groupTest].group_test_case[i].title, () => {
                            it(description, () => {
                                return request(authUrl)
                                    .get(TestCase[groupTest].group_test_case[i].url)
                                    .set(TestCase[groupTest].headers)
                                    .expect((response: request.Response) => {
                                        if (response.body[0]) {
                                            for (const item of TestCase[groupTest].group_test_case[i].response_empty_field_body.data) {
                                                if (item.type_of) {
                                                    expect(typeof response.body[0][item.field]).toBe(item.type_of)
                                                }
                                            }
                                        } else {
                                            for (const item of TestCase[groupTest].group_test_case[i].response_empty_field_body.data) {
                                                if (item.type_of) {
                                                    expect(typeof response.body[item.field]).toBe(item.type_of)
                                                }
                                            }
                                        }
                                    })
                                    .expect(TestCase[groupTest].group_test_case[i].response_empty_field_body.status);
                            });
                        });
                    }
                    description = `trường ${keyObject.field} null`
                    body[keyObject.field] = null
                    if (TestCase[groupTest].group_test_case[i].method === "post") {
                        describe(TestCase[groupTest].group_test_case[i].title, () => {
                            it(description, () => {
                                return request(authUrl)
                                    .post(TestCase[groupTest].group_test_case[i].url)
                                    .set(TestCase[groupTest].headers)
                                    .send(body)
                                    .expect((response: request.Response) => {
                                        if (response.body[0]) {
                                            for (const item of TestCase[groupTest].group_test_case[i].response_empty_field_body.data) {
                                                if (item.type_of) {
                                                    expect(typeof response.body[0][item.field]).toBe(item.type_of)
                                                } else if (item.value) {
                                                    expect(typeof response.body[0][item.field]).toEqual(item.value)
                                                }
                                            }
                                        } else {
                                            for (const item of TestCase[groupTest].group_test_case[i].response_empty_field_body.data) {
                                                if (item.type_of) {
                                                    expect(typeof response.body[item.field]).toBe(item.type_of)
                                                } else if (item.value) {
                                                    expect(typeof response.body[0][item.field]).toEqual(item.value)
                                                }
                                            }
                                        }
                                    })
                                    .expect(TestCase[groupTest].group_test_case[i].response_empty_field_body.status);
                            });
                        });
                    } else if (TestCase[groupTest].group_test_case[i].method === "get") {
                        describe(TestCase[groupTest].group_test_case[i].title, () => {
                            it(description, () => {
                                return request(authUrl)
                                    .get(TestCase[groupTest].group_test_case[i].url)
                                    .set(TestCase[groupTest].headers)
                                    .expect((response: request.Response) => {
                                        if (response.body[0]) {
                                            for (const item of TestCase[groupTest].group_test_case[i].response_empty_field_body.data) {
                                                if (item.type_of) {
                                                    expect(typeof response.body[0][item.field]).toBe(item.type_of)
                                                }
                                            }
                                        } else {
                                            for (const item of TestCase[groupTest].group_test_case[i].response_empty_field_body.data) {
                                                if (item.type_of) {
                                                    expect(typeof response.body[item.field]).toBe(item.type_of)
                                                }
                                            }
                                        }
                                    })
                                    .expect(TestCase[groupTest].group_test_case[i].response_empty_field_body.status);
                            });
                        });
                    }
                    description = `trường ${keyObject.field} trống`
                    delete body[keyObject.field];
                    if (TestCase[groupTest].group_test_case[i].method === "post") {
                        describe(TestCase[groupTest].group_test_case[i].title, () => {
                            it(description, () => {
                                return request(authUrl)
                                    .post(TestCase[groupTest].group_test_case[i].url)
                                    .set(TestCase[groupTest].headers)
                                    .send(body)
                                    .expect((response: request.Response) => {
                                        if (response.body[0]) {
                                            for (const item of TestCase[groupTest].group_test_case[i].response_empty_field_body.data) {
                                                if (item.type_of) {
                                                    expect(typeof response.body[0][item.field]).toBe(item.type_of)
                                                } else if (item.value) {
                                                    expect(typeof response.body[0][item.field]).toEqual(item.value)
                                                }
                                            }
                                        } else {
                                            for (const item of TestCase[groupTest].group_test_case[i].response_empty_field_body.data) {
                                                if (item.type_of) {
                                                    expect(typeof response.body[item.field]).toBe(item.type_of)
                                                } else if (item.value) {
                                                    expect(typeof response.body[0][item.field]).toEqual(item.value)
                                                }
                                            }
                                        }
                                    })
                                    .expect(TestCase[groupTest].group_test_case[i].response_empty_field_body.status);
                            });
                        });
                    } else if (TestCase[groupTest].group_test_case[i].method === "get") {
                        describe(TestCase[groupTest].group_test_case[i].title, () => {
                            it(description, () => {
                                return request(authUrl)
                                    .get(TestCase[groupTest].group_test_case[i].url)
                                    .set(TestCase[groupTest].headers)
                                    .expect((response: request.Response) => {
                                        if (response.body[0]) {
                                            for (const item of TestCase[groupTest].group_test_case[i].response_empty_field_body.data) {
                                                if (item.type_of) {
                                                    expect(typeof response.body[0][item.field]).toBe(item.type_of)
                                                }
                                            }
                                        } else {
                                            for (const item of TestCase[groupTest].group_test_case[i].response_empty_field_body.data) {
                                                if (item.type_of) {
                                                    expect(typeof response.body[item.field]).toBe(item.type_of)
                                                }
                                            }
                                        }
                                    })
                                    .expect(TestCase[groupTest].group_test_case[i].response_empty_field_body.status);
                            });
                        });
                    }
                } else {
                    let body = {...TestCase[groupTest].group_test_case[i].request.body};
                    let description = `trường ${keyObject.field} rỗng ""`
                    body[keyObject.field] = ""
                    if (TestCase[groupTest].group_test_case[i].method === "post") {
                        describe(TestCase[groupTest].group_test_case[i].title, () => {
                            it(description, () => {
                                return request(authUrl)
                                    .post(TestCase[groupTest].group_test_case[i].url)
                                    .set(TestCase[groupTest].headers)
                                    .send(body)
                                    .expect((response: request.Response) => {
                                        if (response.body[0]) {
                                            for (const item of TestCase[groupTest].group_test_case[i].response.data) {
                                                if (item.type_of) {
                                                    expect(typeof response.body[0][item.field]).toBe(item.type_of)
                                                } else if (item.value) {
                                                    expect(typeof response.body[0][item.field]).toEqual(item.value)
                                                }
                                            }
                                        } else {
                                            for (const item of TestCase[groupTest].group_test_case[i].response.data) {
                                                if (item.type_of) {
                                                    expect(typeof response.body[item.field]).toBe(item.type_of)
                                                } else if (item.value) {
                                                    expect(typeof response.body[0][item.field]).toEqual(item.value)
                                                }
                                            }
                                        }
                                    })
                                    .expect(TestCase[groupTest].group_test_case[i].response.status);
                            });
                        });
                    } else if (TestCase[groupTest].group_test_case[i].method === "get") {
                        describe(TestCase[groupTest].group_test_case[i].title, () => {
                            it(description, () => {
                                return request(authUrl)
                                    .get(TestCase[groupTest].group_test_case[i].url)
                                    .set(TestCase[groupTest].headers)
                                    .expect((response: request.Response) => {
                                        if (response.body[0]) {
                                            for (const item of TestCase[groupTest].group_test_case[i].response.data) {
                                                if (item.type_of) {
                                                    expect(typeof response.body[0][item.field]).toBe(item.type_of)
                                                }
                                            }
                                        } else {
                                            for (const item of TestCase[groupTest].group_test_case[i].response.data) {
                                                if (item.type_of) {
                                                    expect(typeof response.body[item.field]).toBe(item.type_of)
                                                }
                                            }
                                        }
                                    })
                                    .expect(TestCase[groupTest].group_test_case[i].response.status);
                            });
                        });
                    }
                    description = `trường ${keyObject.field} null`
                    body[keyObject.field] = null
                    if (TestCase[groupTest].group_test_case[i].method === "post") {
                        describe(TestCase[groupTest].group_test_case[i].title, () => {
                            it(description, () => {
                                return request(authUrl)
                                    .post(TestCase[groupTest].group_test_case[i].url)
                                    .set(TestCase[groupTest].headers)
                                    .send(body)
                                    .expect((response: request.Response) => {
                                        if (response.body[0]) {
                                            for (const item of TestCase[groupTest].group_test_case[i].response.data) {
                                                if (item.type_of) {
                                                    expect(typeof response.body[0][item.field]).toBe(item.type_of)
                                                } else if (item.value) {
                                                    expect(typeof response.body[0][item.field]).toEqual(item.value)
                                                }
                                            }
                                        } else {
                                            for (const item of TestCase[groupTest].group_test_case[i].response.data) {
                                                if (item.type_of) {
                                                    expect(typeof response.body[item.field]).toBe(item.type_of)
                                                } else if (item.value) {
                                                    expect(typeof response.body[0][item.field]).toEqual(item.value)
                                                }
                                            }
                                        }
                                    })
                                    .expect(TestCase[groupTest].group_test_case[i].response.status);
                            });
                        });
                    } else if (TestCase[groupTest].group_test_case[i].method === "get") {
                        describe(TestCase[groupTest].group_test_case[i].title, () => {
                            it(description, () => {
                                return request(authUrl)
                                    .get(TestCase[groupTest].group_test_case[i].url)
                                    .set(TestCase[groupTest].headers)
                                    .expect((response: request.Response) => {
                                        if (response.body[0]) {
                                            for (const item of TestCase[groupTest].group_test_case[i].response.data) {
                                                if (item.type_of) {
                                                    expect(typeof response.body[0][item.field]).toBe(item.type_of)
                                                }
                                            }
                                        } else {
                                            for (const item of TestCase[groupTest].group_test_case[i].response.data) {
                                                if (item.type_of) {
                                                    expect(typeof response.body[item.field]).toBe(item.type_of)
                                                }
                                            }
                                        }
                                    })
                                    .expect(TestCase[groupTest].group_test_case[i].response.status);
                            });
                        });
                    }
                    description = `trường ${keyObject.field} trống`
                    delete body[keyObject.field];
                    if (TestCase[groupTest].group_test_case[i].method === "post") {
                        describe(TestCase[groupTest].group_test_case[i].title, () => {
                            it(description, () => {
                                return request(authUrl)
                                    .post(TestCase[groupTest].group_test_case[i].url)
                                    .set(TestCase[groupTest].headers)
                                    .send(body)
                                    .expect((response: request.Response) => {
                                        if (response.body[0]) {
                                            for (const item of TestCase[groupTest].group_test_case[i].response.data) {
                                                if (item.type_of) {
                                                    expect(typeof response.body[0][item.field]).toBe(item.type_of)
                                                } else if (item.value) {
                                                    expect(typeof response.body[0][item.field]).toEqual(item.value)
                                                }
                                            }
                                        } else {
                                            for (const item of TestCase[groupTest].group_test_case[i].response.data) {
                                                if (item.type_of) {
                                                    expect(typeof response.body[item.field]).toBe(item.type_of)
                                                } else if (item.value) {
                                                    expect(typeof response.body[0][item.field]).toEqual(item.value)
                                                }
                                            }
                                        }
                                    })
                                    .expect(TestCase[groupTest].group_test_case[i].response.status);
                            });
                        });
                    } else if (TestCase[groupTest].group_test_case[i].method === "get") {
                        describe(TestCase[groupTest].group_test_case[i].title, () => {
                            it(description, () => {
                                return request(authUrl)
                                    .get(TestCase[groupTest].group_test_case[i].url)
                                    .set(TestCase[groupTest].headers)
                                    .expect((response: request.Response) => {
                                        if (response.body[0]) {
                                            for (const item of TestCase[groupTest].group_test_case[i].response.data) {
                                                if (item.type_of) {
                                                    expect(typeof response.body[0][item.field]).toBe(item.type_of)
                                                }
                                            }
                                        } else {
                                            for (const item of TestCase[groupTest].group_test_case[i].response.data) {
                                                if (item.type_of) {
                                                    expect(typeof response.body[item.field]).toBe(item.type_of)
                                                }
                                            }
                                        }
                                    })
                                    .expect(TestCase[groupTest].group_test_case[i].response.status);
                            });
                        });
                    }
                }
            }
        }
        // if (TestCase[groupTest].group_test_case[i].test_field_type_body_of === true) {

        // }
        // if (TestCase[groupTest].group_test_case[i].test_empty_field_headers === true) {

        // }
        // ----------------- run auto case -----------------
        // ----------------- run exception test case -----------------
        for (const itemExceptionTest of TestCase[groupTest].group_test_case[i].exception_test_case) {
            console.log(itemExceptionTest.description, 'itemExceptionTest.description');
            console.log(itemExceptionTest.description, 'itemExceptionTest.description');
            
            if (TestCase[groupTest].group_test_case[i].method === "post") {
                describe(TestCase[groupTest].group_test_case[i].title, () => {
                    it(itemExceptionTest.description, () => {
                        return request(authUrl)
                            .post(TestCase[groupTest].group_test_case[i].url)
                            .set(TestCase[groupTest].headers)
                            .send(itemExceptionTest.request.body)
                            .expect((response: request.Response) => {
                                if (response.body[0]) {
                                    for (const item of itemExceptionTest.response.data) {
                                        if (item.type_of) {
                                            expect(typeof response.body[0][item.field]).toBe(item.type_of)
                                        } else if (item.value) {
                                            expect(typeof response.body[0][item.field]).toEqual(item.value)
                                        }
                                    }
                                } else {
                                    for (const item of itemExceptionTest.response.data) {
                                        if (item.type_of) {
                                            expect(typeof response.body[item.field]).toBe(item.type_of)
                                        } else if (item.value) {
                                            expect(typeof response.body[0][item.field]).toEqual(item.value)
                                        }
                                    }
                                }
                            })
                            .expect(itemExceptionTest.response.status);
                    });
                });
            } else if (TestCase[groupTest].group_test_case[i].method === "get") {
                describe(TestCase[groupTest].group_test_case[i].title, () => {
                    it(itemExceptionTest.description, () => {
                        return request(authUrl)
                            .get(TestCase[groupTest].group_test_case[i].url)
                            .set(TestCase[groupTest].headers)
                            .expect((response: request.Response) => {
                                if (response.body[0]) {
                                    for (const item of itemExceptionTest.response.data) {
                                        if (item.type_of) {
                                            expect(typeof response.body[0][item.field]).toBe(item.type_of)
                                        }
                                    }
                                } else {
                                    for (const item of itemExceptionTest.response.data) {
                                        if (item.type_of) {
                                            expect(typeof response.body[item.field]).toBe(item.type_of)
                                        }
                                    }
                                }
                            })
                            .expect(itemExceptionTest.response.status);
                    });
                });
            }
        }
        // ----------------- chay exceoption test case -----------------
    }
}











// async function testFunction() {
//     try {
//         console.log("check");
        
//     } catch (err) {
//         console.log(err, "error");
        
//     }
// }









// for (let i = 0; i < Object.keys(TestCase).length; i++) {
//     const groupTest = `testcase${i}`
//     const authUrl = `${TestCase[groupTest].base_point}`;
//     // console.log(authUrl, 'authUrl');
    
//     for (let i = 0; i < TestCase[groupTest].test_case.length; i++) {
//         if (TestCase[groupTest].test_case[i].method === "post") {
//             describe(TestCase[groupTest].test_case[i].title, () => {
//                 it(TestCase[groupTest].test_case[i].description, () => {
//                     return request(authUrl)
//                         .post(TestCase[groupTest].test_case[i].url)
//                         .set(TestCase[groupTest].headers)
//                         .send(TestCase[groupTest].test_case[i].request.body)
//                         .expect((response: request.Response) => {
//                             if (response.body[0]) {
//                                 for (const item of TestCase[groupTest].test_case[i].response.data) {
//                                     if (item.type_of) {
//                                         expect(typeof response.body[0][item.field]).toBe(item.type_of)
//                                     } else if (item.value) {
//                                         expect(typeof response.body[0][item.field]).toEqual(item.value)
//                                     }
//                                 }
//                             } else {
//                                 for (const item of TestCase[groupTest].test_case[i].response.data) {
//                                     if (item.type_of) {
//                                         expect(typeof response.body[item.field]).toBe(item.type_of)
//                                     } else if (item.value) {
//                                         expect(typeof response.body[0][item.field]).toEqual(item.value)
//                                     }
//                                 }
//                             }


//                             //   expect(givenName).toEqual(mockUser.givenName),
//                             //   expect(familyName).toEqual(mockUser.familyName),
//                             //   expect(email).toEqual(mockUser.email),
//                             //   expect(password).toBeUndefined();
//                             // expect(imagePath).toBeNull();
//                             // expect(role).toEqual("user");
//                         })
//                         .expect(TestCase[groupTest].test_case[i].response.status);
//                 });
//             });
//         } else if (TestCase[groupTest].test_case[i].method === "get") {
//             describe(TestCase[groupTest].test_case[i].title, () => {
//                 it(TestCase[groupTest].test_case[i].description, () => {
//                     return request(authUrl)
//                         .get(TestCase[groupTest].test_case[i].url)
//                         .set(TestCase[groupTest].headers)
//                         .expect((response: request.Response) => {
//                             if (response.body[0]) {
//                                 for (const item of TestCase[groupTest].test_case[i].response.data) {
//                                     if (item.type_of) {
//                                         expect(typeof response.body[0][item.field]).toBe(item.type_of)
//                                     }
//                                 }
//                             } else {
//                                 for (const item of TestCase[groupTest].test_case[i].response.data) {
//                                     if (item.type_of) {
//                                         expect(typeof response.body[item.field]).toBe(item.type_of)
//                                     }
//                                 }
//                             }


//                             //   expect(givenName).toEqual(mockUser.givenName),
//                             //   expect(familyName).toEqual(mockUser.familyName),
//                             //   expect(email).toEqual(mockUser.email),
//                             //   expect(password).toBeUndefined();
//                             // expect(imagePath).toBeNull();
//                             // expect(role).toEqual("user");
//                         })
//                         .expect(TestCase[groupTest].test_case[i].response.status);
//                 });
//             });
//         }
//     }
// }





// describe("/auth/login (POST)", () => {
//   const authUrl = `http://localhost:5000/customer/auth`;

//   const mockUser: any = {
//     code_phone_area: "+84",
//     phone: "0389888952",
//     password: "Guvico2022"
//   };

//   it("it should register a user and return the new user object", () => {
//     return request(authUrl)
//       .post("/login?lang=vi")
//       .set("Accept", "application/json")
//       .send(mockUser)
//       .expect((response: request.Response) => {
//         const {
//           token
//         } = response.body;

//         expect(typeof token).toBe("string")
//         //   expect(givenName).toEqual(mockUser.givenName),
//         //   expect(familyName).toEqual(mockUser.familyName),
//         //   expect(email).toEqual(mockUser.email),
//         //   expect(password).toBeUndefined();
//         // expect(imagePath).toBeNull();
//         // expect(role).toEqual("user");
//       })
//       .expect(HttpStatus.CREATED);
//   });
// });




// describe('AppController (e2e)', () => {
//   // let app: INestApplication;

//   // beforeEach(async () => {
//   //   const moduleFixture: TestingModule = await Test.createTestingModule({
//   //     imports: [CustomerModule],
//   //   }).compile();

//   //   app = moduleFixture.createNestApplication();
//   //   await app.init();
//   // });

  

//   // it('/ (GET)', () => {
//   //   return request(app.getHttpServer())
//   //     .get('/')
//   //     .expect(200)
//   // });
//   // it('check auth login', () => {
//   //   const payload = {
//   //     code_phone_area: "+84",
//   //     phone: "0389888952",
//   //     password: "Guvico2022"
//   //   }
//   //   return request(app.getHttpServer())
//   //     .post('/customer/auth/login')
//   //     .send(payload)
//   //     .expect(200)
//   // });
// });
