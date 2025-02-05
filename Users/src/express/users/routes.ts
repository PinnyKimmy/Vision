import { Router } from 'express';
import { wrapRoute } from '../../utils/express/wrappers.js';
import { usersModel } from './model.js';
import {
    createOneRequestSchema,
    deleteOneRequestSchema,
    getByIdRequestSchema,
    getByQueryRequestSchema,
    getCountRequestSchema,
    updateOneRequestSchema,
} from './validations.js';
import { DocumentNotFoundError } from '../../utils/errors.js';

export const usersRouter = Router();

usersRouter.get(
    '/',
    wrapRoute(getByQueryRequestSchema, async ({ query: { step, limit, ...query } }) => {
        return usersModel.find(query, {}, limit ? { limit, skip: limit * step } : {})
            .lean()
            .exec();
    }),
);

usersRouter.get(
    '/count',
    wrapRoute(getCountRequestSchema, async ({ query }) => {
        return usersModel.countDocuments(query).lean().exec();
    }),
);

usersRouter.get(
    '/:id',
    wrapRoute(getByIdRequestSchema, async ({ params: { id } }) => {
        return usersModel.findById(id).orFail(new DocumentNotFoundError(id)).lean().exec();
    }),
);

usersRouter.post(
    '/',
    wrapRoute(createOneRequestSchema, async ({ body }) => {
        return usersModel.create(body);
    }),
);

usersRouter.put(
    '/:id',
    wrapRoute(updateOneRequestSchema, async ({ params: { id }, body }) => {
        return usersModel.findByIdAndUpdate(id, body, { new: true }).orFail(new DocumentNotFoundError(id)).lean().exec();
    }),
);

usersRouter.delete(
    '/:id',
    wrapRoute(deleteOneRequestSchema, async ({ params: { id } }) => {
        return usersModel.findByIdAndDelete(id).orFail(new DocumentNotFoundError(id)).lean().exec();
    }),
);
