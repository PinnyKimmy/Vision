/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { NextFunction, Request, Response } from 'express';
import { AnyZodObject } from 'zod';
import { TypedRequest } from '../zod.js';

export const wrapRoute = <TSchema extends AnyZodObject, TManagerReturnType>(
    validationSchema: TSchema,
    handleFunc: (req: TypedRequest<TSchema>) => Promise<TManagerReturnType>,
) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const { body, query, params } = req;

        try {
            const { body: parsedBody, query: parsedQuery, params: parsedParams } = await validationSchema.parseAsync({ body, query, params });

            res.json(await handleFunc({ ...req, body: parsedBody, query: parsedQuery, params: parsedParams } as TypedRequest<TSchema>));

            next();
        } catch (error) {
            next(error);
        }
    };
};
