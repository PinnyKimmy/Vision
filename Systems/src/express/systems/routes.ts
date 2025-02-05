import { Router } from 'express';
import { wrapRoute } from '../../utils/express/wrappers.js';
import { SystemsModel } from './model.js';
import {
    createOneRequestSchema,
    deleteOneRequestSchema,
    getByIdRequestSchema,
    getByQueryRequestSchema,
    getCountRequestSchema,
    updateOneRequestSchema,
} from './validations.js';
import { DocumentNotFoundError } from '../../utils/errors.js';

export const systemsRouter = Router();

systemsRouter.get(
    '/',
    wrapRoute(getByQueryRequestSchema, async ({ query: { step, limit, ...query } }) => {
        return SystemsModel.find(query, {}, limit ? { limit, skip: limit * step } : {})
            .lean()
            .exec();
    }),
);

systemsRouter.get(
    '/count',
    wrapRoute(getCountRequestSchema, async ({ query }) => {
        return SystemsModel.countDocuments(query).lean().exec();
    }),
);

systemsRouter.get(
    '/:id',
    wrapRoute(getByIdRequestSchema, async ({ params: { id } }) => {
        return SystemsModel.findById(id).orFail(new DocumentNotFoundError(id)).lean().exec();
    }),
);

systemsRouter.post(
    '/',
    wrapRoute(createOneRequestSchema, async ({ body }) => {
        return SystemsModel.create(body);
    }),
);

systemsRouter.put(
    '/:id',
    wrapRoute(updateOneRequestSchema, async ({ params: { id }, body }) => {
        return SystemsModel.findByIdAndUpdate(id, body, { new: true }).orFail(new DocumentNotFoundError(id)).lean().exec();
    }),
);

systemsRouter.delete(
    '/:id',
    wrapRoute(deleteOneRequestSchema, async ({ params: { id } }) => {
        return SystemsModel.findByIdAndDelete(id).orFail(new DocumentNotFoundError(id)).lean().exec();
    }),
);
