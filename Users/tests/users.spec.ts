/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { Express } from 'express';
import mongoose from 'mongoose';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { config } from '../src/config.js';
import { User } from '../src/express/users/interface.js';
import { Server } from '../src/express/server.js';

const { mongo } = config;

const fakeObjectId = '111111111111111111111111';

const removeAllCollections = async () => {
    const collections = Object.keys(mongoose.connection.collections);

    for (const collectionName of collections) {
        const collection = mongoose.connection.collections[collectionName];
        await collection!.deleteMany({});
    }
};

const exampleUser: User = {
    badgeId: '12345678',
    name: 'soldier1',
    isAdmin: false,
};

describe('e2e users api testing', () => {
    let app: Express;

    beforeAll(async () => {
        await mongoose.connect(mongo.uri);
        app = Server.createExpressApp();
    });

    afterAll(async () => {
        await mongoose.disconnect();
    });

    beforeEach(async () => {
        await removeAllCollections();
    });

    describe('/isAlive', () => {
        it('should return alive', async () => {
            const response = await request(app).get('/isAlive').expect(200);
            expect(response.text).toBe('alive');
        });
    });

    describe('/unknownRoute', () => {
        it('should return status code 404', async () => {
            return request(app).get('/unknownRoute').expect(404);
        });
    });

    describe('/api/users', () => {
        describe('GET /api/users', () => {
            it('should get all the users', async () => {
                const users: User[] = [];

                for (let i = 0; i < 3; i++) {
                    const { body: user } = await request(app).post('/api/users').send(exampleUser).expect(200);

                    users.push(user);
                }

                const { body } = await request(app).get('/api/users').expect(200);

                expect(body).toEqual(users);
            });

            it('should get users with pagination', async () => {
                const users: User[] = [];

                for (let i = 0; i < 15; i++) {
                    const { body: user } = await request(app).post('/api/users').send(exampleUser).expect(200);

                    users.push(user);
                }

                const [{ body: body1 }, { body: body2 }, { body: body3 }] = await Promise.all([
                    request(app).get('/api/users').query({ limit: 5, step: 0 }).expect(200),
                    request(app).get('/api/users').query({ limit: 5, step: 1 }).expect(200),
                    request(app).get('/api/users').query({ limit: 5, step: 2 }).expect(200),
                ]);

                expect(body1).toEqual(users.slice(0, 5));
                expect(body2).toEqual(users.slice(5, 10));
                expect(body3).toEqual(users.slice(10, 15));
            });

            it('should get an empty array', async () => {
                const { body } = await request(app).get('/api/users').query({ limit: 100 }).expect(200);

                expect(body).toEqual([]);
            });
        });

        describe('GET /api/users/:userId', () => {
            it('should get a user', async () => {
                const { body: user } = await request(app).post('/api/users').send(exampleUser).expect(200);

                const { body } = await request(app).get(`/api/users/${user._id}`).expect(200);

                expect(body).toEqual(expect.objectContaining({
                    ...exampleUser,
                    _id: expect.any(String),
                }));
                
            });

            it('should fail for getting a non-existing user', async () => {
                return request(app).get(`/api/users/${fakeObjectId}`).expect(404);
            });
        });

        describe('GET /api/users/count', () => {
            it('should get users count', async () => {
                const count = 4;

                await Promise.all(Array.from({ length: count }, () => request(app).post('/api/users').send(exampleUser).expect(200)));

                const { body } = await request(app).get('/api/users/count').expect(200);

                expect(body).toEqual(count);
            });

            it('should get zero when there are no users', async () => {
                const { body } = await request(app).get('/api/users/count').expect(200);

                expect(body).toEqual(0);
            });
        });

        describe('POST /api/users', () => {
            it('should create a new user', async () => {
                const { body } = await request(app).post('/api/users').send(exampleUser).expect(200);

                expect(body).toEqual(expect.objectContaining(exampleUser));
            });

            it('should fail validation for missing fields', async () => {
                return request(app).post('/api/users').send({}).expect(400);
            });
        });

        describe('PUT /api/users/:userId', () => {
            it('should update user', async () => {
                const propertyForUpdate = 'test2';

                const {
                    body: { _id },
                } = await request(app).post('/api/users').send(exampleUser).expect(200);

                const {
                    body: { name },
                } = await request(app).put(`/api/users/${_id}`).send({ name: propertyForUpdate }).expect(200);

                expect(name).toEqual(propertyForUpdate);
            });

            it('should fail for updating a non-existing user', async () => {
                return request(app).put(`/api/users/${fakeObjectId}`).send(exampleUser).expect(404);
            });
        });

        describe('DELETE /api/users/:userId', () => {
            it('should delete user', async () => {
                const {
                    body: { _id },
                } = await request(app).post('/api/users').send(exampleUser).expect(200);

                return request(app).delete(`/api/users/${_id}`).expect(200);
            });

            it('should fail for deleting a non-existing user', async () => {
                return request(app).delete(`/api/users/${fakeObjectId}`).expect(404);
            });
        });
    });
});
