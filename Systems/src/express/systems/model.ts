import mongoose from 'mongoose';
import { config } from '../../config.js';
import { System } from './interface.js';

const SystemsSchema = new mongoose.Schema<System>(
    {
        name: {
            type: String,
            required: true,
        },
        active: {
            type: Boolean,
            default: true,
        },
    },
    {
        versionKey: false,
    },
);

export const SystemsModel = mongoose.model<System>(config.mongo.systemsCollectionName, SystemsSchema);
