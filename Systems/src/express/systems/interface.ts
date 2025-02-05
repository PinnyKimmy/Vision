/* v8 ignore start */
import { z } from 'zod';
import { Prettify } from '../../utils/types.js';

export const requiredFields = z
    .object({
        name: z.string(),
        active: z.boolean(),
    })
    .required();

export const optionalFields = z
    .object({
        // can add more fields later if needed
    })
    .partial();

export type System = Prettify<z.infer<typeof requiredFields & typeof optionalFields>>;
