/* v8 ignore start */
import { z } from 'zod';
import { Prettify } from '../../utils/types.js';

export const requiredFields = z
    .object({
        badgeId: z.string(),
        name: z.string(),
        isAdmin: z.boolean(),
    })
    .required();

export const optionalFields = z
    .object({
        // can add more fields later if needed
    })
    .partial();

export type User = Prettify<z.infer<typeof requiredFields & typeof optionalFields>>;
