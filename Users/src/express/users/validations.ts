import { z } from 'zod';
import { zodMongoObjectId } from '../../utils/zod.js';
import { optionalFields, requiredFields } from './interface.js';

// GET /api/users
export const getByQueryRequestSchema = z.object({
    body: z.object({}),
    query: z
        .object({
            step: z.coerce.number().min(0).default(0),
            limit: z.coerce.number().optional(),
        })
        .merge(requiredFields.partial())
        .merge(optionalFields),
    params: z.object({}),
});

// GET /api/users/count
export const getCountRequestSchema = z.object({
    body: z.object({}),
    query: requiredFields.partial().merge(optionalFields),
    params: z.object({}),
});

// GET /api/users/:id
export const getByIdRequestSchema = z.object({
    body: z.object({}),
    query: z.object({}),
    params: z.object({
        id: zodMongoObjectId,
    }),
});

// POST /api/users
export const createOneRequestSchema = z.object({
    body: requiredFields.merge(optionalFields),
    query: z.object({}),
    params: z.object({}),
});

// PUT /api/users/:id
export const updateOneRequestSchema = z.object({
    body: requiredFields.partial().merge(optionalFields),
    query: z.object({}),
    params: z.object({
        id: zodMongoObjectId,
    }),
});

// DELETE /api/users/:id
export const deleteOneRequestSchema = z.object({
    body: z.object({}),
    query: z.object({}),
    params: z.object({
        id: zodMongoObjectId,
    }),
});
