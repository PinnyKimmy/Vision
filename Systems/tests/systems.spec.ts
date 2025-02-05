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
import { System } from '../src/express/systems/interface.js';
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

const exampleSystem: System = {
    name: 'test',
    active: true,
};

describe('e2e systems api testing', () => {
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

    describe('/api/systems', () => {
        describe('GET /api/systems', () => {
            it('should get all the systems', async () => {
                const systems: System[] = [];

                for (let i = 0; i < 3; i++) {
                    const { body: system } = await request(app).post('/api/systems').send(exampleSystem).expect(200);

                    systems.push(system);
                }

                const { body } = await request(app).get('/api/systems').expect(200);

                expect(body).toEqual(systems);
            });

            it('should get systems with pagination', async () => {
                const systems: System[] = [];

                for (let i = 0; i < 15; i++) {
                    const { body: system } = await request(app).post('/api/systems').send(exampleSystem).expect(200);

                    systems.push(system);
                }

                const [{ body: body1 }, { body: body2 }, { body: body3 }] = await Promise.all([
                    request(app).get('/api/systems').query({ limit: 5, step: 0 }).expect(200),
                    request(app).get('/api/systems').query({ limit: 5, step: 1 }).expect(200),
                    request(app).get('/api/systems').query({ limit: 5, step: 2 }).expect(200),
                ]);

                expect(body1).toEqual(systems.slice(0, 5));
                expect(body2).toEqual(systems.slice(5, 10));
                expect(body3).toEqual(systems.slice(10, 15));
            });

            it('should get an empty array', async () => {
                const { body } = await request(app).get('/api/systems').query({ limit: 100 }).expect(200);

                expect(body).toEqual([]);
            });
        });

        describe('GET /api/systems/:systemId', () => {
            it('should get a systems', async () => {
                const { body: systems } = await request(app).post('/api/systems').send(exampleSystem).expect(200);

                const { body } = await request(app).get(`/api/systems/${systems._id}`).expect(200);

                expect(body).toEqual(systems);
            });

            it('should fail for getting a non-existing systems', async () => {
                return request(app).get(`/api/systems/${fakeObjectId}`).expect(404);
            });
        });

        describe('GET /api/systems/count', () => {
            it('should get systems count', async () => {
                const count = 4;

                await Promise.all(Array.from({ length: count }, () => request(app).post('/api/systems').send(exampleSystem).expect(200)));

                const { body } = await request(app).get('/api/systems/count').expect(200);

                expect(body).toEqual(count);
            });

            it('should get zero when there are no systems', async () => {
                const { body } = await request(app).get('/api/systems/count').expect(200);

                expect(body).toEqual(0);
            });
        });

        describe('POST /api/systems', () => {
            it('should create a new systems', async () => {
                const { body } = await request(app).post('/api/systems').send(exampleSystem).expect(200);

                expect(body).toEqual(expect.objectContaining(exampleSystem));
            });

            it('should fail validation for missing fields', async () => {
                return request(app).post('/api/systems').send({}).expect(400);
            });
        });

        describe('PUT /api/systems/:systemId', () => {
            it('should update systems', async () => {
                const propertyForUpdate = 'test2';

                const {
                    body: { _id },
                } = await request(app).post('/api/systems').send(exampleSystem).expect(200);

                const {
                    body: { name },
                } = await request(app).put(`/api/systems/${_id}`).send({ name: propertyForUpdate }).expect(200);

                expect(name).toEqual(propertyForUpdate);
            });

            it('should fail for updating a non-existing systems', async () => {
                return request(app).put(`/api/systems/${fakeObjectId}`).send(exampleSystem).expect(404);
            });
        });

        describe('DELETE /api/systems/:systemId', () => {
            it('should delete systems', async () => {
                const {
                    body: { _id },
                } = await request(app).post('/api/systems').send(exampleSystem).expect(200);

                return request(app).delete(`/api/systems/${_id}`).expect(200);
            });

            it('should fail for deleting a non-existing systems', async () => {
                return request(app).delete(`/api/systems/${fakeObjectId}`).expect(404);
            });
        });
    });
});
